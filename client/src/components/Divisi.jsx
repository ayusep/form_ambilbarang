import { useEffect, useState } from 'react';

const Divisi = () => {
  const [divisi, setDivisi] = useState([]);
  const [namaDivisi, setNamaDivisi] = useState("");
  const [limitBudget, setLimitBudget] = useState("");

  const getDivisi = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/divisi');
      const data = await response.json();
      setDivisi(data);
    } catch (err) { console.error("Gagal ambil divisi:", err); }
  };

  useEffect(() => { getDivisi(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/divisi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama_divisi: namaDivisi, limit_budget_pinjam: limitBudget })
    });
    setNamaDivisi(""); setLimitBudget("");
    getDivisi();
  };

  const deleteDivisi = async (id) => {
    if (window.confirm("Yakin ingin menghapus?")) {
      await fetch(`http://localhost:5000/api/divisi/${id}`, { method: 'DELETE' });
      getDivisi();
    }
  };

  return (
    <>
      <header style={{ marginBottom: '30px' }}>
        <h1>Manajemen Divisi</h1>
        <p>Kelola data departemen dan limit budget inventaris.</p>
      </header>
      
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '30px' }}>
        <h3>Tambah Divisi Baru</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px' }}>
          <input style={{ padding: '8px', flex: 1 }} type="text" placeholder="Nama Divisi" value={namaDivisi} onChange={(e) => setNamaDivisi(e.target.value)} required />
          <input style={{ padding: '8px', flex: 1 }} type="number" placeholder="Limit Budget" value={limitBudget} onChange={(e) => setLimitBudget(e.target.value)} required />
          <button type="submit" style={{ padding: '8px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Simpan</button>
        </form>
      </div>

      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th style={{ padding: '12px' }}>Nama Divisi</th>
              <th style={{ padding: '12px' }}>Limit Budget (Rp)</th>
              <th style={{ padding: '12px' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {divisi.map((item) => (
              <tr key={item.id_divisi} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{item.id_divisi}</td>
                <td style={{ padding: '12px' }}>{item.nama_divisi}</td>
                <td style={{ padding: '12px' }}>{Number(item.limit_budget_pinjam).toLocaleString('id-ID')}</td>
                <td style={{ padding: '12px' }}>
                  <button onClick={() => deleteDivisi(item.id_divisi)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Divisi;