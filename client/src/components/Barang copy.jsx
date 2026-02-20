import { useEffect, useState } from 'react';

const Barang = () => {
  const [barang, setBarang] = useState([]);

  // Fungsi untuk mengambil data barang dari backend
  const getBarang = async () => {
  try {
    // Pastikan pakai http://localhost:5000
    const response = await fetch('http://localhost:5000/api/barang'); 
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    setBarang(data);
  } catch (err) {
    console.error("Gagal ambil data barang:", err);
  }
};

  // Jalankan getBarang saat komponen pertama kali dibuka
  useEffect(() => {
    getBarang();
  }, []);

  return (
    <>
      {/* HEADER - UI Identik dengan Divisi */}
      <header style={{ marginBottom: '30px' }}>
        <h1>Stok Barang (Master SAP)</h1>
        <p>Daftar material yang ditarik dari sistem SAP pusat.</p>
      </header>

      {/* TABEL DATA - UI Identik dengan Divisi */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '12px' }}>Kode SAP</th>
              <th style={{ padding: '12px' }}>Nama Barang</th>
              <th style={{ padding: '12px' }}>Harga SAP (Rp)</th>
              <th style={{ padding: '12px' }}>Stok</th>
            </tr>
          </thead>
          <tbody>
            {barang.length > 0 ? (
              barang.map((item) => (
                <tr key={item.id_barang} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{item.nama_barang}</td>
                <td style={{ padding: '12px' }}>{item.harga_sap}</td>
                <td style={{ padding: '12px' }}>{Number(item.stok).toLocaleString('id-ID')}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                  Memuat data atau data barang kosong...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Barang;