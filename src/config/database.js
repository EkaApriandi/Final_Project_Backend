const { PrismaClient } = require('@prisma/client');

// menginisialisasi koneksi database
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
});

module.exports = prisma;