import { useEffect, useState } from 'react';

const CreateRequest = () => {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [qty, setQty] = useState(1);
  const [cart, setCart] = useState([]);
  const [purpose, setPurpose] = useState("");
  const [note, setNote] = useState(""); // State baru untuk kolom keterangan

  const getItems = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/barang');
      const data = await response.json();
      setItems(data);
    } catch (err) {
      console.error("Gagal ambil barang:", err);
    }
  };

  useEffect(() => {
    getItems();
  }, []);

  const addItem = () => {
    if (!selectedItem) {
      alert("Pilih barang dulu!");
      return;
    }

    const itemDetail = items.find(i => i.id_barang === Number(selectedItem));

    if (qty <= 0) {
      alert("Jumlah harus lebih dari 0");
      return;
    }

    const newItem = {
      id_barang: itemDetail.id_barang,
      nama_barang: itemDetail.nama_barang,
      harga_sap: itemDetail.harga_sap,
      qty: Number(qty),
      subtotal: Number(itemDetail.harga_sap) * Number(qty)
    };

    setCart(prev => [...prev, newItem]);
    setSelectedItem("");
    setQty(1);
  };

  const submitRequest = async () => {
    if (!purpose || cart.length === 0) {
      alert("Tujuan dan daftar barang tidak boleh kosong!");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/permintaan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_user: 1, 
          tujuan: purpose,
          keterangan: note, // Menambah keterangan sesuai DB
          status_approval: "Pending", // Default status sesuai kolom DB
          items: cart
        })
      });

      if (response.ok) {
        alert("Form Ambil Barang (FAB) Berhasil Dikirim!");
        setCart([]);
        setPurpose("");
        setNote("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeCartItem = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const total = cart.reduce((a, b) => a + b.subtotal, 0);

  return (
    <>
      <header style={{ marginBottom: '30px' }}>
        <h1>📝 Form Ambil Barang (FAB)</h1>
        <p>Silakan isi detail kebutuhan barang inventaris di bawah ini.</p>
      </header>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h3>Detail Permintaan</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <input
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            type="text"
            placeholder="Tujuan Permintaan (Contoh: Event Marketing)"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
          />

          {/* Input Keterangan Baru */}
          <textarea
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ddd', minHeight: '80px', fontFamily: 'Arial' }}
            placeholder="Keterangan tambahan (Opsional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
            <select 
              style={{ padding: '10px', flex: 2, borderRadius: '4px', border: '1px solid #ddd' }}
              value={selectedItem}
              onChange={(e) => setSelectedItem(e.target.value)}
            >
              <option value="">-- Pilih Barang --</option>
              {items.map(i => (
                <option key={i.id_barang} value={i.id_barang}>
                  {i.nama_barang} (Stok: {i.stok} {i.satuan})
                </option>
              ))}
            </select>

            <input
              style={{ padding: '10px', flex: 1, borderRadius: '4px', border: '1px solid #ddd' }}
              type="number"
              placeholder="Qty"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
            />

            <button 
              onClick={addItem}
              style={{ padding: '10px 25px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Tambah Barang
            </button>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '12px' }}>Nama Barang</th>
              <th style={{ padding: '12px' }}>Harga</th>
              <th style={{ padding: '12px' }}>Qty</th>
              <th style={{ padding: '12px' }}>Subtotal</th>
              <th style={{ padding: '12px' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {cart.length > 0 ? (
              cart.map((c, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px' }}>{c.nama_barang}</td>
                  <td style={{ padding: '12px' }}>Rp {Number(c.harga_sap).toLocaleString('id-ID')}</td>
                  <td style={{ padding: '12px' }}>{c.qty}</td>
                  <td style={{ padding: '12px' }}>Rp {c.subtotal.toLocaleString('id-ID')}</td>
                  <td style={{ padding: '12px' }}>
                    <button onClick={() => removeCartItem(index)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Batal</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Keranjang FAB masih kosong.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '2px solid #eee', paddingTop: '20px' }}>
          <h2 style={{ color: '#2c3e50' }}>Total Estimasi: Rp {total.toLocaleString('id-ID')}</h2>
          <button 
            onClick={submitRequest}
            style={{ padding: '12px 30px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
          >
            Simpan & Kirim FAB
          </button>
        </div>
      </div>
    </>
  );
};

export default CreateRequest;