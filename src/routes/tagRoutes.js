const express = require('express');
const router = express.Router();

const tagController = require('../controllers/tagController');
const authenticate = require('../middleware/auth');
const validate = require('../middleware/validate');
const { createTagSchema } = require('../validators/tagValidation');

// menerapkan middleware auth
router.use(authenticate);

// definisi endpoint tag
router.post('/', validate(createTagSchema), tagController.createTag);
router.get('/', tagController.getTags);
router.delete('/:id', tagController.deleteTag);

module.exports = router;