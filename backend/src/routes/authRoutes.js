const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);

// Protected routes
router.post('/logout', requireAuth, authController.logout);
router.get('/me', requireAuth, authController.getCurrentUser);

module.exports = router;
