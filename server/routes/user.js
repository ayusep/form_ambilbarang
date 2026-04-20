const express = require('express');
const router = express.Router();
const pool = require('../db');
const { hashPassword } = require('../authHelper');

// ... (import tetap sama)

// 1. Ambil SEMUA daftar user (Ditambah no_telp)
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT 
        u.id_user, u.nama, u.email, u.role, u.no_telp,
        d.nama_departemen, v.nama_divisi 
      FROM users u
      LEFT JOIN departemen d ON u.id_departemen = d.id_departemen
      LEFT JOIN divisi v ON u.id_divisi = v.id_divisi
      ORDER BY u.id_user DESC`; // Diubah ke DESC agar user baru di atas
      
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE USER
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM users WHERE id_user = $1", [id]);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Gagal menghapus user. Pastikan user tidak terikat data transaksi." });
  }
});

// server\routes\user.js (Bagian PUT /:id)
// server\routes\user.js (Bagian PUT /:id yang sudah diperbaiki)
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nama, email, role, no_telp, id_divisi, id_departemen, password } = req.body;

  try {
    // 1. Validasi Tipe Data: Pastikan ID adalah angka atau NULL, bukan string kosong ""
    const cleanId = parseInt(id);
    const cleanDivisi = id_divisi ? parseInt(id_divisi) : null;
    const cleanDept = id_departemen ? parseInt(id_departemen) : null;

    // 2. Cek apakah user memang ada sebelum update
    const checkUser = await pool.query("SELECT id_user FROM users WHERE id_user = $1", [cleanId]);
    if (checkUser.rows.length === 0) {
      return res.status(404).json({ error: "User tidak ditemukan" });
    }

    let query;
    let params;

    // 3. Logika Update dengan Password atau Tanpa Password
    if (password && password.trim() !== "") {
      const hashedPassword = hashPassword(password); 
      query = `
        UPDATE users 
        SET nama=$1, email=$2, role=$3, no_telp=$4, id_divisi=$5, id_departemen=$6, password=$7 
        WHERE id_user=$8`;
      params = [nama, email, role, no_telp, cleanDivisi, cleanDept, hashedPassword, cleanId];
    } else {
      query = `
        UPDATE users 
        SET nama=$1, email=$2, role=$3, no_telp=$4, id_divisi=$5, id_departemen=$6 
        WHERE id_user=$7`;
      params = [nama, email, role, no_telp, cleanDivisi, cleanDept, cleanId];
    }

    await pool.query(query, params);
    res.json({ success: true, message: "Data berhasil diperbarui" });

  } catch (err) {
    // Tampilkan detail error di terminal VS Code agar Ayu bisa baca penyebabnya
    console.error("DATABASE ERROR:", err.message);
    
    // Kirim pesan yang lebih spesifik ke frontend
    res.status(500).json({ 
      error: "Gagal menyimpan perubahan.", 
      detail: err.message 
    });
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