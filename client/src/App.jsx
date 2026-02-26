import { useState, useEffect } from 'react';
import Divisi from './components/Divisi';
import Barang from './components/Barang';
import CreateRequest from './components/CreateRequest';
import DataRequest from './components/DataRequest'; // Komponen hasil tabel
import FilterLaporan from './components/FilterLaporan'; // Komponen input bulan/tahun
import Register from './components/Register'; 
import Profile from './components/Profile';
import Login from './components/Login';
import UserList from './components/UserList';

function App() {
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState("request");
  
  // State tambahan untuk menyimpan filter laporan
  const [reportFilter, setReportFilter] = useState({ bulan: "", tahun: "" });

  useEffect(() => {
    const loggedInUser = localStorage.getItem("user");
    if (loggedInUser) {
      const parsedUser = JSON.parse(loggedInUser);
      setUser(parsedUser);
      if (parsedUser.role !== 'admin' && (activeMenu === 'divisi' || activeMenu === 'barang' || activeMenu === 'register')) {
        setActiveMenu("request");
      }
    }
  }, []);

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin logout?")) {
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  if (!user) {
    return <Login onLoginSuccess={(userData) => {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setActiveMenu(userData.role === 'admin' ? "divisi" : "request");
    }} />;
  }

  const menuStyle = (menuName) => ({
    padding: '12px',
    cursor: 'pointer',
    backgroundColor: activeMenu === menuName ? '#34495e' : 'transparent',
    color: activeMenu === menuName ? '#3498db' : 'white',
    fontWeight: activeMenu === menuName ? 'bold' : 'normal',
    borderRadius: '4px',
    marginBottom: '5px',
    transition: '0.3s'
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial', backgroundColor: '#f4f7f6' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '260px', backgroundColor: '#2c3e50', color: 'white', padding: '20px', display: 'flex', flexDirection: 'column', boxShadow: '2px 0 5px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginBottom: '5px', color: '#ecf0f1' }}>FAB SYSTEM</h2>
        <p style={{ fontSize: '12px', color: '#bdc3c7', marginBottom: '20px' }}>SAP Integrated System</p>
        
        <div onClick={() => setActiveMenu("profile")} style={{ backgroundColor: '#34495e', padding: '15px', borderRadius: '8px', marginBottom: '25px', cursor: 'pointer', border: activeMenu === "profile" ? '1px solid #3498db' : '1px solid transparent' }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>👤 {user.nama}</p>
          <p style={{ margin: '5px 0 0 0', fontSize: '11px', color: '#3498db' }}>{user.role}</p>
        </div>

        <nav style={{ flex: 1 }}>
          {user.role === 'admin' && (
            <>
              <p style={{ fontSize: '11px', color: '#7f8c8d', fontWeight: 'bold', marginLeft: '12px', marginBottom: '10px' }}>ADMIN MENU</p>
              <div onClick={() => setActiveMenu("register")} style={menuStyle("register")}>👤 Registrasi User</div>
              <div onClick={() => setActiveMenu("data_user")} style={menuStyle("data_user")}>👥 Data User</div>
              <div onClick={() => setActiveMenu("divisi")} style={menuStyle("divisi")}>🏢 Manajemen Divisi</div>
              <div onClick={() => setActiveMenu("barang")} style={menuStyle("barang")}>📦 Stok Barang (SAP)</div>
              <div style={{ margin: '15px 0', borderTop: '1px solid #34495e' }}></div>
            </>
          )}

          <p style={{ fontSize: '11px', color: '#7f8c8d', fontWeight: 'bold', marginLeft: '12px', marginBottom: '10px' }}>TRANSAKSI</p>
          <div onClick={() => setActiveMenu("request")} style={menuStyle("request")}>📝 Form Ambil Barang (FAB)</div>
          
          {/* MENU LAPORAN BARU */}
          <div onClick={() => {
            setReportFilter({ bulan: "", tahun: "" }); // Reset filter saat klik menu
            setActiveMenu("laporan");
          }} style={menuStyle("laporan")}>📊 Laporan Per Divisi</div>
        </nav>

        <button onClick={handleLogout} style={{ marginTop: 'auto', padding: '12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          🚪 LOGOUT
        </button>
      </div>

      {/* KONTEN UTAMA */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
           {activeMenu === "profile" && <Profile user={user} />}
           {activeMenu === "register" && user.role === 'admin' && <Register />}
           {activeMenu === "divisi" && user.role === 'admin' && <Divisi />}
           {activeMenu === "barang" && user.role === 'admin' && <Barang />}
           {activeMenu === "request" && <CreateRequest user={user} />}
           {activeMenu === "data_user" && user.role === 'admin' && <UserList />}

           {/* LOGIKA LAPORAN: Tampilkan Filter dulu, lalu Tabel */}
           {activeMenu === "laporan" && (
             reportFilter.bulan === "" ? (
               <FilterLaporan 
                 user={user} 
                 onFilterSubmit={(data) => setReportFilter(data)} 
               />
             ) : (
               <div style={{ position: 'relative' }}>
                 <button 
                   onClick={() => setReportFilter({ bulan: "", tahun: "" })}
                   style={{ marginBottom: '10px', padding: '8px 15px', cursor: 'pointer' }}
                 >
                   ← Kembali ke Filter
                 </button>
                 <DataRequest 
                   user={user} 
                   filter={reportFilter} 
                 />
               </div>
             )
           )}
        </div>
      </div>
    </div>
  );
}

export default App;