const User = require('../models/User');
const Product = require('../models/Product');
const Report = require('../models/Report');
const ScanHistory = require('../models/ScanHistory');
const mongoose = require('mongoose');
const os = require('os');

exports.getSystemAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalManufacturers = await User.countDocuments({ role: 'manufacturer' });
    const totalProducts = await Product.countDocuments();
    const totalVerifications = await ScanHistory.countDocuments();
    const totalReports = await Report.countDocuments();

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalManufacturers,
        totalProducts,
        totalVerifications,
        totalReports
      }
    });
  } catch (error) {
    console.error('Admin Analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('Admin Users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (status === 'suspended') {
      // Hard delete the user and all their products
      await Product.deleteMany({ manufacturerId: req.params.id });
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      
      if (!deletedUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.status(200).json({ success: true, message: 'User and all associated products were permanently deleted' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { status },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.status(200).json({ success: true, data: user, message: `User status updated to ${status}` });
  } catch (error) {
    console.error('Admin Update User error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 }).populate('manufacturerId', 'companyName name');
    res.status(200).json({ success: true, data: reports });
  } catch (error) {
    console.error('Admin Reports error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getSystemHealth = async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    
    const uptime = process.uptime();
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = ((usedMemory / totalMemory) * 100).toFixed(2);

    res.status(200).json({
      success: true,
      data: {
        database: dbStatus,
        uptime: uptime, // in seconds
        memory: {
          total: totalMemory,
          free: freeMemory,
          used: usedMemory,
          usagePercent: memoryUsagePercent
        },
        apiStatus: 'healthy',
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Admin System Health error:', error);
    res.status(500).json({ success: false, message: 'Server error retrieving system health' });
  }
};
