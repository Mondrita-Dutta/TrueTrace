const mongoose = require('mongoose');

const productTemplateSchema = new mongoose.Schema({
  templateName: {
    type: String,
    required: [true, 'Template name is required'],
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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ProductTemplate', productTemplateSchema);
