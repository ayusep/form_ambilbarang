import { useState, useEffect } from 'react';
import Divisi from './components/Divisi';
import Barang from './components/Barang';
import CreateRequest from './components/CreateRequest';
import DataRequest from './components/DataRequest';
import Login from './components/Login'; // Pastikan kamu sudah buat file Login.jsx

function App() {
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState("request"); // Default ke FAB agar operasional langsung bisa kerja

  // 1. Cek apakah user sudah login sebelumnya saat aplikasi dibuka
  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      // Jika operasional login, jangan arahkan ke menu divisi (karena dia tidak punya akses)
      if (parsedUser.role !== 'admin') {
        setActiveMenu("request");
      } else {
        setActiveMenu("divisi");
      }
    }
  }, []);

  // 2. Fungsi Logout
  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  // Jika belum login, tampilkan hanya halaman Login
  if (!user) {
    return <Login onLoginSuccess={(userData) => setUser(userData)} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '250px', backgroundColor: '#2c3e50', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ marginBottom: '5px' }}>Inventory App</h2>
        <p style={{ fontSize: '12px', color: '#bdc3c7', marginBottom: '10px' }}>SAP Integrated System</p>
        
        {/* Info User yang sedang Login */}
        <div style={{ backgroundColor: '#34495e', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>👤 {user.nama}</p>
          <p style={{ margin: 0, fontSize: '11px', color: '#3498db', textTransform: 'uppercase' }}>Role: {user.role}</p>
        </div>

        <hr style={{ borderColor: '#34495e', width: '100%' }} />
        
        <nav style={{ marginTop: '20px', flex: 1 }}>
          {/* MENU KHUSUS ADMIN */}
          {user.role === 'admin' && (
            <>
              <div 
                onClick={() => setActiveMenu("divisi")} 
                style={{ padding: '12px', cursor: 'pointer', color: activeMenu === "divisi" ? '#3498db' : 'white', fontWeight: activeMenu === "divisi" ? 'bold' : 'normal' }}>
                🏢 Manajemen Divisi
              </div>
              
              <div 
                onClick={() => setActiveMenu("barang")} 
                style={{ padding: '12px', cursor: 'pointer', color: activeMenu === "barang" ? '#3498db' : 'white', fontWeight: activeMenu === "barang" ? 'bold' : 'normal' }}>
                📦 Stok Barang (SAP)
              </div>
            </>
          )}

          {/* MENU YANG BISA DIAKSES SEMUA ROLE (ADMIN & OPERASIONAL) */}
          <div 
            onClick={() => setActiveMenu("request")} 
            style={{ padding: '12px', cursor: 'pointer', color: activeMenu === "request" ? '#3498db' : 'white', fontWeight: activeMenu === "request" ? 'bold' : 'normal' }}>
            📝 Form Ambil Barang (FAB)
          </div>
          
          <div 
            onClick={() => setActiveMenu("data_request")} 
            style={{ padding: '12px', cursor: 'pointer', color: activeMenu === "data_request" ? '#3498db' : 'white', fontWeight: activeMenu === "data_request" ? 'bold' : 'normal' }}>
            📊 Data Request Barang
          </div>
<button 
      onClick={handleLogout}
      style={{ 
        width: '100%', // Agar lebar tombol penuh mengikuti menu di atasnya
        padding: '12px', 
        backgroundColor: '#e74c3c', 
        color: 'white', 
        border: 'none', 
        borderRadius: '4px', 
        cursor: 'pointer', 
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        marginTop: '10px' 
      }}>
      🚪 Logout
    </button>
          
        </nav>

      </div>

      {/* KONTEN UTAMA */}
      <div style={{ flex: 1, padding: '40px', backgroundColor: '#f4f7f6' }}>
        
        {/* Logic Hak Akses Konten (Security Level 2) */}
        {activeMenu === "divisi" && user.role === 'admin' && <Divisi />}
        
        {activeMenu === "barang" && user.role === 'admin' && <Barang />}

        {activeMenu === "request" && <CreateRequest user={user} />}

        {activeMenu === "data_request" && <DataRequest user={user} />}

        {activeMenu === "dashboard" && <h1>Selamat Datang di Dashboard</h1>}
      </div>
    </div>
  );
}

export default App;