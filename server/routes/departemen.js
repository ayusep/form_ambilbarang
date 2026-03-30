const express = require('express');
const router = express.Router();
const pool = require('../db');

// --- GET SEMUA DIVISI ---
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM departemen ORDER BY id_departemen ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- POST DIVISI BARU (INI YANG MEMBUAT TOMBOL SIMPAN JALAN) ---
// --- POST DIVISI BARU ---
router.post('/', async (req, res) => {
  try {
    const { code_departemen, nama_departemen, limit_budget_pinjam } = req.body;
    
    if (!code_departemen || !nama_departemen || !limit_budget_pinjam) {
        return res.status(400).json({ error: "Data tidak lengkap" });
    }

    const query = 'INSERT INTO departemen (code_departemen, nama_departemen, limit_budget_pinjam) VALUES ($1, $2, $3) RETURNING *';
    const values = [code_departemen, nama_departemen, limit_budget_pinjam];
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]); 
  } catch (err) {
    console.error(err.message);
    
    // Memberikan pesan yang lebih jelas ke frontend
    if (err.code === '23505') { // 23505 adalah kode PostgreSQL untuk Unique Violation
        return res.status(400).json({ error: "Gagal: Kode departemen atau ID sudah ada!" });
    }
    
    res.status(500).json({ error: "Terjadi kesalahan pada server" });
  }
});

// --- DELETE DIVISI ---
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM departemen WHERE id_departemen = $1', [id]);
    res.json({ message: "Departemen berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ambil satu departemen berdasarkan ID dengan Perhitungan Budget Bulanan
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        d.id_departemen,
        d.code_departemen, 
        d.nama_departemen, 
        d.limit_budget_pinjam,
        COALESCE((
          SELECT SUM(b.harga_sap * p.qty)
          FROM permintaan_barang p
          JOIN barang b ON p.id_barang = b.id_barang
          JOIN users u ON p.id_user = u.id_user
          WHERE u.id_departemen = d.id_departemen
          AND p.status_approval != 'Rejected' -- <--- Tambahkan ini agar refund jalan
          AND EXTRACT(MONTH FROM p.tgl_permintaan) = EXTRACT(MONTH FROM CURRENT_DATE)
          AND EXTRACT(YEAR FROM p.tgl_permintaan) = EXTRACT(YEAR FROM CURRENT_DATE)
        ), 0) as terpakai_bulan_ini
      FROM departemen d
      WHERE d.id_departemen = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Departemen tidak ditemukan" });
    }

    const data = result.rows[0];
    const budgetAwal = parseFloat(data.limit_budget_pinjam) || 0;
    const terpakai = parseFloat(data.terpakai_bulan_ini) || 0;
    const sisaBudgetReal = budgetAwal - terpakai;

    res.json({
      id_departemen: data.id_departemen,
      code_departemen: data.code_departemen,
      nama_departemen: data.nama_departemen,
      limit_budget_pinjam: budgetAwal,
      terpakai_bulan_ini: terpakai,
      sisa_budget_real: sisaBudgetReal 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;