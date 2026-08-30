const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { initializeStellarAccount } = require('./services/stellarService');
const { errorHandler } = require('./middlewares/errorMiddleware');
const { loggerMiddleware } = require('./middlewares/loggerMiddleware');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();

// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: false })); // Basic security headers, CORP false for local images
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests from this IP, please try again after 15 minutes' }
});

// Apply rate limiter to all API routes
app.use('/api', apiLimiter);

// Body parsers
app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Logging
app.use(loggerMiddleware);

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
const analyticsRoutes = require('./routes/analyticsRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Placeholder route
app.get('/api/health', (req, res) => {
  res.success(null, 'TrueTrace API is running');
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use(errorHandler);

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
// trigger restart
// trigger restart 2
