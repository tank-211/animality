const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Admin routes
router.get('/shop', petController.getShopPets);
router.post('/', authMiddleware, adminMiddleware, petController.createPet);

// Update route - both admin and pet parent can update (pet parent only own pets)
router.put('/:petId', authMiddleware, petController.updatePet);

// Delete route - both admin and pet parent can delete (pet parent only own pets)
router.delete('/:petId', authMiddleware, petController.deletePet);

// Pet Parent routes
router.post('/upload', authMiddleware, petController.uploadPetByParent);
router.get('/user/:userId', authMiddleware, petController.getUserPets);

// Public routes
router.get('/available', petController.getAvailablePets);

module.exports = router;
