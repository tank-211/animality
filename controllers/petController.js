const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Admin: Get all pets (in shop)
exports.getShopPets = async (req, res) => {
  try {
    const pets = await prisma.pet.findMany({
      where: { isShopPet: true },
      include: { documents: true }
    });

    res.json(pets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shop pets' });
  }
};

// Admin: Create pet
exports.createPet = async (req, res) => {
  try {
    const {
      petName,
      animalVariety,
      breed,
      dateOfBirth,
      breederName,
      price,
      description,
      imageUrl
    } = req.body;

    const pet = await prisma.pet.create({
      data: {
        petName,
        animalVariety,
        breed,
        dateOfBirth: new Date(dateOfBirth),
        breederName,
        price,
        description,
        imageUrl,
        isShopPet: true,
        isAvailableForSale: true
      }
    });

    res.status(201).json({ message: 'Pet created successfully', pet });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create pet' });
  }
};

// Admin/Pet Parent: Update pet
exports.updatePet = async (req, res) => {
  try {
    const { petId } = req.params;
    const updateData = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    // Check if user is admin or owns the pet
    const pet = await prisma.pet.findUnique({
      where: { id: petId }
    });

    if (!pet) {
      return res.status(404).json({ error: 'Pet not found' });
    }

    // Only admin or the pet owner can update
    if (userRole !== 'ADMIN' && pet.parentId !== userId) {
      return res.status(403).json({ error: 'You can only update your own pets' });
    }

    const updatedPet = await prisma.pet.update({
      where: { id: petId },
      data: updateData
    });

    res.json({ message: 'Pet updated successfully', pet: updatedPet });
  } catch (error) {
    console.error('Update pet error:', error);
    res.status(500).json({ error: 'Failed to update pet', details: error.message });
  }
};

// Admin/Pet Parent: Delete pet
exports.deletePet = async (req, res) => {
  try {
    // 1. Debugging: See exactly what the frontend is sending
    console.log("Full Params received:", req.params);
    
    // Attempt to grab the ID regardless of what you named it in the route
    const petId = req.params.petId || req.params.id; 
    
    console.log("Extracted petId:", petId);

    if (!petId || petId === 'undefined') {
      return res.status(400).json({ error: 'Pet ID is missing in the request URL' });
    }

    const numericPetId = parseInt(petId);

    if (isNaN(numericPetId)) {
      return res.status(400).json({ error: `Invalid Pet ID format: ${petId}` });
    }

    // 2. Check if pet exists
    const pet = await prisma.pet.findUnique({
      where: { id: numericPetId }
    });

    if (!pet) {
      return res.status(404).json({ error: 'Pet not found in database' });
    }

    // 3. Delete related and then the pet
    await prisma.document.deleteMany({ where: { petId: numericPetId } });
    await prisma.vaccinationAlert.deleteMany({ where: { petId: numericPetId } });
    await prisma.pet.delete({ where: { id: numericPetId } });

    res.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Delete pet error:', error);
    res.status(500).json({ error: 'Failed to delete pet', details: error.message });
  }
};

// Pet Parent: Upload pet
exports.uploadPetByParent = async (req, res) => {
  try {
    const {
      petName,
      animalVariety,
      breed,
      dateOfBirth,
      vaccinationStatus,
      breederName
    } = req.body;

    const pet = await prisma.pet.create({
      data: {
        petName,
        animalVariety,
        breed,
        dateOfBirth: new Date(dateOfBirth),
        vaccinationStatus,
        breederName,
        parentId: req.userId,
        isShopPet: false
      }
    });

    // Create vaccination alert
    const nextVaccinationDue = new Date(dateOfBirth);
    nextVaccinationDue.setFullYear(nextVaccinationDue.getFullYear() + 1);

    await prisma.vaccinationAlert.create({
      data: {
        petId: pet.id,
        nextVaccinationDue
      }
    });

    res.status(201).json({ message: 'Pet uploaded successfully', pet });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to upload pet' });
  }
};

// Pet Parent: Get user's pets
exports.getUserPets = async (req, res) => {
  try {
    const { userId } = req.params;

    const pets = await prisma.pet.findMany({
      where: { parentId: userId },
      include: {
        documents: true,
        vaccinationAlerts: true
      }
    });

    res.json(pets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pets' });
  }
};

// Public: Get available shop pets
exports.getAvailablePets = async (req, res) => {
  try {
    const pets = await prisma.pet.findMany({
      where: {
        isShopPet: true,
        isAvailableForSale: true
      },
      include: { documents: true }
    });

    res.json(pets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch available pets' });
  }
};
