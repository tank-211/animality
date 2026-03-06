const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Create payment
router.post('/', authMiddleware, paymentController.createPayment);
router.post('/confirm', authMiddleware, paymentController.confirmPayment);

// Pet Parent routes
router.get('/user/:userId', authMiddleware, paymentController.getUserPayments);
router.get('/:paymentId/receipt', authMiddleware, paymentController.downloadReceipt);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, paymentController.getAllPayments);

module.exports = router;
