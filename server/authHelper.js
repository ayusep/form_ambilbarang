const crypto = require('crypto');

/**
 * Mengubah password teks biasa menjadi hash yang aman
 */
const hashPassword = (password) => {
    // Buat salt acak 16 byte
    const salt = crypto.randomBytes(16).toString('hex');
    // Hash password dengan salt (menggunakan PBKDF2)
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    // Gabungkan salt dan hash untuk disimpan di DB
    return `${salt}:${hash}`;
};

/**
 * Membandingkan password input user dengan hash yang ada di database
 */
const verifyPassword = (inputPassword, storedData) => {
    try {
        const [salt, storedHash] = storedData.split(':');
        const inputHash = crypto.pbkdf2Sync(inputPassword, salt, 1000, 64, 'sha512').toString('hex');
        return inputHash === storedHash;
    } catch (err) {
        return false;
    }
};

module.exports = { hashPassword, verifyPassword };