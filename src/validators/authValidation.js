const Joi = require('joi');

// memvalidasi input data saat registrasi user baru
const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'any.required': 'Nama wajib diisi'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Format email tidak valid',
    'any.required': 'Email wajib diisi'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password minimal 6 karakter',
    'any.required': 'Password wajib diisi'
  })
});

// memvalidasi input data saat user login
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Format email tidak valid',
    'any.required': 'Email wajib diisi'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password wajib diisi'
  })
});

// memvalidasi input saat update profil
const updateProfileSchema = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow('', null), 
  bio: Joi.string().allow('', null)
});

// memvalidasi input saat mengganti password
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required().messages({
    'any.required': 'Password saat ini wajib diisi'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'Password baru minimal 6 karakter'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Konfirmasi password tidak cocok'
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema
};