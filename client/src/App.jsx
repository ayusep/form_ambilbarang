import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Divisi from './components/Divisi';
import Barang from './components/Barang';
import CreateRequest from './components/CreateRequest';
import DataRequest from './components/DataRequest';
import FilterLaporan from './components/FilterLaporan';
import Register from './components/Register'; 
import Profile from './components/Profile';
import Login from './components/Login';
import UserList from './components/UserList';

function App() {
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State untuk Hide/Show Sidebar
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
      setActiveMenu("dashboard");
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
    transition: '0.3s',
    whiteSpace: 'nowrap',
    overflow: 'hidden'
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial', backgroundColor: '#f4f7f6', position: 'relative' }}>
      
      {/* TOMBOL TOGGLE (Hanya muncul kalau sidebar tertutup) */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          style={{ position: 'absolute', left: '10px', top: '10px', zIndex: 100, padding: '10px', backgroundColor: '#2c3e50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          ☰ Menu
        </button>
      )}

      {/* SIDEBAR */}
      <div style={{ 
        width: isSidebarOpen ? '260px' : '0px', 
        backgroundColor: '#2c3e50', 
        color: 'white', 
        padding: isSidebarOpen ? '20px' : '0px', 
        display: 'flex', 
        flexDirection: 'column', 
        boxShadow: isSidebarOpen ? '2px 0 5px rgba(0,0,0,0.1)' : 'none',
        transition: '0.3s',
        overflow: 'hidden',
        position: 'relative'
      }}>
        
        {/* Tombol Close Sidebar */}
        <div style={{ textAlign: 'right', marginBottom: '10px' }}>
          <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', color: '#7f8c8d', cursor: 'pointer', fontSize: '18px' }}>✖</button>
        </div>

<h2 
  onClick={() => setActiveMenu("dashboard")}
  style={{ 
    marginBottom: '5px',
    color: '#ecf0f1',
    fontSize: '18px',
    cursor: 'pointer'
  }}
>
  Form Ambil Barang (FAB)
</h2>
        <p style={{ fontSize: '11px', color: '#bdc3c7', marginBottom: '20px' }}>SAP Integrated System</p>
        
        {/* INFO USER & DIVISI */}
<div 
  onClick={() => setActiveMenu("profile")} 
  style={{ 
    backgroundColor: '#34495e',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '25px',
    cursor: 'pointer',
    border: activeMenu === "profile" ? '1px solid #3498db' : '1px solid transparent'
  }}
>
  <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
    👤 {user.nama}
  </p>

  <div style={{ marginTop: '8px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
    <span style={{
      fontSize: '10px',
      backgroundColor: '#3498db',
      color: 'white',
      padding: '3px 8px',
      borderRadius: '10px'
    }}>
      {user.role}
    </span>

    <span style={{
      fontSize: '10px',
      backgroundColor: '#16a085',
      color: 'white',
      padding: '3px 8px',
      borderRadius: '10px'
    }}>
      {user.nama_divisi || "Internal"}
    </span>
  </div>
</div>

<nav style={{ flex: 1 }}>

  {/* ================= ADMIN ONLY ================= */}
  {user.role === 'admin' && (
    <>
      <p style={{ fontSize: '10px', color: '#7f8c8d', fontWeight: 'bold', marginLeft: '12px', marginBottom: '10px' }}>
        ADMIN MENU
      </p>

      <div onClick={() => setActiveMenu("register")} style={menuStyle("register")}>
        👤 Registrasi User
      </div>

      <div onClick={() => setActiveMenu("data_user")} style={menuStyle("data_user")}>
        👥 Data User
      </div>
    </>
  )}

  {/* ================= SEMUA ROLE ================= */}
  <p style={{ fontSize: '10px', color: '#7f8c8d', fontWeight: 'bold', marginLeft: '12px', marginBottom: '10px' }}>
    MASTER DATA
  </p>

  <div onClick={() => setActiveMenu("divisi")} style={menuStyle("divisi")}>
    🏢 Data Departemen
  </div>

  <div onClick={() => setActiveMenu("barang")} style={menuStyle("barang")}>
    📦 Stok Barang (SAP)
  </div>

  <div style={{ margin: '15px 0', borderTop: '1px solid #34495e' }}></div>

  {/* ================= TRANSAKSI ================= */}
  <p style={{ fontSize: '10px', color: '#7f8c8d', fontWeight: 'bold', marginLeft: '12px', marginBottom: '10px' }}>
    TRANSAKSI
  </p>

  {/* FAB hanya admin & operasional */}
  {(user.role === 'admin' || user.role === 'operasional') && (
    <div onClick={() => setActiveMenu("request")} style={menuStyle("request")}>
      📝 Form Ambil Barang (FAB)
    </div>
  )}

  {/* Semua role */}
  <div onClick={() => {
    setReportFilter({ bulan: "", tahun: "" });
    setActiveMenu("laporan");
  }} style={menuStyle("laporan")}>
    📊 Data Permintaan Barang
  </div>

  {/* LOGOUT tepat di bawah laporan */}
  <button
    onClick={handleLogout}
    style={{
      marginTop: '20px',
      padding: '12px',
      backgroundColor: '#e74c3c',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: 'bold',
      width: '100%'
    }}
  >
    🚪 LOGOUT
  </button>

</nav>

       
      </div>

      {/* KONTEN UTAMA */}
      <div style={{ flex: 1, padding: '40px', overflowY: 'auto', transition: '0.3s' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
           {activeMenu === "dashboard" && 
  <Dashboard user={user} setActiveMenu={setActiveMenu} />
}
{activeMenu === "profile" && <Profile user={user} />}
{activeMenu === "register" && user.role === 'admin' && <Register />}
{activeMenu === "data_user" && user.role === 'admin' && <UserList />}
{activeMenu === "divisi" && <Divisi />}
{activeMenu === "barang" && <Barang />}
{activeMenu === "request" && (user.role === 'admin' || user.role === 'operasional') && <CreateRequest user={user} />}

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
                   user={user.role === 'admin' ? { ...user, id_divisi: '' } : user} 
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