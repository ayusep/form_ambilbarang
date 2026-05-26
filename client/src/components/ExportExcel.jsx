import { useState } from 'react';

const ExportExcel = () => {

  const [tanggalAwal, setTanggalAwal] = useState('');
  const [tanggalAkhir, setTanggalAkhir] = useState('');

  const handleDownload = () => {

    if (!tanggalAwal || !tanggalAkhir) {
      alert('Pilih tanggal terlebih dahulu');
      return;
    }

    window.open(
      `http://localhost:5000/api/export/excel?tanggal_awal=${tanggalAwal}&tanggal_akhir=${tanggalAkhir}`,
      '_blank'
    );
  };

  return (

    <div style={{
      padding: '40px',
      fontFamily: 'Inter, sans-serif'
    }}>

      <h2>
        📊 Export Data Excel
      </h2>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        maxWidth: '300px',
        marginTop: '20px'
      }}>

        <div>
          <label>Tanggal Awal</label>

          <input
            type="date"
            value={tanggalAwal}
            onChange={(e) =>
              setTanggalAwal(e.target.value)
            }
            style={inputStyle}
          />
        </div>

        <div>
          <label>Tanggal Akhir</label>

          <input
            type="date"
            value={tanggalAkhir}
            onChange={(e) =>
              setTanggalAkhir(e.target.value)
            }
            style={inputStyle}
          />
        </div>

        <button
          onClick={handleDownload}
          style={btnStyle}
        >
          ⬇️ Download Excel
        </button>

      </div>

    </div>
  );
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  marginTop: '5px',
  borderRadius: '6px',
  border: '1px solid #ddd'
};

const btnStyle = {
  padding: '12px',
  background: '#27ae60',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold'
};

export default ExportExcel;