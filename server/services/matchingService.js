const Criminal = require('../models/Criminal');
const Complaint = require('../models/Complaint');
const MatchResult = require('../models/MatchResult');
const { calculateMatchScore } = require('../utils/scoreCalculator');

/**
 * Runs matching algorithm between a single complaint and all active criminals.
 * Stores matches with score >= 40%.
 * 
 * @param {Object} complaint Complaint document
 */
const runMatchingForComplaint = async (complaint) => {
  try {
    console.log(`[MatchingService] Starting matching execution for Complaint: ${complaint.complaintNumber}`);
    
    // Find all active criminals
    const activeCriminals = await Criminal.find({ status: 'active' });
    console.log(`[MatchingService] Found ${activeCriminals.length} active criminals to match against.`);
    
    let matchesCount = 0;

    for (const criminal of activeCriminals) {
      const { score, reasons } = calculateMatchScore(complaint, criminal);
      
      // If score is 40 or higher, record/update the match result
      if (score >= 40) {
        await MatchResult.findOneAndUpdate(
          { complaintId: complaint._id, criminalId: criminal._id },
          {
            matchScore: score,
            matchReason: reasons.join('; '),
            status: 'pending'
          },
          { upsert: true, new: true }
        );
        matchesCount++;
      } else {
        // Remove match result if it was previously above 40 but now isn't
        await MatchResult.findOneAndDelete({ complaintId: complaint._id, criminalId: criminal._id });
      }
    }
    
    console.log(`[MatchingService] Matching complete. Created/updated ${matchesCount} match results.`);
  } catch (err) {
    console.error('[MatchingService Error] Failed to run matching for complaint:', err);
    throw err;
  }
};

/**
 * Runs matching algorithm between a single criminal and all unresolved complaints.
 * 
 * @param {Object} criminal Criminal document
 */
const runMatchingForCriminal = async (criminal) => {
  try {
    console.log(`[MatchingService] Starting matching execution for suspect: ${criminal.name}`);
    if (criminal.status !== 'active') {
      console.log(`[MatchingService] Criminal is not active. Skipping match run.`);
      return;
    }

    // Find all pending or investigating complaints
    const openComplaints = await Complaint.find({ status: { $in: ['pending', 'investigating'] } });
    console.log(`[MatchingService] Found ${openComplaints.length} unresolved complaints to check.`);

    let matchesCount = 0;

    for (const complaint of openComplaints) {
      const { score, reasons } = calculateMatchScore(complaint, criminal);

      if (score >= 40) {
        await MatchResult.findOneAndUpdate(
          { complaintId: complaint._id, criminalId: criminal._id },
          {
            matchScore: score,
            matchReason: reasons.join('; '),
            status: 'pending'
          },
          { upsert: true, new: true }
        );
        matchesCount++;
      } else {
        await MatchResult.findOneAndDelete({ complaintId: complaint._id, criminalId: criminal._id });
      }
    }

    console.log(`[MatchingService] Matching complete. Created/updated ${matchesCount} match results for criminal.`);
  } catch (err) {
    console.error('[MatchingService Error] Failed to run matching for criminal:', err);
    throw err;
  }
};

module.exports = {
  runMatchingForComplaint,
  runMatchingForCriminal
};
