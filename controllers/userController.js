import User from '../models/User.js';
import { sendTokenResponse } from '../utils/jwt.js';

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { fullName, email, phoneNumber, deliveryAddress, password, role } = req.body;

    // Create user
    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      deliveryAddress,
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
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.correctPassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
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
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
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
export const logout = async (req, res, next) => {
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

// @desc    Get all users (for testing)
// @route   GET /api/users
// @access  Public
export const getUsers = async (req, res, next) => {
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


// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (admin or user himself)
export const updateUser = async (req, res) => {
  try {
    const { fullName, phoneNumber, deliveryAddress, role, isActive } = req.body;

    // Prevent updating password here directly
    if (req.body.password) {
      return res.status(400).json({
        success: false,
        message: "Use password update route instead"
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { fullName, phoneNumber, deliveryAddress, role, isActive },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};



// @desc    Delete user (soft delete)
// @route   DELETE /api/users/:id
// @access  Private (admin only)
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


export const getProfile = async (req, res) => {
  try {
    // Remove password from the response
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