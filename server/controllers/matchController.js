const MatchResult = require('../models/MatchResult');
const Verification = require('../models/Verification');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get all matching results sorted by score descending
 * @route   GET /api/matches
 * @access  Private (Officer/Admin)
 */
const getMatchResults = async (req, res) => {
  try {
    const { status, complaintId, criminalId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (complaintId) query.complaintId = complaintId;
    if (criminalId) query.criminalId = criminalId;

    const matches = await MatchResult.find(query)
      .sort({ matchScore: -1 })
      .populate({
        path: 'complaintId',
        select: 'complaintNumber title category status theftLocation theftDate'
      })
      .populate({
        path: 'criminalId',
        select: 'name aliases status physicalFeatures lastKnownLocation photoUrl'
      });

    return sendSuccess(res, matches, 'Matching suspect alerts retrieved successfully');
  } catch (error) {
    console.error('Fetch matches error:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Verify a suspect match and log verification details
 * @route   POST /api/matches/:id/verify
 * @access  Private (Officer/Admin)
 */
const verifyMatch = async (req, res) => {
  try {
    const { notes } = req.body;
    
    if (!notes) {
      return sendError(res, 'Please provide verification comments or action items', 400);
    }

    const match = await MatchResult.findById(req.params.id);
    if (!match) {
      return sendError(res, 'Match alert not found in system', 404);
    }

    if (match.status === 'verified') {
      return sendError(res, 'This match has already been verified', 400);
    }

    // Update match result status
    match.status = 'verified';
    await match.save();

    // Create verification audit log
    const verification = await Verification.create({
      matchResultId: match._id,
      verifiedBy: req.user._id,
      verificationNotes: notes
    });

    return sendSuccess(res, { match, verification }, 'Suspect match verified successfully');
  } catch (error) {
    console.error('Verify match error:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Dismiss a suspect match
 * @route   POST /api/matches/:id/dismiss
 * @access  Private (Officer/Admin)
 */
const dismissMatch = async (req, res) => {
  try {
    const match = await MatchResult.findById(req.params.id);
    if (!match) {
      return sendError(res, 'Match alert not found in system', 404);
    }

    match.status = 'dismissed';
    await match.save();

    return sendSuccess(res, match, 'Suspect match alert dismissed successfully');
  } catch (error) {
    console.error('Dismiss match error:', error);
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  getMatchResults,
  verifyMatch,
  dismissMatch
};
