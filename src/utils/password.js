const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

// mengubah password teks biasa menjadi hash
const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

// membandingkan password input dengan hash database
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword,
};