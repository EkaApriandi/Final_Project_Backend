const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

// mengubah password menjadi format hash terenkripsi
const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

// membandingkan kecocokan password input dengan hash tersimpan
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePassword,
};