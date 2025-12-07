const prisma = require('../config/database');

const createTask = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { title, description, dueDate, categoryId, tags } = req.body;

    // logika menghubungkan tags (create or connect)
    // jika tag belum ada, otomatis dibuatkan. jika ada, disambungkan.
    const tagConnect = tags && tags.length > 0 
      ? tags.map((name) => ({ where: { name }, create: { name } })) 
      : [];

    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId,
        categoryId,
        tags: {
          connectOrCreate: tagConnect
        }
      },
      include: {
        category: true,
        tags: true
      }
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

const getTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // mengambil parameter query untuk filter/search
    const { page = 1, limit = 10, search, status, categoryId, sortBy = 'createdAt', order = 'desc' } = req.query;

    // setup pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // menyusun filter query (where clause)
    const where = {
      userId, // user hanya melihat task miliknya
      ...(status && { status }), // filter status jika ada
      ...(categoryId && { categoryId: parseInt(categoryId) }), // filter kategori jika ada
      ...(search && { // pencarian judul atau deskripsi
        OR: [
          { title: { contains: search } }, // sqlite default case-insensitive untuk like
          { description: { contains: search } }
        ]
      })
    };

    // eksekusi query ke database
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: order }, // sorting dinamis
        include: {
          category: true,
          tags: true
        }
      }),
      prisma.task.count({ where }) // menghitung total data untuk pagination
    ]);

    res.status(200).json({
      success: true,
      message: 'Daftar tugas berhasil diambil',
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

const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const task = await prisma.task.findFirst({
      where: { id: parseInt(id), userId },
      include: {
        category: true,
        tags: true
      }
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

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, status, dueDate, categoryId, tags } = req.body;

    // cek kepemilikan task
    const existingTask = await prisma.task.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!existingTask) {
      const error = new Error('Tugas tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    // logika update tags (reset tag lama, pasang tag baru)
    let tagsUpdate = {};
    if (tags) {
      tagsUpdate = {
        set: [], // lepas semua tag lama
        connectOrCreate: tags.map((name) => ({ where: { name }, create: { name } }))
      };
    }

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(id) },
      data: {
        title,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        categoryId,
        tags: tags ? tagsUpdate : undefined
      },
      include: { tags: true }
    });

    res.status(200).json({
      success: true,
      message: 'Tugas berhasil diperbarui',
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role; // mengambil role dari token

    // mencari task berdasarkan id
    const task = await prisma.task.findUnique({
      where: { id: parseInt(id) }
    });

    if (!task) {
      const error = new Error('Tugas tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    // logika otorisasi: pemilik asli BOLEH, admin juga BOLEH
    if (task.userId !== userId && userRole !== 'ADMIN') {
      const error = new Error('Anda tidak memiliki akses menghapus tugas ini');
      error.statusCode = 403;
      throw error;
    }

    // menghapus task
    await prisma.task.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Tugas berhasil dihapus'
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
  deleteTask
};