import React, { useState, useEffect } from 'react';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/user')
      .then(res => res.json())
      .then(data => {
        setUsers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal ambil data user:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={styles.container}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#2c3e50' }}>👥 Manajemen Data User</h2>
        <span style={{ fontSize: '14px', color: '#7f8c8d' }}>Total: {users.length} User</span>
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
              <th style={styles.th}>NAMA DIVISI</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Memuat data...</td></tr>
            ) : users.length > 0 ? (
              users.map((u, index) => (
                <tr 
                  key={u.id_user} 
                  style={index % 2 === 0 ? styles.evenRow : styles.oddRow}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f4f6'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? '#f9f9f9' : '#ffffff'}
                >
                  <td style={styles.td}>{index + 1}</td>
                  <td style={styles.td}><strong>#{u.id_user}</strong></td>
                  <td style={styles.td}>{u.nama}</td>
                  <td style={styles.td}>{u.email}</td>
                  <td style={styles.td}>
                    <span style={roleBadge(u.role)}>{u.role}</span>
                  </td>
                  <td style={styles.td}>{u.nama_divisi || <span style={{color: '#bdc3c7'}}>Tidak ada divisi</span>}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#7f8c8d' }}>Data user masih kosong.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Styling badge untuk Role dengan variasi warna
const roleBadge = (role) => {
  const roleLower = role?.toLowerCase();
  let bgColor = '#95a5a6'; // Default (Abu-abu)

  if (roleLower === 'admin') bgColor = '#e74c3c';      // Merah
  if (roleLower === 'manager') bgColor = '#f39c12';    // Oranye
  if (roleLower === 'logistik') bgColor = '#27ae60';   // Hijau
  if (roleLower === 'operasional') bgColor = '#3498db'; // Biru

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
  table: { width: '100%', borderCollapse: 'collapse' },
  headerRow: { backgroundColor: '#2c3e50', color: 'white', textAlign: 'left' },
  th: { padding: '15px', borderBottom: '2px solid #ddd', fontSize: '13px', letterSpacing: '0.5px' },
  td: { padding: '15px', borderBottom: '1px solid #eee', fontSize: '14px', color: '#34495e' },
  evenRow: { backgroundColor: '#f9f9f9', transition: '0.2s' },
  oddRow: { backgroundColor: '#ffffff', transition: '0.2s' }
};

export default UserList;