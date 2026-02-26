import React, { useState, useEffect } from 'react';

const CreateRequest = ({ user }) => {
  const [mesin, setMesin] = useState("");
  const [operator, setOperator] = useState("");
  const [coa, setCoa] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [qty, setQty] = useState(1);
  const [selectedBarang, setSelectedBarang] = useState(null);

  // --- LOGIKA BUDGET BULANAN ---
  const [limitBudgetPinjam, setLimitBudgetPinjam] = useState(0);
  const [pemakaianBulanIni, setPemakaianBulanIni] = useState(0);
  const [namaDivisi, setNamaDivisi] = useState("");

  // 1. Ambil Data Budget & Pemakaian (Reset Otomatis Logika)
  useEffect(() => {
    const fetchBudgetData = async () => {
      if (user?.id_divisi) {
        try {
          // A. Ambil Limit Statis Divisi
          const resDivisi = await fetch(`http://localhost:5000/api/divisi/${user.id_divisi}`);
          const dataDivisi = await resDivisi.json();
          setLimitBudgetPinjam(parseFloat(dataDivisi.limit_budget_pinjam) || 0);
          setNamaDivisi(dataDivisi.nama_divisi || "");

          // B. Ambil Total Pemakaian khusus Bulan Ini dari DB
          const resPemakaian = await fetch(`http://localhost:5000/api/permintaan/pemakaian/${user.id_divisi}`);
          const dataPemakaian = await resPemakaian.json();
          setPemakaianBulanIni(parseFloat(dataPemakaian.total_bulan_ini) || 0);
        } catch (err) {
          console.error("Gagal sinkronisasi data budget:", err);
        }
      }
    };
    fetchBudgetData();
  }, [user]);

  // Kalkulasi Real-time: Limit - (Sudah terpakai di DB bulan ini) - (Yang ada di keranjang)
  const totalKeranjang = cart.reduce((sum, item) => sum + item.total_baris, 0);
  const sisaBudget = limitBudgetPinjam - pemakaianBulanIni - totalKeranjang;

  // 2. Logic Search Barang
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

  // 3. Tambah ke Keranjang + Proteksi Budget
  const addToCart = () => {
    if (!selectedBarang) return alert("Pilih barang dari rekomendasi!");
    if (qty <= 0) return alert("Jumlah (Qty) harus lebih dari 0!");
    if (qty > selectedBarang.stok) return alert(`Stok tidak mencukupi! Sisa stok: ${selectedBarang.stok}`);

    const harga = parseFloat(selectedBarang.harga_sap);
    const jumlah = parseInt(qty);
    const totalHargaBarangBaru = harga * jumlah;

    if (totalHargaBarangBaru > sisaBudget) {
      alert(`⚠️ LIMIT BUDGET TERCAPAI!\n\nSisa Budget ${namaDivisi} bulan ini: Rp ${sisaBudget.toLocaleString('id-ID')}\nHarga barang yang diminta: Rp ${totalHargaBarangBaru.toLocaleString('id-ID')}\n\nPermintaan ditolak karena melebihi limit.`);
      return;
    }

    const newItem = {
      id_barang: selectedBarang.id_barang,
      kode_sap: selectedBarang.kode_sap,
      nama_barang: selectedBarang.nama_barang,
      harga_sap: harga,
      qty: jumlah,
      total_baris: totalHargaBarangBaru
    };

    setCart([...cart, newItem]);
    setSearchTerm("");
    setSelectedBarang(null);
    setQty(1);
  };

  // 4. Simpan Transaksi (Backend akan menghitung no_fab YYMMNN)
  const handleSimpanTransaksi = async () => {
    if (cart.length === 0) return alert("Keranjang masih kosong!");
    if (!mesin || !operator) return alert("Mohon isi data Mesin dan Operator!");

    const confirmSimpan = window.confirm("Simpan Transaksi FAB? Nomor FAB akan di-generate otomatis sesuai periode bulan/tahun.");
    if (!confirmSimpan) return;

    const dataTransaksi = {
      id_user: user.id_user,
      id_divisi: user.id_divisi,
      mesin: mesin,
      operator_maintenance: operator,
      coa: coa,
      items: cart,
      total_harga_seluruhnya: totalKeranjang
    };

    try {
      const response = await fetch('http://localhost:5000/api/permintaan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataTransaksi)
      });

      const result = await response.json();

      if (response.ok) {
        alert("✅ " + result.message);
        setCart([]);
        setMesin("");
        setOperator("");
        setCoa("");
        window.location.reload(); // Refresh untuk update pemakaian bulan berjalan
      } else {
        alert("❌ Gagal: " + (result.error || result.message));
      }
    } catch (err) {
      alert("❌ Terjadi kesalahan koneksi ke server.");
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginBottom: '20px', color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>
        📝 Form Ambil Barang (FAB) - {namaDivisi}
      </h2>

      {/* INPUT ROW */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '30px', flexWrap: 'nowrap' }}>
        <div style={{ flex: 2, position: 'relative' }}>
          <label style={s.label}>Cari Barang:</label>
          <input type="text" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setSelectedBarang(null); }} placeholder="Nama/SAP..." style={s.inputFAB} />
          {results.length > 0 && (
            <div style={s.dropdown}>
              {results.map(b => (
                <div key={b.id_barang} onClick={() => { setSelectedBarang(b); setSearchTerm(`${b.kode_sap} - ${b.nama_barang}`); setResults([]); }} style={s.dropdownItem}>
                  {b.kode_sap} - {b.nama_barang} (Rp {parseFloat(b.harga_sap).toLocaleString('id-ID')})
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ width: '70px' }}>
          <label style={s.label}>Qty:</label>
          <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} style={s.inputFAB} />
        </div>

        <div style={{ flex: 1 }}>
          <label style={s.label}>Mesin:</label>
          <input type="text" value={mesin} onChange={(e) => setMesin(e.target.value)} placeholder="Mesin..." style={s.inputFAB} />
        </div>

        <div style={{ flex: 1 }}>
          <label style={s.label}>Operator:</label>
          <input type="text" value={operator} onChange={(e) => setOperator(e.target.value)} placeholder="Teknisi..." style={s.inputFAB} />
        </div>

        <div style={{ flex: 1 }}>
          <label style={s.label}>COA:</label>
          <input type="text" value={coa} onChange={(e) => setCoa(e.target.value)} placeholder="Kode..." style={s.inputFAB} />
        </div>

        <div style={{ flex: 0.5 }}>
          <button onClick={addToCart} style={s.btnTambah}>Tambah</button>
        </div>
      </div>

      {/* TABLE */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px' }}>
        <thead>
          <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
            <th style={s.th}>Barang</th>
            <th style={s.th}>Qty</th>
            <th style={s.th}>Total</th>
            <th style={s.th}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {cart.length === 0 ? (
            <tr><td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>Keranjang Kosong</td></tr>
          ) : (
            cart.map((item, idx) => (
              <tr key={idx}>
                <td style={s.td}>{item.nama_barang}</td>
                <td style={s.td}>{item.qty}</td>
                <td style={s.td}>Rp {item.total_baris.toLocaleString('id-ID')}</td>
                <td style={s.td}>
                  <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} style={s.btnBatal}>Batal</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* BUDGET INFO */}
      <div style={s.budgetContainer}>
        <div>
          <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Limit Divisi {namaDivisi} / Bulan:</div>
          <strong>Rp {limitBudgetPinjam.toLocaleString('id-ID')}</strong>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Sisa Saldo FAB (Periode {new Date().getMonth() + 1}/{new Date().getFullYear()}):</div>
          <strong style={{ fontSize: '18px', color: sisaBudget < 100000 ? '#e74c3c' : '#27ae60' }}>
            Rp {sisaBudget.toLocaleString('id-ID')}
          </strong>
        </div>
      </div>

      <button onClick={handleSimpanTransaksi} style={s.btnSimpan}>
        SIMPAN TRANSAKSI FAB
      </button>
    </div>
  );
};

const s = {
  label: { display: 'block', fontWeight: 'bold', fontSize: '12px', marginBottom: '5px' },
  inputFAB: { width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' },
  btnTambah: { width: '100%', padding: '9px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  btnSimpan: { width: '100%', padding: '15px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
  dropdown: { position: 'absolute', zIndex: 100, background: 'white', border: '1px solid #ddd', width: '100%', borderRadius: '4px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
  dropdownItem: { padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' },
  th: { padding: '10px', border: '1px solid #ddd' },
  td: { padding: '10px', border: '1px solid #ddd', textAlign: 'center' },
  btnBatal: { backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' },
  budgetContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    border: '1px solid #eee',
    marginBottom: '20px'
  }
};

export default CreateRequest;