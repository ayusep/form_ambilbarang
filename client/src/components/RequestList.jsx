import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const RequestList = () => {
  const [data, setData] = useState([]);
  const location = useLocation();
  
  // Ambil parameter dari URL (misal: ?bulan=2&tahun=2026&divisi=1)
  const queryParams = new URLSearchParams(location.search);
  const bulan = queryParams.get('bulan');
  const tahun = queryParams.get('tahun');
  const divisi = queryParams.get('divisi');

  useEffect(() => {
    fetch(`http://localhost:5000/api/permintaan/filter?bulan=${bulan}&tahun=${tahun}&divisi=${divisi}`)
      .then(res => res.json())
      .then(resData => setData(resData))
      .catch(err => console.error("Gagal load data:", err));
  }, [bulan, tahun, divisi]);

  return (
    <div style={{ padding: '20px' }}>
      <h3>📄 Data Permintaan: Periode {bulan}/{tahun}</h3>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#f4f4f4' }}>
          <tr>
            <th>No FAB</th>
            <th>Barang</th>
            <th>Qty</th>
            <th>Status</th>
            <th>Tanggal</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? data.map((item, i) => (
            <tr key={i}>
              <td>{item.no_fab}</td>
              <td>{item.nama_barang}</td>
              <td>{item.qty}</td>
              <td>{item.status_approval}</td>
              <td>{new Date(item.tgl_permintaan).toLocaleDateString('id-ID')}</td>
            </tr>
          )) : (
            <tr><td colSpan="5" style={{ textAlign: 'center' }}>Data tidak ditemukan untuk periode ini.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RequestList;