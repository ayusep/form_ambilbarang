import React, { useState, useEffect } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    nama: '', 
    email: '', // Tetap biarkan nama field-nya 'email' agar sinkron dengan database
    password: '', 
    no_telp: '', 
    role: 'operasional', 
    id_divisi: '' 
  });
  
  const [divisiList, setDivisiList] = useState([]); 
  const [showPassword, setShowPassword] = useState(false);

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

    const selectedDivisi = divisiList.find(d => d.id_divisi === parseInt(formData.id_divisi));
    const dataToSend = {
      ...formData,
      id_departemen: selectedDivisi ? selectedDivisi.id_departemen : null
    };

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        alert("✅ " + result.message);
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
        
        {/* --- PERUBAHAN DI SINI --- */}
        <input 
          type="text" // Diubah dari 'email' ke 'text'
          placeholder="Username" // Diubah dari 'Email' ke 'Username'
          required 
          style={styles.input}
          value={formData.email} // Tetap menggunakan formData.email
          onChange={(e) => setFormData({...formData, email: e.target.value})} 
        />
        {/* ------------------------- */}
        
        <div style={styles.passwordWrapper}>
          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="Password" 
            required 
            style={{...styles.input, width: '100%'}}
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
          />
          <span onClick={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            {showPassword ? "👁️‍🗨️" : "👁️"} 
          </span>
        </div>

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
            <option value="supporting">Supporting</option>
            <option value="approver">Approver</option>
            <option value="logistik">Logistik</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div style={styles.labelGroup}>
          <label style={styles.label}>Divisi Kerja:</label>
          <select 
            style={styles.input} 
            required 
            value={formData.id_divisi}
            onChange={(e) => setFormData({...formData, id_divisi: e.target.value})}
          >
            <option value="">-- Pilih Divisi --</option>
            {divisiList.map(v => (
              <option key={v.id_divisi} value={v.id_divisi}>
                {v.nama_divisi}
              </option>
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
  input: { padding: '12px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', boxSizing: 'border-box' },
  passwordWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  eyeIcon: { position: 'absolute', right: '12px', cursor: 'pointer', fontSize: '18px', userSelect: 'none' },
  labelGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '12px', fontWeight: 'bold', color: '#7f8c8d' },
  button: { padding: '14px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }
};

export default Register;