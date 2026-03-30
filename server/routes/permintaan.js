const express = require('express');
const router = express.Router();
const pool = require('../db');

// server\routes\permintaan.js

router.post('/', async (req, res) => {
  // Ambil hanya user dan departemen dari root body
  const { id_user, id_departemen, items } = req.body; 
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    // ... (Logika penomoran nextFab tetap sama) ...
    const now = new Date();
    const yy = now.getFullYear().toString().slice(-2);
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const prefix = yy + mm;
    const lastFabResult = await client.query(
      `SELECT MAX(no_fab) as max_fab FROM permintaan_barang WHERE CAST(no_fab AS TEXT) LIKE $1`, 
      [`${yy}%`]
    );
    let nextFab;
    const lastFab = lastFabResult.rows[0].max_fab;
    if (!lastFab) {
      nextFab = parseInt(`${prefix}01`);
    } else {
      const lastSequence = parseInt(lastFab.toString().slice(-2));
      nextFab = parseInt(`${prefix}${(lastSequence + 1).toString().padStart(2, '0')}`);
    }

    // PERBAIKAN: Ambil data mesin, operator, coa dari item
    for (const item of items) {
      await client.query(
        `INSERT INTO permintaan_barang (
            no_fab, 
            id_barang, 
            id_user, 
            qty, 
            status_approval, 
            mesin, 
            operator_maintenance, 
            coa, 
            tgl_permintaan
          ) 
          VALUES ($1, $2, $3, $4, 'Pending', $5, $6, $7, CURRENT_TIMESTAMP)`,
        [
          nextFab, 
          item.id_barang, 
          id_user, 
          item.qty, 
          item.id_mesin,        // Diambil dari properti item
          item.operator,        // Diambil dari properti item
          item.id_coa           // Diambil dari properti item
        ]
      );
    }

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: `FAB #${nextFab} Berhasil disimpan!`, no_fab: nextFab });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err); // Sangat disarankan untuk log error di console server
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// Tambahkan di permintaan.js atau buat file route baru (misal: master.js)

// Ambil semua daftar mesin
router.get('/mesin', async (req, res) => {
  try {
    const result = await pool.query("SELECT id_mesin, nama_mesin, no_item FROM mesin ORDER BY nama_mesin ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ambil semua daftar COA
// Ambil daftar COA (Bisa difilter berdasarkan id_divisi)
router.get('/coa', async (req, res) => {
  const { id_divisi } = req.query; // Ambil id_divisi dari query parameter
  try {
    let query = "SELECT id_coa, kode_akun, coa, id_divisi FROM coa";
    let params = [];

    if (id_divisi) {
      query += " WHERE id_divisi = $1";
      params.push(id_divisi);
    }

    query += " ORDER BY kode_akun ASC";
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. FILTER DATA (GET) - Diperbarui untuk mendukung akses multi-departemen
// 2. FILTER DATA (GET) - Diperbarui sesuai ERD Lampiran
router.get('/filter', async (req, res) => {
  const { bulan, tahun, departemen } = req.query;
  
  try {
    let query;
    let params;

    // Base SELECT - Menggunakan JOIN ke tabel mesin dan coa sesuai ERD
    const baseSelect = `
        SELECT 
            p.*, 
            u.nama, 
            u.id_divisi,
            div.nama_divisi,
            d.nama_departemen, 
            b.nama_barang, 
            b.kode_sap, 
            b.harga_sap,
            b.satuan,
            m.nama_mesin,               -- Mengambil nama_mesin dari tabel mesin
            p.operator_maintenance,     -- Kolom teknisi dari tabel permintaan_barang
            c.coa AS nama_coa           -- Mengambil kolom coa dari tabel coa
        FROM permintaan_barang p
        JOIN users u ON p.id_user = u.id_user
        JOIN departemen d ON u.id_departemen = d.id_departemen
        JOIN barang b ON p.id_barang = b.id_barang
        LEFT JOIN divisi div ON u.id_divisi = div.id_divisi -- JOIN ke tabel divisi
        LEFT JOIN mesin m ON p.mesin = m.id_mesin    -- Relasi p.mesin -> m.id_mesin
        LEFT JOIN coa c ON p.coa = c.id_coa          -- Relasi p.coa -> c.id_coa
    `;

    if (!departemen || departemen === '' || departemen === 'null') {
      query = `
        ${baseSelect}
        WHERE EXTRACT(MONTH FROM p.tgl_permintaan) = $1
        AND EXTRACT(YEAR FROM p.tgl_permintaan) = $2
        ORDER BY p.no_fab DESC, p.tgl_permintaan DESC`;
      params = [bulan, tahun];
    } else {
      query = `
        ${baseSelect}
        WHERE d.id_departemen = $1
        AND EXTRACT(MONTH FROM p.tgl_permintaan) = $2
        AND EXTRACT(YEAR FROM p.tgl_permintaan) = $3
        ORDER BY p.no_fab DESC, p.tgl_permintaan DESC`;
      params = [departemen, bulan, tahun];
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: err.message });
  }
});

// 3. HITUNG PEMAKAIAN BULAN BERJALAN (RESET BUDGET)
router.get('/pemakaian/:id_departemen', async (req, res) => {
  const { id_departemen } = req.params;
  try {
    const result = await pool.query(
      `SELECT SUM(p.qty * b.harga_sap) as total_bulan_ini
       FROM permintaan_barang p
       JOIN barang b ON p.id_barang = b.id_barang
       JOIN users u ON p.id_user = u.id_user
       WHERE u.id_departemen = $1 
       AND EXTRACT(MONTH FROM p.tgl_permintaan) = EXTRACT(MONTH FROM CURRENT_DATE)
       AND EXTRACT(YEAR FROM p.tgl_permintaan) = EXTRACT(YEAR FROM CURRENT_DATE)
       AND p.status_approval IN ('Pending', 'Approved', 'Closed')`,
      [id_departemen]
    );
    res.json({ total_bulan_ini: result.rows[0].total_bulan_ini || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. UPDATE APPROVAL (PUT)
router.put('/fab/:no_fab', async (req, res) => {
  const { no_fab } = req.params;
  const { status_approval, keterangan } = req.body;
  try {
    await pool.query(
      "UPDATE permintaan_barang SET status_approval = $1, keterangan = $2 WHERE no_fab = $3",
      [status_approval, keterangan, no_fab]
    );
    res.json({ message: "Update success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;