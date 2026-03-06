const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Create order
router.post('/', authMiddleware, orderController.createOrder);

// Pet Parent routes
router.get('/user/:userId', authMiddleware, orderController.getUserOrders);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, orderController.getAllOrders);
router.put('/:orderId/status', authMiddleware, adminMiddleware, orderController.updateOrderStatus);

module.exports = router;
