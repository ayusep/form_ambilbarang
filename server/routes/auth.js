const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari user berdasarkan email
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Email tidak ditemukan!" });
    }

    const user = result.rows[0];

    // Cek password (plain text sesuai gambar database kamu)
    if (password !== user.password) {
      return res.status(401).json({ message: "Password salah!" });
    }

    // Kirim data user ke frontend
    res.json({
      success: true,
      user: {
        id_user: user.id_user,
        nama: user.nama,
        role: user.role,
        id_divisi: user.id_divisi
      }
    });

  } catch (err) {
    console.error("ERROR LOGIN:", err.message);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

module.exports = router;