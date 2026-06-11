const StolenItem = require('../models/StolenItem');
const qrService = require('../services/qrService');
const { sendSuccess, sendError } = require('../utils/responseHandler');

/**
 * @desc    Get QR code image data URL for a stolen item
 * @route   GET /api/qr/generate/:itemId
 * @access  Private
 */
const generateItemQRCode = async (req, res) => {
  try {
    const item = await StolenItem.findById(req.params.itemId);
    if (!item) {
      return sendError(res, 'Item not found in database', 404);
    }

    // Generate the Base64 QR code image using its unique token
    const qrCodeDataURL = await qrService.generateQRCodeDataURL(item.qrCodeToken);

    return sendSuccess(res, {
      itemId: item._id,
      itemName: item.itemName,
      qrCodeToken: item.qrCodeToken,
      qrCodeDataURL
    }, 'QR Code data URL generated successfully');
  } catch (error) {
    console.error('QR code generation error:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Get QR code image data URL for a complaint
 * @route   GET /api/qr/generate/complaint/:complaintId
 * @access  Private
 */
const generateComplaintQRCode = async (req, res) => {
  try {
    const Complaint = require('../models/Complaint');
    const complaint = await Complaint.findById(req.params.complaintId);
    if (!complaint) {
      return sendError(res, 'Complaint record not found', 404);
    }

    // Generate the Base64 QR code image using its unique token
    const qrCodeDataURL = await qrService.generateQRCodeDataURL(complaint.qrCodeToken);

    return sendSuccess(res, {
      complaintId: complaint._id,
      complaintNumber: complaint.complaintNumber,
      qrCodeToken: complaint.qrCodeToken,
      qrCodeDataURL
    }, 'Complaint QR Code data URL generated successfully');
  } catch (error) {
    console.error('Complaint QR code generation error:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Scan QR code token and retrieve item/complaint info / suspect history
 * @route   POST /api/qr/scan
 * @access  Private (Officer/Admin)
 */
const scanQRCode = async (req, res) => {
  try {
    const { token, action, recoveryLocation } = req.body;

    if (!token) {
      return sendError(res, 'Missing QR code token', 400);
    }

    // 1. Check if this is a Complaint QR token
    if (token.startsWith('QR-COMP-')) {
      const Complaint = require('../models/Complaint');
      const MatchResult = require('../models/MatchResult');

      const complaint = await Complaint.findOne({ qrCodeToken: token })
        .populate('reportedBy', 'username email');

      if (!complaint) {
        return sendError(res, 'No complaint found matching this QR code token', 404);
      }

      const items = await StolenItem.find({ complaintId: complaint._id });

      // Find similarity matches for this complaint
      const matches = await MatchResult.find({ complaintId: complaint._id })
        .populate('criminalId')
        .sort({ matchScore: -1 });

      // For each match, retrieve the criminal's history (other matches)
      const matchesWithHistory = [];
      for (const match of matches) {
        if (match.criminalId) {
          const history = await MatchResult.find({
            criminalId: match.criminalId._id,
            complaintId: { $ne: complaint._id } // exclude current case
          })
            .populate('complaintId', 'complaintNumber title category status')
            .sort({ createdAt: -1 });

          matchesWithHistory.push({
            match,
            criminal: match.criminalId,
            history
          });
        }
      }

      return sendSuccess(res, {
        type: 'complaint',
        complaint,
        items,
        matches: matchesWithHistory
      }, 'Complaint QR Code scanned successfully');
    }

    // 2. Check if this is a Criminal QR token
    if (token.startsWith('QR-CRIM-')) {
      const Criminal = require('../models/Criminal');
      const MatchResult = require('../models/MatchResult');

      const criminal = await Criminal.findOne({ qrCodeToken: token });
      if (!criminal) {
        return sendError(res, 'No criminal profile found matching this QR code token', 404);
      }

      // Retrieve criminal's caseload/history
      const history = await MatchResult.find({ criminalId: criminal._id })
        .populate('complaintId', 'complaintNumber title category status')
        .sort({ createdAt: -1 });

      return sendSuccess(res, {
        type: 'criminal',
        criminal,
        history
      }, 'Criminal QR Code scanned successfully');
    }

    // 3. Fallback to StolenItem QR token
    const item = await StolenItem.findOne({ qrCodeToken: token })
      .populate('complaintId');

    if (!item) {
      return sendError(res, 'No item or complaint found matching this QR code token', 404);
    }

    // Optional: Directly mark as recovered during scan
    if (action === 'recover') {
      if (item.status === 'recovered') {
        return sendSuccess(res, item, 'Item has already been marked as recovered');
      }

      if (!recoveryLocation) {
        return sendError(res, 'Recovery location is required to recover this item', 400);
      }

      item.status = 'recovered';
      item.recoveryLocation = recoveryLocation;
      item.recoveredDate = new Date();
      await item.save(); // Triggers Mongoose post-save hooks to resolve complaint if applicable

      return sendSuccess(res, item, 'Item scanned and marked as RECOVERED successfully');
    }

    return sendSuccess(res, item, 'QR Code scanned successfully. Item retrieved.');
  } catch (error) {
    console.error('Scan QR code error:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Get QR code image data URL for a criminal
 * @route   GET /api/qr/generate/criminal/:criminalId
 * @access  Private
 */
const generateCriminalQRCode = async (req, res) => {
  try {
    const Criminal = require('../models/Criminal');
    const criminal = await Criminal.findById(req.params.criminalId);
    if (!criminal) {
      return sendError(res, 'Criminal record not found', 404);
    }

    if (!criminal.qrCodeToken) {
      criminal.qrCodeToken = qrService.generateCriminalToken();
      await criminal.save();
    }

    // Generate the Base64 QR code image using its unique token
    const qrCodeDataURL = await qrService.generateQRCodeDataURL(criminal.qrCodeToken);

    return sendSuccess(res, {
      criminalId: criminal._id,
      name: criminal.name,
      qrCodeToken: criminal.qrCodeToken,
      qrCodeDataURL
    }, 'Criminal QR Code data URL generated successfully');
  } catch (error) {
    console.error('Criminal QR code generation error:', error);
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  generateItemQRCode,
  generateComplaintQRCode,
  generateCriminalQRCode,
  scanQRCode
};
