import React from 'react';

const PrintFAB = React.forwardRef(({ data }, ref) => {
  if (!data) return null;

  const rows = [...(data.allItems || [])];

  // TOTAL PERSENTASE HARUS 100%
  // Saya lebarkan Nama Barang dan Spek agar memakan sisa space yang kosong
  const columns = [
    { header: 'No', key: 'no',  align: 'center', render: (_, index) => index + 1 },
    { header: 'Nama Barang', key: 'nama_barang', width: '32%' }, // Diperlebar
    { header: 'Spek', key: 'spesifikasi' },      // Diperlebar
    { header: 'Qty', key: 'qty', width: '6%', align: 'center', bold: true },
    { header: 'Sat', key: 'sat', width: '6%', align: 'center', default: 'Pcs' },
    { header: 'Prj', key: 'prj', width: '7%', align: 'center' },
    { header: 'Msn', key: 'msn', width: '7%', align: 'center' },
    { header: 'No', key: 'no_penggunaan', width: '4%', align: 'center' },
    { header: 'Ket', key: 'keterangan', width: '100px' }, // Sisanya untuk keterangan
  ];

  return (
    <div ref={ref} className="fab-full-wrapper">

      <div className="header-box">
        <div className="logo-section">
          <strong style={{fontSize: '12pt'}}>PT. BAHANA BHUMIPHALA PERSADA</strong><br/>
          <span style={{fontSize: '9pt'}}>Batang, Jawa Tengah</span>
        </div>
        <div className="sign-section">
          {['User', 'PIC', 'Mgr', 'GNBB'].map((label, i) => (
            <div key={label} className="sign-box" style={{ borderRight: i === 3 ? 0 : '1pt solid black' }}>
              {label}<br/><br/><br/>
              <strong>{['Coord', 'Budget', 'Dept', 'Staff'][i]}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="title-row">FORM AMBIL BARANG (FAB)</div>
      
      <div className="info-row">
        <div>Bagian: <strong>{data.nama_departemen}</strong></div>
        <div>Tgl: <strong>{new Date(data.tgl_permintaan).toLocaleDateString('id-ID')}</strong></div>
        <div>No: <strong>{data.no_fab}</strong></div>
      </div>

      <table className="fab-table">
        <thead>
          <tr>
            <th rowSpan="2" style={{width: columns[0].width}}>{columns[0].header}</th>
            <th rowSpan="2" style={{width: columns[1].width}}>{columns[1].header}</th>
            <th rowSpan="2" style={{width: columns[2].width}}>{columns[2].header}</th>
            <th colSpan="2" style={{width: '12%'}}>Qty</th>
            <th colSpan="3" style={{width: '18%'}}>Penggunaan</th>
            <th rowSpan="2" style={{width: '10%'}}>Ket</th>
          </tr>
          <tr>
            <th style={{width: columns[3].width}}>jguhkjlkjlk</th>
            <th style={{width: columns[4].width}}>Sat</th>
            <th style={{width: columns[5].width}}>Prj</th>
            <th style={{width: columns[6].width}}>Msn</th>
            <th style={{width: columns[7].width}}>No</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((item, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col) => (
                <td 
                  key={col.key} 
                  style={{ textAlign: col.align || 'left', fontWeight: col.bold ? 'bold' : 'normal' }}
                >
                  {col.render ? col.render(item, rowIndex) : (item[col.key] || col.default || '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      <div style={{marginTop: '10px', fontSize: '8pt', display: 'flex', justifyContent: 'space-between'}}>
        <span>* Lembar: Putih (Acc), Biru (GNBB), Kuning (User)</span>
        <span><i>Printed by System - {new Date().toLocaleDateString('id-ID')}</i></span>
      </div>
    </div>
  );
});

export default PrintFAB;