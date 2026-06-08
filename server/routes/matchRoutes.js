const express = require('express');
const router = express.Router();
const {
  getMatchResults,
  verifyMatch,
  dismissMatch
} = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All suspect matching routes are private and restricted to officers & admins
router.use(protect);
router.use(authorize('officer', 'admin'));

router.get('/', getMatchResults);
router.post('/:id/verify', verifyMatch);
router.post('/:id/dismiss', dismissMatch);

module.exports = router;
