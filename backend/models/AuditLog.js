const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Sometimes actions are performed anonymously or before login
  },
  action: {
    type: String,
    required: true
  },
  resource: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed, // Can store objects, arrays, etc.
    default: {}
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, { timestamps: true });

// Add indexing for faster querying in Admin panel
auditLogSchema.index({ user: 1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ resource: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
