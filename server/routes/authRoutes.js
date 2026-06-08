const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe,
  getUsers,
  updateUserRole,
  deleteUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Route for register (restricted to administrators only)
router.post('/register', protect, authorize('admin'), register);

// Route for login
router.post('/login', login);

// Route for getting current user info
router.get('/me', protect, getMe);

// Admin-only user management routes
router.route('/users')
  .get(protect, authorize('admin'), getUsers);

router.route('/users/:id/role')
  .put(protect, authorize('admin'), updateUserRole);

router.route('/users/:id')
  .delete(protect, authorize('admin'), deleteUser);

module.exports = router;
