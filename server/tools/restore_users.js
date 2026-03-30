const pool = require('../db');
const { hashPassword } = require('../authHelper');

async function restore() {
    try {
        // Data user dengan id_departemen (d) dan id_divisi (v)
        const users = [
            { n: 'Admin', e: 'admin@bbp.com', r: 'admin', d: 1, v: 5, p: '081234567890' }, // Contoh: Dept HRD, Div IT
            { n: 'Agus', e: 'agus@bbp.com', r: 'operasional', d: 1, v: 2, p: '081234567891' },
            { n: 'Adam', e: 'adam@bbp.com', r: 'logistik', d: 11, v: 34, p: '081234567892' }, // Dept Warehouse, Div Logistik
            { n: 'Anton', e: 'anton@bbp.com', r: 'manager', d: 1, v: 1, p: '081234567893' }
        ];

        for (let u of users) {
            // Jika hashPassword kamu asinkron (pakai bcrypt), gunakan await
            const hp = hashPassword('password123'); 
            
            await pool.query(
                `INSERT INTO users (nama, email, password, role, id_departemen, id_divisi, no_telp) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [u.n, u.e, hp, u.r, u.d, u.v, u.p]
            );
        }
        console.log("✅ Semua user berhasil dipulihkan dengan Departemen & Divisi!");
    } catch (err) {
        console.error("❌ Gagal:", err.message);
    } finally {
        pool.end();
    }
}
restore();