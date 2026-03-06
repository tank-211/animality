const express = require('express');
const router = express.Router();
const inquiryController = require('../controllers/inquiryController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Create inquiry
router.post('/', authMiddleware, inquiryController.createInquiry);

// Pet Parent routes
router.get('/user/:userId', authMiddleware, inquiryController.getUserInquiries);

// Admin routes
router.get('/', authMiddleware, adminMiddleware, inquiryController.getAllInquiries);
router.put('/:inquiryId', authMiddleware, adminMiddleware, inquiryController.updateInquiry);
router.delete('/:inquiryId', authMiddleware, adminMiddleware, inquiryController.deleteInquiry);

module.exports = router;
