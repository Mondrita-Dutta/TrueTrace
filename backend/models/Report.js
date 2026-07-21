const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    index: true,
  },
  manufacturerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
  },
  reason: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
  },
  email: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Open', 'Investigating', 'Resolved', 'Dismissed'],
    default: 'Open'
  },
  reportedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', reportSchema);
