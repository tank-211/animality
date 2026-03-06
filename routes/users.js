const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Admin routes
router.get('/pet-parents', authMiddleware, adminMiddleware, userController.getPetParents);
router.get('/:userId', authMiddleware, userController.getUserById);
router.put('/:userId', authMiddleware, userController.updateUser);
router.post('/:userId/deactivate', authMiddleware, adminMiddleware, userController.deactivateUser);

module.exports = router;
