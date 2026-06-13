const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { registerValidator, loginValidator } = require('../validators/authValidators');
const { validate } = require('../middleware/validate');

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.get('/me', protect, getMe);

module.exports = router;
