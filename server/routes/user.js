const express = require('express');
const router = express.Router();
const pool = require('../db');
const { hashPassword } = require('../authHelper');

// Ambil SEMUA daftar user (Untuk UserList.jsx)
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id_user, 
        u.nama, 
        u.email, 
        u.role, 
        d.nama_departemen, 
        v.nama_divisi 
      FROM users u
      LEFT JOIN departemen d ON u.id_departemen = d.id_departemen
      LEFT JOIN divisi v ON u.id_divisi = v.id_divisi
      ORDER BY u.id_user ASC`;
      
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("ERROR GET ALL USERS:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Ambil satu profil
router.get('/profile/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        u.id_user, 
        u.nama, 
        u.email, 
        u.role, 
        u.no_telp,
        u.id_departemen, -- Tambahkan ini
        u.id_divisi,     -- Tambahkan ini
        d.nama_departemen, 
        v.nama_divisi 
      FROM users u
      LEFT JOIN departemen d ON u.id_departemen = d.id_departemen
      LEFT JOIN divisi v ON u.id_divisi = v.id_divisi
      WHERE u.id_user = $1`;
      
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("ERROR GET PROFILE:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE PROFIL & PASSWORD
router.put('/update/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, email, password } = req.body;

    // 1. Cek apakah user ada
    const userCheck = await pool.query('SELECT * FROM users WHERE id_user = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    let query;
    let values;

    // 2. Logika Update
    if (password && password.trim() !== "") {
      // GUNAKAN HELPERMU DI SINI
      const hashedPassword = hashPassword(password); 
      
      query = `
        UPDATE users 
        SET nama = $1, email = $2, password = $3 
        WHERE id_user = $4 
        RETURNING id_user, nama, email`;
      values = [nama, email, hashedPassword, id];
    } else {
      // Jika password kosong, hanya update nama & email
      query = `
        UPDATE users 
        SET nama = $1, email = $2 
        WHERE id_user = $3 
        RETURNING id_user, nama, email`;
      values = [nama, email, id];
    }

    const result = await pool.query(query, values);
    
    res.json({ 
      success: true, 
      message: "Profil berhasil diperbarui!", 
      user: result.rows[0] 
    });

  } catch (err) {
    console.error("ERROR UPDATE USER:", err.message);
    res.status(500).json({ error: "Gagal memperbarui data" });
  }
});


module.exports = router;