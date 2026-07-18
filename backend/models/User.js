const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  // Common Fields
  role: {
    type: String,
    enum: ['admin', 'manufacturer', 'customer'],
    required: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false // Exclude from query results by default
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'suspended', 'rejected'],
    default: 'active'
  },
  profileImage: {
    type: String,
    default: ''
  },
  
  // Customer Fields
  firstName: {
    type: String
  },
  lastName: {
    type: String
  },
  phone: {
    type: String
  },

  // Manufacturer Fields
  companyName: {
    type: String
  },
  manufacturerName: {
    type: String // Representative name
  },
  companyAddress: {
    type: String
  },
  country: {
    type: String
  },
  businessRegistrationNumber: {
    type: String
  },
  website: {
    type: String
  },
  companyLogo: {
    type: String
  }
}, { timestamps: true });

// Pre-save hook to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
