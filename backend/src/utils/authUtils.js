/**
 * Shared authentication utilities for both User and Police authentication
 */

/**
 * Create a session for authenticated user
 * @param {Object} req - Express request object
 * @param {String} userId - User/Police ID
 * @param {String} userType - 'citizen' or 'police'
 */
exports.createSession = (req, userId, userType) => {
  req.session.userId = userId;
  req.session.userType = userType;
};

/**
 * Destroy session and clear cookies
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Promise} - Resolves when session is destroyed
 */
exports.destroySession = (req, res) => {
  return new Promise((resolve, reject) => {
    // Get session ID before destroying
    const sessionId = req.sessionID;
    
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return reject(err);
      }
      
      // Clear the session cookie
      res.clearCookie('connect.sid', {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
      });
      
      console.log(`Session ${sessionId} destroyed and removed from database`);
      resolve();
    });
  });
};

/**
 * Validate required fields for signup
 * @param {Object} fields - Object containing field values
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} - { isValid: boolean, message: string }
 */
exports.validateRequiredFields = (fields, requiredFields) => {
  const missingFields = requiredFields.filter(field => !fields[field]);
  
  if (missingFields.length > 0) {
    return {
      isValid: false,
      message: `Please provide all required fields: ${missingFields.join(', ')}`
    };
  }
  
  return { isValid: true };
};

/**
 * Validate password strength
 * @param {String} password - Password to validate
 * @returns {Object} - { isValid: boolean, message: string }
 */
exports.validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      message: 'Password is required'
    };
  }
  
  if (password.length < 6) {
    return {
      isValid: false,
      message: 'Password must be at least 6 characters long'
    };
  }
  
  return { isValid: true };
};

/**
 * Validate email format
 * @param {String} email - Email to validate
 * @returns {Object} - { isValid: boolean, message: string }
 */
exports.validateEmail = (email) => {
  if (!email) {
    return {
      isValid: false,
      message: 'Email is required'
    };
  }
  
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Please enter a valid email address'
    };
  }
  
  return { isValid: true };
};

/**
 * Validate login credentials
 * @param {String} email - Email address
 * @param {String} password - Password
 * @returns {Object} - { isValid: boolean, message: string }
 */
exports.validateLoginCredentials = (email, password) => {
  if (!email || !password) {
    return {
      isValid: false,
      message: 'Please provide email and password'
    };
  }
  
  return { isValid: true };
};

/**
 * Format user response (remove sensitive data)
 * @param {Object} user - User or Police document
 * @param {String} userType - 'citizen' or 'police'
 * @returns {Object} - Formatted user object
 */
exports.formatUserResponse = (user, userType = 'citizen') => {
  if (userType === 'police') {
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      policeId: user.policeId,
      badgeNumber: user.badgeNumber,
      rank: user.rank,
      department: user.department,
      station: user.station,
      district: user.district,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      joiningDate: user.joiningDate,
      profilePicture: user.profilePicture,
      verified: user.verified,
      createdAt: user.createdAt
    };
  }
  
  // Citizen user
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    dateOfBirth: user.dateOfBirth,
    bio: user.bio,
    profilePicture: user.profilePicture,
    createdAt: user.createdAt
  };
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Error message
 * @param {Error} error - Optional error object for logging
 */
exports.sendErrorResponse = (res, statusCode, message, error = null) => {
  if (error) {
    console.error(`Error: ${message}`, error);
  }
  
  res.status(statusCode).json({
    success: false,
    message
  });
};

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Success message
 * @param {Object} data - Additional data to send
 */
exports.sendSuccessResponse = (res, statusCode, message, data = {}) => {
  res.status(statusCode).json({
    success: true,
    message,
    ...data
  });
};
