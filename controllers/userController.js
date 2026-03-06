const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getPetParents = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { role: 'PET_PARENT' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        subscriptionTier: true,
        address: true,
        city: true,
        state: true,
        createdAt: true,
        _count: {
          select: { pets: true, orders: true }
        }
      }
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pet parents' });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        pets: true,
        orders: true,
        documents: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, phone, address, city, state, zipCode, subscriptionTier } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        phone,
        address,
        city,
        state,
        zipCode,
        subscriptionTier
      }
    });

    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
};

exports.deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false }
    });

    res.json({ message: 'User deactivated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
};
