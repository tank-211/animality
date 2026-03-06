const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// ADD THIS LINE
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;