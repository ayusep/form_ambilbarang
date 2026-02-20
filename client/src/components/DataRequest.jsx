import { useEffect, useState } from 'react';

const DataRequest = () => {
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

  return (
    <>
      <header style={{ marginBottom: '30px' }}>
        <h1>📋 Data Permintaan Barang</h1>
        <p>Riwayat seluruh permintaan barang yang telah diajukan ke sistem.</p>
      </header>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '12px' }}>No. FAB</th>
              <th style={{ padding: '12px' }}>Tujuan</th>
              <th style={{ padding: '12px' }}>Tanggal</th>
              <th style={{ padding: '12px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((item) => (
                <tr key={item.no_fab} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>#{item.no_fab}</td>
                  <td style={{ padding: '12px' }}>{item.tujuan}</td>
                  <td style={{ padding: '12px' }}>
                    {new Date(item.tanggal_request).toLocaleDateString('id-ID', {
                      day: '2-digit', month: 'long', year: 'numeric'
                    })}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      backgroundColor: item.status === 'Pending' ? '#f1c40f' : '#2ecc71',
                      color: 'white',
                      fontSize: '12px'
                    }}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>Belum ada data permintaan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default DataRequest;