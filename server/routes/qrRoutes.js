const express = require('express');
const router = express.Router();
const { generateItemQRCode, generateComplaintQRCode, generateCriminalQRCode, scanQRCode } = require('../controllers/qrController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All QR-related routes require authentication
router.use(protect);

// Anyone logged in (citizen/officer) can generate/print QR codes
router.get('/generate/:itemId', generateItemQRCode);
router.get('/generate/complaint/:complaintId', generateComplaintQRCode);
router.get('/generate/criminal/:criminalId', generateCriminalQRCode);

// Only officers and admins can scan and process item recovery
router.post('/scan', authorize('officer', 'admin'), scanQRCode);

module.exports = router;
