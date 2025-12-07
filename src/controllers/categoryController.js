const prisma = require('../config/database');

const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    // memeriksa apakah kategori dengan nama sama sudah ada untuk user ini
    const existingCategory = await prisma.category.findFirst({
      where: { name, userId }
    });

    if (existingCategory) {
      const error = new Error('Kategori dengan nama ini sudah ada');
      error.statusCode = 409;
      throw error;
    }

    const category = await prisma.category.create({
      data: { name, userId }
    });

    res.status(201).json({
      success: true,
      message: 'Kategori berhasil dibuat',
      data: category
    });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // mengambil semua kategori milik user
    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({
      success: true,
      message: 'Data kategori berhasil diambil',
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // mencari kategori spesifik dan memvalidasi kepemilikan
    const category = await prisma.category.findFirst({
      where: {
        id: parseInt(id),
        userId
      }
    });

    if (!category) {
      const error = new Error('Kategori tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const userId = req.user.id;

    // memastikan kategori ada sebelum update
    const existingCategory = await prisma.category.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!existingCategory) {
      const error = new Error('Kategori tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    const updatedCategory = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name }
    });

    res.status(200).json({
      success: true,
      message: 'Kategori berhasil diperbarui',
      data: updatedCategory
    });
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // memastikan kategori ada sebelum dihapus
    const existingCategory = await prisma.category.findFirst({
      where: { id: parseInt(id), userId }
    });

    if (!existingCategory) {
      const error = new Error('Kategori tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    await prisma.category.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Kategori berhasil dihapus'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
};