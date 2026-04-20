import { useEffect, useState, useCallback } from 'react';

const DataRequest = ({ user, filter }) => {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [coaOptions, setCoaOptions] = useState([]);

  const [printData, setPrintData] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const isAdminOrLogistik = ['admin', 'logistik'].includes(user?.role);
      const queryDepartemen = isAdminOrLogistik ? '' : user.id_departemen;

      const response = await fetch(
        `http://localhost:5000/api/permintaan/filter?bulan=${filter.bulan}&tahun=${filter.tahun}&departemen=${queryDepartemen}`
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


  useEffect(() => {
  const fetchCoaOptions = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/permintaan/coa`);
      const data = await response.json();
      setCoaOptions(data);
    } catch (err) {
      console.error("Gagal ambil daftar COA:", err);
    }
  };
  fetchCoaOptions();
}, []);

// Tambahkan di dalam komponen DataRequest, di bawah fetchData
const [editingCoa, setEditingCoa] = useState(null); // Menyimpan ID item yang diedit
const [tempCoa, setTempCoa] = useState(""); // Menyimpan input sementara

const handleUpdateCoa = async (id_permintaan_barang) => {
  try {
    const response = await fetch(`http://localhost:5000/api/permintaan/detail/${id_permintaan_barang}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_coa: tempCoa }) // Kirim ID COA yang dipilih
    });

    if (response.ok) {
      setEditingCoa(null);
      fetchData(); 
    } else {
      alert("Gagal mengupdate COA");
    }
  } catch (err) {
    console.error("Error update COA:", err);
  }
};

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

  const handlePrintManual = (fab) => {
    setPrintData(fab);
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const groupedData = requests.reduce((acc, item) => {
    const key = item.no_fab;
    if (!acc[key]) {
      acc[key] = { ...item, allItems: [], totalHargaFAB: 0 };
    }
    acc[key].allItems.push(item);
    acc[key].totalHargaFAB += (Number(item.qty) * Number(item.harga_sap || 0));
    return acc;
  }, {});

  const finalData = Object.values(groupedData).sort((a, b) => b.no_fab - a.no_fab);

  // --- UPDATE LOGIKA TOTAL BUDGET (Pending + Approved + Closed) ---
  const totalBudgetTerpakai = finalData.reduce((sum, fab) => {
    if (['Pending', 'Approved', 'Closed'].includes(fab.status_approval)) {
      return sum + fab.totalHargaFAB;
    }
    return sum;
  }, 0);

  const filteredData = finalData.filter(fab => {
    // 1. Filter Role Logistik
    if (user?.role === 'logistik') {
      if (!['Approved', 'Closed'].includes(fab.status_approval)) return false;
    }

    // 2. Filter Status (Select Option)
    const matchesStatus = statusFilter === 'All' || fab.status_approval === statusFilter;

    // 3. Filter Search (Input Text)
    const search = searchTerm.toLowerCase();
    
    // Cek apakah ada item di dalam FAB ini yang cocok dengan pencarian barang/mesin
    const matchesItems = fab.allItems.some(item => 
      item.nama_barang?.toLowerCase().includes(search) || 
      item.nama_mesin?.toLowerCase().includes(search) ||
      item.operator_maintenance?.toLowerCase().includes(search)
    );

    const tglFormatted = new Date(fab.tgl_permintaan).toLocaleDateString('id-ID');
    
    const matchesHeader =
      fab.no_fab.toString().includes(search) ||
      fab.nama?.toLowerCase().includes(search) ||
      fab.nama_departemen?.toLowerCase().includes(search) ||
      tglFormatted.includes(search);

    return matchesStatus && (matchesHeader || matchesItems);
  });

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
<style>
{`
@media screen{
  .print-wrapper{ display:none; }
}

@media print{

  body *{
    visibility:hidden;
  }

  .print-wrapper,
  .print-wrapper *{
    visibility:visible;
  }

  .print-wrapper{
    position:fixed;
    top:0;
    left:0;
  }

  .print-area{
    width:210mm;
    min-height:29,5mm;
    padding:2mm;
    margin:0;
    box-sizing:border-box;
    font-family:Arial;
  }

  table{
    width:100%;
    border-collapse:collapse;
  }

  th,td{
    border:1px solid black;
    font-size:8.5px;
    padding:2px 4px;
  }

  th{
    background:#efefef;
  }

  @page{
    size:210mm 29,5mm;
    margin:0;
  }

}
`}
</style>

      <header style={s.header}>
        <div>
          <h2 style={{ color: '#2c3e50', margin: 0 }}>📋 Data Request {filter.bulan}/{filter.tahun}</h2>
          <small style={{ color: '#7f8c8d' }}>Role: <span style={{ fontWeight: 'bold', color: '#2980b9' }}>{user?.role?.toUpperCase()}</span></small>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
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
  placeholder="Cari FAB, Nama, Barang, Mesin..."
  style={s.searchInput}
  value={searchTerm} // Tambahkan ini
  onChange={(e) => { 
    setSearchTerm(e.target.value); 
    setCurrentPage(1); // Reset ke halaman 1 saat mencari
  }}
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
              <th style={s.th}>DETAIL PENGGUNAAN</th>
              <th style={s.th}>HARGA</th>
              <th style={s.th}>STATUS</th>
              <th style={s.th}>KETERANGAN</th> 
              {user?.role !== 'operasional' && <th style={s.th}>AKSI</th>}
            </tr>
          </thead>
          <tbody>
            {currentItems.length === 0 ? (
              <tr><td colSpan="8" style={{ textAlign: 'center', padding: '30px' }}>Data tidak ditemukan.</td></tr>
            ) : currentItems.map((fab) => (
              <tr key={fab.no_fab} style={s.trBody}>
                <td style={{ ...s.td, fontWeight: 'bold' }}>#{fab.no_fab}</td>
                <td style={s.td}>{new Date(fab.tgl_permintaan).toLocaleDateString('id-ID')}</td>
                <td style={s.td}>
                  <strong>{fab.nama}</strong><br />
                  <small style={{ color: '#7f8c8d' }}>{fab.nama_departemen}</small>
                </td>
                

                <td style={{ padding: 0 }}>
                  {fab.allItems.map((item, i) => (
                    <div key={i} style={s.innerCell}>{item.nama_barang} (x{item.qty})</div>
                  ))}
                </td>

{/* UPDATE CELL LIST BARANG DENGAN EDITABLE COA */}
<td style={{ padding: 0 }}>
  {fab.allItems.map((item, i) => (
    <div key={i} style={{ ...s.innerCell, borderLeft: '3px solid #3498db', margin: '2px 0' }}>
      <small style={{ color: '#7f8c8d', fontSize: '10px' }}>
        ⚙️ {item.nama_mesin || '-'} <br /> 
        👷 {item.operator_maintenance || '-'} <br /> 
        
        {/* LOGIKA EDIT COA */}
        {/* LOGIKA EDIT COA DENGAN SELECT DROPDOWN */}
🏷️ {editingCoa === item.id_permintaan_barang ? (
  <div style={{ display: 'inline-flex', gap: '4px', marginTop: '4px', alignItems: 'center' }}>
    <select 
      value={tempCoa} 
      onChange={(e) => setTempCoa(e.target.value)}
      style={{ fontSize: '10px', padding: '2px', width: '120px', borderRadius: '4px' }}
      autoFocus
    >
      <option value="">-- Pilih COA --</option>
      {coaOptions.map(option => (
        <option key={option.id_coa} value={option.id_coa}>
          {option.kode_akun} - {option.coa}
        </option>
      ))}
    </select>
    <button 
      onClick={() => handleUpdateCoa(item.id_permintaan_barang)}
      style={{ padding: '2px 6px', cursor: 'pointer', background: '#27ae60', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px' }}
    >
      Simpan
    </button>
    <button 
      onClick={() => setEditingCoa(null)}
      style={{ padding: '2px 6px', cursor: 'pointer', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '10px' }}
    >
      Batal
    </button>
  </div>
) : (
  <span 
    style={{ 
      cursor: (user?.role === 'admin' || user?.role === 'logistik') ? 'pointer' : 'default',
      textDecoration: (user?.role === 'admin' || user?.role === 'logistik') ? 'underline dotted' : 'none',
      color: (user?.role === 'admin' || user?.role === 'logistik') ? '#2980b9' : 'inherit'
    }}
    onClick={() => {
      if (['admin', 'logistik'].includes(user?.role)) {
        setEditingCoa(item.id_permintaan_barang);
        setTempCoa(item.coa || ""); // Set ID awal (pastikan item.coa berisi id_coa)
      }
    }}
    title="Klik untuk edit COA"
  >
    {item.nama_coa || 'Klik isi COA'}
  </span>
)}
      </small>
    </div>
  ))}
</td>


                <td style={{ ...s.td, fontWeight: 'bold', color: '#2980b9' }}>{formatIDR(fab.totalHargaFAB)}</td>
                <td style={s.td}>
                  <span style={{ ...s.badge, backgroundColor: getBadgeColor(fab.status_approval) }}>{fab.status_approval}</span>
                </td>

                {/* CELL KETERANGAN */}
                <td style={{ ...s.td, fontSize: '11px', color: '#e74c3c', maxWidth: '150px' }}>
                  {fab.keterangan || '-'}
                </td>

                {user?.role !== 'operasional' && (
                  <td style={s.td}>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      {['approver', 'admin'].includes(user?.role) && fab.status_approval === 'Pending' && (
                        <>
                          <button onClick={() => handleActionFab(fab.no_fab, 'Approved')} style={s.btnA}>Approve</button>
                          <button onClick={() => handleActionFab(fab.no_fab, 'Rejected')} style={s.btnR}>Reject</button>
                        </>
                      )}
                      {['logistik', 'admin'].includes(user?.role) && fab.status_approval === 'Approved' && (
                        <button onClick={() => handleActionFab(fab.no_fab, 'Closed')} style={s.btnC}>Close Order</button>
                      )}
                      {['logistik', 'admin'].includes(user?.role) && fab.status_approval === 'Closed' && (
                        <button onClick={() => handlePrintManual(fab)} style={{ ...s.btnA, backgroundColor: '#8e44ad' }}>🖨️ Print</button>
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
          <div style={{ color: '#7f8c8d', fontSize: '12px', fontWeight: 'bold' }}>Total Budget Terpakai (Pnd + App + Cls):</div>
          <div style={{ color: '#27ae60', fontSize: '20px', fontWeight: 'bold' }}>{formatIDR(totalBudgetTerpakai)}</div>
        </div>
      </div>

      {/* --- PRINT AREA TETAP SAMA --- */}
      {printData && (
<div className="print-wrapper">
<div className="print-area">

{/* HEADER - Tabel Utama */}
<table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse' }}>
  <tbody>
    <tr>
      {/* LOGO */}
      <td style={{ width: '45px', textAlign: 'center', border: '1px solid black' }}>
        <img 
          src={`${window.location.origin}/BBP LOGO.png`} 
          style={{ width: '30px' }} 
          alt="Logo" 
        />
      </td>

      {/* NAMA PERUSAHAAN */}
      <td style={{ width: '250px', border: '1px solid black', padding: '5px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '10px' }}>PT. BAHANA BHUMIPHALA PERSADA</div>
        <div style={{ fontSize: '7px' }}>Jl. Raya Semarang - Pekalongan Km. 59 Batang</div>
      </td>

      {/* KOLOM TANDA TANGAN DINAMIS (3 KOLOM) */}
      {[
        { label: 'User', jabatan: 'Staff' },
        { label: 'Mengetahui', jabatan: 'Spv/Kabag/Mgr' },
        { label: 'GNBB', jabatan: 'Staff Logistik' }
      ].map((item) => (
        <td 
          key={item.label} 
          rowSpan="2" 
          style={{ 
            textAlign: 'center', 
            verticalAlign: 'top', 
            width: '100px', // Sedikit diperlebar karena kolom berkurang
            border: '1px solid black',
            padding: '4px' 
          }}
        >
          <div style={{ fontSize: '8px', fontWeight: 'bold' }}>{item.label},</div>
          
          {/* STEMPEL APPROVED */}
          <div style={{
            marginTop: '8px',
            fontSize: '7px',
            color: '#27ae60',
            border: '1px solid #27ae60',
            display: 'inline-block',
            padding: '1px 4px',
            fontWeight: 'bold',
            transform: 'rotate(-5deg)',
            borderRadius: '2px'
          }}>
            APPROVED
          </div>

          {/* JABATAN SESUAI REQUEST */}
          <div style={{ fontSize: '7px', marginTop: '8px', fontWeight: '500' }}>
            {item.jabatan}
          </div>
        </td>
      ))}
    </tr>

    <tr>
      {/* JUDUL FORM */}
      <td colSpan="2" style={{
        background: 'black',
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '13px',
        padding: '5px',
        border: '1px solid black'
      }}>
        FORM AMBIL BARANG (FAB)
      </td>
    </tr>
  </tbody>
</table>

{/* INFO */}
<table>
<tbody>

<tr>
<td style={{width:'30%'}}>Bagian : <b>{printData.nama_departemen}</b></td>
<td style={{width:'20%'}}>Sub : <b>{printData.nama_divisi}</b></td>{/* PERBAIKI INI, Sub adalah AMBIL DATA NAMA DIVISI DARI ID_USER */}
<td style={{width:'25%'}}>Tanggal : <b>
{new Date(printData.tgl_permintaan).toLocaleDateString('id-ID')}
</b></td>
<td style={{width:'25%'}}>No FAB : <b>{printData.no_fab}</b></td>
</tr>

</tbody>
</table>


{/* TABEL BARANG */}
<table>

<thead>

<tr>
<th rowSpan="2">No</th>
<th rowSpan="2">Nama Barang</th>
<th rowSpan="2">Spesifikasi</th>
<th rowSpan="2">Kode Barang</th>

<th colSpan="2">Kuantitas</th>

<th colSpan="3">Penggunaan</th>

<th rowSpan="2">Keterangan</th>
</tr>

<tr>
<th>Jml</th>
<th>Sat</th> 
<th>COA</th>
<th>Mesin</th>
<th>Teknisi</th>
</tr>

</thead>

<tbody>

{Array.from({length:10}).map((_,i)=>{

const item = printData.allItems[i]

return(
<tr key={i} style={{height:'20px'}}>

<td style={{textAlign:'center'}}>{i+1}</td>

<td>{item?.nama_barang || ''}</td>

<td>{item?.spesifikasi || '-'}</td>

<td style={{textAlign:'center'}}>{item?.kode_sap || ''}</td> 

<td style={{textAlign:'center'}}>{item?.qty || ''}</td>

<td style={{textAlign:'center'}}>{item?.satuan || ''}</td> {/* PERBAIKI INI, SAT adalah AMBIL DATA satuan dari id barang*/}


<td style={{textAlign:'center'}}>{item?.nama_coa || ''}</td>

<td style={{textAlign:'center'}}>{item?.nama_mesin || ''}</td>

<td style={{textAlign:'center'}}>{item?.operator_maintenance || ''}</td>

<td style={{fontSize:'7px'}}>
{i===0 ? printData.keterangan : ''}
</td>

</tr>
)

})}

</tbody>

</table>


{/* FOOTER */}
<div style={{
display:'flex',
justifyContent:'space-between',
fontSize:'7px',
marginTop:'2px'
}}>

<div>
*) Form digandakan : Lembar Putih : Accounting, Biru : GNBB, Kuning : User
</div>

<div>
Printed : {new Date().toLocaleString('id-ID')}
</div>

</div>


</div>
</div>
)}
    </div>
  );
};

const p = {
  container: {
    backgroundColor: 'white',
    width: '210mm',
    height: '99mm',
    fontFamily: 'Arial',
    fontSize: '9px'
  },

  tableHeader: {
    width: '100%',
    border: '1px solid black'
  },

  logoBox: {
    width: '45px',
    textAlign: 'center'
  },

  companyInfo: {
    fontSize: '9px',
    padding: '2px'
  },

  signHeader: {
    fontSize: '9px',
    textAlign: 'center',
    fontWeight: 'bold'
  },

  formTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: '12px'
  },

  approveBox: {
    height: '35px',
    textAlign: 'center',
    verticalAlign: 'top'
  },

  stampContainer: {
    display: 'flex',
    justifyContent: 'center'
  },

  stampText: {
    fontSize: '8px',
    color: '#27ae60',
    border: '1px solid #27ae60',
    padding: '1px 4px'
  },

  roleText: {
    fontSize: '7px'
  },

  tableMid: {
    marginTop: '2px',
    fontSize: '9px'
  },

  tableMain: {
    marginTop: '2px',
    fontSize: '9px',
    tableLayout: 'fixed'
  }
};

const s = {
  // ... copy styles dari kode lama Anda ...
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