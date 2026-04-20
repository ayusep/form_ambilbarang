import { useState } from 'react';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        onLoginSuccess(data.user);
        alert(`Selamat datang, ${data.user.nama}!`);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal terhubung ke server.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoCircle}>📦</div>
          <h2 style={styles.title}>Inventory System</h2>
          <p style={styles.subtitle}>PT. Bahana Bhumiphala Persada</p>
        </div>

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Username</label>
            <input 
              type="text" 
              placeholder="Username..." 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.passwordWrapper}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Masukkan Password..." 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                style={styles.inputPassword}
              />
              <span 
                onClick={() => setShowPassword(!showPassword)} 
                style={styles.eyeIcon}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>

          <button type="submit" style={styles.button}>
            Sign In
          </button>
        </form>
        
        <div style={styles.footer}>
          <small>© 2026 IT Department</small>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',           // Mengaktifkan mode flex
    justifyContent: 'center',  // Center secara Horizontal (Kanan-Kiri)
    alignItems: 'center',      // Center secara Vertikal (Atas-Bawah)
    minHeight: '100vh',        // Mengambil 100% tinggi layar browser
    width: '100vw',            // Mengambil 100% lebar layar browser
    backgroundColor: '#f0f2f5',
    margin: 0,                 // Menghilangkan margin bawaan browser
    padding: '20px',
    boxSizing: 'border-box',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '40px 30px',
    borderRadius: '16px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
    boxSizing: 'border-box',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  logoCircle: {
    fontSize: '40px',
    marginBottom: '10px',
  },
  title: {
    margin: '0',
    color: '#2c3e50',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  subtitle: {
    margin: '5px 0 0 0',
    color: '#7f8c8d',
    fontSize: '14px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#34495e',
    marginLeft: '2px',
  },
  input: {
    padding: '12px 15px',
    borderRadius: '8px',
    border: '1.5px solid #dcdde1',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputPassword: {
    padding: '12px 15px',
    paddingRight: '45px', // Ruang untuk ikon mata
    borderRadius: '8px',
    border: '1.5px solid #dcdde1',
    fontSize: '15px',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
  },
  eyeIcon: {
    position: 'absolute',
    right: '15px',
    cursor: 'pointer',
    fontSize: '18px',
    userSelect: 'none',
    color: '#95a5a6',
  },
  button: {
    padding: '14px',
    backgroundColor: '#2c3e50', // Biru gelap elegan
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginTop: '10px',
    transition: 'background-color 0.3s',
  },
  footer: {
    marginTop: '30px',
    textAlign: 'center',
    color: '#bdc3c7',
  }
};

export default Login;