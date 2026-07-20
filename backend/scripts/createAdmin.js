const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Check if superadmin already exists
    const existingAdmin = await User.findOne({ email: 'mondritadebayan123@gmail.com' });
    if (existingAdmin) {
      // If it exists, update it to be superadmin and update the password
      existingAdmin.role = 'superadmin';
      existingAdmin.password = 'Mon@1234';
      await existingAdmin.save();
      console.log('Successfully updated existing account to superadmin: mondritadebayan123@gmail.com');
      process.exit(0);
    }

    const admin = new User({
      email: 'mondritadebayan123@gmail.com',
      password: 'Mon@1234',
      role: 'superadmin',
      firstName: 'Mondrita',
      lastName: 'Debayan'
    });

    await admin.save();
    console.log('Successfully created superadmin account: mondritadebayan123@gmail.com');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();
