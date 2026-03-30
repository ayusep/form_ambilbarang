import React, { useState, useEffect } from 'react';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // --- LOGIKA PAGINATION ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetch('http://localhost:5000/api/user')
      .then(res => res.json())
      .then(data => {
        setUsers(data.sort((a, b) => b.id_user - a.id_user));
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal ambil data user:", err);
        setLoading(false);
      });
  }, []);

  // 1. LOGIKA FILTER (Search Data) - Ditambah pengecekan nama_divisi
  const filteredUsers = users.filter((u) => {
    const search = searchTerm.toLowerCase();
    return (
      u.nama?.toLowerCase().includes(search) ||
      u.email?.toLowerCase().includes(search) ||
      u.role?.toLowerCase().includes(search) ||
      u.nama_departemen?.toLowerCase().includes(search) ||
      u.nama_divisi?.toLowerCase().includes(search) // <-- Tambahan filter divisi
    );
  });

  // 2. PERHITUNGAN DATA UNTUK PAGINATION
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
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
              <th style={styles.th}>EMAIL</th>
              <th style={styles.th}>ROLE</th>
              <th style={styles.th}>DIVISI</th> {/* <-- Header Baru */}
              <th style={styles.th}>DEPARTEMEN</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Memuat data...</td></tr>
            ) : currentUsers.length > 0 ? (
              currentUsers.map((u, index) => (
                <tr 
                  key={u.id_user} 
                  style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f4f6'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : '#ffffff'}
                >
                  <td style={styles.td}>{indexOfFirstItem + index + 1}</td>
                  <td style={styles.td}><strong>#{u.id_user}</strong></td>
                  <td style={styles.td}>{u.nama}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>
                    <span style={roleBadge(u.role)}>{u.role}</span>
                  </td>
                  {/* Kolom Divisi Baru */}
                  <td style={styles.td}>
                    {u.nama_divisi || <span style={{color: '#bdc3c7'}}>Tanpa Divisi</span>}
                  </td>
                  <td style={styles.td}>
                    {u.nama_departemen || <span style={{color: '#bdc3c7'}}>Tanpa Departemen</span>}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: '#7f8c8d' }}>User tidak ditemukan.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* --- UI PAGINATION --- */}
      {!loading && filteredUsers.length > itemsPerPage && (
        <div style={styles.paginationContainer}>
          <button 
            onClick={() => paginate(currentPage - 1)} 
            disabled={currentPage === 1}
            style={currentPage === 1 ? styles.pageBtnDisabled : styles.pageBtn}
          >
            Prev
          </button>
          
          {[...Array(totalPages)].map((_, i) => (
            <button 
              key={i + 1} 
              onClick={() => paginate(i + 1)}
              style={currentPage === i + 1 ? styles.pageBtnActive : styles.pageBtn}
            >
              {i + 1}
            </button>
          ))}

          <button 
            onClick={() => paginate(currentPage + 1)} 
            disabled={currentPage === totalPages}
            style={currentPage === totalPages ? styles.pageBtnDisabled : styles.pageBtn}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

// Styling badge untuk Role (Tetap sama)
const roleBadge = (role) => {
  const roleLower = role?.toLowerCase();
  let bgColor = '#95a5a6';
  if (roleLower === 'admin') bgColor = '#e74c3c';
  if (roleLower === 'manager') bgColor = '#f39c12';
  if (roleLower === 'logistik') bgColor = '#27ae60';
  if (roleLower === 'operasional') bgColor = '#3498db';

  return {
    padding: '5px 12px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    backgroundColor: bgColor,
    color: 'white',
    display: 'inline-block',
    minWidth: '80px',
    textAlign: 'center'
  };
};

const styles = {
  container: { backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' },
  searchWrapper: { position: 'relative' },
  searchInput: { padding: '10px 15px', borderRadius: '8px', border: '1px solid #dfe6e9', width: '300px', fontSize: '14px', outline: 'none', transition: '0.3s' },
  table: { width: '100%', borderCollapse: 'collapse' },
  headerRow: { backgroundColor: '#2c3e50', color: 'white', textAlign: 'left' },
  th: { padding: '15px', borderBottom: '2px solid #ddd', fontSize: '13px', letterSpacing: '0.5px' },
  td: { padding: '15px', borderBottom: '1px solid #eee', fontSize: '14px', color: '#34495e' },
  evenRow: { backgroundColor: '#f9f9f9', transition: '0.2s' },
  oddRow: { backgroundColor: '#ffffff', transition: '0.2s' },
  paginationContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '25px', gap: '5px' },
  pageBtn: { padding: '8px 12px', border: '1px solid #ddd', backgroundColor: '#fff', cursor: 'pointer', borderRadius: '4px', fontSize: '13px', transition: '0.3s' },
  pageBtnActive: { padding: '8px 12px', border: '1px solid #2c3e50', backgroundColor: '#2c3e50', color: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  pageBtnDisabled: { padding: '8px 12px', border: '1px solid #eee', backgroundColor: '#f9f9f9', color: '#ccc', cursor: 'not-allowed', borderRadius: '4px', fontSize: '13px' }
};

export default UserList;