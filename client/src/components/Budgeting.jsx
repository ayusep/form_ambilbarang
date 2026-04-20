import { useEffect, useState } from 'react';

const Budgeting = () => {
  const [listDepartemen, setListDepartemen] = useState([]);
  const [budgets, setBudgets] = useState([]);
  
  // Form State
  const [idDepartemen, setIdDepartemen] = useState("");
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [limitBudget, setLimitBudget] = useState("");
  const [keterangan, setKeterangan] = useState("");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Ambil data departemen untuk dropdown
  const getDepartemen = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/departemen');
      const data = await res.json();
      setListDepartemen(data);
    } catch (err) { console.error(err); }
  };

  // Ambil data riwayat budgeting
  const getBudgets = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/budgeting');
      const data = await res.json();
      setBudgets(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    getDepartemen();
    getBudgets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idDepartemen || !limitBudget) return alert("Pilih departemen dan isi limit!");

    try {
      const response = await fetch('http://localhost:5000/api/budgeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_departemen: idDepartemen,
          bulan: parseInt(bulan),
          tahun: parseInt(tahun),
          limit_budget: parseFloat(limitBudget),
          keterangan: keterangan || "Budget Awal"
        })
      });

      if (response.ok) {
        setLimitBudget("");
        setKeterangan("");
        getBudgets();
        alert("✅ Budget/Revisi berhasil disimpan!");
      }
    } catch (err) { alert("❌ Koneksi gagal"); }
  };

  const filteredBudgets = budgets.filter(item => 
    item.nama_departemen?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.keterangan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBudgets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBudgets.length / itemsPerPage);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>💰 Manajemen Budgeting & Revisi</h2>
      </header>

      <div style={styles.card}>
        <h3 style={{ marginTop: 0 }}>Atur / Revisi Budget</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select style={styles.input} value={idDepartemen} onChange={(e) => setIdDepartemen(e.target.value)} required>
            <option value="">-- Pilih Departemen --</option>
            {listDepartemen.map(d => <option key={d.id_departemen} value={d.id_departemen}>{d.nama_departemen}</option>)}
          </select>
          <select style={{...styles.input, maxWidth: '100px'}} value={bulan} onChange={(e) => setBulan(e.target.value)}>
            {[...Array(12)].map((_, i) => <option key={i+1} value={i+1}>Bulan {i+1}</option>)}
          </select>
          <input style={{...styles.input, maxWidth: '100px'}} type="number" value={tahun} onChange={(e) => setTahun(e.target.value)} />
          <input style={styles.input} type="number" placeholder="Limit Budget (Rp)" value={limitBudget} onChange={(e) => setLimitBudget(e.target.value)} required />
          <input style={styles.input} type="text" placeholder="Keterangan (Contoh: Revisi Bukber)" value={keterangan} onChange={(e) => setKeterangan(e.target.value)} />
          <button type="submit" style={styles.btnSimpan}>Simpan / Update</button>
        </form>
      </div>

      <div style={styles.card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <h3 style={{ margin: 0 }}>Riwayat Perubahan Budget</h3>
          <input type="text" placeholder="Cari..." style={{ ...styles.input, maxWidth: '200px' }} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', backgroundColor: '#f8f9fa' }}>
              <th style={styles.th}>Waktu Input</th>
              <th style={styles.th}>Departemen</th>
              <th style={styles.th}>Periode</th>
              <th style={styles.th}>Limit (Rp)</th>
              <th style={styles.th}>Keterangan</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, idx) => (
              <tr key={idx} style={styles.tr}>
                <td style={styles.td}>{new Date(item.tgl_input).toLocaleString('id-ID')}</td>
                <td style={styles.td}><strong>{item.nama_departemen}</strong></td>
                <td style={styles.td}>{item.bulan}/{item.tahun}</td>
                <td style={{ ...styles.td, fontWeight: 'bold', color: '#27ae60' }}>{Number(item.limit_budget).toLocaleString('id-ID')}</td>
                <td style={styles.td}>{item.keterangan}</td>
                <td style={styles.td}>
                  {item.status_aktif ? 
                    <span style={{color: 'white', backgroundColor: '#27ae60', padding: '2px 8px', borderRadius: '10px', fontSize: '11px'}}>AKTIF</span> : 
                    <span style={{color: '#95a5a6', fontSize: '11px'}}>History</span>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination disini sama dengan template Departemen kamu */}
      </div>
    </div>
  );
};

const styles = {
    card: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' },
    input: { padding: '12px', borderRadius: '6px', border: '1px solid #dfe6e9', fontSize: '14px' },
    btnSimpan: { padding: '12px 25px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    th: { padding: '15px', color: '#636e72', fontSize: '12px', borderBottom: '2px solid #eee' },
    td: { padding: '15px', borderBottom: '1px solid #f1f2f6', fontSize: '13px' },
    tr: { transition: '0.2s' }
};

export default Budgeting;