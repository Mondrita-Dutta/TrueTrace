const Product = require('../models/Product');
const ScanHistory = require('../models/ScanHistory');
const Report = require('../models/Report');

exports.getAnalyticsDashboard = async (req, res) => {
  try {
    const manufacturerId = req.user.id;

    const totalProducts = await Product.countDocuments({ manufacturerId });
    const verifiedProducts = await Product.countDocuments({ manufacturerId, blockchainStatus: 'Verified' });
    const pendingRegistration = await Product.countDocuments({ manufacturerId, blockchainStatus: 'Pending' });

    const totalScans = await ScanHistory.countDocuments({ manufacturerId });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayScans = await ScanHistory.countDocuments({ manufacturerId, scannedAt: { $gte: today } });

    const counterfeitReports = await Report.countDocuments({ manufacturerId });

    // Trend data for the last 7 days for the chart
    const trendData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(date.getDate() + 1);

      const count = await ScanHistory.countDocuments({
        manufacturerId,
        scannedAt: { $gte: date, $lt: nextDate }
      });
      trendData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        scans: count
      });
    }

    return res.success({
      totalProducts,
      verifiedProducts,
      pendingRegistration,
      totalScans,
      todayScans,
      counterfeitReports,
      trendData
    }, 'Analytics fetched successfully');

  } catch (error) {
    console.error('Analytics error:', error);
    return res.error('Failed to fetch analytics', 500);
  }
};

exports.getReports = async (req, res) => {
  try {
    const manufacturerId = req.user.id;
    const reports = await Report.find({ manufacturerId }).sort({ createdAt: -1 });
    return res.success(reports, 'Reports fetched successfully');
  } catch (error) {
    console.error('Reports fetch error:', error);
    return res.error('Failed to fetch reports', 500);
  }
};
