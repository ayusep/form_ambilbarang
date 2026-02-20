const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  try {
    const { items, keterangan } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Keranjang kosong!" });
    }

    for (const item of items) {
      // Kita pakai query yang SANGAT SEDERHANA dulu untuk tes
      const query = `
        INSERT INTO permintaan_barang (id_barang, qty, status_approval, keterangan) 
        VALUES ($1, $2, $3, $4)
      `;
      const values = [item.id_barang, item.qty, 'Pending', keterangan || ''];
      
      await pool.query(query, values);
    }

    res.status(200).json({ message: "FAB Berhasil Disimpan!" });
  } catch (err) {
    // INI AKAN MUNCUL DI TERMINAL VS CODE KAMU
    console.error("=== ERROR DATABASE DETECTED ===");
    console.error("Pesan Error:", err.message);
    console.error("Detail:", err.detail);
    console.error("===============================");
    
    res.status(500).json({ error: err.message });
  }
});

// Route GET untuk nampilin data di tabel Data Request
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, b.nama_barang 
      FROM permintaan_barang p
      LEFT JOIN barang b ON p.id_barang = b.id_barang
      ORDER BY p.no_fab DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;