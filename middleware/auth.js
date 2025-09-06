import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes
export const protect = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If you want to support cookie-based token, add cookie-parser and uncomment:
    // if (!token && req.cookies && req.cookies.token) token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No user found for this token'
        });
      }

      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'User account is deactivated'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

// Grant access to specific roles (role-based)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Allow admin OR owner of resource (owner = req.params.id or req.user._id)
export const adminOrSelf = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    // If user is admin => allowed
    if (req.user.role === 'admin') return next();

    // If user is owner of resource => allowed
    const paramId = req.params.id;
    if (paramId && req.user._id.toString() === paramId.toString()) return next();

    // Otherwise forbidden
    return res.status(403).json({
      success: false,
      message: 'User is not authorized to perform this action'
    });
  };
};
