const prisma = require('../config/database');

const createTag = async (req, res, next) => {
  try {
    const { name } = req.body;

    // mengecek apakah tag sudah ada di database
    const existingTag = await prisma.tag.findUnique({
      where: { name }
    });

    if (existingTag) {
      const error = new Error('Tag dengan nama ini sudah ada');
      error.statusCode = 409;
      throw error;
    }

    // menyimpan tag baru
    const tag = await prisma.tag.create({
      data: { name }
    });

    res.status(201).json({
      success: true,
      message: 'Tag berhasil dibuat',
      data: tag
    });
  } catch (error) {
    next(error);
  }
};

const getTags = async (req, res, next) => {
  try {
    // mengambil seluruh data tag
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' }
    });

    res.status(200).json({
      success: true,
      message: 'Data tag berhasil diambil',
      data: tags
    });
  } catch (error) {
    next(error);
  }
};

const deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params;

    // memastikan tag ada sebelum dihapus
    const existingTag = await prisma.tag.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingTag) {
      const error = new Error('Tag tidak ditemukan');
      error.statusCode = 404;
      throw error;
    }

    // menghapus tag dari database
    await prisma.tag.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Tag berhasil dihapus'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTag,
  getTags,
  deleteTag
};