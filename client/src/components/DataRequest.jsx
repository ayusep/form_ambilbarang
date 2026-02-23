import { useEffect, useState } from 'react';

const DataRequest = ({ user }) => {
  const [requests, setRequests] = useState([]);

  const getRequests = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/permintaan');
      const data = await response.json();
      setRequests(data);
    } catch (err) {
      console.error("Gagal ambil data permintaan:", err);
    }
  };

  useEffect(() => {
    getRequests();
  }, []);

  // Fungsi untuk Admin melakukan Approve atau Reject
  const handleAction = async (id, statusBaru) => {
    let alasan = null;
    if (statusBaru === 'Rejected') {
      alasan = prompt("Masukkan alasan penolakan:");
      if (alasan === null) return; // Batal jika menekan cancel pada prompt
    }

    try {
      const response = await fetch(`http://localhost:5000/api/permintaan/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status_approval: statusBaru,
          keterangan: alasan 
        })
      });

      if (response.ok) {
        alert(`Berhasil update status ke ${statusBaru}`);
        getRequests(); // Refresh data
      }
    } catch (err) {
      console.error("Gagal update status:", err);
    }
  };

  // Helper untuk warna badge status
  const getStatusBadge = (status) => {
    let bgColor = '#f1c40f'; // Pending
    if (status === 'Approved') bgColor = '#2ecc71';
    if (status === 'Rejected') bgColor = '#e74c3c';

    return {
      padding: '4px 10px',
      borderRadius: '20px',
      backgroundColor: bgColor,
      color: 'white',
      fontSize: '12px',
      fontWeight: 'bold',
      display: 'inline-block'
    };
  };

  return (
    <>
      <header style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50' }}>📋 Data Request Barang (FAB)</h1>
        <p style={{ color: '#7f8c8d' }}>Kelola dan pantau riwayat permintaan barang dalam sistem.</p>
      </header>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ textAlign: 'left', backgroundColor: '#2c3e50', color: 'white' }}>
              <th style={styles.th}>NO</th>
              <th style={styles.th}>NO. FAB</th>
              <th style={styles.th}>TANGGAL</th>
              <th style={styles.th}>ATAS NAMA</th>
              <th style={styles.th}>NAMA BARANG</th>
              <th style={styles.th}>QTY</th>
              <th style={styles.th}>TUJUAN PENGGUNAAN</th>
              <th style={styles.th}>STATUS</th>
              <th style={styles.th}>ALASAN REJECT</th>
              {user?.role === 'Admin' && <th style={styles.th}>AKSI</th>}
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((item, index) => (
                <tr key={item.id_permintaan} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={styles.td}>{index + 1}</td>
                  <td style={{ ...styles.td, fontWeight: 'bold' }}>#{item.no_fab}</td>
                  <td style={styles.td}>
                    {new Date(item.tgl_permintaan).toLocaleDateString('id-ID', {
                      day: '2-digit', month: 'short', year: 'numeric'
                    })}
                  </td>
                  <td style={styles.td}>
                    <strong>{item.nama}</strong> <br />
                    <small style={{ color: '#888' }}>({item.nama_divisi})</small>
                  </td>
                  <td style={styles.td}>
                    <strong>{item.nama_barang}</strong> <br />
                    <small style={{ color: '#3498db' }}>{item.kode_sap}</small>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>{item.qty}</td>
                  <td style={styles.td}>{item.tujuan}</td>
                  <td style={styles.td}>
                    <span style={getStatusBadge(item.status_approval)}>
                      {item.status_approval}
                    </span>
                  </td>
                  <td style={styles.td}>{item.keterangan || "-"}</td>
                  
                  {/* AKSI HANYA UNTUK ADMIN */}
                  {user?.role === 'Admin' && (
                    <td style={styles.td}>
                      {item.status_approval === 'Pending' ? (
                        <div style={{ display: 'flex', gap: '5px' }}>
                          <button 
                            onClick={() => handleAction(item.id_permintaan, 'Approved')}
                            style={styles.btnApprove}
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleAction(item.id_permintaan, 'Rejected')}
                            style={styles.btnReject}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: '#bdc3c7', fontStyle: 'italic' }}>Fixed</span>
                      )}
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={user?.role === 'Admin' ? "10" : "9"} style={{ padding: '30px', textAlign: 'center', color: '#888' }}>
                  Belum ada data permintaan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

// Objek Styles untuk merapikan tampilan
const styles = {
  th: { padding: '15px 12px', borderBottom: '2px solid #eee' },
  td: { padding: '12px', borderBottom: '1px solid #eee', verticalAlign: 'top' },
  btnApprove: {
    padding: '6px 10px',
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  },
  btnReject: {
    padding: '6px 10px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px'
  }
};

export default DataRequest;