const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Simple in-memory user cache with TTL
const userCache = new Map();
const CACHE_TTL = 60 * 1000; // 60 seconds TTL

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key_123456');

      const now = Date.now();
      const cached = userCache.get(decoded.id);

      if (cached && (now - cached.timestamp < CACHE_TTL)) {
        req.user = cached.user;
      } else {
        // Get user from the token, exclude password
        const user = await User.findById(decoded.id).select('-passwordHash');
        
        if (!user) {
          return res.status(401).json({ success: false, message: 'User associated with this token no longer exists' });
        }

        userCache.set(decoded.id, {
          user,
          timestamp: now
        });

        req.user = user;
      }

      next();
    } catch (error) {
      console.error('JWT validation error:', error.message);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
