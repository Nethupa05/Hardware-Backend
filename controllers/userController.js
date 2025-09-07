import User from '../models/User.js';
import { sendTokenResponse } from '../utils/jwt.js';

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password, role } = req.body;

    // optional: enforce only admin can create an admin (if you want)
    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      password,
      role
    });

    sendTokenResponse(user, 200, res);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for user (include password)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches (method uses stored password)
    const isMatch = await user.correctPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check active account
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/users/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    // protect middleware attaches req.user (without password)
    const user = await User.findById(req.user._id).select('-password');
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Log user out / clear cookie
// @route   GET /api/users/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private (admin)
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    });
  }
};

// @desc    Update user by admin (or by owner via /me route)
// @route   PUT /api/users/:id
// @access  Private (admin) OR PUT /api/users/me (self)
export const updateUser = async (req, res) => {
  try {
    const allowedFields = ['fullName', 'phoneNumber', 'role', 'isActive'];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Prevent updating password here
    if (req.body.password) {
      return res.status(400).json({
        success: false,
        message: "Use password update route instead"
      });
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
      context: 'query'
    }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Update currently authenticated user's profile
// @route   PUT /api/users/me
// @access  Private (owner)
export const updateMe = async (req, res) => {
  try {
    const userId = req.user._id;

    // Prevent updating role or isActive by normal customers
    const updates = {};
    const allowedForSelf = ['fullName', 'phoneNumber'];
    allowedForSelf.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (req.body.password) {
      return res.status(400).json({
        success: false,
        message: "Use password update route instead"
      });
    }

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
      context: 'query'
    }).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Soft delete user (admin deletes any user)
// @route   DELETE /api/users/:id
// @access  Private (admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "User deleted (soft delete)" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Soft delete own account
// @route   DELETE /api/users/me
// @access  Private (owner)
export const deleteMe = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findByIdAndUpdate(userId, { isActive: false }, { new: true });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, message: "Your account has been deactivated" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get profile (same as getMe, kept for compatibility)
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
