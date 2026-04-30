const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const authValidator = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', validate(authValidator.register), authController.register);
router.post('/login', validate(authValidator.login), authController.login);

module.exports = router;
