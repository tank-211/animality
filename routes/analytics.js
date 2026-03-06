const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Get analytics (Admin only)
router.get('/', authMiddleware, adminMiddleware, analyticsController.getAnalytics);
router.post('/update', authMiddleware, adminMiddleware, analyticsController.updateAnalytics);

module.exports = router;
