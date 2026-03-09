import React from "react";

function Dashboard({ user, setActiveMenu }) {

  const cardStyle = {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    cursor: "pointer",
    transition: "0.3s",
    textAlign: "center"
  };

  const containerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginTop: "30px"
  };

  return (
    <div>
      <h2>📊 Dashboard</h2>
      <p>Selamat datang, <b>{user.nama}</b> 👋</p>

      <div style={containerStyle}>

        {/* ADMIN ONLY */}
        {user.role === "admin" && (
          <>
            <div style={cardStyle} onClick={() => setActiveMenu("register")}>
              <h3>👤 Registrasi User</h3>
              <p>Tambah user baru</p>
            </div>

            <div style={cardStyle} onClick={() => setActiveMenu("data_user")}>
              <h3>👥 Data User</h3>
              <p>Kelola data user</p>
            </div>
          </>
        )}

        {/* SEMUA ROLE */}
        <div style={cardStyle} onClick={() => setActiveMenu("divisi")}>
          <h3>🏢 Data Departemen</h3>
          <p>Lihat data divisi</p>
        </div>

        <div style={cardStyle} onClick={() => setActiveMenu("barang")}>
          <h3>📦 Stok Barang</h3>
          <p>Data barang SAP</p>
        </div>

        {(user.role === "admin" || user.role === "operasional") && (
          <div style={cardStyle} onClick={() => setActiveMenu("request")}>
            <h3>📝 Form Ambil Barang</h3>
            <p>Buat permintaan barang</p>
          </div>
        )}

        <div style={cardStyle} onClick={() => setActiveMenu("laporan")}>
          <h3>📊 Data Permintaan</h3>
          <p>Lihat laporan permintaan</p>
        </div>

      </div>
    </div>
  );
}

export default Dashboard;