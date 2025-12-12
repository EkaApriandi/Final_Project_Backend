const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const errorMiddleware = require('./middleware/error');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const tagRoutes = require('./routes/tagRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// menerapkan middleware global aplikasi
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// melonggarkan keamanan helmet agar bisa memuat gambar dari server sendiri
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(morgan('dev'));

// membuka akses publik ke folder uploads agar gambar bisa diakses
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// menyediakan endpoint untuk pemeriksaan kesehatan server
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API Task Management siap digunakan',
    timestamp: new Date().toISOString(),
    uptime: process.uptime() 
  });
});

// mendaftarkan routing untuk fitur-fitur aplikasi
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/tasks', taskRoutes);

// menangani error yang terjadi di aplikasi
app.use(errorMiddleware);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;