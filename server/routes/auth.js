const express = require('express');
const router = express.Router();
const pool = require('../db');

// --- 1. ROUTE REGISTER (BARU) ---
router.post('/register', async (req, res) => {
  const { nama, email, password, role, id_divisi, no_telp} = req.body;

  try {
    // Cek apakah email sudah ada
    const checkEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar!" });
    }

    // Simpan user baru (Plain Text Password)
    const result = await pool.query(
      `INSERT INTO users (nama, email, password, role, id_divisi, no_telp) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id_user, nama, role`,
      [nama, email, password, role, id_divisi, no_telp]
    );

    res.status(201).json({ 
      success: true, 
      message: "User berhasil didaftarkan!",
      user: result.rows[0]
    });

  } catch (err) {
    console.error("ERROR REGISTER:", err.message);
if (err.code === '23505') {
      if (err.constraint === 'unique_email') {
        return res.status(400).json({ message: "Email sudah digunakan oleh user lain!" });
      }
      if (err.constraint === 'unique_no_telp') {
        return res.status(400).json({ message: "Nomor telepon sudah digunakan oleh user lain!" });
      }
    }


    res.status(500).json({ message: "Gagal mendaftarkan user: " + err.message });
  }
});

// --- 2. ROUTE LOGIN (EXISTING) ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Email tidak ditemukan!" });
    }

    const user = result.rows[0];

    // Cek password plain text
    if (password !== user.password) {
      return res.status(401).json({ message: "Password salah!" });
    }

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