const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

// Middleware
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 1. IMPORT ROUTES
const authRoutes = require('./routes/auth'); // Pastikan path-nya benar
const barangRoutes = require('./routes/barang');
const departemenRoutes = require('./routes/departemen');
const userRoute = require('./routes/user');
const permintaanRoutes = require('./routes/permintaan');
const divisiRoutes = require('./routes/divisi');
const budgetingRoute = require('./routes/budgeting'); // Sesuaikan path-nya

// 2. GUNAKAN ROUTES
app.use('/api/auth', authRoutes); // Ini akan membuat URL: http://localhost:5000/api/auth/login
app.use('/api/barang', barangRoutes);
app.use('/api/departemen', departemenRoutes);
app.use('/api/permintaan', permintaanRoutes);
app.use('/api/divisi', divisiRoutes);
app.use('/api/user', userRoute);
app.use('/api/budgeting', budgetingRoute);

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server jalan di port ${PORT}`);
});