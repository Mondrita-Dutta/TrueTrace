const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user to req (excluding password)
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        return res.error('User not found', 401);
      }

      if (req.user.status === 'rejected' || req.user.status === 'suspended') {
        return res.error('Account is restricted', 403);
      }

      next();
    } catch (error) {
      console.error('Auth Error:', error);
      return res.error('Not authorized, token failed', 401);
    }
  } else {
    return res.error('Not authorized, no token provided', 401);
  }
};

module.exports = { protect };
