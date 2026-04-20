import React, { useState, useEffect } from 'react';

const Profile = ({ user }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // State untuk toggle password
  const [formData, setFormData] = useState({ nama: '', email: '', password: '' });
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id_user) return;
      try {
        const response = await fetch(`http://localhost:5000/api/user/profile/${user.id_user}`);
        const data = await response.json();
        if (response.ok) {
          setProfileData(data);
          // Reset form dan kosongkan field password saat load awal
          setFormData({ nama: data.nama, email: data.email, password: '' }); 
        }
      } catch (err) {
        console.error("Gagal ambil data profil:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/user/update/${user.id_user}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setProfileData({ ...profileData, nama: formData.nama, email: formData.email });
        setFormData({ ...formData, password: '' }); // Kosongkan password lagi setelah simpan
        setIsEditing(false);
        setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
      } else {
        setMessage({ type: 'error', text: 'Gagal memperbarui profil.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Terjadi kesalahan jaringan.' });
    }
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  if (loading) return <div style={pStyles.container}>Loading profil...</div>;
  if (!profileData) return <div style={pStyles.container}>Data profil tidak ditemukan.</div>;

  return (
    <div style={pStyles.container}>
      <div style={pStyles.card}>
        <div style={pStyles.avatar}>
          {profileData.nama.charAt(0).toUpperCase()}
        </div>

        {message.text && (
          <div style={{ ...pStyles.alert, backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da' }}>
            {message.text}
          </div>
        )}

        {!isEditing ? (
          /* --- TAMPILAN DETAIL --- */
          <>
            <h2 style={pStyles.userName}>{profileData.nama}</h2>
            <p style={pStyles.roleTag}>{profileData.role}</p>
            <hr style={pStyles.divider} />
            <div style={pStyles.infoBox}>
              <div style={pStyles.infoItem}>
                <span style={pStyles.label}>📧 Username</span>
                <span style={pStyles.value}>{profileData.email}</span>
              </div>
              <div style={pStyles.infoItem}>
                <span style={pStyles.label}>🏢 Departemen</span>
                <span style={pStyles.value}>{profileData.nama_departemen || 'N/A'}</span>
              </div>
              <div style={pStyles.infoItem}>
                <span style={pStyles.label}>📂 Divisi</span>
                <span style={pStyles.value}>{profileData.nama_divisi || 'N/A'}</span>
              </div>
            </div>
            <button onClick={() => setIsEditing(true)} style={pStyles.editBtn}>Edit Profil</button>
          </>
        ) : (
          /* --- TAMPILAN FORM EDIT --- */
          <form onSubmit={handleSubmit} style={pStyles.infoBox}>
            <div style={pStyles.infoItem}>
              <label style={pStyles.label}>Nama Lengkap</label>
              <input 
                name="nama"
                style={pStyles.input} 
                value={formData.nama} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div style={pStyles.infoItem}>
              <label style={pStyles.label}>Email</label>
              <input 
                name="email"
                type="email"
                style={pStyles.input} 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>
            
            {/* --- INPUT PASSWORD BARU --- */}
            <div style={pStyles.infoItem}>
              <label style={pStyles.label}>Password Baru (Kosongkan jika tidak ganti)</label>
              <div style={pStyles.passwordWrapper}>
                <input 
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  style={{...pStyles.input, width: '100%'}} 
                  value={formData.password} 
                  onChange={handleChange} 
                  placeholder="Masukkan password baru"
                />
                <span onClick={() => setShowPassword(!showPassword)} style={pStyles.eyeIcon}>
                  {showPassword ? "👁️‍🗨️" : "👁️"} 
                </span>
              </div>
            </div>

            <div style={pStyles.btnGroup}>
              <button type="submit" style={pStyles.saveBtn}>Simpan</button>
              <button type="button" onClick={() => setIsEditing(false)} style={pStyles.cancelBtn}>Batal</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const pStyles = {
  container: { padding: '40px', display: 'flex', justifyContent: 'center', fontFamily: 'Arial, sans-serif' },
  card: { backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '400px', textAlign: 'center' },
  avatar: { width: '80px', height: '80px', backgroundColor: '#3498db', color: 'white', fontSize: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', fontWeight: 'bold' },
  userName: { margin: '0', color: '#2c3e50' },
  roleTag: { display: 'inline-block', padding: '5px 15px', backgroundColor: '#ecf0f1', borderRadius: '20px', fontSize: '14px', color: '#7f8c8d', marginTop: '5px' },
  divider: { margin: '20px 0', border: 'none', borderTop: '1px solid #eee' },
  infoBox: { textAlign: 'left' },
  infoItem: { marginBottom: '15px', display: 'flex', flexDirection: 'column' },
  label: { fontSize: '12px', color: '#bdc3c7', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '5px' },
  value: { fontSize: '16px', color: '#34495e' },
  input: { padding: '10px', borderRadius: '5px', border: '1px solid #ddd', fontSize: '14px', boxSizing: 'border-box' },
  
  // Style Password & Eye Icon
  passwordWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  eyeIcon: { position: 'absolute', right: '10px', cursor: 'pointer', fontSize: '18px', userSelect: 'none' },
  
  editBtn: { width: '100%', padding: '10px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', marginTop: '10px' },
  saveBtn: { flex: 1, padding: '10px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  cancelBtn: { flex: 1, padding: '10px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' },
  btnGroup: { display: 'flex', gap: '10px', marginTop: '10px' },
  alert: { padding: '10px', borderRadius: '5px', marginBottom: '15px', fontSize: '14px' }
};

export default Profile;