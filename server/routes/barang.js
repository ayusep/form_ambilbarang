// server/routes/barang.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/search', async (req, res) => {
  const { q } = req.query;
  try {
    const result = await pool.query(
      `SELECT id_barang, kode_sap, nama_barang, harga_sap, stok 
       FROM barang 
       WHERE (nama_barang ILIKE $1 OR kode_sap ILIKE $1) 
       AND stok > 0 LIMIT 5`,
      [`%${q}%`]
    );
    res.json(result.rows); // Pastikan ini mengirim JSON, bukan render HTML
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Database Error" });
  }
});

// 2. ROUTE UMUM DI BAWAHNYA
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM barang ORDER BY id_barang ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;