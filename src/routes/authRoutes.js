const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/auth'); // import middleware
const { registerSchema, loginSchema } = require('../validators/authValidation');

// route publik
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refreshToken);
// route privat (butuh login)
router.get('/me', authenticate, authController.getMe); // pasang authenticate

module.exports = router;