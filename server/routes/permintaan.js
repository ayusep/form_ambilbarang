const express = require('express');
const router = express.Router();
const pool = require('../db');

// 1. SIMPAN PERMINTAAN (POST) - Format YYMMNN
router.post('/', async (req, res) => {
  const { id_user, id_divisi, mesin, operator_maintenance, coa, items } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

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

    for (const item of items) {
      await client.query(
        `INSERT INTO permintaan_barang (no_fab, id_barang, id_user, qty, status_approval, mesin, operator_maintenance, coa, tgl_permintaan) 
         VALUES ($1, $2, $3, $4, 'Pending', $5, $6, $7, CURRENT_TIMESTAMP)`,
        [nextFab, item.id_barang, id_user, item.qty, mesin, operator_maintenance, coa]
      );
    }

    await client.query('COMMIT');
    res.status(200).json({ success: true, message: `FAB #${nextFab} Berhasil disimpan!`, no_fab: nextFab });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 2. FILTER DATA (GET)
router.get('/filter', async (req, res) => {
  const { bulan, tahun, divisi } = req.query;
  try {
    const query = `
      SELECT p.*, u.nama, d.nama_divisi, b.nama_barang, b.kode_sap, b.harga_sap
      FROM permintaan_barang p
      JOIN users u ON p.id_user = u.id_user
      JOIN divisi d ON u.id_divisi = d.id_divisi
      JOIN barang b ON p.id_barang = b.id_barang
      WHERE d.id_divisi = $1
      AND EXTRACT(MONTH FROM p.tgl_permintaan) = $2
      AND EXTRACT(YEAR FROM p.tgl_permintaan) = $3
      ORDER BY p.no_fab DESC, p.tgl_permintaan DESC`;
    const result = await pool.query(query, [divisi, bulan, tahun]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. HITUNG PEMAKAIAN BULAN BERJALAN (RESET BUDGET)
router.get('/pemakaian/:id_divisi', async (req, res) => {
  const { id_divisi } = req.params;
  try {
    const result = await pool.query(
      `SELECT SUM(p.qty * b.harga_sap) as total_bulan_ini
       FROM permintaan_barang p
       JOIN barang b ON p.id_barang = b.id_barang
       JOIN users u ON p.id_user = u.id_user
       WHERE u.id_divisi = $1 
       AND EXTRACT(MONTH FROM p.tgl_permintaan) = EXTRACT(MONTH FROM CURRENT_DATE)
       AND EXTRACT(YEAR FROM p.tgl_permintaan) = EXTRACT(YEAR FROM CURRENT_DATE)`,
      [id_divisi]
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