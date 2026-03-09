const express = require('express');
const router = express.Router();
const pool = require('../db');

// Ambil SEMUA daftar user (Untuk UserList.jsx)
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT u.id_user, u.nama, u.email, u.role, d.nama_divisi 
      FROM users u
      LEFT JOIN divisi d ON u.id_divisi = d.id_divisi
      ORDER BY u.id_user ASC`;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ambil satu profil (Pindahkan dari auth.js ke sini)
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT u.id_user, u.nama, u.email, u.role, d.nama_divisi 
      FROM users u
      LEFT JOIN divisi d ON u.id_divisi = d.id_divisi
      WHERE u.id_user = $1`;
    const result = await pool.query(query, [id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;