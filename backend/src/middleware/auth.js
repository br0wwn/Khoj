// Middleware to check if user is authenticated
exports.requireAuth = (req, res, next) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please login to access this resource.'
    });
  }
  next();
};

// Optional: Middleware to check if user is NOT authenticated (for login/signup pages)
exports.requireGuest = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.status(400).json({
      success: false,
      message: 'You are already logged in'
    });
  }
  next();
};
