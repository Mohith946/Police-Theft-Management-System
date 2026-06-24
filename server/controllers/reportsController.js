const Complaint = require('../models/Complaint');
const StolenItem = require('../models/StolenItem');
const MatchResult = require('../models/MatchResult');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get dashboard metrics and statistics
 * @route   GET /api/reports/dashboard-stats
 * @access  Private
 */
const getDashboardStats = async (req, res) => {
  try {
    const isStaff = req.user.role === 'officer' || req.user.role === 'admin';
    let query = {};
    if (!isStaff) {
      query.reportedBy = req.user._id;
    }

    // Prepare promises for parallel execution
    const totalPromise = Complaint.countDocuments(query);
    const unresolvedPromise = Complaint.countDocuments({ ...query, status: 'pending' });
    const activePromise = Complaint.countDocuments({
      ...query,
      status: { $in: ['pending', 'investigating'] }
    });
    const recentPromise = Complaint.find(query)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('reportedBy', 'username email');
    const resolvedPromise = Complaint.countDocuments({ ...query, status: { $in: ['resolved', 'closed'] } });

    let stolenPromise = Promise.resolve(0);
    let recoveredPromise = Promise.resolve(0);
    let activeMatchesPromise = Promise.resolve(0);

    if (isStaff) {
      stolenPromise = StolenItem.countDocuments({ status: 'stolen' });
      recoveredPromise = StolenItem.countDocuments({ status: 'recovered' });
      activeMatchesPromise = MatchResult.countDocuments({ status: 'pending' });
    }

    // Resolve all promises concurrently
    const [
      totalComplaints,
      unresolvedReportsCount,
      activeInvestigationsCount,
      recentComplaints,
      resolvedCasesCount,
      stolenCount,
      recoveredCount,
      activeMatchesCount
    ] = await Promise.all([
      totalPromise,
      unresolvedPromise,
      activePromise,
      recentPromise,
      resolvedPromise,
      stolenPromise,
      recoveredPromise,
      activeMatchesPromise
    ]);

    // Average resolution time fallback mock (5.2d)
    let avgResolutionTimeText = 'N/A';
    if (resolvedCasesCount > 0) {
      avgResolutionTimeText = '5.2d'; 
    }

    const clearanceRate = totalComplaints > 0 ? Math.round((resolvedCasesCount / totalComplaints) * 100) : 0;
    const totalItemsCount = stolenCount + recoveredCount;
    const evidenceProcessingRate = totalItemsCount > 0 ? Math.round((recoveredCount / totalItemsCount) * 100) : 0;

    return sendSuccess(res, {
      stats: {
        totalStolen: stolenCount,
        totalRecovered: recoveredCount,
        activeMatches: activeMatchesCount,
        totalComplaints
      },
      activeInvestigationsCount,
      unresolvedReportsCount,
      recoveredAssetsCount: recoveredCount,
      avgResolutionTimeText,
      clearanceRate,
      evidenceProcessingRate,
      recentComplaints
    }, 'Dashboard statistics aggregated successfully');
  } catch (error) {
    console.error('Aggregating dashboard stats error:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Get reports analytics aggregated by category
 * @route   GET /api/reports/analytics
 * @access  Private (Officer/Admin)
 */
const getAnalytics = async (req, res) => {
  try {
    // Group StolenItem collection by category and status
    const aggregation = await StolenItem.aggregate([
      {
        $group: {
          _id: { category: "$category", status: "$status" },
          count: { $sum: 1 },
          totalValue: { $sum: "$estimatedValue" }
        }
      }
    ]);

    let stolenValue = 0;
    let recoveredValue = 0;
    const catMap = {};

    aggregation.forEach(item => {
      const category = item._id.category;
      const status = item._id.status;
      const count = item.count;
      const totalVal = item.totalValue || 0;

      if (status === 'stolen') {
        stolenValue += totalVal;
      } else if (status === 'recovered') {
        recoveredValue += totalVal;
      }

      if (!catMap[category]) {
        catMap[category] = { stolen: 0, recovered: 0 };
      }
      catMap[category][status] = count;
    });

    // Format for Recharts Category classification spread (Pie chart)
    const categoryData = Object.keys(catMap).map(cat => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: (catMap[cat].stolen || 0) + (catMap[cat].recovered || 0)
    }));

    // Format for Recharts Open vs Recovered items (Bar chart)
    const recoveryData = Object.keys(catMap).map(cat => ({
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      Stolen: catMap[cat].stolen || 0,
      Recovered: catMap[cat].recovered || 0
    }));

    return sendSuccess(res, {
      financialStats: {
        stolenValue,
        recoveredValue
      },
      categoryData,
      recoveryData
    }, 'Reports analytics aggregated successfully');
  } catch (error) {
    console.error('Aggregating analytics error:', error);
    return sendError(res, error.message, 500);
  }
};

const getBadgeCounts = async (req, res) => {
  try {
    const isStaff = req.user.role === 'officer' || req.user.role === 'admin';
    let query = {};
    if (!isStaff) {
      query.reportedBy = req.user._id;
    }

    // Run active complaints and pending matches count queries in parallel
    const activeCasesPromise = Complaint.countDocuments({
      ...query,
      status: { $in: ['pending', 'investigating'] }
    });

    const matchPromise = isStaff
      ? MatchResult.countDocuments({ status: 'pending' })
      : Promise.resolve(0);

    const [activeCasesCount, matchCount] = await Promise.all([
      activeCasesPromise,
      matchPromise
    ]);

    return sendSuccess(res, {
      activeCasesCount,
      matchCount
    }, 'Badge counts retrieved successfully');
  } catch (error) {
    console.error('Fetch badge counts error:', error);
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  getDashboardStats,
  getAnalytics,
  getBadgeCounts
};
