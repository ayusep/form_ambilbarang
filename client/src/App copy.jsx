import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Departemen from './components/Departemen';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [reportFilter, setReportFilter] = useState({ bulan: "", tahun: "" });

  // Auto close sidebar di layar kecil
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin logout?")) {
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  const menuStyle = (menuName) => ({
    padding: '12px 15px',
    cursor: 'pointer',
    backgroundColor: activeMenu === menuName ? '#3498db' : 'transparent',
    color: 'white',
    fontWeight: activeMenu === menuName ? 'bold' : 'normal',
    borderRadius: '4px',
    marginBottom: '5px',
    transition: '0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  });
  if (!user) return <Login onLoginSuccess={(userData) => { setUser(userData); localStorage.setItem("user", JSON.stringify(userData)); setActiveMenu("dashboard"); }} />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, Arial', backgroundColor: '#f4f7f6' }}>

      {/* SIDEBAR */}
      <div style={{
        width: isSidebarOpen ? '260px' : '0px',
        backgroundColor: '#2c3e50',
        color: 'white',
        position: window.innerWidth <= 768 ? 'fixed' : 'relative', // Overlay di HP
        zIndex: 1000,
        height: '100vh',
        transition: '0.3s',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '20px', minWidth: '260px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 onClick={() => setActiveMenu("dashboard")} style={{ fontSize: '18px', cursor: 'pointer', margin: 0 }}>FAB SYSTEM</h2>
            <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '20px' }}>✖</button>
          </div>
          <p style={{ fontSize: '10px', color: '#bdc3c7', marginBottom: '20px' }}>PT. Bahana Bhumiphala Persada</p>

          {/* USER INFO */}
          <div onClick={() => setActiveMenu("profile")} style={{ backgroundColor: '#34495e', padding: '12px', borderRadius: '8px', marginBottom: '20px', cursor: 'pointer' }}>
            <p style={{ margin: 0, fontSize: '14px' }}>👤 {user.nama}</p>
            <small style={{ color: '#3498db' }}>{user.role.toUpperCase()}</small>
          </div>

          <nav>
            {user.role === 'admin' && (
              <>
                <p style={{ fontSize: '10px', color: '#7f8c8d', marginBottom: '10px' }}>ADMIN</p>
                <div onClick={() => setActiveMenu("register")} style={menuStyle("register")}>👤 Registrasi</div>
                <div onClick={() => setActiveMenu("data_user")} style={menuStyle("data_user")}>👥 Data User</div>
              </>
            )}
            <p style={{ fontSize: '10px', color: '#7f8c8d', margin: '15px 0 10px 0' }}>MAIN MENU</p>
            <div onClick={() => setActiveMenu("departemen")} style={menuStyle("departemen")}>🏢 Departemen</div>
            <div onClick={() => setActiveMenu("barang")} style={menuStyle("barang")}>📦 Stok SAP</div>
            <div onClick={() => setActiveMenu("request")} style={menuStyle("request")}>📝 Form FAB</div>
            <div onClick={() => setActiveMenu("laporan")} style={menuStyle("laporan")}>📊 Laporan</div>

            <button onClick={handleLogout} style={{ width: '100%', padding: '10px', marginTop: '20px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Logout</button>
          </nav>
        </div>
      </div>

      {/* HEADER & KONTEN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        {/* TOPBAR */}
        <div style={{ backgroundColor: '#2c3e50', color: 'white', padding: '15px 20px', display: 'flex', alignItems: 'center', gap: '15px' }}>
          {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '20px', cursor: 'pointer' }}>☰</button>}
          <h3 style={{ margin: 0, fontSize: '16px' }}>Dashboard Control Panel</h3>
        </div>

        {/* KONTEN UTAMA */}
        {/* MAIN CONTENT AREA */}
        <div style={{ flex: 1, padding: window.innerWidth <= 768 ? '20px' : '30px', overflowY: 'auto' }}>
          {activeMenu === "dashboard" && <Dashboard user={user} setActiveMenu={setActiveMenu} />}

          {activeMenu === "profile" && <Profile user={user} />}
          {activeMenu === "register" && user.role === 'admin' && <Register />}
          {activeMenu === "data_user" && user.role === 'admin' && <UserList />}
          {activeMenu === "departemen" && <Departemen />}
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
                  user={user.role === 'admin' ? { ...user, id_departemen: '' } : user}
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