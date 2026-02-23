const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Penting agar bisa baca body JSON dari Login.jsx

// 1. IMPORT ROUTES
const authRoutes = require('./routes/auth'); // Pastikan path-nya benar
const barangRoutes = require('./routes/barang');
const divisiRoutes = require('./routes/divisi');
const permintaanRoutes = require('./routes/permintaan');

// 2. GUNAKAN ROUTES
app.use('/api/auth', authRoutes); // Ini akan membuat URL: http://localhost:5000/api/auth/login
app.use('/api/barang', barangRoutes);
app.use('/api/divisi', divisiRoutes);
app.use('/api/permintaan', permintaanRoutes);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server jalan di port ${PORT}`);
});