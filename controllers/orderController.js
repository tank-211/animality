const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create order
exports.createOrder = async (req, res) => {
  try {
    const { items, petIds, shippingAddress } = req.body;
    const userId = req.userId;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Calculate totals
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const invItem = await prisma.inventoryItem.findUnique({
        where: { id: item.inventoryItemId }
      });

      if (!invItem) continue;

      const itemTotal = invItem.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        inventoryItemId: item.inventoryItemId,
        quantity: item.quantity,
        unitPrice: invItem.price,
        totalPrice: itemTotal
      });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        orderNumber: `ORD-${Date.now()}`,
        totalAmount,
        shippingAddress,
        items: {
          create: orderItems
        },
        pets: petIds && petIds.length > 0 ? {
          connect: petIds.map(id => ({ id }))
        } : undefined
      },
      include: { items: true }
    });

    res.status(201).json({ message: 'Order created', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: { include: { inventoryItem: true } }, payment: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Get all orders (Admin)
exports.getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;

    const where = status ? { status } : {};

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        items: { include: { inventoryItem: true } },
        payment: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber } = req.body;

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        trackingNumber,
        deliveredAt: status === 'DELIVERED' ? new Date() : undefined
      }
    });

    res.json({ message: 'Order updated', order });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
};
