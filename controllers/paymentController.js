const { PrismaClient } = require('@prisma/client');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const prisma = new PrismaClient();

// Create payment
exports.createPayment = async (req, res) => {
  try {
    const { orderId, amount } = req.body;
    const userId = req.userId;

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      metadata: { orderId, userId }
    });

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        orderId,
        amount,
        stripePaymentId: paymentIntent.id,
        status: 'PENDING'
      }
    });

    res.json({
      message: 'Payment intent created',
      clientSecret: paymentIntent.client_secret,
      paymentId: payment.id
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

// Confirm payment
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentId, stripePaymentId } = req.body;

    const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentId);

    if (paymentIntent.status === 'succeeded') {
      const payment = await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'COMPLETED',
          receiptUrl: `receipt_${paymentId}_${Date.now()}`
        }
      });

      await prisma.order.update({
        where: { id: payment.orderId },
        data: { status: 'CONFIRMED' }
      });

      res.json({ message: 'Payment confirmed', payment });
    } else {
      res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
};

// Get user payments
exports.getUserPayments = async (req, res) => {
  try {
    const { userId } = req.params;

    const payments = await prisma.payment.findMany({
      where: { userId },
      include: { order: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

// Get all payments (Admin)
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        user: { select: { id: true, email: true, firstName: true } },
        order: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

// Download receipt
exports.downloadReceipt = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true, user: true }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Generate receipt (simplified)
    const receiptContent = `
    ANIMALITY PETS COMPANY
    Receipt No: ${payment.id}
    Date: ${new Date(payment.createdAt).toLocaleDateString()}
    
    Customer: ${payment.user.firstName} ${payment.user.lastName}
    Email: ${payment.user.email}
    
    Order: ${payment.order.orderNumber}
    Amount: $${payment.amount.toFixed(2)}
    Status: ${payment.status}
    
    Thank you for your purchase!
    `;

    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="receipt_${payment.id}.txt"`);
    res.send(receiptContent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to download receipt' });
  }
};
