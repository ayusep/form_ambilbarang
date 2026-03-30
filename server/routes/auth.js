const express = require('express');
const router = express.Router();
const pool = require('../db');
const { hashPassword, verifyPassword } = require('../authHelper');

// --- 1. ROUTE REGISTER ---
router.post('/register', async (req, res) => {
  // Tambahkan id_divisi di destructuring req.body
  const { nama, email, password, role, id_departemen, id_divisi, no_telp } = req.body;

  try {
    const checkEmail = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar!" });
    }

    const hashedPassword = hashPassword(password);

    // Tambahkan id_divisi ke dalam query INSERT ($7)
    const result = await pool.query(
      `INSERT INTO users (nama, email, password, role, id_departemen, id_divisi, no_telp) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id_user, nama, role`,
      [nama, email, hashedPassword, role, id_departemen, id_divisi, no_telp]
    );

    res.status(201).json({ 
      success: true, 
      message: "User berhasil didaftarkan!",
      user: result.rows[0]
    });

  } catch (err) {
    console.error("ERROR REGISTER:", err.message);
    res.status(500).json({ message: "Gagal mendaftarkan user: " + err.message });
  }
});

// --- 2. ROUTE LOGIN ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Tambahkan JOIN ke tabel divisi agar nama divisi muncul saat login
    const result = await pool.query(`
      SELECT u.*, d.nama_departemen, v.nama_divisi 
      FROM users u
      LEFT JOIN departemen d ON u.id_departemen = d.id_departemen
      LEFT JOIN divisi v ON u.id_divisi = v.id_divisi
      WHERE u.email = $1
    `, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Email tidak ditemukan!" });
    }

    const user = result.rows[0];
    const isPasswordValid = verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password salah!" });
    }

    res.json({
      success: true,
      user: {
        id_user: user.id_user,
        nama: user.nama,
        role: user.role,
        id_departemen: user.id_departemen,
        nama_departemen: user.nama_departemen,
        id_divisi: user.id_divisi,        // Tambahkan ini
        nama_divisi: user.nama_divisi     // Tambahkan ini
      }
    });

  } catch (err) {
    console.error("ERROR LOGIN:", err.message);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
});

module.exports = router;