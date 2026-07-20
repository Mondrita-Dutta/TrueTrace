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

  const { role, email, password, firstName, lastName, phone, companyName, manufacturerName, companyAddress, country, businessRegistrationNumber, website } = req.body;

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
      userData.companyName = companyName;
      userData.manufacturerName = manufacturerName;
      userData.companyAddress = companyAddress;
      userData.country = country;
      userData.businessRegistrationNumber = businessRegistrationNumber;
      userData.website = website;
      userData.status = 'active'; // TEMPORARY DEV OVERRIDE: Automatically activate manufacturers (usually 'pending')
    } else {
      return res.error('Invalid role specified', 400);
    }

    const user = await User.create(userData);

    if (user) {
      res.success({
        _id: user._id,
        role: user.role,
        email: user.email,
        status: user.status,
        firstName: user.firstName,
        lastName: user.lastName,
        companyName: user.companyName,
        token: generateToken(user._id)
      }, 'Registration successful', 201);
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
      country: req.user.country,
      website: req.user.website
    });
  } catch (error) {
    console.error(error);
    res.error('Server error fetching profile', 500);
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
        country: updatedUser.country,
        website: updatedUser.website
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
      walletAddress: user.walletAddress,
      status: user.status,
      firstName: user.firstName,
      lastName: user.lastName,
      companyName: user.companyName,
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
      walletAddress: user.walletAddress,
      status: user.status,
      firstName: user.firstName,
      lastName: user.lastName,
      companyName: user.companyName,
      token: generateToken(user._id)
    }, 'Wallet login successful');
  } catch (error) {
    console.error(error);
    res.error('Server error during wallet login', 500);
  }
};

module.exports = { register, login, getMe, updateProfile, walletRegister, walletLogin };
