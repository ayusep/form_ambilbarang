import React from 'react';

const PrintFAB = React.forwardRef(({ data }, ref) => {
  if (!data) return null;

  // Membuat array 12 baris agar layout konsisten seperti kertas asli
  const rows = [...data.allItems];
  while (rows.length < 12) {
    rows.push({ nama_barang: '', spesifikasi: '', qty: '', sat: '' });
  }

  return (
    <div ref={ref} className="print-area">
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 1cm; }
          .print-area { font-family: Arial, sans-serif; color: black; }
          table { width: 100%; border-collapse: collapse; border: 2px solid black; }
          th, td { border: 1px solid black; padding: 4px; font-size: 11px; height: 20px; }
          .header-box { display: flex; border: 2px solid black; border-bottom: none; }
          .logo-section { width: 45%; padding: 10px; border-right: 2px solid black; }
          .sign-section { width: 55%; display: grid; grid-template-columns: repeat(4, 1fr); }
          .sign-box { border-right: 1px solid black; text-align: center; }
          .title-row { background-color: black !important; color: white !important; text-align: center; font-weight: bold; padding: 5px; -webkit-print-color-adjust: exact; }
          .info-row { display: flex; justify-content: space-between; padding: 5px; border: 2px solid black; border-top: none; border-bottom: none; }
        }
      `}</style>

      <div className="header-box">
        <div className="logo-section">
          <strong>PT. BAHANA BHUMIPHALA PERSADA</strong><br/>
          <small>Jl. Raya Semarang - Pekalongan Km. 69 Batang</small>
        </div>
        <div className="sign-section">
          <div className="sign-box">User,<br/><br/><br/><small>Coord/Kasie/Staff</small></div>
          <div className="sign-box">Controller,<br/><br/><br/><small>PIC Budget</small></div>
          <div className="sign-box">Mengetahui,<br/><br/><br/><small>Spv/Kabag/Mgr</small></div>
          <div className="sign-box" style={{border:0}}>GNBB,<br/><br/><br/><small>Staff</small></div>
        </div>
      </div>

      <div className="title-row">FORM AMBIL BARANG (FAB)</div>
      
      <div className="info-row">
        <div>Bagian: {data.nama_divisi}</div>
        <div>Tanggal: {new Date(data.tgl_permintaan).toLocaleDateString('id-ID')}</div>
        <div>No. FAB: <strong>{data.no_fab}</strong></div>
      </div>

      <table>
        <thead>
          <tr>
            <th rowspan="2">No.</th>
            <th rowspan="2">Nama Barang</th>
            <th rowspan="2">Spesifikasi</th>
            <th rowspan="2">Kode</th>
            <th colspan="2">Kuantitas</th>
            <th colspan="3">Penggunaan</th>
            <th rowspan="2">Ket</th>
          </tr>
          <tr>
            <th>Jml</th><th>Sat</th><th>Proyek</th><th>Mesin</th><th>No.</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item, index) => (
            <tr key={index}>
              <td style={{textAlign:'center'}}>{item.nama_barang ? index + 1 : ''}</td>
              <td>{item.nama_barang}</td>
              <td>{item.spesifikasi || ''}</td>
              <td>{item.kode_barang || ''}</td>
              <td style={{textAlign:'center'}}>{item.qty}</td>
              <td style={{textAlign:'center'}}>{item.sat || 'Pcs'}</td>
              <td></td><td></td><td></td><td></td>
            </tr>
          ))}
        </tbody>
      </table>
      <small><i>Isi Form dengan data selengkapnya - Lembar Putih (Accounting), Biru (GNBB), Kuning (User)</i></small>
    </div>
  );
});

export default PrintFAB;