const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/categoryController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createCategorySchema, updateCategorySchema } = require('../validators/categoryValidation');

// menerapkan keamanan autentikasi pada seluruh endpoint
router.use(authenticate);

// mengatur rute untuk pengelolaan data kategori
router.post('/', validate(createCategorySchema), categoryController.createCategory);
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;