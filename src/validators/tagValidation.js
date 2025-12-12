const Joi = require('joi');

// memvalidasi input saat membuat tag baru
const createTagSchema = Joi.object({
  name: Joi.string().min(2).max(20).required().messages({
    'any.required': 'Nama tag wajib diisi'
  })
});

module.exports = {
  createTagSchema
};