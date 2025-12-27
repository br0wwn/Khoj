const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in environment variables');
  }
  return jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @desc    Register a new admin
// @route   POST /api/admin/auth/signup
// @access  Public (should be restricted in production)
exports.signup = async (req, res) => {
  try {
    const { name, email, phoneNumber, dateOfBirth, password, referredBy } = req.body;

    // Validate required fields
    if (!name || !email || !phoneNumber || !dateOfBirth || !password || !referredBy) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, phoneNumber, dateOfBirth, password, referredBy'
      });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if email is in the approved admins list
    const ApprovedAdmin = require('../models/ApprovedAdmin');
    const approvedEmail = await ApprovedAdmin.findOne({ email: email.toLowerCase() });
    
    if (!approvedEmail) {
      return res.status(403).json({
        success: false,
        message: 'This email is not approved for admin registration. Please contact an existing administrator.'
      });
    }

    // Check if email has already been used
    if (approvedEmail.isUsed) {
      return res.status(400).json({
        success: false,
        message: 'This email has already been used to create an admin account'
      });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin with this email already exists'
      });
    }

    // Create new admin
    const admin = await Admin.create({
      name,
      email,
      phoneNumber,
      dateOfBirth,
      password,
      referredBy
    });

    // Mark the approved email as used
    approvedEmail.isUsed = true;
    approvedEmail.usedAt = new Date();
    await approvedEmail.save();

    // Generate JWT token
    const token = generateToken(admin._id);

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
        dateOfBirth: admin.dateOfBirth,
        referredBy: admin.referredBy,
        emailNotifications: admin.emailNotifications,
        createdAt: admin.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Error registering admin:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error registering admin'
    });
  }
};

// @desc    Login admin
// @route   POST /api/admin/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate credentials
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find admin by email (need to include password for comparison)
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = generateToken(admin._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
        dateOfBirth: admin.dateOfBirth,
        referredBy: admin.referredBy,
        emailNotifications: admin.emailNotifications,
        createdAt: admin.createdAt
      },
      token
    });
  } catch (error) {
    console.error('Error logging in admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in'
    });
  }
};

// @desc    Get current admin
// @route   GET /api/admin/auth/me
// @access  Private (requires admin token)
exports.getCurrentAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id);

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Admin data fetched successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        phoneNumber: admin.phoneNumber,
        dateOfBirth: admin.dateOfBirth,
        referredBy: admin.referredBy,
        emailNotifications: admin.emailNotifications,
        createdAt: admin.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admin data'
    });
  }
};

// @desc    Logout admin (client-side token removal)
// @route   POST /api/admin/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    // With JWT, logout is handled on the client side by removing the token
    // This endpoint can be used for logging purposes
    res.status(200).json({
      success: true,
      message: 'Logout successful. Please remove the token from client.'
    });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging out'
    });
  }
};
