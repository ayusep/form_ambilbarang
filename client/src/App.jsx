import { useState } from 'react';
import Divisi from './components/Divisi';
import Barang from './components/Barang';
import CreateRequest from './components/CreateRequest';
import DataRequest from './components/DataRequest';

function App() {
  const [activeMenu, setActiveMenu] = useState("divisi");

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Arial' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '250px', backgroundColor: '#2c3e50', color: 'white', padding: '20px' }}>
        <h2 style={{ marginBottom: '5px' }}>Inventory App</h2>
        <p style={{ fontSize: '12px', color: '#bdc3c7', marginBottom: '20px' }}>SAP Integrated System</p>
        <hr style={{ borderColor: '#34495e' }} />
        
        <nav style={{ marginTop: '20px' }}>
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
        </nav>
      </div>

      {/* KONTEN UTAMA */}
      <div style={{ flex: 1, padding: '40px', backgroundColor: '#f4f7f6' }}>
        
        {activeMenu === "divisi" && <Divisi />}
        
        {activeMenu === "barang" && <Barang />}

        {activeMenu === "request" && <CreateRequest />}

        {activeMenu === "data_request" && <DataRequest />}

        {activeMenu === "dashboard" && <h1>Selamat Datang di Dashboard</h1>}
      </div>
    </div>
  );
}

export default App;