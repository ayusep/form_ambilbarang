const express = require('express');
const router = express.Router();
const pool = require('../db');

// 1. POST: Simpan Transaksi FAB
router.post('/', async (req, res) => {
  const { id_user, id_departemen, items, total_harga_seluruhnya } = req.body;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // --- 1. DOUBLE CHECK BUDGET DI SERVER ---
    const now = new Date();
    const bulan = now.getMonth() + 1;
    const tahun = now.getFullYear();

    const budgetCheck = await client.query(
      `SELECT limit_budget FROM budgeting 
       WHERE id_departemen = $1 AND status_aktif = true AND bulan = $2 AND tahun = $3`,
      [id_departemen, bulan, tahun]
    );

    if (budgetCheck.rows.length === 0) {
      throw new Error("Budget untuk departemen Anda belum di-setting atau tidak aktif bulan ini.");
    }

    const limit = parseFloat(budgetCheck.rows[0].limit_budget);

    // Hitung pemakaian yang sudah ada di database (exclude Rejected)
    const usageCheck = await client.query(
      `SELECT SUM(pb.qty * brg.harga_sap) as total
       FROM permintaan_barang pb
       JOIN barang brg ON pb.id_barang = brg.id_barang
       JOIN users u ON pb.id_user = u.id_user
       WHERE u.id_departemen = $1 
       AND pb.status_approval != 'Rejected'
       AND EXTRACT(MONTH FROM pb.tgl_permintaan) = $2
       AND EXTRACT(YEAR FROM pb.tgl_permintaan) = $3`,
      [id_departemen, bulan, tahun]
    );

    const currentUsage = parseFloat(usageCheck.rows[0].total || 0);

    // Validasi Akhir: Jika pemakaian lama + transaksi baru > limit
    if (currentUsage + parseFloat(total_harga_seluruhnya) > limit) {
      throw new Error(`Limit Budget Tidak Mencukupi! Sisa: Rp ${(limit - currentUsage).toLocaleString('id-ID')}`);
    }

    // --- 2. GENERATE NOMOR FAB ---
    const yy = now.getFullYear().toString().slice(-2);
    const mm = (now.getMonth() + 1).toString().padStart(2, '0');
    const prefix = yy + mm;

    const lastFabResult = await client.query(
      `SELECT MAX(no_fab) as max_fab FROM permintaan_barang WHERE CAST(no_fab AS TEXT) LIKE $1`,
      [`${prefix}%`] // Perbaikan: Gunakan prefix YYMM agar filter lebih akurat
    );

    let nextFab;
    const lastFab = lastFabResult.rows[0].max_fab;
    if (!lastFab) {
      nextFab = parseInt(`${prefix}01`);
    } else {
      const lastSequence = parseInt(lastFab.toString().slice(-4)); // Ambil 4 digit terakhir jika volume tinggi
      nextFab = parseInt(`${prefix}${(lastSequence + 1).toString().padStart(2, '0')}`);
    }

    // --- 3. INSERT ITEMS ---
    for (const item of items) {
      await client.query(
        `INSERT INTO permintaan_barang (
            no_fab, id_barang, id_user, qty, status_approval, 
            mesin, operator_maintenance, coa, tgl_permintaan
          ) 
          VALUES ($1, $2, $3, $4, 'Pending', $5, $6, $7, CURRENT_TIMESTAMP)`,
        [
          nextFab,
          item.id_barang,
          id_user,
          item.qty,
          item.id_mesin,
          item.operator,
          item.id_coa
        ]
      );
    }

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: `FAB #${nextFab} Berhasil disimpan!`, no_fab: nextFab });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error Simpan FAB:", err.message);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// --- ROUTE LAINNYA (Mesin, COA, Filter, dll) TETAP SAMA ---

router.get('/mesin', async (req, res) => {
  try {
    const result = await pool.query("SELECT id_mesin, nama_mesin, no_item FROM mesin ORDER BY nama_mesin ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/coa', async (req, res) => {
  const { id_divisi } = req.query;
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

// Endpoint untuk mengambil budget aktif (server\routes\permintaan.js)
router.get('/budget-aktif/:id_departemen', async (req, res) => {
  const { id_departemen } = req.params;
  const now = new Date();
  const bulan = now.getMonth() + 1;
  const tahun = now.getFullYear();

  try {
    const query = `
      SELECT 
        CAST(b.limit_budget AS FLOAT) as limit_budget, 
        d.nama_departemen,
        COALESCE((
          SELECT CAST(SUM(pb.qty * brg.harga_sap) AS FLOAT)
          FROM permintaan_barang pb
          JOIN barang brg ON pb.id_barang = brg.id_barang
          JOIN users u ON pb.id_user = u.id_user
          WHERE u.id_departemen = $1
          AND EXTRACT(MONTH FROM pb.tgl_permintaan) = $2
          AND EXTRACT(YEAR FROM pb.tgl_permintaan) = $3
          AND pb.status_approval != 'Rejected'
        ), 0) as terpakai_bulan_ini
      FROM budgeting b
      JOIN departemen d ON b.id_departemen = d.id_departemen
      WHERE b.id_departemen = $1 
        AND b.status_aktif = true 
        AND b.bulan = $2 
        AND b.tahun = $3
      LIMIT 1
    `;
    const result = await pool.query(query, [id_departemen, bulan, tahun]);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      // Sangat Penting: Kirim status 200 dengan nilai 0 daripada 404 
      // agar frontend tidak crash saat mencoba membaca properti
      res.json({ 
        limit_budget: 0, 
        terpakai_bulan_ini: 0, 
        nama_departemen: "Budget Belum Diatur" 
      });
    }
  } catch (err) {
    console.error("API Error Budget:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// server\routes\permintaan.js

router.get('/teknisi', async (req, res) => {
  try {
    // Mengambil user dengan id_divisi 27 (misal: Maintenance) dan 38 (misal: Engineering)
    const result = await pool.query(
      "SELECT id_user, nama FROM users WHERE id_divisi IN (27, 38) ORDER BY nama ASC"
    );
    res.json(result.rows);
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