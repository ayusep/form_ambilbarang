import { useEffect, useState } from 'react';

const Divisi = () => {
  const [divisi, setDivisi] = useState([]);
  const [namaDivisi, setNamaDivisi] = useState("");
  const [limitBudget, setLimitBudget] = useState("");

  const getDivisi = async () => {
    try {
      // Pastikan port 5000 adalah port backend Anda yang sedang berjalan
      const response = await fetch('http://localhost:5000/api/divisi');
      if (!response.ok) throw new Error("Gagal mengambil data dari server");
      const data = await response.json();
      setDivisi(data);
    } catch (err) { 
      console.error("Gagal ambil divisi:", err); 
    }
  };

  useEffect(() => { getDivisi(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi sederhana sebelum kirim
    if (!namaDivisi || !limitBudget) return alert("Mohon isi semua data!");

    try {
      const response = await fetch('http://localhost:5000/api/divisi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          nama_divisi: namaDivisi.toUpperCase(), // Standarisasi nama divisi jadi huruf kapital
          limit_budget_pinjam: parseFloat(limitBudget) 
        })
      });
      
      const result = await response.json();

      if (response.ok) {
        setNamaDivisi(""); 
        setLimitBudget("");
        await getDivisi(); // Refresh data tabel
        alert("✅ Departemen berhasil ditambahkan!");
      } else {
        alert("❌ Gagal simpan: " + (result.error || "Terjadi kesalahan"));
      }
    } catch (err) {
      console.error("Error saat simpan:", err);
      alert("❌ Koneksi ke server gagal!");
    }
  };

  const deleteDivisi = async (id) => {
    if (window.confirm("Yakin ingin menghapus divisi ini?")) {
      try {
        const response = await fetch(`http://localhost:5000/api/divisi/${id}`, { method: 'DELETE' });
        if (response.ok) {
          getDivisi();
        } else {
          alert("Gagal menghapus data");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ marginBottom: '30px' }}>
        <h1>Manajemen Departemen</h1>
        <p>Kelola data departemen dan limit budget bulanan.</p>
      </header>
      
      {/* Form Section */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h3>Tambah Departemen Baru</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
          <input style={styles.input} type="text" placeholder="Nama Departemen (contoh: MAINTENANCE)" value={namaDivisi} onChange={(e) => setNamaDivisi(e.target.value)} required />
          <input style={styles.input} type="number" placeholder="Limit Budget per Bulan" value={limitBudget} onChange={(e) => setLimitBudget(e.target.value)} required />
          <button type="submit" style={styles.btnSimpan}>Simpan</button>
        </form>
      </div>

      {/* Table Section */}
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee', backgroundColor: '#f8f9fa' }}>
              <th style={styles.th}>No</th>
              <th style={styles.th}>ID Departemen</th>
              <th style={styles.th}>Nama Departemen</th>
              <th style={styles.th}>Limit Bulanan (Rp)</th>
              <th style={styles.th}>Aksi</th>
            </tr>
          </thead>
          <tbody>
  {divisi.length === 0 ? (
    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>Data belum ada.</td></tr>
  ) : (
    divisi.map((item, index) => ( // Tambahkan parameter index di sini
      <tr key={item.id_divisi} style={{ borderBottom: '1px solid #eee' }}>
        {/* Nomor Urut */}
        <td style={styles.td}>{index + 1}</td> 
        
        <td style={styles.td}>{item.id_divisi}</td>
        <td style={styles.td}>{item.nama_divisi}</td>
        <td style={styles.td}>
          {Number(item.limit_budget_pinjam || 0).toLocaleString('id-ID')}
        </td>
        <td style={styles.td}>
          <button onClick={() => deleteDivisi(item.id_divisi)} style={styles.btnHapus}>Hapus</button>
        </td>
      </tr>
    ))
  )}
</tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  input: { padding: '10px', flex: 1, borderRadius: '4px', border: '1px solid #ddd' },
  btnSimpan: { padding: '10px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  btnHapus: { backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' },
  th: { padding: '15px' },
  td: { padding: '15px' }
};

export default Divisi;