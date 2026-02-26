import React, { useState } from 'react';

const FilterLaporan = ({ user, onFilterSubmit }) => {
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());

  return (
    <div style={s.container}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>📊 Laporan FAB Per Divisi</h2>
      <p style={{ textAlign: 'center' }}>Divisi: <strong>{user.nama_divisi || "Divisi Terdeteksi"}</strong></p>
      
      <div style={s.flex}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Pilih Bulan:</label>
          <select value={bulan} onChange={(e) => setBulan(e.target.value)} style={s.input}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(2026, i))}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Pilih Tahun:</label>
          <select value={tahun} onChange={(e) => setTahun(e.target.value)} style={s.input}>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
      </div>

      <button onClick={() => onFilterSubmit({ bulan, tahun })} style={s.btn}>
        Tampilkan Data Permintaan
      </button>
    </div>
  );
};

const s = {
  container: { padding: '30px', backgroundColor: 'white', borderRadius: '12px', maxWidth: '500px', margin: '50px auto', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' },
  flex: { display: 'flex', gap: '15px', marginTop: '20px' },
  input: { width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ddd' },
  btn: { width: '100%', padding: '12px', marginTop: '25px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }
};

export default FilterLaporan;