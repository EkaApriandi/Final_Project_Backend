const Joi = require('joi');

// memvalidasi input saat membuat tugas baru
const createTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100).required().messages({
    'any.required': 'Judul tugas wajib diisi'
  }),
  description: Joi.string().allow('', null),
  dueDate: Joi.date().iso().messages({
    'date.format': 'Format tanggal harus ISO (YYYY-MM-DD)'
  }),
  categoryId: Joi.number().integer().optional(),
  tags: Joi.array().items(Joi.string()).optional() // menerima array string nama tag
});

// memvalidasi input saat memperbarui data tugas
const updateTaskSchema = Joi.object({
  title: Joi.string().min(3).max(100),
  description: Joi.string().allow('', null),
  status: Joi.string().valid('PENDING', 'IN_PROGRESS', 'COMPLETED'),
  dueDate: Joi.date().iso(),
  categoryId: Joi.number().integer().allow(null),
  tags: Joi.array().items(Joi.string())
});

module.exports = {
  createTaskSchema,
  updateTaskSchema
};