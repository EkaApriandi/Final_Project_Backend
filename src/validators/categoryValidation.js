const Joi = require('joi');

// skema validasi untuk membuat kategori
const createCategorySchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'any.required': 'Nama kategori wajib diisi'
  })
});

// skema validasi untuk update kategori
const updateCategorySchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'any.required': 'Nama kategori wajib diisi'
  })
});

module.exports = {
  createCategorySchema,
  updateCategorySchema
};