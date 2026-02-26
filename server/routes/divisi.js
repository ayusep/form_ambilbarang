const express = require('express');
const router = express.Router();
const pool = require('../db');

// --- GET SEMUA DIVISI ---
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM divisi ORDER BY id_divisi ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- POST DIVISI BARU (INI YANG MEMBUAT TOMBOL SIMPAN JALAN) ---
router.post('/', async (req, res) => {
  try {
    const { nama_divisi, limit_budget_pinjam } = req.body;
    
    // Validasi data
    if (!nama_divisi || !limit_budget_pinjam) {
        return res.status(400).json({ error: "Data tidak lengkap" });
    }

    const query = 'INSERT INTO divisi (nama_divisi, limit_budget_pinjam) VALUES ($1, $2) RETURNING *';
    const values = [nama_divisi, limit_budget_pinjam];
    
    const result = await pool.query(query, values);
    res.status(201).json(result.rows[0]); // Berhasil simpan
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Gagal menyimpan ke database: " + err.message });
  }
});

// --- DELETE DIVISI ---
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM divisi WHERE id_divisi = $1', [id]);
    res.json({ message: "Divisi berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ambil satu divisi berdasarkan ID dengan Perhitungan Budget Bulanan
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Query ini mengambil data divisi dan menjumlahkan pemakaian budget bulan ini
    // Pemakaian dihitung dari (harga_sap * qty) pada tabel permintaan_barang
    const query = `
      SELECT 
        d.id_divisi, 
        d.nama_divisi, 
        d.limit_budget_pinjam,
        COALESCE((
          SELECT SUM(b.harga_sap * p.qty)
          FROM permintaan_barang p
          JOIN barang b ON p.id_barang = b.id_barang
          JOIN users u ON p.id_user = u.id_user
          WHERE u.id_divisi = d.id_divisi
          AND EXTRACT(MONTH FROM p.tgl_permintaan) = EXTRACT(MONTH FROM CURRENT_DATE)
          AND EXTRACT(YEAR FROM p.tgl_permintaan) = EXTRACT(YEAR FROM CURRENT_DATE)
        ), 0) as terpakai_bulan_ini
      FROM divisi d
      WHERE d.id_divisi = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Divisi tidak ditemukan" });
    }

    const data = result.rows[0];
    
    // Hitung sisa budget secara dinamis
    const budgetAwal = parseFloat(data.limit_budget_pinjam);
    const terpakai = parseFloat(data.terpakai_bulan_ini);
    const sisaBudgetReal = budgetAwal - terpakai;

    res.json({
      id_divisi: data.id_divisi,
      nama_divisi: data.nama_divisi,
      limit_budget_pinjam: budgetAwal, // Plafon asli (misal 5jt)
      terpakai_bulan_ini: terpakai,
      sisa_budget_real: sisaBudgetReal // Ini yang akan ditampilkan di React
    });

  } catch (err) {
    console.error("Error Get Divisi Budget:", err.message);
    res.status(500).json({ error: "Server error: " + err.message });
  }
});

module.exports = router;