const express = require('express');
const router = express.Router();
const pool = require('../db');

// Ambil semua divisi + Nama Departemen (Gunakan LEFT JOIN agar data tetap muncul meski dept dihapus)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                divisi.*, 
                departemen.nama_departemen 
            FROM divisi 
            LEFT JOIN departemen ON divisi.id_departemen = departemen.id_departemen
            ORDER BY divisi.id_divisi DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Tambah Divisi
router.post('/', async (req, res) => {
    const { code_divisi, nama_divisi, id_departemen } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO divisi (id_departemen, code_divisi, nama_divisi) VALUES ($1, $2, $3) RETURNING *',
            [parseInt(id_departemen), code_divisi, nama_divisi]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("ERROR DB:", err.message); // LIHAT TERMINAL VS CODE ANDA
        res.status(500).json({ error: err.message });
    }
});

// Hapus Divisi
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM divisi WHERE id_divisi = $1', [id]);
        res.json({ message: "Divisi berhasil dihapus" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;