import { useEffect, useState } from 'react';

const Departemen = () => {
  const [departemen, setDepartemen] = useState([]);
  const [codeDepartemen, setCodeDepartemen] = useState("");
  const [namaDepartemen, setNamaDepartemen] = useState("");
  const [limitBudget, setLimitBudget] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

// === TAMBAHKAN INI: State untuk menyimpan data user ===
  const [user, setUser] = useState(null);

  const getDepartemen = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/departemen');
      if (!response.ok) throw new Error("Gagal mengambil data");
      const data = await response.json();
      
      // Sorting aman: jaga-jaga jika id_departemen null
      const sortedData = data.sort((a, b) => (b.id_departemen || 0) - (a.id_departemen || 0));
      setDepartemen(sortedData);
    } catch (err) { 
      console.error("Gagal ambil departemen:", err); 
    }
  };

useEffect(() => {
    // === TAMBAHKAN INI: Ambil data user saat komponen dimuat ===
    const loggedInUser = JSON.parse(localStorage.getItem("user")); 
    setUser(loggedInUser);
    
    getDepartemen();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

// === TAMBAHKAN INI: Proteksi fungsi tambah agar hanya admin yang bisa eksekusi ===
    if (user?.role !== 'admin') return alert("Anda tidak memiliki akses!");

    if (!codeDepartemen || !namaDepartemen || !limitBudget) return alert("Mohon isi semua data!");

    try {
      const response = await fetch('http://localhost:5000/api/departemen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          // Pastikan nama property ini SAMA dengan yang dibaca oleh Controller Backend Anda
          code_departemen: codeDepartemen.toUpperCase(),
          nama_departemen: namaDepartemen.toUpperCase(),
          limit_budget_pinjam: parseFloat(limitBudget) 
        })
      });
      
      if (response.ok) {
        setCodeDepartemen(""); 
        setNamaDepartemen(""); 
        setLimitBudget("");
        await getDepartemen();
        setCurrentPage(1);
        alert("✅ Departemen berhasil ditambahkan!");
      } else {
        const errorData = await response.json();
        alert(`❌ Gagal simpan: ${errorData.message || 'Cek terminal backend Anda'}`);
      }
    } catch (err) {
      console.error("Error:", err);
      alert("❌ Terjadi kesalahan koneksi!");
    }
  };

  const deleteDepartemen = async (id) => {

// === TAMBAHKAN INI: Proteksi fungsi hapus ===
    if (user?.role !== 'admin') return alert("Akses ditolak!");

    if (window.confirm("Yakin ingin menghapus departemen ini?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/departemen/${id}`, { method: 'DELETE' });
        if (response.ok) getDepartemen();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // --- FIX LOGIKA FILTER (ANTI CRASH / ANTI NULL) ---
  const filteredDepartemen = departemen.filter(item => {
    // Gunakan optional chaining (?.) dan default string "" agar tidak error toLowerCase
    const kode = (item?.code_departemen || "").toString().toLowerCase();
    const nama = (item?.nama_departemen || "").toString().toLowerCase();
    const search = searchTerm.toLowerCase();

    return kode.includes(search) || nama.includes(search);
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDepartemen.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDepartemen.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>🏢 Manajemen Departemen</h2>
      </header>
      
      {user?.role === 'admin' && (
      <div style={styles.card}>
        <h3 style={{ marginTop: 0 }}>Tambah Departemen Baru</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input style={styles.input} type="text" placeholder="Kode (Contoh: IT)" value={codeDepartemen} onChange={(e) => setCodeDepartemen(e.target.value)} required />
          <input style={styles.input} type="text" placeholder="Nama Departemen" value={namaDepartemen} onChange={(e) => setNamaDepartemen(e.target.value)} required />
          <input style={styles.input} type="number" placeholder="Limit Budget" value={limitBudget} onChange={(e) => setLimitBudget(e.target.value)} required />
          <button type="submit" style={styles.btnSimpan}>Simpan</button>
        </form>
      </div>
      )}

      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Daftar Departemen</h3>
            <input 
                type="text" 
                placeholder="Cari Kode atau Nama..." 
                style={{ ...styles.input, maxWidth: '250px' }}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee', backgroundColor: '#f8f9fa' }}>
              <th style={styles.th}>No</th>
              <th style={styles.th}>Kode</th>
              <th style={styles.th}>Nama Departemen</th>
              <th style={styles.th}>Limit Bulanan (Rp)</th>
              {user?.role === 'admin' && <th style={styles.th}>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
             <tr>
                <td colSpan={user?.role === 'admin' ? "5" : "4"} style={{ textAlign: 'center', padding: '30px', color: '#95a5a6' }}>
                  Data tidak ditemukan.
                </td>
              </tr>
            ) : (
              currentItems.map((item, index) => (
                <tr key={item.id_departemen} style={styles.tr}>
                  <td style={styles.td}>{indexOfFirstItem + index + 1}</td> 
                  <td style={styles.td}><strong>{item.code_departemen || '-'}</strong></td>
                  <td style={styles.td}>{item.nama_departemen || '-'}</td>
                  <td style={{ ...styles.td, fontWeight: 'bold', color: '#27ae60' }}>
                    {Number(item.limit_budget_pinjam || 0).toLocaleString('id-ID')}
                  </td>
                  {user?.role === 'admin' && (
                    <td style={styles.td}>
                      <button onClick={() => deleteDepartemen(item.id_departemen)} style={styles.btnHapus}>Hapus</button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div style={styles.pagination}>
          <button disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)} style={currentPage === 1 ? styles.pageBtnDisabled : styles.pageBtn}>Prev</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i + 1} onClick={() => paginate(i + 1)} style={currentPage === i + 1 ? styles.pageBtnActive : styles.pageBtn}>{i + 1}</button>
          ))}
          <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => paginate(currentPage + 1)} style={(currentPage === totalPages || totalPages === 0) ? styles.pageBtnDisabled : styles.pageBtn}>Next</button>
        </div>
      </div>
    </div>
  );
};

// ... (Gunakan styles yang sama dengan kode awal Anda)
const styles = {
    card: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' },
    input: { padding: '12px', flex: 1, borderRadius: '6px', border: '1px solid #dfe6e9', fontSize: '14px', outline: 'none' },
    btnSimpan: { padding: '12px 25px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    btnHapus: { backgroundColor: '#fab1a0', color: '#d63031', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' },
    th: { padding: '15px', color: '#636e72', textTransform: 'uppercase', fontSize: '12px' },
    td: { padding: '15px', borderBottom: '1px solid #f1f2f6' },
    tr: { transition: '0.2s' },
    pagination: { display: 'flex', justifyContent: 'center', marginTop: '25px', gap: '8px' },
    pageBtn: { padding: '8px 16px', border: '1px solid #dfe6e9', backgroundColor: '#fff', cursor: 'pointer', borderRadius: '6px' },
    pageBtnActive: { padding: '8px 16px', backgroundColor: '#2c3e50', color: '#fff', borderRadius: '6px' },
    pageBtnDisabled: { padding: '8px 16px', backgroundColor: '#f5f6fa', color: '#b2bec3', cursor: 'not-allowed', borderRadius: '6px' }
  };

export default Departemen;