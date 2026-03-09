import { useEffect, useState, useCallback } from 'react';

const DataRequest = ({ user, filter }) => {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // FETCH DATA DENGAN LOGIKA ROLE (BACKEND COMPATIBLE)
  const fetchData = useCallback(async () => {
    try {
      // Admin & Logistik mengirim 'all' atau string kosong agar backend tidak memfilter 1 divisi saja
      // Catatan: Pastikan backend Anda menangani jika id_divisi kosong/null maka bypass filter divisi
      const isAdminOrLogistik = ['admin', 'logistik'].includes(user?.role);
      const queryDivisi = isAdminOrLogistik ? '' : user.id_divisi;

      const response = await fetch(
        `http://localhost:5000/api/permintaan/filter?bulan=${filter.bulan}&tahun=${filter.tahun}&divisi=${queryDivisi}`
      );
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      console.error("Gagal ambil data:", err);
    }
  }, [filter, user]);

  useEffect(() => {
    fetchData();
    setCurrentPage(1);
  }, [fetchData]);

  const handleActionFab = async (no_fab, statusBaru) => {
    let alasan = null;
    if (statusBaru === 'Rejected') {
      alasan = prompt("Masukkan alasan penolakan untuk No. FAB #" + no_fab);
      if (alasan === null) return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/permintaan/fab/${no_fab}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status_approval: statusBaru, keterangan: alasan })
      });

      if (response.ok) {
        alert(`FAB #${no_fab} berhasil diupdate ke status: ${statusBaru}`);
        fetchData();
      }
    } catch (err) {
      console.error("Gagal update status:", err);
    }
  };

  // 1. GROUPING (Menggabungkan item barang berdasarkan No. FAB yang sama)
  const groupedData = requests.reduce((acc, item) => {
    const key = item.no_fab;
    if (!acc[key]) {
      acc[key] = { ...item, allItems: [], totalHargaFAB: 0 };
    }
    acc[key].allItems.push(item);
    acc[key].totalHargaFAB += (Number(item.qty) * Number(item.harga_sap || 0));
    return acc;
  }, {});

  // Mengubah object ke array dan urutkan berdasarkan no_fab TERBARU (descending)
  const finalData = Object.values(groupedData).sort((a, b) => b.no_fab - a.no_fab);
  
  // 2. LOGIKA TOTAL BUDGET TERPAKAI (Hanya Pending + Approved)
  const totalBudgetTerpakai = finalData.reduce((sum, fab) => {
    if (['Pending', 'Approved'].includes(fab.status_approval)) {
      return sum + fab.totalHargaFAB;
    }
    return sum;
  }, 0);

  // 3. SEARCH & STATUS FILTER BERDASARKAN ROLE
  const filteredData = finalData.filter(fab => {
    // A. Filter berdasarkan Role Logistik (Hanya Approved & Closed)
    if (user?.role === 'logistik') {
      if (!['Approved', 'Closed'].includes(fab.status_approval)) return false;
    }

    // B. Filter Status dari Dropdown
    const matchesStatus = statusFilter === 'All' || fab.status_approval === statusFilter;

    // C. Global Search (Semua data)
    const tglFormatted = new Date(fab.tgl_permintaan).toLocaleDateString('id-ID');
    const matchesSearch = 
      fab.no_fab.toString().includes(searchTerm) || 
      fab.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fab.nama_divisi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fab.mesin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tglFormatted.includes(searchTerm);
    
    return matchesStatus && matchesSearch;
  });

  // 4. PAGINATION
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  const getBadgeColor = (status) => {
    switch (status) {
      case 'Pending': return '#f1c40f';
      case 'Approved': return '#3498db';
      case 'Closed': return '#27ae60';
      case 'Rejected': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <header style={s.header}>
        <div>
          <h2 style={{ color: '#2c3e50', margin: 0 }}>📋 Data Request {filter.bulan}/{filter.tahun}</h2>
          <small style={{ color: '#7f8c8d' }}>Role: <span style={{fontWeight:'bold', color: '#2980b9'}}>{user?.role?.toUpperCase()}</span></small>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          {/* FILTER STATUS DROPDOWN */}
          <select 
            style={s.selectFilter} 
            value={statusFilter} 
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="All">Semua Status</option>
            {user?.role !== 'logistik' && <option value="Pending">Pending</option>}
            <option value="Approved">Approved</option>
            {user?.role !== 'logistik' && <option value="Rejected">Rejected</option>}
            <option value="Closed">Closed</option>
          </select>

          <input 
            type="text" 
            placeholder="Cari FAB, Nama, Divisi..." 
            style={s.searchInput}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </header>

      <div style={s.tableCard}>
        <table style={s.table}>
          <thead>
            <tr style={s.trHead}>
              <th style={s.th}>NO. FAB</th>
              <th style={s.th}>TANGGAL</th>
              <th style={s.th}>PEMOHON</th>
              <th style={s.th}>LIST BARANG</th>
              <th style={s.th}>TOTAL HARGA</th>
              <th style={s.th}>STATUS</th>
              {user?.role !== 'operasional' && <th style={s.th}>AKSI</th>}
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Data tidak ditemukan.</td></tr>
            ) : currentItems.map((fab) => (
              <tr key={fab.no_fab} style={s.trBody}>
                <td style={{ ...s.td, fontWeight: 'bold' }}>#{fab.no_fab}</td>
                <td style={s.td}>{new Date(fab.tgl_permintaan).toLocaleDateString('id-ID')}</td>
                <td style={s.td}>
                  <strong>{fab.nama}</strong><br />
                  <small style={{ color: '#7f8c8d' }}>{fab.nama_divisi}</small>
                </td>
                <td style={{ padding: 0 }}>
                  {fab.allItems.map((item, i) => (
                    <div key={i} style={s.innerCell}>{item.nama_barang} (x{item.qty})</div>
                  ))}
                </td>
                <td style={{ ...s.td, fontWeight: 'bold', color: '#2980b9' }}>{formatIDR(fab.totalHargaFAB)}</td>
                <td style={s.td}>
                  <span style={{ ...s.badge, backgroundColor: getBadgeColor(fab.status_approval) }}>{fab.status_approval}</span>
                </td>
                
                {/* LOGIKA TOMBOL AKSI BERDASARKAN ROLE */}
                {user?.role !== 'operasional' && (
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {/* Manager & Admin: Hanya saat Pending */}
                      {['manager', 'admin'].includes(user?.role) && fab.status_approval === 'Pending' && (
                        <>
                          <button onClick={() => handleActionFab(fab.no_fab, 'Approved')} style={s.btnA}>Approve</button>
                          <button onClick={() => handleActionFab(fab.no_fab, 'Rejected')} style={s.btnR}>Reject</button>
                        </>
                      )}
                      {/* Logistik & Admin: Hanya saat Approved */}
                      {['logistik', 'admin'].includes(user?.role) && fab.status_approval === 'Approved' && (
                        <button onClick={() => handleActionFab(fab.no_fab, 'Closed')} style={s.btnC}>Close Order</button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={s.footer}>
        <div style={s.pagination}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} style={currentPage === 1 ? s.pageBtnDisabled : s.pageBtn}>Prev</button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i + 1} onClick={() => setCurrentPage(i + 1)} style={currentPage === i + 1 ? s.pageBtnActive : s.pageBtn}>{i + 1}</button>
          ))}
          <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(prev => prev + 1)} style={(currentPage === totalPages || totalPages === 0) ? s.pageBtnDisabled : s.pageBtn}>Next</button>
        </div>

        <div style={s.grandTotalBox}>
          <div style={{ color: '#7f8c8d', fontSize: '12px', fontWeight: 'bold' }}>Total Budget Terpakai (Pending + Approved):</div>
          <div style={{ color: '#27ae60', fontSize: '20px', fontWeight: 'bold' }}>{formatIDR(totalBudgetTerpakai)}</div>
        </div>
      </div>
    </div>
  );
};

// CSS-in-JS Styles
const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  selectFilter: { padding: '8px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '12px', backgroundColor: '#fff', cursor: 'pointer' },
  searchInput: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', width: '250px', fontSize: '12px' },
  tableCard: { backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  trHead: { backgroundColor: '#2c3e50', color: 'white' },
  th: { padding: '15px 12px', fontSize: '11px', textAlign: 'left', textTransform: 'uppercase', letterSpacing: '0.5px' },
  trBody: { borderBottom: '1px solid #eee', transition: '0.2s' },
  td: { padding: '12px', fontSize: '13px', verticalAlign: 'middle' },
  innerCell: { padding: '6px 12px', fontSize: '11px', borderBottom: '1px solid #f1f1f1', color: '#34495e' },
  badge: { padding: '4px 10px', borderRadius: '12px', color: 'white', fontSize: '10px', fontWeight: 'bold' },
  btnA: { padding: '6px 10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' },
  btnR: { padding: '6px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' },
  btnC: { padding: '6px 10px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '10px' },
  pagination: { display: 'flex', gap: '5px' },
  pageBtn: { padding: '6px 12px', borderRadius: '4px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#fff', fontSize: '12px' },
  pageBtnActive: { padding: '6px 12px', borderRadius: '4px', border: '1px solid #2c3e50', backgroundColor: '#2c3e50', color: '#fff', fontSize: '12px', fontWeight: 'bold' },
  pageBtnDisabled: { padding: '6px 12px', borderRadius: '4px', border: '1px solid #eee', backgroundColor: '#f9f9f9', color: '#ccc', cursor: 'not-allowed', fontSize: '12px' },
  grandTotalBox: { textAlign: 'right', borderLeft: '3px solid #27ae60', paddingLeft: '15px' }
};

export default DataRequest;