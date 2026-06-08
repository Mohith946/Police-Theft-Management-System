const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key_123456', {
    expiresIn: '30d'
  });
};

/**
 * @desc    Register a new user (Citizens are public; Officers/Admins require an Admin)
 * @route   POST /api/auth/register
 * @access  Public / Protected (conditional)
 */
const register = async (req, res) => {
  try {
    const { username, email, password, role, badgeNumber } = req.body;

    // Enforce email domain restriction
    if (!email || !email.endsWith('@police.gov')) {
      return sendError(res, 'Registration is restricted to official @police.gov email addresses.', 400);
    }

    // Check if user already exists
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return sendError(res, 'User with this email or username already exists', 400);
    }

    // Enforce requester is admin
    if (!req.user || req.user.role !== 'admin') {
      return sendError(res, 'Only administrators can create accounts', 403);
    }

    // Validate role is admin or officer
    if (!role || !['officer', 'admin'].includes(role)) {
      return sendError(res, 'Invalid role specified. Only officer or admin accounts can be created.', 400);
    }

    const assignedRole = role;
    const assignedBadge = role === 'officer' 
      ? (badgeNumber || `BADGE-${Math.floor(1000 + Math.random() * 9000)}`)
      : null;

    // Create user
    const user = await User.create({
      username,
      email,
      passwordHash: password, // Hashing occurs in UserSchema pre-save hook
      role: assignedRole,
      badgeNumber: assignedBadge
    });

    const token = generateToken(user._id);

    return sendSuccess(res, {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      badgeNumber: user.badgeNumber,
      token
    }, 'User registered successfully', 201);
  } catch (error) {
    console.error('Registration error:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Authenticate a user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password, accessCode } = req.body;

    // Enforce email domain restriction
    if (!email || !email.endsWith('@police.gov')) {
      return sendError(res, 'Access restricted to official @police.gov email addresses.', 403);
    }

    // Validate precinct access passcode
    const precinctAccessCode = process.env.PRECINCT_ACCESS_CODE || 'SHIELD-SECURE-2026';
    if (accessCode !== precinctAccessCode) {
      return sendError(res, 'Invalid precinct access passcode', 403);
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const token = generateToken(user._id);

    return sendSuccess(res, {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      badgeNumber: user.badgeNumber,
      token
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    if (!req.user) {
      return sendError(res, 'User profile not found', 404);
    }
    return sendSuccess(res, req.user, 'Profile retrieved successfully');
  } catch (error) {
    console.error('Get profile error:', error);
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  register,
  login,
  getMe
};

/**
 * @desc    Get all users
 * @route   GET /api/auth/users
 * @access  Private (Admin only)
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    return sendSuccess(res, users, 'Users retrieved successfully');
  } catch (error) {
    console.error('Fetch users error:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Update user role
 * @route   PUT /api/auth/users/:id/role
 * @access  Private (Admin only)
 */
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['admin', 'officer'].includes(role)) {
      return sendError(res, 'Invalid role specified', 400);
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Prevent removing the last admin
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return sendError(res, 'Cannot downgrade the only administrator', 400);
      }
    }

    user.role = role;
    if (role === 'officer' && !user.badgeNumber) {
      user.badgeNumber = `BADGE-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    await user.save();
    return sendSuccess(res, user, 'User role updated successfully');
  } catch (error) {
    console.error('Update role error:', error);
    return sendError(res, error.message, 500);
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/auth/users/:id
 * @access  Private (Admin only)
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return sendError(res, 'Cannot delete the only administrator', 400);
      }
    }

    await user.deleteOne();
    return sendSuccess(res, null, 'User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  register,
  login,
  getMe,
  getUsers,
  updateUserRole,
  deleteUser
};
