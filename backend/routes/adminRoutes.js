const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.get('/analytics', adminController.getSystemAnalytics);
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/status', adminController.updateUserStatus);
router.get('/health', adminController.getSystemHealth);
router.get('/reports', adminController.getAllReports);

module.exports = router;
