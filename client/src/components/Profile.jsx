import React, { useState, useEffect } from 'react';

const Profile = ({ user }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id_user) return;
      
      try {
        const response = await fetch(`http://localhost:5000/api/user/profile/${user.id_user}`);
        const data = await response.json();
        
        if (response.ok) {
          setProfileData(data);
        } else {
          console.error(data.message);
        }
      } catch (err) {
        console.error("Gagal ambil data profil:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) return <div style={pStyles.container}>Loading profil...</div>;
  if (!profileData) return <div style={pStyles.container}>Data profil tidak ditemukan.</div>;

  return (
    <div style={pStyles.container}>
      <div style={pStyles.card}>
        <div style={pStyles.avatar}>
          {profileData.nama.charAt(0).toUpperCase()}
        </div>
        <h2 style={pStyles.userName}>{profileData.nama}</h2>
        <p style={pStyles.roleTag}>{profileData.role}</p>
        
        <hr style={pStyles.divider} />
        
        <div style={pStyles.infoBox}>
          <div style={pStyles.infoItem}>
            <span style={pStyles.label}>📧 Email</span>
            <span style={pStyles.value}>{profileData.email}</span>
          </div>
          <div style={pStyles.infoItem}>
            <span style={pStyles.label}>🏢 Divisi</span>
            <span style={pStyles.value}>{profileData.nama_divisi || 'Tidak Ada Divisi'}</span>
          </div>
          <div style={pStyles.infoItem}>
            <span style={pStyles.label}>🆔 User ID</span>
            <span style={pStyles.value}>#{profileData.id_user}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const pStyles = {
  container: { padding: '40px', display: 'flex', justifyContent: 'center' },
  card: { 
    backgroundColor: 'white', padding: '30px', borderRadius: '15px', 
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '400px', textAlign: 'center' 
  },
  avatar: { 
    width: '80px', height: '80px', backgroundColor: '#3498db', color: 'white', 
    fontSize: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', 
    justifyContent: 'center', margin: '0 auto 15px', fontWeight: 'bold' 
  },
  userName: { margin: '0', color: '#2c3e50' },
  roleTag: { 
    display: 'inline-block', padding: '5px 15px', backgroundColor: '#ecf0f1', 
    borderRadius: '20px', fontSize: '14px', color: '#7f8c8d', marginTop: '5px' 
  },
  divider: { margin: '20px 0', border: 'none', borderTop: '1px solid #eee' },
  infoBox: { textAlign: 'left' },
  infoItem: { marginBottom: '15px', display: 'flex', flexDirection: 'column' },
  label: { fontSize: '12px', color: '#bdc3c7', fontWeight: 'bold', textTransform: 'uppercase' },
  value: { fontSize: '16px', color: '#34495e', marginTop: '3px' }
};

export default Profile;