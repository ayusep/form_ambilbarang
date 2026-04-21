import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';

const Barang = () => {
  const [barang, setBarang] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [importing, setImporting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // State Baru untuk Edit
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  const [formData, setFormData] = useState({
    kode_sap: '',
    nama_barang: '',
    harga_sap: '',
    satuan: '',
    item_groub: 'SOP',
    stok: 0
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const getBarang = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/barang');
      const data = await response.json();
      setBarang(data.sort((a, b) => b.id_barang - a.id_barang));
    } catch (err) {
      console.error("Gagal ambil Barang:", err);
    }
  };

  useEffect(() => { getBarang(); }, []);

  // Fungsi untuk membuka modal Edit
  const handleEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item.id_barang);
    setFormData({
      kode_sap: item.kode_sap,
      nama_barang: item.nama_barang,
      harga_sap: item.harga_sap,
      satuan: item.satuan,
      item_groub: item.item_groub,
      stok: item.stok
    });
    setShowModal(true);
  };

  // Reset Form saat tutup modal
  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setCurrentId(null);
    setFormData({ kode_sap: '', nama_barang: '', harga_sap: '', satuan: '', item_groub: 'SOP', stok: 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Tentukan URL dan Method berdasarkan mode (Edit atau Tambah)
    const url = isEditing 
      ? `http://localhost:5000/api/barang/update/${currentId}` 
      : 'http://localhost:5000/api/barang/add';
    
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(isEditing ? "Barang berhasil diperbarui!" : "Barang berhasil ditambah!");
        closeModal();
        getBarang();
      } else {
        const err = await response.json();
        alert(err.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan server");
    }
  };

  const handleImportExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const response = await fetch('http://localhost:5000/api/barang/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: jsonData })
        });

        if (response.ok) {
          alert("Import Berhasil!");
          getBarang();
        }
      } catch (err) {
        alert("Gagal membaca file!");
      } finally {
        setImporting(false);
        e.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const template = [{ kode_sap: "SAP123", nama_barang: "Contoh Barang", harga_sap: 5000, item_groub: "SOP", satuan: "PCS" }];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template_Barang.xlsx");
  };

  const filteredBarang = barang.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      (item.kode_sap?.toLowerCase() || "").includes(search) ||
      (item.nama_barang?.toLowerCase() || "").includes(search) ||
      (item.item_groub?.toLowerCase() || "").includes(search)
    );
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBarang.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBarang.length / itemsPerPage);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h2 style={{ margin: 0 }}>Data Barang</h2>
          <p style={{ color: '#666' }}>Manajemen data material.</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowModal(true)} style={s.btnAdd}>➕ Tambah</button>
          <button onClick={downloadTemplate} style={s.btnDownload}>📥 Template</button>
          <label style={importing ? s.btnImportDisabled : s.btnImport}>
            {importing ? '⏳...' : '📤 Import'}
            <input type="file" accept=".xlsx, .xls" onChange={handleImportExcel} hidden />
          </label>
          <input
            type="text"
            placeholder="Cari..."
            style={s.searchInput}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </header>

      {showModal && (
        <div style={s.modalOverlay}>
          <div style={s.modalContent}>
            <h3>{isEditing ? 'Edit Barang' : 'Tambah Barang Baru'}</h3>
            <form onSubmit={handleSubmit} style={s.formGrid}>
              <input type="text" placeholder="Kode SAP" required value={formData.kode_sap} onChange={e => setFormData({ ...formData, kode_sap: e.target.value })} style={s.input} />
              <input type="text" placeholder="Nama Barang" required value={formData.nama_barang} onChange={e => setFormData({ ...formData, nama_barang: e.target.value })} style={s.input} />
              <input type="number" placeholder="Harga SAP" required value={formData.harga_sap} onChange={e => setFormData({ ...formData, harga_sap: e.target.value })} style={s.input} />
              <input type="text" placeholder="Satuan" required value={formData.satuan} onChange={e => setFormData({ ...formData, satuan: e.target.value })} style={s.input} />
              <select value={formData.item_groub} onChange={e => setFormData({ ...formData, item_groub: e.target.value })} style={s.input}>
                <option value="SOP">SOP</option>
                <option value="PAK">PAK</option>
                <option value="ATK & Rumah Tangga">ATK & Rumah Tangga</option>
                <option value="Sparepart">Sparepart</option>
              </select>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={s.btnSave}>{isEditing ? 'Update' : 'Simpan'}</button>
                <button type="button" onClick={closeModal} style={s.btnCancel}>Batal</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div style={s.tableCard}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={s.trHead}>
              <th style={s.th}>No</th>
              <th style={s.th}>Kode SAP</th>
              <th style={s.th}>Nama Barang</th>
              <th style={s.th}>Group</th>
              <th style={{ ...s.th, textAlign: 'right' }}>Harga</th>
              <th style={{ ...s.th, textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((item, index) => (
              <tr key={item.id_barang} style={s.trBody}>
                <td style={s.td}>{indexOfFirstItem + index + 1}</td>
                <td style={s.td}>{item.kode_sap}</td>
                <td style={s.td}>{item.nama_barang}</td>
                <td style={s.td}><span style={s.groupBadge}>{item.item_groub}</span></td>
                <td style={{ ...s.td, textAlign: 'right' }}>{Number(item.harga_sap).toLocaleString('id-ID')}</td>
                <td style={{ ...s.td, textAlign: 'center' }}>
                  <button onClick={() => handleEdit(item)} style={s.btnEdit}>✏️ Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Kontrol Pagination Baru */}
<div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
  <button 
    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
    disabled={currentPage === 1}
    style={currentPage === 1 ? s.btnNavDisabled : s.btnNav}
  >
    ‹ Previous
  </button>

  <span style={{ fontWeight: 'bold', color: '#2c3e50' }}>
    Halaman {currentPage} dari {totalPages || 1}
  </span>

  <button 
    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
    disabled={currentPage === totalPages || totalPages === 0}
    style={(currentPage === totalPages || totalPages === 0) ? s.btnNavDisabled : s.btnNav}
  >
    Next ›
  </button>
</div>
    </div>
  );
};

const s = {
  btnAdd: { padding: '10px 15px', backgroundColor: '#8e44ad', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
  btnSave: { padding: '10px 20px', backgroundColor: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  btnCancel: { padding: '10px 20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  btnEdit: { padding: '5px 10px', backgroundColor: '#f39c12', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '400px' },
  formGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { padding: '10px', borderRadius: '4px', border: '1px solid #ddd' },
  btnImport: { padding: '10px 15px', backgroundColor: '#27ae60', color: 'white', borderRadius: '6px', cursor: 'pointer' },
  btnImportDisabled: { padding: '10px 15px', backgroundColor: '#95a5a6', color: 'white', borderRadius: '6px' },
  btnDownload: { padding: '10px 15px', backgroundColor: '#3498db', color: 'white', borderRadius: '6px', border: 'none', cursor: 'pointer' },
  searchInput: { padding: '10px 15px', borderRadius: '6px', border: '1px solid #ddd', width: '200px' },
  tableCard: { backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' },
  trHead: { backgroundColor: '#2c3e50', color: 'white', textAlign: 'left' },
  th: { padding: '15px' },
  td: { padding: '15px', borderBottom: '1px solid #eee' },
  groupBadge: { backgroundColor: '#f1c40f', color: '#000', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' },
  pageBtn: { padding: '5px 10px', cursor: 'pointer' },
  pageBtnActive: { padding: '5px 10px', backgroundColor: '#2c3e50', color: 'white' },

btnNav: {
    padding: '8px 16px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: '0.3s'
  },
  btnNavDisabled: {
    padding: '8px 16px',
    backgroundColor: '#ecf0f1',
    color: '#bdc3c7',
    border: 'none',
    borderRadius: '4px',
    cursor: 'not-allowed',
    fontWeight: 'bold'
  }

};

export default Barang;