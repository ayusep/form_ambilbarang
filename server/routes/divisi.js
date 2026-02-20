const express = require('express');
const router = express.Router();
const pool = require('../db');

// Ambil semua divisi
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM divisi ORDER BY id_divisi ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
  }
});

// Tambah divisi
router.post('/', async (req, res) => {
  try {
    const { nama_divisi, limit_budget_pinjam } = req.body;
    const newDivisi = await pool.query(
      'INSERT INTO divisi (nama_divisi, limit_budget_pinjam) VALUES($1, $2) RETURNING *',
      [nama_divisi, limit_budget_pinjam]
    );
    res.json(newDivisi.rows[0]);
  } catch (err) {
    console.error(err.message);
  }
});

module.exports = router;