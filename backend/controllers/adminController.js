const User = require('../models/User');
const Product = require('../models/Product');
const Report = require('../models/Report');
const ScanHistory = require('../models/ScanHistory');

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
