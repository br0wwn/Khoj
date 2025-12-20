const express = require('express');
const router = express.Router();
const policeAuthController = require('../controllers/policeAuthController');
const { requireAuth } = require('../middleware/auth');

// Public routes
router.post('/signup', policeAuthController.signup);
router.post('/login', policeAuthController.login);

// Protected routes
router.post('/logout', requireAuth, policeAuthController.logout);
router.get('/me', requireAuth, policeAuthController.getCurrentPolice);

module.exports = router;
