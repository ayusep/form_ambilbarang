import React, { useState, useEffect } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    nama: '', 
    email: '', 
    password: '', 
    no_telp: '', 
    role: 'operasional', 
    id_divisi: ''
  });
  const [divisiList, setDivisiList] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/divisi')
      .then(res => res.json())
      .then(data => setDivisiList(data))
      .catch(err => console.error("Gagal load divisi:", err));
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!formData.id_divisi) {
      alert("Silakan pilih divisi terlebih dahulu!");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert("✅ " + result.message);
        // Reset form setelah berhasil
        setFormData({
          nama: '', email: '', password: '', no_telp: '',
          role: 'operasional', id_divisi: ''
        });
      } else {
        alert("❌ Gagal: " + result.message);
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi ke server.");
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleRegister} style={styles.card}>
        <h2 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '10px' }}>📝 Sign Up User Baru</h2>
        
        <input type="text" placeholder="Nama Lengkap" required style={styles.input}
          value={formData.nama}
          onChange={(e) => setFormData({...formData, nama: e.target.value})} />
        
        <input type="email" placeholder="Email" required style={styles.input}
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})} />
        
        <input type="password" placeholder="Password" required style={styles.input}
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})} />

        <input type="text" placeholder="Nomor Telepon" required style={styles.input}
          value={formData.no_telp}
          onChange={(e) => setFormData({...formData, no_telp: e.target.value})} />

        <div style={styles.labelGroup}>
          <label style={styles.label}>Role User:</label>
          <select 
            style={styles.input} 
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
          >
            <option value="operasional">Operasional</option>
            <option value="manager">Manager</option>
            <option value="logistik">Logistik</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div style={styles.labelGroup}>
          <label style={styles.label}>Divisi:</label>
          <select 
            style={styles.input} 
            required 
            value={formData.id_divisi}
            onChange={(e) => setFormData({...formData, id_divisi: e.target.value})}
          >
            <option value="">-- Pilih Divisi --</option>
            {divisiList.map(div => (
              <option key={div.id_divisi} value={div.id_divisi}>{div.nama_divisi}</option>
            ))}
          </select>
        </div>

        <button type="submit" style={styles.button}>Daftar Sekarang</button>
      </form>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#f4f7f6', padding: '20px' },
  card: { padding: '30px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', width: '380px', display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' },
  labelGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d' },
  button: { padding: '14px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }
};

export default Register;