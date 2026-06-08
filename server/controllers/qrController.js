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
 * @desc    Scan QR code token and retrieve item info / execute recovery
 * @route   POST /api/qr/scan
 * @access  Private (Officer/Admin)
 */
const scanQRCode = async (req, res) => {
  try {
    const { token, action, recoveryLocation } = req.body;

    if (!token) {
      return sendError(res, 'Missing QR code token', 400);
    }

    // Find the item matching this unique token
    const item = await StolenItem.findOne({ qrCodeToken: token })
      .populate('complaintId');

    if (!item) {
      return sendError(res, 'No item found matching this QR code token', 404);
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

module.exports = {
  generateItemQRCode,
  scanQRCode
};
