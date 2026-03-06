const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Get inventory (public)
router.get('/', inventoryController.getInventory);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, inventoryController.createInventoryItem);
router.put('/:itemId', authMiddleware, adminMiddleware, inventoryController.updateInventoryItem);
router.delete('/:itemId', authMiddleware, adminMiddleware, inventoryController.deleteInventoryItem);

module.exports = router;
