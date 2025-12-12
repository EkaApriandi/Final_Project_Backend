const express = require('express');
const router = express.Router();

const tagController = require('../controllers/tagController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createTagSchema } = require('../validators/tagValidation');

// menerapkan keamanan autentikasi pada seluruh endpoint
router.use(authenticate);

// mengatur rute untuk pengelolaan data tag
router.post('/', validate(createTagSchema), tagController.createTag);
router.get('/', tagController.getTags);
router.delete('/:id', tagController.deleteTag);

module.exports = router;