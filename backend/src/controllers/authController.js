const User = require('../models/User');
const authUtils = require('../utils/authUtils');

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, password, dateOfBirth, bio } = req.body;

    // Validate required fields
    const fieldsValidation = authUtils.validateRequiredFields(
      { name, email, password, dateOfBirth },
      ['name', 'email', 'password', 'dateOfBirth']
    );
    if (!fieldsValidation.isValid) {
      return authUtils.sendErrorResponse(res, 400, fieldsValidation.message);
    }

    // Validate password
    const passwordValidation = authUtils.validatePassword(password);
    if (!passwordValidation.isValid) {
      return authUtils.sendErrorResponse(res, 400, passwordValidation.message);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return authUtils.sendErrorResponse(res, 400, 'User with this email already exists');
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      dateOfBirth,
      bio: bio || ''
    });

    // Create session
    await authUtils.createSession(req, user._id, 'citizen');

    authUtils.sendSuccessResponse(res, 201, 'User registered successfully', {
      user: authUtils.formatUserResponse(user, 'citizen')
    });
  } catch (error) {
    authUtils.sendErrorResponse(res, 500, error.message || 'Error registering user', error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate credentials
    const credentialsValidation = authUtils.validateLoginCredentials(email, password);
    if (!credentialsValidation.isValid) {
      return authUtils.sendErrorResponse(res, 400, credentialsValidation.message);
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return authUtils.sendErrorResponse(res, 401, 'Invalid email or password');
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return authUtils.sendErrorResponse(res, 401, 'Invalid email or password');
    }

    // Create session
    await authUtils.createSession(req, user._id, 'citizen');

    console.log('✅ Login successful for user:', user.email);
    console.log('   Session ID:', req.sessionID);
    console.log('   Session data:', req.session);

    authUtils.sendSuccessResponse(res, 200, 'Login successful', {
      user: authUtils.formatUserResponse(user, 'citizen')
    });
  } catch (error) {
    authUtils.sendErrorResponse(res, 500, 'Error logging in', error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    await authUtils.destroySession(req, res);
    authUtils.sendSuccessResponse(res, 200, 'Logout successful');
  } catch (error) {
    authUtils.sendErrorResponse(res, 500, 'Error logging out', error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');

    if (!user) {
      return authUtils.sendErrorResponse(res, 404, 'User not found');
    }

    authUtils.sendSuccessResponse(res, 200, 'User data fetched successfully', {
      user: authUtils.formatUserResponse(user, 'citizen')
    });
  } catch (error) {
    authUtils.sendErrorResponse(res, 500, 'Error fetching user data', error);
  }
};
