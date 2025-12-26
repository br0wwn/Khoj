const express = require('express');
const router = express.Router();
const adminAuthController = require('../controllers/adminAuthController');
const { requireAdminAuth, requireAdminGuest } = require('../middleware/adminAuth');

// Public routes
router.post('/signup', requireAdminGuest, adminAuthController.signup);
router.post('/login', requireAdminGuest, adminAuthController.login);

// Protected routes (require admin authentication)
router.get('/me', requireAdminAuth, adminAuthController.getCurrentAdmin);
router.post('/logout', requireAdminAuth, adminAuthController.logout);

module.exports = router;
