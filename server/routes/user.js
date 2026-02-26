const express = require('express');
const router = express.Router();
const pool = require('../db');

// Ambil Profil User berdasarkan ID
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Kita JOIN dengan tabel divisi supaya dapat nama divisinya, bukan cuma ID
    const query = `
      SELECT 
        u.id_user, 
        u.nama, 
        u.email, 
        u.role, 
        d.nama_divisi 
      FROM users u
      LEFT JOIN divisi d ON u.id_divisi = d.id_divisi
      WHERE u.id_user = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("ERROR GET PROFILE:", err.message);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

module.exports = router;