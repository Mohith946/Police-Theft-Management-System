const express = require('express');
const router = express.Router();
const { getDashboardStats, getAnalytics, getBadgeCounts } = require('../controllers/reportsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Authenticate all routes
router.use(protect);

router.get('/dashboard-stats', getDashboardStats);
router.get('/badge-counts', getBadgeCounts);
router.get('/analytics', authorize('officer', 'admin'), getAnalytics);

module.exports = router;
