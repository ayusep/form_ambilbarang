import React, { useState, useEffect } from 'react';

const CreateRequest = ({ user }) => {
  const [tujuan, setTujuan] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [qty, setQty] = useState(1);
  const [selectedBarang, setSelectedBarang] = useState(null);

  // 1. Logic Search Barang (Live Search)
  useEffect(() => {
    const fetchBarang = async () => {
      if (searchTerm.length > 1 && !selectedBarang) {
        try {
          const response = await fetch(`http://localhost:5000/api/barang/search?q=${searchTerm}`);
          const data = await response.json();
          setResults(data);
        } catch (err) {
          console.error("Gagal mengambil data search:", err);
        }
      } else {
        setResults([]);
      }
    };

    fetchBarang();
  }, [searchTerm, selectedBarang]);

  // 2. Logika Tambah ke Keranjang
  const addToCart = () => {
    if (!selectedBarang) return alert("Pilih barang dari rekomendasi!");
    if (qty <= 0) return alert("Jumlah (Qty) harus lebih dari 0!");
    if (qty > selectedBarang.stok) return alert(`Stok tidak mencukupi! Sisa stok: ${selectedBarang.stok}`);

    const harga = parseFloat(selectedBarang.harga_sap);
    const jumlah = parseInt(qty);

    const newItem = {
      id_barang: selectedBarang.id_barang,
      kode_sap: selectedBarang.kode_sap,
      nama_barang: selectedBarang.nama_barang,
      harga_sap: harga,
      qty: jumlah,
      total_baris: harga * jumlah // Kalkulasi per baris
    };

    setCart([...cart, newItem]);
    
    // Reset form input barang
    setSearchTerm("");
    setSelectedBarang(null);
    setQty(1);
  };

  // 3. Hitung Grand Total
  const grandTotal = cart.reduce((sum, item) => sum + item.total_baris, 0);

  // 4. Simpan ke Database
  const handleSimpan = async () => {
    if (!tujuan) return alert("Harap isi tujuan penggunaan!");
    if (cart.length === 0) return alert("Keranjang masih kosong!");

    try {
      const response = await fetch('http://localhost:5000/api/permintaan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_user: user.id_user,
          tujuan: tujuan, // Masuk ke kolom 'keterangan' di backend
          items: cart
        })
      });

      if (response.ok) {
        alert("✅ Berhasil menyimpan Transaksi FAB!");
        setCart([]);
        setTujuan("");
      } else {
        const errorData = await response.json();
        alert("Gagal simpan: " + errorData.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi ke server.");
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginBottom: '20px', color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>
        📝 Form Ambil Barang (FAB)
      </h2>

      {/* Field Tujuan */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontWeight: 'bold' }}>Tujuan Penggunaan:</label>
        <input 
          type="text" 
          value={tujuan} 
          onChange={(e) => setTujuan(e.target.value)}
          placeholder="Masukkan tujuan (misal: Maintenance Mesin A)"
          style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
        />
      </div>

      {/* Search & Qty Section */}
      <div style={{ display: 'flex', gap: '10px', position: 'relative', marginBottom: '30px' }}>
        <div style={{ flex: 3 }}>
          <label style={{ fontWeight: 'bold' }}>Cari Barang (SAP / Nama):</label>
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => { setSearchTerm(e.target.value); setSelectedBarang(null); }}
            placeholder="Ketik minimal 2 huruf..."
            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #3498db', boxSizing: 'border-box' }}
          />
          
          {/* Dropdown Hasil Search */}
          {results.length > 0 && (
            <div style={{ position: 'absolute', zIndex: 100, background: 'white', border: '1px solid #ddd', width: '100%', borderRadius: '4px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
              {results.map(b => (
                <div 
                  key={b.id_barang} 
                  onClick={() => { 
                    setSelectedBarang(b); 
                    setSearchTerm(`${b.kode_sap} - ${b.nama_barang}`); 
                    setResults([]); 
                  }}
                  style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f1f2f6'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
                >
                  <strong>{b.kode_sap}</strong> - {b.nama_barang} (Stok: {b.stok}) - Rp {Number(b.harga_sap).toLocaleString('id-ID')}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ fontWeight: 'bold' }}>Qty:</label>
          <input 
            type="number" 
            value={qty} 
            onChange={(e) => setQty(e.target.value)}
            style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
          <button 
            onClick={addToCart}
            style={{ width: '100%', padding: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Tambah
          </button>
        </div>
      </div>

      {/* Tabel Keranjang */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
            <th style={{ padding: '12px', border: '1px solid #ddd' }}>Barang</th>
            <th style={{ padding: '12px', border: '1px solid #ddd' }}>Harga Satuan</th>
            <th style={{ padding: '12px', border: '1px solid #ddd' }}>Qty</th>
            <th style={{ padding: '12px', border: '1px solid #ddd' }}>Total</th>
            <th style={{ padding: '12px', border: '1px solid #ddd' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {cart.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Belum ada barang di keranjang</td>
            </tr>
          ) : (
            cart.map((item, idx) => (
              <tr key={idx}>
                <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                  {item.kode_sap} - {item.nama_barang}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>
                  Rp {item.harga_sap.toLocaleString('id-ID')}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  {item.qty}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right', fontWeight: 'bold' }}>
                  Rp {item.total_baris.toLocaleString('id-ID')}
                </td>
                <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
                  <button 
                    onClick={() => setCart(cart.filter((_, i) => i !== idx))} 
                    style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Batal
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
        <tfoot>
          <tr style={{ backgroundColor: '#f9f9f9', fontWeight: 'bold' }}>
            <td colSpan="3" style={{ textAlign: 'right', padding: '10px', border: '1px solid #ddd' }}>Grand Total:</td>
            <td style={{ textAlign: 'right', padding: '10px', color: '#2c3e50', border: '1px solid #ddd' }}>
              Rp {grandTotal.toLocaleString('id-ID')}
            </td>
            <td style={{ border: '1px solid #ddd' }}></td>
          </tr>
        </tfoot>
      </table>

      {/* Tombol Simpan Akhir */}
      <button 
        onClick={handleSimpan}
        style={{ width: '100%', padding: '15px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
      >
        SIMPAN TRANSAKSI FAB
      </button>
    </div>
  );
};

export default CreateRequest;