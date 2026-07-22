const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { validationResult } = require('express-validator');
const crypto = require('crypto');
const StellarSdk = require('@stellar/stellar-sdk');

// @desc    Register user (Customer or Manufacturer)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.error('Validation Error', 400, errors.array());
  }

  const { role, email, password, firstName, lastName, phone, companyName, manufacturerName, companyAddress, country, businessRegistrationNumber, website, walletAddress } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.error('User already exists with this email', 400);
    }

    const userData = {
      role,
      email,
      password,
      phone
    };

    if (role === 'customer') {
      userData.firstName = firstName;
      userData.lastName = lastName;
      userData.status = 'active'; // Customers are active immediately
    } else if (role === 'manufacturer') {
      if (!walletAddress) {
        return res.error('Wallet address is required for manufacturer registration', 400);
      }
      
      // Optional: Check if wallet is already registered to another account
      const walletExists = await User.findOne({ walletAddress });
      if (walletExists) {
        return res.error('This wallet address is already registered to an account', 400);
      }

      userData.companyName = companyName;
      userData.manufacturerName = manufacturerName;
      userData.companyAddress = companyAddress;
      userData.country = country;
      userData.businessRegistrationNumber = businessRegistrationNumber;
      userData.website = website;
      userData.walletAddress = walletAddress;
      userData.status = 'active'; // TEMPORARY DEV OVERRIDE: Automatically activate manufacturers (usually 'pending')
    } else {
      return res.error('Invalid role specified', 400);
    }

    const user = await User.create(userData);

    if (user) {
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          _id: user._id,
          role: user.role,
          email: user.email,
          status: user.status,
          firstName: user.firstName,
          lastName: user.lastName,
          companyName: user.companyName,
          phone: user.phone,
          companyAddress: user.companyAddress,
          businessRegistrationNumber: user.businessRegistrationNumber,
          licenseNumber: user.licenseNumber,
          country: user.country,
          website: user.website,
          walletAddress: user.walletAddress,
          token: generateToken(user._id)
        }
      });
    } else {
      res.error('Invalid user data', 400);
    }
  } catch (error) {
    console.error(error);
    res.error('Server error during registration: ' + error.message, 500);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.error('Validation Error', 400, errors.array());
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.error('Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.error('Invalid email or password', 401);
    }

    // TEMPORARY DEV OVERRIDE: Disable pending check
    // if (user.status === 'pending') {
    //   return res.error('Your account is pending admin approval', 403);
    // }
    if (user.status === 'rejected' || user.status === 'suspended') {
      return res.error('Your account is restricted', 403);
    }

    res.success({
      _id: user._id,
      role: user.role,
      email: user.email,
      status: user.status,
      firstName: user.firstName,
      lastName: user.lastName,
      companyName: user.companyName,
      phone: user.phone,
      companyAddress: user.companyAddress,
      businessRegistrationNumber: user.businessRegistrationNumber,
      licenseNumber: user.licenseNumber,
      country: user.country,
      website: user.website,
      walletAddress: user.walletAddress,
      token: generateToken(user._id)
    }, 'Login successful');
  } catch (error) {
    console.error(error);
    res.error('Server error during login', 500);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    // req.user is populated by the protect middleware
    res.success({
      _id: req.user._id,
      role: req.user.role,
      email: req.user.email,
      status: req.user.status,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      companyName: req.user.companyName,
      phone: req.user.phone,
      companyAddress: req.user.companyAddress,
      businessRegistrationNumber: req.user.businessRegistrationNumber,
      licenseNumber: req.user.licenseNumber,
      country: req.user.country,
      website: req.user.website,
      walletAddress: req.user.walletAddress
    });
  } catch (error) {
    console.error(error);
    res.error('Server error fetching profile', 500);
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.error('Please provide current and new password', 400);
  }

  try {
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.error('User not found', 404);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.error('Incorrect current password', 401);
    }

    user.password = newPassword;
    await user.save();

    res.success(null, 'Password updated successfully');
  } catch (error) {
    console.error('Change password error:', error);
    res.error('Server error during password change', 500);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.companyName = req.body.companyName || user.companyName;
      user.phone = req.body.phone || user.phone;
      user.companyAddress = req.body.companyAddress || user.companyAddress;
      user.businessRegistrationNumber = req.body.businessRegistrationNumber || user.businessRegistrationNumber;
      user.licenseNumber = req.body.licenseNumber || user.licenseNumber;
      user.country = req.body.country || user.country;
      user.website = req.body.website || user.website;

      const updatedUser = await user.save();

      res.success({
        _id: updatedUser._id,
        role: updatedUser.role,
        email: updatedUser.email,
        status: updatedUser.status,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        companyName: updatedUser.companyName,
        phone: updatedUser.phone,
        companyAddress: updatedUser.companyAddress,
        businessRegistrationNumber: updatedUser.businessRegistrationNumber,
        licenseNumber: updatedUser.licenseNumber,
        country: updatedUser.country,
        website: updatedUser.website,
        walletAddress: updatedUser.walletAddress
      }, 'Profile updated successfully');
    } else {
      res.error('User not found', 404);
    }
  } catch (error) {
    console.error(error);
    res.error('Server error updating profile', 500);
  }
};

// @desc    Register with wallet (1-Click)
// @route   POST /api/auth/wallet/register
// @access  Public
const walletRegister = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.error('Wallet address is required', 400);
    }

    if (!StellarSdk.StrKey.isValidEd25519PublicKey(walletAddress)) {
      return res.error('Invalid Stellar wallet address', 400);
    }

    let user = await User.findOne({ walletAddress });
    
    if (!user) {
      if (req.body.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) return res.error('Email already in use', 400);
      }

      user = await User.create({
        walletAddress,
        role: req.body.role || 'manufacturer',
        email: req.body.email || undefined,
        password: req.body.password || undefined,
        firstName: req.body.firstName || undefined,
        lastName: req.body.lastName || undefined,
        companyName: req.body.companyName || undefined,
        status: 'active',
      });
    } else {
      // Update existing blank profile with the new registration details
      if (req.body.email && user.email !== req.body.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) return res.error('Email already in use', 400);
      }
      
      user.role = req.body.role || user.role;
      user.email = req.body.email || user.email;
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.companyName = req.body.companyName || user.companyName;
      if (req.body.password) {
        user.password = req.body.password;
      }
      await user.save();
    }

    res.success({
      _id: user._id,
      role: user.role,
      email: user.email,
      status: user.status,
      firstName: user.firstName,
      lastName: user.lastName,
      companyName: user.companyName,
      phone: user.phone,
      companyAddress: user.companyAddress,
      businessRegistrationNumber: user.businessRegistrationNumber,
      licenseNumber: user.licenseNumber,
      country: user.country,
      website: user.website,
      walletAddress: user.walletAddress,
      token: generateToken(user._id)
    }, 'Wallet registration successful');
  } catch (error) {
    console.error(error);
    res.error('Server error during wallet registration', 500);
  }
};

// @desc    Login with wallet (1-Click)
// @route   POST /api/auth/wallet/login
// @access  Public
const walletLogin = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.error('Wallet address is required', 400);
    }

    const user = await User.findOne({ walletAddress });
    if (!user) {
      return res.error('User not found. Please register first.', 404);
    }

    if (user.status === 'rejected' || user.status === 'suspended') {
      return res.error('Your account is restricted', 403);
    }

    res.success({
      _id: user._id,
      role: user.role,
      email: user.email,
      status: user.status,
      firstName: user.firstName,
      lastName: user.lastName,
      companyName: user.companyName,
      phone: user.phone,
      companyAddress: user.companyAddress,
      businessRegistrationNumber: user.businessRegistrationNumber,
      licenseNumber: user.licenseNumber,
      country: user.country,
      website: user.website,
      walletAddress: user.walletAddress,
      token: generateToken(user._id)
    }, 'Wallet login successful');
  } catch (error) {
    console.error(error);
    res.error('Server error during wallet login', 500);
  }
};

module.exports = { register, login, getMe, updateProfile, walletRegister,
  walletLogin,
  changePassword
};
