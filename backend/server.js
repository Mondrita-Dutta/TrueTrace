const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const { initializeStellarAccount } = require('./services/stellarService');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (like uploaded product images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Global Response Format Middleware
app.use((req, res, next) => {
  res.success = (data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  };
  res.error = (message = 'Error', statusCode = 500, errors = null) => {
    return res.status(statusCode).json({
      success: false,
      message,
      errors
    });
  };
  next();
});

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const publicRoutes = require('./routes/publicRoutes');

// Placeholder route
app.get('/api/health', (req, res) => {
  res.success(null, 'TrueTrace API is running');
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/public', publicRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.error(err.message || 'Server Error', err.status || 500);
});

const PORT = process.env.PORT || 5000;

// Initialize Stellar account before starting server
initializeStellarAccount().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize Stellar Account:', err);
  // Still start the server even if stellar fails, but log it
  app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} mode on port ${PORT} (Stellar Init Failed)`);
  });
});
