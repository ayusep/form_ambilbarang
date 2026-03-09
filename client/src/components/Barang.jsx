import { useEffect, useState } from 'react';

const Barang = () => {
  const [barang, setBarang] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // State untuk pencarian

  // --- LOGIKA PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Dibatasi 5 baris sesuai permintaan sebelumnya

  const getBarang = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/barang');
      const data = await response.json();
      
      // URUTKAN: Data terbaru (ID terbesar) di atas
      const sortedData = data.sort((a, b) => b.id_barang - a.id_barang);
      setBarang(sortedData);
    } catch (err) { 
      console.error("Gagal ambil Barang:", err); 
    }
  };

  useEffect(() => { 
    getBarang(); 
  }, []);

  // 1. LOGIKA FILTER (Search by Kode SAP atau Nama Barang)
  const filteredBarang = barang.filter((item) => {
    const search = searchTerm.toLowerCase();
    const kodeStr = (item.kode_sap || item.id_barang).toString().toLowerCase();
    return kodeStr.includes(search) || item.nama_barang.toLowerCase().includes(search);
  });

  // 2. LOGIKA HITUNG PAGINATION
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBarang.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBarang.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ margin: 0 }}>Stok Barang (Master SAP)</h2>
          <p style={{ color: '#666', margin: '5px 0 0 0' }}>Daftar material pusat.</p>
        </div>
        
        {/* INPUT SEARCH */}
        <input 
          type="text" 
          placeholder="Cari Kode atau Nama Barang..." 
          style={s.searchInput}
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
      </header>
      
      <div style={s.tableCard}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={s.trHead}>
              <th style={s.th}>No</th>
              <th style={s.th}>Kode SAP</th>
              <th style={s.th}>Nama Barang</th>
              <th style={{ ...s.th, textAlign: 'right' }}>Harga (Rp)</th>
              <th style={{ ...s.th, textAlign: 'center' }}>Stok</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>Barang tidak ditemukan.</td></tr>
            ) : (
              currentItems.map((item, index) => (
                <tr key={item.id_barang} style={s.trBody}>
                  <td style={s.td}>{indexOfFirstItem + index + 1}</td>
                  <td style={{ ...s.td, fontWeight: 'bold' }}>{item.kode_sap || item.id_barang}</td>
                  <td style={s.td}>{item.nama_barang}</td>
                  <td style={{ ...s.td, textAlign: 'right', fontWeight: 'bold', color: '#2980b9' }}>
                    {Number(item.harga_sap).toLocaleString('id-ID')}
                  </td>
                  <td style={{ ...s.td, textAlign: 'center' }}>
                    <span style={s.stokBadge}>
                      {Number(item.stok).toLocaleString('id-ID')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- UI PAGINATION --- */}
      <div style={s.paginationContainer}>
        <div style={{ fontSize: '13px', color: '#7f8c8d' }}>
          Menampilkan {currentItems.length} dari {filteredBarang.length} barang
        </div>
        <div style={s.pageGroup}>
          <button 
            disabled={currentPage === 1} 
            onClick={() => paginate(currentPage - 1)}
            style={currentPage === 1 ? s.pageBtnDisabled : s.pageBtn}
          >
            Prev
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button 
              key={i + 1} 
              onClick={() => paginate(i + 1)}
              style={currentPage === i + 1 ? s.pageBtnActive : s.pageBtn}
            >
              {i + 1}
            </button>
          )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}

          <button 
            disabled={currentPage === totalPages || totalPages === 0} 
            onClick={() => paginate(currentPage + 1)}
            style={(currentPage === totalPages || totalPages === 0) ? s.pageBtnDisabled : s.pageBtn}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

// --- STYLES ---
const s = {
  searchInput: { padding: '10px 15px', borderRadius: '6px', border: '1px solid #ddd', width: '250px', fontSize: '14px' },
  tableCard: { backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' },
  trHead: { backgroundColor: '#2c3e50', color: 'white', textAlign: 'left' },
  th: { padding: '15px', fontSize: '13px' },
  trBody: { borderBottom: '1px solid #eee' },
  td: { padding: '15px', fontSize: '14px' },
  stokBadge: { backgroundColor: '#f1f2f6', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' },
  paginationContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' },
  pageGroup: { display: 'flex', gap: '5px' },
  pageBtn: { padding: '6px 12px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', borderRadius: '4px', fontSize: '13px' },
  pageBtnActive: { padding: '6px 12px', backgroundColor: '#2c3e50', color: '#fff', border: '1px solid #2c3e50', borderRadius: '4px', fontSize: '13px', fontWeight: 'bold' },
  pageBtnDisabled: { padding: '6px 12px', backgroundColor: '#f9f9f9', color: '#ccc', border: '1px solid #eee', cursor: 'not-allowed', borderRadius: '4px', fontSize: '13px' }
};

export default Barang;