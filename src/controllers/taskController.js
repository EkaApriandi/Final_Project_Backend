const prisma = require('../config/database');
const fs = require('fs');
const path = require('path');

// membuat tugas baru untuk user
const createTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description, dueDate, categoryId, tags } = req.body;

    // mempersiapkan relasi tags jika ada input
    const tagConnect = tags && tags.length > 0 
      ? tags.map((name) => ({ where: { name }, create: { name } })) 
      : [];

    // menyimpan data tugas ke database
    const task = await prisma.task.create({
      data: {
        title, 
        description, 
        userId,
        dueDate: dueDate ? new Date(dueDate) : null,
        categoryId: categoryId ? parseInt(categoryId) : null,
        tags: { connectOrCreate: tagConnect }
      },
      include: { category: true, tags: true, files: true }
    });

    res.status(201).json({ 
      success: true, 
      message: 'Tugas berhasil dibuat', 
      data: task 
    });
  } catch (error) { 
    next(error); 
  }
};

// mengambil daftar tugas dengan fitur filter dan pagination
const getTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, search, status, categoryId, sortBy = 'createdAt', order = 'desc' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // menyusun kondisi pencarian berdasarkan filter
    const where = {
      userId,
      ...(status && { status }),
      ...(categoryId && { categoryId: parseInt(categoryId) }),
      ...(search && { OR: [{ title: { contains: search } }, { description: { contains: search } }] })
    };

    // menjalankan query data dan hitung total secara bersamaan
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where, skip, take, orderBy: { [sortBy]: order },
        include: { category: true, tags: true, files: true }
      }),
      prisma.task.count({ where })
    ]);

    res.status(200).json({
      success: true, 
      message: 'Daftar tugas diambil',
      data: tasks,
      pagination: { 
        totalData: total, 
        totalPages: Math.ceil(total / take), 
        currentPage: parseInt(page), 
        limit: parseInt(limit) 
      }
    });
  } catch (error) { 
    next(error); 
  }
};

// mengambil detail satu tugas berdasarkan id
const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // mencari data tugas spesifik
    const task = await prisma.task.findFirst({
      where: { id: parseInt(id), userId },
      include: { category: true, tags: true, files: true }
    });

    if (!task) { 
      const error = new Error('Tugas tidak ditemukan'); 
      error.statusCode = 404; 
      throw error; 
    }

    res.status(200).json({ 
      success: true, 
      data: task 
    });
  } catch (error) { 
    next(error); 
  }
};

// memperbarui informasi tugas yang sudah ada
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, status, dueDate, categoryId, tags } = req.body;

    // mengecek keberadaan tugas sebelum update
    const existingTask = await prisma.task.findFirst({ 
      where: { id: parseInt(id), userId } 
    });
    
    if (!existingTask) { 
      const error = new Error('Tugas tidak ditemukan'); 
      error.statusCode = 404; 
      throw error; 
    }

    // mengatur logika update untuk tags
    let tagsUpdate = {};
    if (tags) {
      const tagsArray = Array.isArray(tags) ? tags : [tags]; 
      tagsUpdate = { 
        set: [], 
        connectOrCreate: tagsArray.map((name) => ({ where: { name }, create: { name } })) 
      };
    }

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(status && { status }),
        dueDate: dueDate ? new Date(dueDate) : undefined,
        categoryId: categoryId ? parseInt(categoryId) : undefined,
        tags: tags ? tagsUpdate : undefined,
      },
      include: { files: true, tags: true }
    });

    // menambahkan file lampiran jika ada upload baru
    if (req.file) {
      const newFile = await prisma.taskFile.create({
        data: {
          fileUrl: `/uploads/${req.file.filename}`,
          taskId: parseInt(id)
        }
      });
      updatedTask.files.push(newFile);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Tugas diperbarui', 
      data: updatedTask 
    });
  } catch (error) { 
    next(error); 
  }
};

// menghapus tugas beserta file terkaitnya
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const task = await prisma.task.findUnique({ 
        where: { id: parseInt(id) }, 
        include: { files: true } 
    });

    if (!task) {
        const error = new Error('Tugas tidak ditemukan');
        error.statusCode = 404;
        throw error;
    }

    // memvalidasi hak akses penghapusan (pemilik atau admin)
    if (task.userId !== userId && userRole !== 'ADMIN') {
        const error = new Error('Akses ditolak. Anda bukan pemilik tugas ini.');
        error.statusCode = 403;
        throw error;
    }
    
    // membersihkan file fisik dari server agar hemat penyimpanan
    if (task.files && task.files.length > 0) {
      task.files.forEach(file => {
         const filePath = path.join(__dirname, '..', file.fileUrl);
         if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      });
    }

    await prisma.task.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ 
      success: true, 
      message: 'Tugas dihapus' 
    });
  } catch (error) { 
    next(error); 
  }
};

// menghapus satu file lampiran spesifik
const deleteTaskFile = async (req, res, next) => {
    try {
        const { fileId } = req.params;
        
        const fileRecord = await prisma.taskFile.findUnique({ 
          where: { id: parseInt(fileId) } 
        });

        if (!fileRecord) { 
          return res.status(404).json({ message: 'File tidak ditemukan' }); 
        }

        // menghapus file fisik dari direktori
        const filePath = path.join(__dirname, '..', fileRecord.fileUrl);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await prisma.taskFile.delete({ where: { id: parseInt(fileId) } });

        res.status(200).json({ 
          success: true, 
          message: 'File dihapus' 
        });
    } catch (error) { 
      next(error); 
    }
};

module.exports = { 
  createTask, 
  getTasks, 
  getTaskById, 
  updateTask, 
  deleteTask, 
  deleteTaskFile 
};