import { useEffect, useState } from 'react';

const Divisi = () => {
  const [divisi, setDivisi] = useState([]);
  const [departemenList, setDepartemenList] = useState([]);
  const [codeDivisi, setCodeDivisi] = useState("");
  const [namaDivisi, setNamaDivisi] = useState("");
  const [idDepartemen, setIdDepartemen] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [user, setUser] = useState(null);

  const fetchData = async () => {
    try {
      const resDivisi = await fetch('http://localhost:5000/api/divisi');
      const dataDivisi = await resDivisi.json();
      // Sorting berdasarkan ID terbaru
      setDivisi(dataDivisi.sort((a, b) => (b.id_divisi || 0) - (a.id_divisi || 0)));

      const resDept = await fetch('http://localhost:5000/api/departemen');
      const dataDept = await resDept.json();
      setDepartemenList(dataDept);
    } catch (err) {
      console.error("Gagal ambil data:", err);
    }
  };

 useEffect(() => { 
    // === TAMBAHKAN INI: Ambil data user dari localStorage ===
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    setUser(loggedInUser);
    
    fetchData(); 
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user?.role !== 'admin') return alert("Akses ditolak!");

    if (!codeDivisi || !namaDivisi || !idDepartemen) return alert("Mohon isi semua data!");
    
    try {
      const response = await fetch('http://localhost:5000/api/divisi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code_divisi: codeDivisi.toUpperCase(),
          nama_divisi: namaDivisi.toUpperCase(),
          id_departemen: parseInt(idDepartemen)
        })
      });

      if (response.ok) {
        setCodeDivisi("");
        setNamaDivisi("");
        setIdDepartemen("");
        fetchData();
        setCurrentPage(1);
        alert("✅ Divisi berhasil ditambahkan!");
      } else {
        alert("❌ Gagal simpan data");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteDivisi = async (id) => {
if (user?.role !== 'admin') return alert("Hanya admin yang boleh menghapus!");

    if (window.confirm("Yakin ingin menghapus divisi ini?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/divisi/${id}`, { method: 'DELETE' });
        if (response.ok) fetchData();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const filteredDivisi = divisi.filter(item => {
    const search = searchTerm.toLowerCase();
    return (
      (item?.code_divisi || "").toLowerCase().includes(search) ||
      (item?.nama_divisi || "").toLowerCase().includes(search) ||
      (item?.nama_departemen || "").toLowerCase().includes(search)
    );
  });

  // Logika Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDivisi.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDivisi.length / itemsPerPage);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>🏢 Manajemen Divisi</h2>
      </header>

{/* === TAMBAHKAN INI: Form Tambah hanya untuk Admin === */}
      {user?.role === 'admin' && (
        <div style={styles.card}>
          <h3 style={{ marginTop: 0 }}>Tambah Divisi Baru</h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <select style={styles.input} value={idDepartemen} onChange={(e) => setIdDepartemen(e.target.value)} required>
              <option value="">-- Pilih Departemen --</option>
              {departemenList.map(dept => (
                <option key={dept.id_departemen} value={dept.id_departemen}>{dept.nama_departemen}</option>
              ))}
            </select>
            <input style={styles.input} type="text" placeholder="Kode Divisi" value={codeDivisi} onChange={(e) => setCodeDivisi(e.target.value)} required />
            <input style={styles.input} type="text" placeholder="Nama Divisi" value={namaDivisi} onChange={(e) => setNamaDivisi(e.target.value)} required />
            <button type="submit" style={styles.btnSimpan}>Simpan</button>
          </form>
        </div>
      )}

      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>Daftar Divisi</h3>
          <input type="text" placeholder="Cari divisi..." style={{ ...styles.input, maxWidth: '250px' }} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee', backgroundColor: '#f8f9fa' }}>
              <th style={styles.th}>No</th>
              <th style={styles.th}>Kode</th>
              <th style={styles.th}>Nama Divisi</th>
              <th style={styles.th}>Departemen</th>
              {user?.role === 'admin' && <th style={styles.th}>Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? currentItems.map((item, index) => (
              <tr key={item.id_divisi} style={styles.tr}>
                <td style={styles.td}>{indexOfFirstItem + index + 1}</td>
                <td style={styles.td}><strong>{item.code_divisi}</strong></td>
                <td style={styles.td}>{item.nama_divisi}</td>
                <td style={styles.td}><span style={styles.badge}>{item.nama_departemen || 'N/A'}</span></td>
                
                {user?.role === 'admin' && (
                  <td style={styles.td}>
                    <button onClick={() => deleteDivisi(item.id_divisi)} style={styles.btnHapus}>Hapus</button>
                  </td>
                )}
              </tr>
            )) : (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Data tidak ditemukan</td></tr>
            )}
          </tbody>
        </table>

        {/* PAGINATION UI */}
        <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '5px' }}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              style={{
                ...styles.btnPage,
                backgroundColor: currentPage === i + 1 ? '#3498db' : '#ecf0f1',
                color: currentPage === i + 1 ? 'white' : '#2c3e50'
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' },
  input: { padding: '12px', flex: 1, minWidth: '200px', borderRadius: '6px', border: '1px solid #dfe6e9', fontSize: '14px' },
  btnSimpan: { padding: '12px 25px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  btnHapus: { backgroundColor: '#fab1a0', color: '#d63031', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' },
  th: { padding: '15px', color: '#636e72', fontSize: '12px', textTransform: 'uppercase' },
  td: { padding: '15px', borderBottom: '1px solid #f1f2f6' },
  badge: { backgroundColor: '#e1f5fe', color: '#0288d1', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
  btnPage: { border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }
};

export default Divisi;