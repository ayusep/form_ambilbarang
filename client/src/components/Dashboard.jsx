import React from "react";

function Dashboard({ user, setActiveMenu }) {

  // --- STYLE RESPONSIVE ---
  const containerStyle = {
    display: "grid",
    // repeat(auto-fill, ...) membuat card berjajar ke kanan selama masih ada ruang
    // minmax(160px, 1fr) memastikan card tidak lebih kecil dari 160px di HP
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: "15px",
    marginTop: "20px",
    width: "100%"
  };

  const cardStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // Pusatkan ikon & teks
    textAlign: "center",
    backgroundColor: "white",
    padding: "20px 10px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "1px solid #f0f0f0",
    minHeight: "120px", // Biar tinggi seragam
    boxSizing: "border-box"
  };

  const iconStyle = {
    fontSize: "28px",
    marginBottom: "10px"
  };

  const titleStyle = {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: "5px"
  };

  const descStyle = {
    fontSize: "11px",
    color: "#7f8c8d"
  };

  return (
    <div style={{ padding: "10px" }}>
      <header>
        <h2 style={{ margin: 0, color: "#2c3e50" }}>📊 Dashboard</h2>
        <p style={{ color: "#555", fontSize: "14px", marginTop: "5px" }}>
          Selamat datang, <b>{user.nama}</b> 👋
        </p>
      </header>

      <div style={containerStyle}>
        {/* ADMIN ONLY */}
        {user.role === "admin" && (
          <>
            <div style={cardStyle} onClick={() => setActiveMenu("register")}>
              <div style={iconStyle}>👤</div>
              <div style={titleStyle}>Registrasi User</div>
              <div style={descStyle}>Tambah user baru</div>
            </div>

            <div style={cardStyle} onClick={() => setActiveMenu("data_user")}>
              <div style={iconStyle}>👥</div>
              <div style={titleStyle}>Data User</div>
              <div style={descStyle}>Kelola data user</div>
            </div>
          </>
        )}

        {/* SEMUA ROLE */}
        <div style={cardStyle} onClick={() => setActiveMenu("departemen")}>
          <div style={iconStyle}>🏢</div>
          <div style={titleStyle}>Departemen</div>
          <div style={descStyle}>Lihat data departemen</div>
        </div>

        <div style={cardStyle} onClick={() => setActiveMenu("barang")}>
          <div style={iconStyle}>📦</div>
          <div style={titleStyle}>Stok Barang</div>
          <div style={descStyle}>Data barang SAP</div>
        </div>

        {(user.role === "admin" || user.role === "operasional") && (
          <div style={cardStyle} onClick={() => setActiveMenu("request")}>
            <div style={iconStyle}>📝</div>
            <div style={titleStyle}>Form FAB</div>
            <div style={descStyle}>Buat permintaan</div>
          </div>
        )}

        <div style={cardStyle} onClick={() => setActiveMenu("laporan")}>
          <div style={iconStyle}>📊</div>
          <div style={titleStyle}>Laporan</div>
          <div style={descStyle}>Data permintaan</div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;