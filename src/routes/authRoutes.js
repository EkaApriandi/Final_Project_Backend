const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth'); 
const { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } = require('../validators/authValidation');

// mendaftarkan route yang dapat diakses publik
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);

// membatasi akses route hanya untuk user yang sudah login
router.get('/me', authenticate, authController.getMe);

// menangani permintaan update profil dan ganti password
router.put('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);
router.put('/password', authenticate, validate(changePasswordSchema), authController.changePassword);

module.exports = router;