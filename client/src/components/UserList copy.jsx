import React, { useState, useEffect, useCallback } from 'react';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // State untuk Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // --- LOGIKA PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // State untuk data master
  const [divisiOptions, setDivisiOptions] = useState([]);
  const [deptOptions, setDeptOptions] = useState([]);

  // Bungkus fetchUsers dengan useCallback agar stabil saat dipanggil di useEffect
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/user');
      if (!res.ok) throw new Error("Gagal ambil data user");
      const data = await res.json();
      setUsers(data.sort((a, b) => b.id_user - a.id_user));
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Jalankan semua fetch secara paralel
    const fetchMasterData = async () => {
      try {
        const [resDiv, resDept] = await Promise.all([
          fetch('http://localhost:5000/api/divisi'),
          fetch('http://localhost:5000/api/departemen')
        ]);
        
        if (resDiv.ok) setDivisiOptions(await resDiv.json());
        if (resDept.ok) setDeptOptions(await resDept.json());
      } catch (err) {
        console.error("Gagal memuat data master:", err);
      }
    };

    fetchUsers();
    fetchMasterData();
  }, [fetchUsers]);

  // Reset page kalau search term berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDelete = async (id, nama) => {
    if (window.confirm(`Hapus user "${nama}"?`)) {
      try {
        const res = await fetch(`http://localhost:5000/api/user/${id}`, {
          method: 'DELETE'
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || "Gagal menghapus");

        alert("User berhasil dihapus");
        fetchUsers();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleEditClick = (user) => {
    setCurrentUser({ ...user, password: '' });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const payload = {
      nama: currentUser.nama,
      email: currentUser.email,
      no_telp: currentUser.no_telp,
      role: currentUser.role,
      id_divisi: currentUser.id_divisi,
      id_departemen: currentUser.id_departemen,
    };

    if (currentUser.password) payload.password = currentUser.password;

    try {
      // BAGIAN YANG BENAR
const res = await fetch(`http://localhost:5000/api/user/${currentUser.id_user}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal update");

      alert("Data berhasil diperbarui!");
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  // 1. LOGIKA FILTER
  const filteredUsers = users.filter((u) => {
    const search = searchTerm.toLowerCase();
    return (
      u.nama?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search) ||
      u.role?.toLowerCase().includes(search) ||
      u.no_telp?.includes(search) ||
      u.nama_departemen?.toLowerCase().includes(search) ||
      u.nama_divisi?.toLowerCase().includes(search)
    );
  });

  // 2. PAGINATION CALCULATIONS
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0, color: '#2c3e50' }}>👥 Manajemen Data User</h2>
          <span style={{ fontSize: '13px', color: '#7f8c8d' }}>
            Menampilkan {filteredUsers.length} dari {users.length} Total User
          </span>
        </div>

        <div style={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Cari nama, divisi, departemen..."
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div style={{ overflowX: 'auto' }}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>NO</th>
              <th style={styles.th}>ID USER</th>
              <th style={styles.th}>NAMA</th>
              <th style={styles.th}>USERNAME</th>
              <th style={styles.th}>NO. TELP</th>
              <th style={styles.th}>ROLE</th>
              <th style={styles.th}>DIVISI</th>
              <th style={styles.th}>DEPARTEMEN</th>
              <th style={styles.th}>AKSI</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '30px' }}>Memuat data...</td></tr>
            ) : currentUsers.length > 0 ? (
              currentUsers.map((u, index) => (
                <tr 
                  key={u.id_user} 
                  style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                >
                  <td style={styles.td}>{indexOfFirstItem + index + 1}</td>
                  <td style={styles.td}><strong>#{u.id_user}</strong></td>
                  <td style={styles.td}>{u.nama}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>{u.no_telp || '-'}</td>
                  <td style={styles.td}>
                    <span style={roleBadge(u.role)}>{u.role}</span>
                  </td>
                  <td style={styles.td}>{u.nama_divisi || '-'}</td>
                  <td style={styles.td}>{u.nama_departemen || '-'}</td>
                  <td style={styles.td}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEditClick(u)} style={styles.btnEdit}>✏️ Edit</button>
                      <button onClick={() => handleDelete(u.id_user, u.nama)} style={styles.btnDelete}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="9" style={{ textAlign: 'center', padding: '30px', color: '#7f8c8d' }}>User tidak ditemukan.</td></tr>
            )}
          </tbody>
        </table>
      </div>

    {/* --- MODAL EDIT --- */}
{isEditModalOpen && currentUser && (
  <div style={styles.modalOverlay}>
    <div style={styles.modalContent}>
      <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Edit Data User</h3>
      <form onSubmit={handleUpdate}>
        
        {/* Row 1: Nama */}
        <div style={{ marginBottom: '15px' }}>
          <label style={styles.label}>Nama Lengkap</label>
          <input 
            style={styles.input} 
            value={currentUser.nama || ''} 
            onChange={(e) => setCurrentUser({...currentUser, nama: e.target.value})}
          />
        </div>

        {/* Row 2: Username/Email */}
        <div style={{ marginBottom: '15px' }}>
          <label style={styles.label}>Username</label>
          <input 
            style={styles.input} 
            value={currentUser.email || ''} 
            onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
          />
        </div>

        {/* Row 3: No. Telp & Role (Grid) - Diberi Margin Bottom agar tidak nempel ke bawah */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={styles.label}>No. Telepon</label>
            <input 
              style={styles.input} 
              value={currentUser.no_telp || ''} 
              onChange={(e) => setCurrentUser({...currentUser, no_telp: e.target.value})}
            />
          </div>
          
          <div>
            <label style={styles.label}>Role</label>
            <select
              style={styles.input}
              value={currentUser.role || ''}
              onChange={(e) => setCurrentUser({...currentUser, role: e.target.value})}
            >
              <option value="">-- Pilih --</option>
              <option value="admin">Admin</option>
              <option value="approver">Approver</option>
              <option value="logistik">Logistik</option>
              <option value="operasional">Operasional</option>
              <option value="supporting">Supporting</option>
            </select>
          </div>
        </div>
              
        {/* Row 4: Divisi & Departemen (Grid) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={styles.label}>Divisi</label>
            <select
              style={styles.input}
              value={currentUser.id_divisi || ''}
              onChange={(e) => setCurrentUser({...currentUser, id_divisi: e.target.value})}
            >
              <option value="">-- Pilih --</option>
              {divisiOptions.map(d => (
                <option key={d.id_divisi} value={d.id_divisi}>{d.nama_divisi}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={styles.label}>Departemen</label>
            <select
              style={styles.input}
              value={currentUser.id_departemen || ''}
              onChange={(e) => setCurrentUser({...currentUser, id_departemen: e.target.value})}
            >
              <option value="">-- Pilih --</option>
              {deptOptions.map(d => (
                <option key={d.id_departemen} value={d.id_departemen}>{d.nama_departemen}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 5: Password */}
        <div style={{ marginBottom: '15px' }}>
          <label style={styles.label}>Password (Opsional)</label>
          <input 
            type="password"
            style={styles.input} 
            placeholder="Isi jika ingin ganti password"
            onChange={(e) => setCurrentUser({...currentUser, password: e.target.value})}
          />
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <button type="button" onClick={() => setIsEditModalOpen(false)} style={styles.btnCancel}>Batal</button>
          <button type="submit" style={styles.btnSave}>Update Data</button>
        </div>
      </form>
    </div>
  </div>
)}

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <div style={styles.paginationContainer}>
          <button 
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
            disabled={currentPage === 1}
            style={currentPage === 1 ? styles.pageBtnDisabled : styles.pageBtn}
          > Prev </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button 
              key={i + 1} 
              onClick={() => setCurrentPage(i + 1)}
              style={currentPage === i + 1 ? styles.pageBtnActive : styles.pageBtn}
            > {i + 1} </button>
          ))}

          <button 
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
            disabled={currentPage === totalPages}
            style={currentPage === totalPages ? styles.pageBtnDisabled : styles.pageBtn}
          > Next </button>
        </div>
      )}
    </div>
  );
};

// Helper function untuk Badge
const roleBadge = (role) => {
  const roleLower = role?.toLowerCase();
  const colors = {
    admin: '#e74c3c',
    approver: '#f39c12',
    logistik: '#27ae60',
    operasional: '#3498db'
  };
  
  return {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: colors[roleLower] || '#95a5a6',
    color: 'white',
    textTransform: 'uppercase'
  };
};

const styles = {
  container: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
  header: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  searchInput: { padding: '8px 12px', borderRadius: '6px', border: '1px solid #ddd', width: '250px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  headerRow: { backgroundColor: '#f8f9fa', textAlign: 'left' },
  th: { padding: '12px', borderBottom: '2px solid #eee', fontSize: '12px', color: '#7f8c8d' },
  td: { padding: '12px', borderBottom: '1px solid #eee', fontSize: '13px' },
  evenRow: { backgroundColor: '#fafafa' },
  oddRow: { backgroundColor: '#ffffff' },
  btnEdit: { padding: '5px 10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  btnDelete: { padding: '5px 10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: 'white', padding: '25px', borderRadius: '8px', width: '450px' },
  input: { width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '4px', border: '1px solid #ddd' },
  label: { display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 'bold' },
  btnSave: { padding: '8px 16px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  btnCancel: { padding: '8px 16px', backgroundColor: '#bdc3c7', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  paginationContainer: { display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '20px' },
  pageBtn: { padding: '5px 10px', border: '1px solid #ddd', cursor: 'pointer', borderRadius: '4px' },
  pageBtnActive: { padding: '5px 10px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '4px' },
  pageBtnDisabled: { padding: '5px 10px', color: '#ccc', cursor: 'not-allowed' }
};

export default UserList;