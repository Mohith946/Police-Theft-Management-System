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
    const { email, password } = req.body;

    // Enforce email domain restriction
    if (!email || !email.endsWith('@police.gov')) {
      return sendError(res, 'Access restricted to official @police.gov email addresses.', 403);
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    // Check account status approval
    if (user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        status: user.status,
        message: user.status === 'denied' 
          ? 'Access Denied: Your account has been rejected by an administrator.'
          : 'Access Denied: Your account is pending administrator approval.'
      });
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
 * @desc    Google OAuth login & auto-provisioning
 * @route   POST /api/auth/google-login
 * @access  Public
 */
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return sendError(res, 'Google ID token is required', 400);
    }

    // Verify token with Google's endpoint using native fetch
    const ticket = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
    if (!ticket.ok) {
      const errorData = await ticket.json().catch(() => ({}));
      return sendError(res, errorData.error_description || 'Invalid Google token', 400);
    }

    const payload = await ticket.json();
    const googleClientId = process.env.GOOGLE_CLIENT_ID || '1023024125198-fv94ng719e75v08ot46rig8hkgd4tqnj.apps.googleusercontent.com';

    // Verify audience matches our client ID
    if (payload.aud !== googleClientId) {
      return sendError(res, 'Google token audience mismatch', 400);
    }

    const { email, name } = payload;
    if (!email) {
      return sendError(res, 'Email not provided by Google account', 400);
    }

    // Find user by email
    let user = await User.findOne({ email });

    if (!user) {
      // Auto-provision user as 'officer'
      // Generate unique username based on name or email
      let baseUsername = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '') : email.split('@')[0];
      if (!baseUsername) baseUsername = 'officer';
      
      let username = baseUsername;
      let counter = 1;
      while (await User.findOne({ username })) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      // Generate random badge number
      const badgeNumber = `BADGE-${Math.floor(1000 + Math.random() * 9000)}`;

      // Generate random secure password string (min 6 characters)
      const randomPassword = Math.random().toString(36).substring(2, 12);

      user = await User.create({
        username,
        email,
        passwordHash: randomPassword,
        role: 'officer',
        badgeNumber
      });
    }

    // Check account status approval
    if (user.status !== 'approved') {
      return res.status(403).json({
        success: false,
        status: user.status,
        message: user.status === 'denied' 
          ? 'Access Denied: Your account has been rejected by an administrator.'
          : 'Access Denied: Your account is pending administrator approval.'
      });
    }

    // Generate JWT token
    const localToken = generateToken(user._id);

    return sendSuccess(res, {
      token: localToken,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        badgeNumber: user.badgeNumber
      }
    }, 'Google authentication successful');
  } catch (error) {
    console.error('Google login controller error:', error);
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

/**
 * @desc    Update user status (approve/deny access)
 * @route   PUT /api/auth/users/:id/status
 * @access  Private (Admin only)
 */
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['pending', 'approved', 'denied'].includes(status)) {
      return sendError(res, 'Invalid status specified', 400);
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    // Prevent changing own status
    if (user._id.toString() === req.user._id.toString()) {
      return sendError(res, 'Cannot change status of your own account', 400);
    }

    user.status = status;
    await user.save();
    return sendSuccess(res, user, `User status updated to ${status} successfully`);
  } catch (error) {
    console.error('Update status error:', error);
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  getMe,
  getUsers,
  updateUserRole,
  updateUserStatus,
  deleteUser
};
