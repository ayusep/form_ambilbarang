const express = require('express');
const router = express.Router();
const pool = require('../db');

// Route utama untuk ambil semua barang
router.get('/', async (req, res) => {
  console.log("Ada permintaan masuk ke GET /api/barang"); // Cek ini di terminal
  try {
    const result = await pool.query('SELECT * FROM barang ORDER BY id_barang ASC');
    res.json(result.rows);
  } catch (err) {
    console.error("Kesalahan Query:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Pastikan baris ini ADA dan paling bawah!
module.exports = router;