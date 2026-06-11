const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  googleLogin,
  getMe,
  getUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Route for register (restricted to administrators only)
router.post('/register', protect, authorize('admin'), register);

// Route for login
router.post('/login', login);
router.post('/google-login', googleLogin);

// Route for getting current user info
router.get('/me', protect, getMe);

// Admin-only user management routes
router.route('/users')
  .get(protect, authorize('admin'), getUsers);

router.route('/users/:id/role')
  .put(protect, authorize('admin'), updateUserRole);

router.route('/users/:id/status')
  .put(protect, authorize('admin'), updateUserStatus);

router.route('/users/:id')
  .delete(protect, authorize('admin'), deleteUser);

module.exports = router;
