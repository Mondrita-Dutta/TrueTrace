const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: [true, 'Product ID is required'],
    unique: true,
    trim: true,
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    trim: true,
  },
  brandName: {
    type: String,
    required: [true, 'Brand name is required'],
    trim: true,
  },
  manufacturerName: {
    type: String,
    required: [true, 'Manufacturer name is required'],
    trim: true,
  },
  manufacturerCompany: {
    type: String,
    required: [true, 'Manufacturer company is required'],
    trim: true,
  },
  manufacturerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Manufacturer reference is required'],
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
  },
  batchNumber: {
    type: String,
    required: [true, 'Batch number is required'],
    trim: true,
  },
  serialNumber: {
    type: String,
    required: [true, 'Serial number is required'],
    unique: true,
    trim: true,
  },
  manufacturingDate: {
    type: Date,
    required: [true, 'Manufacturing date is required'],
  },
  expiryDate: {
    type: Date,
  },
  countryOfOrigin: {
    type: String,
    required: [true, 'Country of origin is required'],
    trim: true,
  },
  warrantyPeriod: {
    type: String,
    trim: true,
  },
  additionalNotes: {
    type: String,
    trim: true,
  },
  productImage: {
    type: String, // Store the file path/URL
  },
  qrData: {
    type: String, // Encoded JSON payload
  },
  qrImageUrl: {
    type: String, // URL to the generated QR code image
  },
  verificationStatus: {
    type: String,
    default: 'Unverified',
  },
  blockchainStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Failed'],
    default: 'Pending',
  },
  blockchainTxHash: {
    type: String,
    trim: true,
  },
  blockchainLedger: {
    type: Number,
  },
  status: {
    type: String,
    enum: ['Draft', 'Pending Blockchain', 'Verified', 'Inactive', 'Archived'],
    default: 'Draft',
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
