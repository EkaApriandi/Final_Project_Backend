const Joi = require('joi');

// skema validasi pembuatan tag
const createTagSchema = Joi.object({
  name: Joi.string().min(2).max(20).required().messages({
    'any.required': 'Nama tag wajib diisi'
  })
});

module.exports = {
  createTagSchema
};