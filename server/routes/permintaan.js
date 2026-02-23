const express = require('express');
const router = express.Router();
const pool = require('../db');

// ROUTE: Simpan Permintaan Barang (FAB)
router.post('/', async (req, res) => {
  const { id_user, tujuan, items } = req.body;
  
  try {
    // 1. Ambil No FAB terbaru (Next Number)
    const lastFabResult = await pool.query('SELECT MAX(no_fab) as max_fab FROM permintaan_barang');
    const nextFab = (lastFabResult.rows[0].max_fab || 0) + 1;

    // 2. Loop untuk simpan setiap barang dari keranjang
    for (const item of items) {
      await pool.query(
        `INSERT INTO permintaan_barang (
          no_fab, 
          id_barang, 
          id_user, 
          qty, 
          status_approval, 
          tujuan, 
          keterangan, 
          tgl_permintaan
        ) VALUES ($1, $2, $3, $4, 'Pending', $5, NULL, CURRENT_TIMESTAMP)`,
        [
          nextFab, 
          item.id_barang, 
          id_user, 
          item.qty, 
          tujuan // SEKARANG MASUK KE KOLOM TUJUAN (Urutan ke-5)
        ]
      );
    }

    res.status(200).json({ success: true, message: `FAB #${nextFab} Berhasil disimpan!` });
  } catch (err) {
    console.error("Error Simpan Permintaan:", err.message);
    res.status(500).json({ error: "Gagal simpan transaksi: " + err.message });
  }
});

// ROUTE: Ambil Semua Data untuk Tabel (JOIN DATA)
router.get('/', async (req, res) => {
    try {
      const query = `
        SELECT 
          p.id_permintaan,
          p.no_fab,
          p.tgl_permintaan,
          u.nama,
          d.nama_divisi,
          b.nama_barang,
          b.kode_sap,
          p.qty,
          p.status_approval,
          p.tujuan,
          p.keterangan
        FROM permintaan_barang p
        JOIN users u ON p.id_user = u.id_user
        JOIN divisi d ON u.id_divisi = d.id_divisi
        JOIN barang b ON p.id_barang = b.id_barang
        ORDER BY p.no_fab DESC, p.id_permintaan ASC
      `;
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (err) {
      console.error("Error Fetch Data:", err.message);
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;