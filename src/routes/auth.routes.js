const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const authValidator = require('../validators/auth.validator');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

router.post('/register', authLimiter, validate(authValidator.register), authController.register);
router.post('/login', authLimiter, validate(authValidator.login), authController.login);
router.post('/verify-email', authLimiter, validate(authValidator.verifyEmail), authController.verifyEmail);
router.post('/resend-verification', authLimiter, validate(authValidator.resendVerification), authController.resendVerification);
router.get('/me', protect, authController.getProfile);

module.exports = router;
