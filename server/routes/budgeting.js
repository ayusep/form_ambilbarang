const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET Semua riwayat budget (untuk tabel riwayat)
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT b.*, d.nama_departemen 
            FROM budgeting b
            JOIN departemen d ON b.id_departemen = d.id_departemen
            ORDER BY b.tgl_input DESC`;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST Budget Baru / Revisi
router.post('/', async (req, res) => {
    const { id_departemen, bulan, tahun, limit_budget, keterangan } = req.body;
    try {
        // 1. Matikan status_aktif untuk budget departemen tersebut di bulan & tahun yang sama
        await pool.query(
            'UPDATE budgeting SET status_aktif = FALSE WHERE id_departemen = $1 AND bulan = $2 AND tahun = $3',
            [id_departemen, bulan, tahun]
        );

        // 2. Insert budget baru sebagai yang AKTIF
        const query = `
            INSERT INTO budgeting (id_departemen, bulan, tahun, limit_budget, keterangan, status_aktif)
            VALUES ($1, $2, $3, $4, $5, TRUE) RETURNING *`;
        const values = [id_departemen, bulan, tahun, limit_budget, keterangan];
        const result = await pool.query(query, values);
        
        res.status(201).json(result.rows[0]);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Endpoint khusus untuk Form FAB (mengambil budget aktif saat ini)
router.get('/current/:id_dept', async (req, res) => {
    try {
        const { id_dept } = req.params;
        const query = `
            SELECT b.limit_budget, d.nama_departemen
            FROM budgeting b
            JOIN departemen d ON b.id_departemen = d.id_departemen
            WHERE b.id_departemen = $1 
              AND b.bulan = EXTRACT(MONTH FROM CURRENT_DATE)
              AND b.tahun = EXTRACT(YEAR FROM CURRENT_DATE)
              AND b.status_aktif = TRUE
            LIMIT 1`;
        const result = await pool.query(query, [id_dept]);
        res.json(result.rows[0] || { limit_budget: 0 });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;