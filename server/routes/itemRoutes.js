const express = require('express');
const router = express.Router();
const {
  getStolenItems,
  getRecoveredItems,
  getItemById,
  updateItemRecovery
} = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All item inventory endpoints require authentication
router.use(protect);

router.get('/stolen', authorize('officer', 'admin'), getStolenItems);
router.get('/recovered', authorize('officer', 'admin'), getRecoveredItems);

router.route('/:id')
  .get(getItemById);

router.put('/:id/recover', authorize('officer', 'admin'), updateItemRecovery);

module.exports = router;
