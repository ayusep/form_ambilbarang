const express = require('express');
const router = express.Router();
const pool = require('../db');

// 1. Ambil Semua
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM barang ORDER BY id_barang DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Search (DIREVISI)
router.get('/search', async (req, res) => {
  const { q } = req.query;
  try {
    const result = await pool.query(
      `SELECT * FROM barang 
       WHERE nama_barang ILIKE $1 
          OR kode_sap ILIKE $1 
          OR item_groub::TEXT ILIKE $1  -- Tambahkan ::TEXT di sini
       LIMIT 10`,
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Database Error:", err.message); // Agar muncul di terminal VS Code
    res.status(500).json({ error: err.message });
  }
});

// 3. Tambah Manual
router.post('/add', async (req, res) => {
  const { kode_sap, nama_barang, harga_sap, item_groub, satuan, stok } = req.body;
  try {
    const checkExist = await pool.query('SELECT kode_sap FROM barang WHERE kode_sap = $1', [kode_sap]);
    if (checkExist.rows.length > 0) return res.status(400).json({ error: "Kode SAP sudah ada!" });

    const result = await pool.query(
      `INSERT INTO barang (kode_sap, nama_barang, harga_sap, item_groub, satuan, stok) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [kode_sap, nama_barang, harga_sap, item_groub, satuan, stok || 0]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
});

// 4. Import Bulk (FIXED: One route only)
router.post('/import', async (req, res) => {
  const { items } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const item of items) {
      await client.query(
        `INSERT INTO barang (kode_sap, nama_barang, harga_sap, item_groub, satuan, stok)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (kode_sap) 
         DO UPDATE SET 
            nama_barang = EXCLUDED.nama_barang,
            harga_sap = EXCLUDED.harga_sap,
            item_groub = EXCLUDED.item_groub,
            satuan = EXCLUDED.satuan,
            stok = EXCLUDED.stok`,
        [item.kode_sap, item.nama_barang, item.harga_sap, item.item_groub, item.satuan, item.stok || 0]
      );
    }
    await client.query('COMMIT');
    res.json({ message: "Import Berhasil" });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;