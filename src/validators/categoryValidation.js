const Joi = require('joi');

// memvalidasi input saat membuat kategori baru
const createCategorySchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'any.required': 'Nama kategori wajib diisi'
  })
});

// memvalidasi input saat memperbarui data kategori
const updateCategorySchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'any.required': 'Nama kategori wajib diisi'
  })
});

module.exports = {
  createCategorySchema,
  updateCategorySchema
};