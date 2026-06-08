const express = require('express');
const router = express.Router();
const { generateItemQRCode, scanQRCode } = require('../controllers/qrController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All QR-related routes require authentication
router.use(protect);

// Anyone logged in (citizen/officer) can generate/print QR codes for their items
router.get('/generate/:itemId', generateItemQRCode);

// Only officers and admins can scan and process item recovery
router.post('/scan', authorize('officer', 'admin'), scanQRCode);

module.exports = router;
