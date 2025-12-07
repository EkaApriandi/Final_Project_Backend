const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const errorMiddleware = require('./middleware/error');
const authRoutes = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const tagRoutes = require('./routes/tagRoutes');
const taskRoutes = require('./routes/taskRoutes');


const app = express();
const PORT = process.env.PORT || 3000;

// menerapkan middleware global
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// endpoint untuk pemeriksaan kesehatan server
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API Task Management siap digunakan'
  });
});

// menerapkan routing aplikasi 
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tags', tagRoutes);
app.use('/api/tasks', taskRoutes);

// menerapkan penanganan error terpusat
app.use(errorMiddleware);

// menjalankan server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
  });
}

module.exports = app;