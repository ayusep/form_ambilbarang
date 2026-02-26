import { useEffect, useState } from 'react';

const DataRequest = ({ user, filter }) => {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/permintaan/filter?bulan=${filter.bulan}&tahun=${filter.tahun}&divisi=${user.id_divisi}`);
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      console.error("Gagal ambil data:", err);
    }
  };

  useEffect(() => {
    fetchData();
    setCurrentPage(1);
  }, [filter, user]);

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

  // 1. GROUPING & HITUNG TOTAL PER NO_FAB
  const groupedData = requests.reduce((acc, item) => {
    const key = item.no_fab;
    if (!acc[key]) {
      acc[key] = { ...item, allItems: [], totalHargaFAB: 0 };
    }
    acc[key].allItems.push(item);
    // Hitung subtotal tiap item dan tambahkan ke total FAB
    acc[key].totalHargaFAB += (Number(item.qty) * Number(item.harga_sap || 0));
    return acc;
  }, {});

  const finalData = Object.values(groupedData);

  // 2. SEARCH LOGIC
  const filteredData = finalData.filter(fab => 
    fab.no_fab.toString().includes(searchTerm) || 
    fab.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 3. PAGINATION LOGIC
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // 4. GRAND TOTAL BULANAN
  const grandTotalBulan = filteredData.reduce((sum, fab) => sum + fab.totalHargaFAB, 0);

  const formatIDR = (num) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);

  const getBadgeColor = (status) => {
    switch (status) {
      case 'Pending': return '#f1c40f';
      case 'Approved': return '#3498db';
      case 'Completed': return '#27ae60';
      case 'Rejected': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <header style={s.header}>
        <h2 style={{ color: '#2c3e50', margin: 0 }}>📋 Data Request Periode {filter.bulan}/{filter.tahun}</h2>
        <input 
          type="text" 
          placeholder="Cari No. FAB atau Pemohon..." 
          style={s.searchInput}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </header>

      <div style={s.tableCard}>
        <table style={s.table}>
          <thead>
            <tr style={s.trHead}>
              <th style={s.th}>NO. FAB</th>
              <th style={s.th}>TANGGAL</th>
              <th style={s.th}>PEMOHON</th>
              <th style={s.th}>LIST BARANG</th>
              <th style={s.th}>QTY x HARGA_SAP</th>
              <th style={s.th}>TOTAL</th>
              <th style={s.th}>MESIN / OPERATOR</th>
              <th style={s.th}>STATUS</th>
              <th style={s.th}>CATATAN</th>
              {user?.role !== 'operasional' && <th style={s.th}>AKSI</th>}
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr><td colSpan="10" style={{ textAlign: 'center', padding: '30px' }}>Data tidak ditemukan.</td></tr>
            ) : currentItems.map((fab) => (
              <tr key={fab.no_fab} style={s.trBody}>
                <td style={{ ...s.td, fontWeight: 'bold' }}>#{fab.no_fab}</td>
                <td style={s.td}>{new Date(fab.tgl_permintaan).toLocaleDateString('id-ID')}</td>
                <td style={s.td}>
                  <strong>{fab.nama}</strong><br />
                  <small style={{ color: '#7f8c8d' }}>{fab.nama_divisi}</small>
                </td>
                
                {/* LIST BARANG */}
                <td style={{ padding: 0 }}>
                  {fab.allItems.map((item, i) => (
                    <div key={i} style={s.innerCell}>{item.nama_barang}</div>
                  ))}
                </td>

                {/* QTY x HARGA_SAP */}
                <td style={{ padding: 0 }}>
                  {fab.allItems.map((item, i) => (
                    <div key={i} style={s.innerCell}>
                      {item.qty} x <span style={{fontSize: '10px'}}>{formatIDR(item.harga_sap || 0)}</span>
                    </div>
                  ))}
                </td>

                {/* TOTAL PER FAB */}
                <td style={{ ...s.td, fontWeight: 'bold', color: '#2980b9' }}>
                  {formatIDR(fab.totalHargaFAB)}
                </td>

                <td style={s.td}>
                  <strong>{fab.mesin || '-'}</strong><br />
                  <small style={{ color: '#7f8c8d' }}>{fab.operator_maintenance || '-'}</small>
                </td>
                
                <td style={s.td}>
                  <span style={{ ...s.badge, backgroundColor: getBadgeColor(fab.status_approval) }}>
                    {fab.status_approval}
                  </span>
                </td>

                <td style={{ ...s.td, fontSize: '11px', fontStyle: 'italic', color: '#7f8c8d' }}>
                  {fab.keterangan || '-'}
                </td>

                {user?.role !== 'operasional' && (
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {user?.role === 'manager' && fab.status_approval === 'Pending' && (
                        <>
                          <button onClick={() => handleActionFab(fab.no_fab, 'Approved')} style={s.btnA}>Approve</button>
                          <button onClick={() => handleActionFab(fab.no_fab, 'Rejected')} style={s.btnR}>Reject</button>
                        </>
                      )}
                      {user?.role === 'logistik' && fab.status_approval === 'Approved' && (
                        <button onClick={() => handleActionFab(fab.no_fab, 'Completed')} style={s.btnC}>Complete</button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOOTER: PAGINATION & GRAND TOTAL */}
      <div style={s.footer}>
        <div style={s.pagination}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={s.pageBtn}>Prev</button>
          <span style={{ margin: '0 15px', fontSize: '13px' }}>Hal {currentPage} / {totalPages || 1}</span>
          <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)} style={s.pageBtn}>Next</button>
        </div>

        <div style={s.grandTotalBox}>
          <div style={{ color: '#7f8c8d', fontSize: '12px' }}>Total Pengeluaran Bulan Ini:</div>
          <div style={{ color: '#27ae60', fontSize: '20px', fontWeight: 'bold' }}>{formatIDR(grandTotalBulan)}</div>
        </div>
      </div>
    </div>
  );
};

const s = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  searchInput: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', width: '250px' },
  tableCard: { backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  trHead: { backgroundColor: '#2c3e50', color: 'white' },
  th: { padding: '12px', fontSize: '11px', textAlign: 'left', textTransform: 'uppercase' },
  trBody: { borderBottom: '1px solid #eee' },
  td: { padding: '12px', fontSize: '12px', verticalAlign: 'top' },
  innerCell: { padding: '8px 12px', borderBottom: '1px solid #f9f9f9', fontSize: '11px', minHeight: '32px' },
  badge: { padding: '4px 8px', borderRadius: '12px', color: 'white', fontSize: '10px', fontWeight: 'bold' },
  btnA: { padding: '4px 8px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' },
  btnR: { padding: '4px 8px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' },
  btnC: { padding: '4px 8px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '10px' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', backgroundColor: '#fff', padding: '15px', borderRadius: '10px' },
  pageBtn: { padding: '5px 10px', borderRadius: '4px', border: '1px solid #ddd', cursor: 'pointer', backgroundColor: '#fff' },
  grandTotalBox: { textAlign: 'right' }
};

export default DataRequest;