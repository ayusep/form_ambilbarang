import React, { useState, useEffect } from 'react';

const CreateRequest = ({ user }) => {
  // ... (State tetap sama)
  const [mesin, setMesin] = useState("");
  const [operator, setOperator] = useState("");
  const [coa, setCoa] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [cart, setCart] = useState([]);
  const [qty, setQty] = useState(1);
  const [selectedBarang, setSelectedBarang] = useState(null);
  const [listMesin, setListMesin] = useState([]);
  const [listCoa, setListCoa] = useState([]);
  const [searchMesin, setSearchMesin] = useState("");
  const [resultsMesin, setResultsMesin] = useState([]);
  const [selectedMesin, setSelectedMesin] = useState(null);
  const [limitBudgetPinjam, setLimitBudgetPinjam] = useState(0);
  const [pemakaianBulanIni, setPemakaianBulanIni] = useState(0);
  const [namaDepartemen, setNamaDepartemen] = useState("");
  const [listTeknisi, setListTeknisi] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Tambahan status loading

  // --- REKOMENDASI 1: FUNGSI HIGHLIGHT TEKS ---
  const highlightText = (text, query) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() 
            ? <strong key={i} style={{ color: '#3498db' }}>{part}</strong> 
            : part
        )}
      </span>
    );
  };

  // 1. Fetch Master Data
  useEffect(() => {
    const fetchMasterData = async () => {
      if (!user?.id_divisi) return;
      try {
        const [resMesin, resCoa, resTeknisi] = await Promise.all([
          fetch('http://localhost:5000/api/permintaan/mesin'),
          fetch(`http://localhost:5000/api/permintaan/coa?id_divisi=${user.id_divisi}`),
          fetch('http://localhost:5000/api/permintaan/teknisi')
        ]);
        const dataMesin = await resMesin.json();
        const dataCoa = await resCoa.json();
        const dataTeknisi = await resTeknisi.json();
        setListMesin(dataMesin);
        setListCoa(dataCoa);
        setListTeknisi(dataTeknisi);
      } catch (err) {
        console.error("Gagal ambil data master:", err);
      }
    };
    fetchMasterData();
  }, [user]);

  // 2. Search Mesin Logic
  useEffect(() => {
    if (searchMesin.length > 0 && !selectedMesin) {
      const filtered = listMesin.filter(m =>
        m.nama_mesin.toLowerCase().includes(searchMesin.toLowerCase())
      );
      setResultsMesin(filtered);
    } else {
      setResultsMesin([]);
    }
  }, [searchMesin, selectedMesin, listMesin]);

  // 3. Fetch Budget Data
  useEffect(() => {
    const fetchBudgetData = async () => {
      if (!user || !user.id_departemen) return;
      try {
        const res = await fetch(`http://localhost:5000/api/permintaan/budget-aktif/${user.id_departemen}`);
        const data = await res.json();
        if (res.ok) {
          setLimitBudgetPinjam(Number(data.limit_budget) || 0); 
          setNamaDepartemen(data.nama_departemen || ""); 
          setPemakaianBulanIni(Number(data.terpakai_bulan_ini) || 0);
        }
      } catch (err) {
        console.error("Gagal sinkronisasi data budget:", err);
      }
    };
    fetchBudgetData();
  }, [user]);

  const totalKeranjang = cart.reduce((sum, item) => sum + (Number(item.total_baris) || 0), 0);
  const sisaBudget = Number(limitBudgetPinjam) - Number(pemakaianBulanIni) - totalKeranjang;

  // 4. Search Barang Logic (Enhanced)
  useEffect(() => {
    if (searchTerm.trim().length <= 0 || selectedBarang) {
      setResults([]);
      return;
    }

    const fetchBarang = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/barang/search?q=${searchTerm}`);
        const data = await response.json();
        setResults(data);
      } catch (err) {
        console.error("Error search barang:", err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(fetchBarang, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedBarang]);

  const addToCart = () => {
    if (!selectedBarang) return alert("Pilih barang terlebih dahulu!");
    if (!coa) return alert("Pilih COA!");

    const inputQty = parseInt(qty);
    if (isNaN(inputQty) || inputQty <= 0) return alert("Qty tidak valid!");

    const harga = parseFloat(selectedBarang.harga_sap);
    const totalHargaBarangBaru = harga * inputQty;

    if (totalHargaBarangBaru > sisaBudget) {
      alert(`⚠️ LIMIT BUDGET TERCAPAI!\nSisa: Rp ${sisaBudget.toLocaleString('id-ID')}`);
      return;
    }

    const selectedCoaObj = listCoa.find(c => String(c.id_coa) === String(coa));

    const newItem = {
      id_barang: selectedBarang.id_barang,
      nama_barang: selectedBarang.nama_barang,
      qty: inputQty,
      harga_sap: harga,
      total_baris: totalHargaBarangBaru,
      id_mesin: selectedMesin ? selectedMesin.id_mesin : null, 
      nama_mesin: selectedMesin ? selectedMesin.nama_mesin : "-",
      operator: operator.trim() || "-",
      id_coa: coa,
      nama_coa: selectedCoaObj ? selectedCoaObj.coa : "N/A"
    };

    setCart([...cart, newItem]);
    setSearchTerm("");
    setSelectedBarang(null);
    setQty(1);
  };

  const handleSimpanTransaksi = async () => {
    if (!user?.id_user) return alert("Sesi habis.");
    if (cart.length === 0) return alert("Keranjang kosong!");

    const confirmSimpan = window.confirm("Simpan Transaksi FAB?");
    if (!confirmSimpan) return;

    const dataTransaksi = {
      id_user: user.id_user,
      id_departemen: user.id_departemen,
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
        window.location.reload();
      } else {
        alert("❌ Gagal: " + result.error);
      }
    } catch (err) {
      alert("❌ Kesalahan koneksi.");
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2 style={{ marginBottom: '20px', color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>
        📝 Form Ambil Barang (FAB) - {namaDepartemen}
      </h2>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', marginBottom: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, position: 'relative', minWidth: '200px' }}>
          <label style={s.label}>Cari Barang:</label>
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => { 
              setSearchTerm(e.target.value);
              if (selectedBarang) setSelectedBarang(null); 
            }} 
            placeholder="Ketik nama barang atau kode SAP..." 
            style={s.inputFAB} 
          />
          
          {/* --- REKOMENDASI 2 & 4: LOADING & PESAN TIDAK DITEMUKAN --- */}
          {(isLoading || (searchTerm.length > 1 && results.length === 0 && !selectedBarang)) && (
            <div style={s.dropdown}>
               <div style={s.dropdownItem}>
                  {isLoading ? "🔍 Mencari..." : "⚠️ Barang tidak ditemukan"}
               </div>
            </div>
          )}

          {results.length > 0 && (
            <div style={s.dropdown}>
              {results.map(b => (
                <div 
                  key={b.id_barang} 
                  onClick={() => { 
                    setSelectedBarang(b); 
                    setSearchTerm(`${b.kode_sap} - ${b.nama_barang}`); 
                    setResults([]); 
                  }} 
                  style={s.dropdownItem}
                >
                  {/* --- REKOMENDASI 1: HIGHLIGHT HASIL --- */}
                  <div style={{ fontSize: '11px', color: '#95a5a6' }}>{b.kode_sap}</div>
                  <div style={{ fontSize: '14px' }}>{highlightText(b.nama_barang, searchTerm)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ width: '70px' }}>
          <label style={s.label}>Qty:</label>
          <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} style={s.inputFAB} />
        </div>

        <div style={{ flex: 1, position: 'relative', minWidth: '150px' }}>
          <label style={s.label}>Mesin:</label>
          <input 
            type="text" 
            value={searchMesin} 
            onChange={(e) => { 
              setSearchMesin(e.target.value); 
              setSelectedMesin(null); 
            }} 
            placeholder="Cari Mesin..." 
            style={s.inputFAB} 
          />
          {resultsMesin.length > 0 && (
            <div style={s.dropdown}>
              {resultsMesin.map(m => (
                <div key={m.id_mesin} onClick={() => { setSelectedMesin(m); setSearchMesin(m.nama_mesin); setResultsMesin([]); }} style={s.dropdownItem}>
                  {m.no_item} - {m.nama_mesin}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={s.label}>Teknisi:</label>
          <select value={operator} onChange={(e) => setOperator(e.target.value)} style={s.inputFAB}>
            <option value="">-- Pilih Teknisi --</option>
            {listTeknisi.map((t) => (
              <option key={t.id_user} value={t.nama}>{t.nama}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={s.label}>COA:</label>
          <select value={coa} onChange={(e) => setCoa(e.target.value)} style={s.inputFAB}>
            <option value="">-- Pilih COA --</option>
            {listCoa.map((c) => (
              <option key={c.id_coa} value={c.id_coa}>{c.kode_akun} - {c.coa}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 'none' }}>
          <button onClick={addToCart} style={s.btnTambah}>Tambah</button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '10px', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
              <th style={s.th}>No</th>
              <th style={s.th}>Barang</th>
              <th style={s.th}>Qty</th>
              <th style={s.th}>Total</th>
              <th style={s.th}>Mesin</th>
              <th style={s.th}>Teknisi</th>
              <th style={s.th}>COA</th>
              <th style={s.th}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {cart.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>Belum ada barang di keranjang</td></tr>
            ) : (
              cart.map((item, idx) => (
                <tr key={idx}>
                  <td style={s.td}>{idx + 1}</td>
                  <td style={{ ...s.td, textAlign: 'left' }}>{item.nama_barang}</td>
                  <td style={s.td}>{item.qty}</td>
                  <td style={s.td}>Rp {item.total_baris.toLocaleString('id-ID')}</td>
                  <td style={s.td}>{item.nama_mesin}</td>
                  <td style={s.td}>{item.operator}</td>
                  <td style={s.td}>{item.nama_coa}</td>
                  <td style={s.td}>
                    <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} style={s.btnBatal}>Batal</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={s.budgetContainer}>
        <div>
          <div style={{ fontSize: '12px', color: '#7f8c8d' }}>Limit Budget / Bulan:</div>
          <strong>Rp {limitBudgetPinjam.toLocaleString('id-ID')}</strong>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '14px', color: '#7f8c8d' }}>Sisa Saldo FAB:</div>
          <strong style={{ fontSize: '18px', color: sisaBudget <= 0 ? '#e74c3c' : '#27ae60' }}>
            Rp {Number(sisaBudget).toLocaleString('id-ID')}
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
  btnTambah: { padding: '9px 20px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  btnSimpan: { width: '100%', padding: '15px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' },
  dropdown: { 
    position: 'absolute', 
    zIndex: 100, 
    background: 'white', 
    border: '1px solid #ddd', 
    width: '100%', 
    borderRadius: '4px', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    maxHeight: '250px',
    overflowY: 'auto'
  },
  dropdownItem: { 
    padding: '10px 15px', 
    cursor: 'pointer', 
    borderBottom: '1px solid #eee',
    transition: 'background 0.2s',
    '&:hover': { backgroundColor: '#f8f9fa' }
  },
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