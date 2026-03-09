import { useEffect, useState } from 'react';

const Divisi = () => {
  const [divisi, setDivisi] = useState([]);
  const [namaDivisi, setNamaDivisi] = useState("");
  const [limitBudget, setLimitBudget] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // --- LOGIKA PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; 

  const getDivisi = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/divisi');
      if (!response.ok) throw new Error("Gagal mengambil data dari server");
      const data = await response.json();
      
      // URUTKAN DATA: Berdasarkan id_divisi secara descending (terbesar/terbaru di atas)
      const sortedData = data.sort((a, b) => b.id_divisi - a.id_divisi);
      
      setDivisi(sortedData);
    } catch (err) { 
      console.error("Gagal ambil divisi:", err); 
    }
  };

  useEffect(() => { getDivisi(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!namaDivisi || !limitBudget) return alert("Mohon isi semua data!");

    try {
      const response = await fetch('http://localhost:5000/api/divisi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nama_divisi: namaDivisi.toUpperCase(),
          limit_budget_pinjam: parseFloat(limitBudget) 
        })
      });
      
      if (response.ok) {
        setNamaDivisi(""); 
        setLimitBudget("");
        await getDivisi(); // Refresh & Sort otomatis
        setCurrentPage(1); // Balik ke hal 1 untuk melihat data yang baru masuk
        alert("✅ Departemen berhasil ditambahkan!");
      }
    } catch (err) {
      console.error("Error:", err);
    }
  };

  const deleteDivisi = async (id) => {
    if (window.confirm("Yakin ingin menghapus divisi ini?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/divisi/${id}`, { method: 'DELETE' });
        if (response.ok) getDivisi();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // 1. Logika Filter Pencarian
  const filteredDivisi = divisi.filter(item => 
    item.nama_divisi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id_divisi.toString().includes(searchTerm)
  );

  // 2. Logika Hitung Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDivisi.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDivisi.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>🏢 Manajemen Departemen</h2>
        <p style={{ color: '#7f8c8d' }}>Kelola data departemen dan limit budget bulanan (Data terbaru di urutan teratas).</p>
      </header>
      
      {/* Form Section */}
      <div style={styles.card}>
        <h3 style={{ marginTop: 0 }}>Tambah Departemen Baru</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input style={styles.input} type="text" placeholder="Nama Departemen" value={namaDivisi} onChange={(e) => setNamaDivisi(e.target.value)} required />
          <input style={styles.input} type="number" placeholder="Limit Budget" value={limitBudget} onChange={(e) => setLimitBudget(e.target.value)} required />
          <button type="submit" style={styles.btnSimpan}>Simpan</button>
        </form>
      </div>

      {/* Table Section */}
      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0 }}>Daftar Departemen</h3>
            <input 
                type="text" 
                placeholder="Cari ID atau Nama..." 
                style={{ ...styles.input, maxWidth: '250px' }}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee', backgroundColor: '#f8f9fa' }}>
              <th style={styles.th}>No</th>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Nama Departemen</th>
              <th style={styles.th}>Limit Bulanan (Rp)</th>
              <th style={styles.th}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#95a5a6' }}>Data tidak ditemukan.</td></tr>
            ) : (
              currentItems.map((item, index) => (
                <tr key={item.id_divisi} style={styles.tr}>
                  <td style={styles.td}>{indexOfFirstItem + index + 1}</td> 
                  <td style={styles.td}><strong>#{item.id_divisi}</strong></td>
                  <td style={styles.td}>{item.nama_divisi}</td>
                  <td style={{ ...styles.td, fontWeight: 'bold', color: '#27ae60' }}>
                    {Number(item.limit_budget_pinjam || 0).toLocaleString('id-ID')}
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => deleteDivisi(item.id_divisi)} style={styles.btnHapus}>Hapus</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* --- UI PAGINATION --- */}
        <div style={styles.pagination}>
          <button 
            disabled={currentPage === 1} 
            onClick={() => paginate(currentPage - 1)}
            style={currentPage === 1 ? styles.pageBtnDisabled : styles.pageBtn}
          >
            Prev
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button 
              key={i + 1} 
              onClick={() => paginate(i + 1)}
              style={currentPage === i + 1 ? styles.pageBtnActive : styles.pageBtn}
            >
              {i + 1}
            </button>
          ))}

          <button 
            disabled={currentPage === totalPages || totalPages === 0} 
            onClick={() => paginate(currentPage + 1)}
            style={(currentPage === totalPages || totalPages === 0) ? styles.pageBtnDisabled : styles.pageBtn}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' },
  input: { padding: '12px', flex: 1, borderRadius: '6px', border: '1px solid #dfe6e9', fontSize: '14px', outline: 'none' },
  btnSimpan: { padding: '12px 25px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' },
  btnHapus: { backgroundColor: '#fab1a0', color: '#d63031', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  th: { padding: '15px', color: '#636e72', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' },
  td: { padding: '15px', borderBottom: '1px solid #f1f2f6', color: '#2d3436' },
  tr: { transition: '0.2s' },
  // Pagination
  pagination: { display: 'flex', justifyContent: 'center', marginTop: '25px', gap: '8px' },
  pageBtn: { padding: '8px 16px', border: '1px solid #dfe6e9', backgroundColor: '#fff', cursor: 'pointer', borderRadius: '6px', fontSize: '14px' },
  pageBtnActive: { padding: '8px 16px', backgroundColor: '#2c3e50', color: '#fff', border: '1px solid #2c3e50', borderRadius: '6px', fontWeight: 'bold' },
  pageBtnDisabled: { padding: '8px 16px', backgroundColor: '#f5f6fa', color: '#b2bec3', border: '1px solid #eee', cursor: 'not-allowed', borderRadius: '6px' }
};

export default Divisi;