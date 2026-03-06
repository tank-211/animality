const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const petRoutes = require('./routes/pets');
const inventoryRoutes = require('./routes/inventory');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const inquiryRoutes = require('./routes/inquiries');
const analyticsRoutes = require('./routes/analytics');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});
// Add this right above your routes
app.use((req, res, next) => {
  console.log(`📡 Incoming Request: ${req.method} ${req.url}`);
  next();
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Animality Backend Server running on port ${PORT}`);
});

module.exports = app;
