const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.use(protect);
router.use(authorize('manufacturer'));

router.get('/', analyticsController.getAnalyticsDashboard);
router.get('/reports', analyticsController.getReports);
router.put('/reports/:id/status', analyticsController.updateReportStatus);

module.exports = router;
