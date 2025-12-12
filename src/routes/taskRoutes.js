const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs'); 

const taskController = require('../controllers/taskController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createTaskSchema, updateTaskSchema } = require('../validators/taskValidation');

// menyiapkan konfigurasi penyimpanan file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// memfilter tipe file dokumen dan gambar yang diizinkan
const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|txt|jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Hanya diperbolehkan upload file dokumen dan gambar!'));
    }
};

// mengatur batasan ukuran file maksimum 5MB
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: fileFilter
});

// menerapkan keamanan autentikasi pada seluruh endpoint
router.use(authenticate);

// mengatur rute utama pengelolaan tugas
router.post('/', validate(createTaskSchema), taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/:id', taskController.getTaskById);
router.put('/:id', upload.single('file'), validate(updateTaskSchema), taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

// menangani penghapusan file lampiran secara spesifik
router.delete('/files/:fileId', taskController.deleteTaskFile);

module.exports = router;