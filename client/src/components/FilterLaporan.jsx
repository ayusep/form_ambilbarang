import React, { useState } from 'react';

const FilterLaporan = ({ onFilterSubmit }) => {
  // Inisialisasi dengan tanggal hari ini dalam format YYYY-MM-DD
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = () => {
    const dateObj = new Date(selectedDate);
    const bulan = dateObj.getMonth() + 1; // Ambil bulan (1-12)
    const tahun = dateObj.getFullYear(); // Ambil tahun otomatis
    
    onFilterSubmit({ bulan, tahun });
  };

  return (
    <div style={s.container}>
      <h2 style={{ textAlign: 'center', color: '#2c3e50' }}>📊 Laporan FAB Per Departemen</h2>

      <div style={s.flex}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Pilih Periode (Bulan/Tahun):</label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            style={s.input}
          />
          <small style={{ color: '#7f8c8d', fontSize: '10px' }}>
            *Sistem akan mengambil data berdasarkan bulan & tahun dari tanggal di atas.
          </small>
        </div>
      </div>

      <button onClick={handleSubmit} style={s.btn}>
        Tampilkan Data Permintaan
      </button>
    </div>
  );
};

const s = {
  container: { 
    padding: '30px', 
    backgroundColor: 'white', 
    borderRadius: '12px', 
    maxWidth: '400px', 
    margin: '50px auto', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)' 
  },
  flex: { marginTop: '20px' },
  input: { 
    width: '100%', 
    padding: '10px', 
    marginTop: '8px', 
    borderRadius: '5px', 
    border: '1px solid #ddd',
    fontSize: '14px',
    boxSizing: 'border-box'
  },
  btn: { 
    width: '100%', 
    padding: '12px', 
    marginTop: '25px', 
    backgroundColor: '#3498db', 
    color: 'white', 
    border: 'none', 
    borderRadius: '5px', 
    cursor: 'pointer', 
    fontWeight: 'bold' 
  }
};

export default FilterLaporan;