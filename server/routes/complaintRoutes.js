const express = require('express');
const router = express.Router();
const {
  getComplaints,
  getComplaintById,
  createComplaint,
  updateComplaint,
  deleteComplaint
} = require('../controllers/complaintController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All complaint routes require authentication
router.use(protect);

router.route('/')
  .get(getComplaints)
  .post(createComplaint); // Citizens and officers can both file complaints

router.route('/:id')
  .get(getComplaintById)
  .put(authorize('officer', 'admin'), updateComplaint) // Officer/Admin only
  .delete(authorize('admin'), deleteComplaint); // Admin only

module.exports = router;
