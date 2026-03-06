const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get analytics data
exports.getAnalytics = async (req, res) => {
  try {
    const analytics = await prisma.analytics.findFirst();

    if (!analytics) {
      return res.json({
        totalPetsSold: 0,
        petsInShop: 0,
        foodInventorySold: 0,
        foodInventoryInStock: 0,
        accessoriesSold: 0,
        accessoriesInStock: 0,
        totalRevenue: 0,
        totalOrders: 0,
        activeUsers: 0
      });
    }

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
};

// Update analytics (called internally)
exports.updateAnalytics = async (req, res) => {
  try {
    // Get computed data
    const petsInShop = await prisma.pet.count({
      where: { isShopPet: true, isAvailableForSale: true }
    });

    const foodInventory = await prisma.inventoryItem.findMany({
      where: { category: 'PET_FOOD', isActive: true }
    });

    const accessoriesInventory = await prisma.inventoryItem.findMany({
      where: { category: 'ACCESSORIES', isActive: true }
    });

    const orders = await prisma.order.findMany();
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const activeUsers = await prisma.user.count({
      where: { isActive: true, role: 'PET_PARENT' }
    });

    const foodInStock = foodInventory.reduce((sum, item) => sum + item.quantity, 0);
    const accessoriesInStock = accessoriesInventory.reduce((sum, item) => sum + item.quantity, 0);

    const analytics = await prisma.analytics.upsert({
      where: { id: 'analytics_1' },
      create: {
        id: 'analytics_1',
        petsInShop,
        foodInventoryInStock: foodInStock,
        accessoriesInStock: accessoriesInStock,
        totalRevenue,
        totalOrders: orders.length,
        activeUsers
      },
      update: {
        petsInShop,
        foodInventoryInStock: foodInStock,
        accessoriesInStock: accessoriesInStock,
        totalRevenue,
        totalOrders: orders.length,
        activeUsers
      }
    });

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update analytics' });
  }
};
