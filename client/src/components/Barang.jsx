import { useEffect, useState } from 'react';

const Barang = () => {
  const [Barang, setBarang] = useState([]);

  const getBarang = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/barang');
      const data = await response.json();
      setBarang(data);
    } catch (err) { 
      console.error("Gagal ambil Barang:", err); 
    }
  };

  useEffect(() => { 
    getBarang(); 
  }, []);

  return (
    <>
      <header style={{ marginBottom: '30px' }}>
        <h1>Stok Barang (Master SAP)</h1>
        <p>Daftar material yang ditarik dari sistem SAP pusat.</p>
      </header>
      
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '12px' }}>Kode SAP</th>
              <th style={{ padding: '12px' }}>Nama Barang</th>
              <th style={{ padding: '12px' }}>Harga (Rp)</th>
              <th style={{ padding: '12px' }}>Stok</th>
            </tr>
          </thead>
          <tbody>
            {Barang.map((item) => (
              <tr key={item.id_barang} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{item.id_barang}</td>
                <td style={{ padding: '12px' }}>{item.nama_barang}</td>
                <td style={{ padding: '12px' }}>{item.harga_sap}</td>
                <td style={{ padding: '12px' }}>{Number(item.stok).toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Barang;