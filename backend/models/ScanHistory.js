const mongoose = require('mongoose');

const scanHistorySchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
    index: true,
  },
  manufacturerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isAuthentic: {
    type: Boolean,
    required: true,
  },
  ipAddress: {
    type: String,
  },
  location: {
    type: String,
  },
  scannedAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('ScanHistory', scanHistorySchema);
