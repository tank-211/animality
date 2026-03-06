const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all inventory items
exports.getInventory = async (req, res) => {
  try {
    const { category } = req.query;

    const where = category ? { category, isActive: true } : { isActive: true };

    const items = await prisma.inventoryItem.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
};

// Create inventory item
exports.createInventoryItem = async (req, res) => {
  try {
    const { name, category, description, price, quantity, sku, imageUrl } = req.body;

    const item = await prisma.inventoryItem.create({
      data: {
        name,
        category,
        description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        sku,
        imageUrl
      }
    });

    res.status(201).json({ message: 'Inventory item created', item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
};

// Update inventory item
exports.updateInventoryItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const updateData = req.body;

    const item = await prisma.inventoryItem.update({
      where: { id: itemId },
      data: updateData
    });

    res.json({ message: 'Inventory item updated', item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
};

// Delete inventory item
exports.deleteInventoryItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    await prisma.inventoryItem.update({
      where: { id: itemId },
      data: { isActive: false }
    });

    res.json({ message: 'Inventory item deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete inventory item' });
  }
};
