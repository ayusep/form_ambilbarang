const express = require('express');
const cors = require('cors');
const app = express();

// Middleware (PENTING: Harus di atas Route)
app.use(cors());
app.use(express.json()); 

// 1. Import file route-nya
const divisiRoutes = require('./routes/divisi');
const barangRoutes = require('./routes/barang');
const permintaanRoutes = require('./routes/permintaan'); // <-- CEK INI

// 2. Daftarkan alamat API-nya
app.use('/api/divisi', divisiRoutes);
app.use('/api/barang', barangRoutes);
app.use('/api/permintaan', permintaanRoutes); // <-- ALAMAT INI HARUS PERSIS

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});