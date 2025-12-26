const express = require('express');
const router = express.Router();
const socialShareController = require('../controllers/socialShareController');

// Track social share
router.post('/', socialShareController.trackShare);

// Get share statistics for an alert
router.get('/alert/:alertId', socialShareController.getAlertShares);

// Get user's share history
router.get('/my-shares', socialShareController.getMyShares);

// Get sharing analytics
router.get('/analytics', socialShareController.getSharingAnalytics);

// Generate shareable link for alert
router.get('/generate-link/:alertId', socialShareController.generateShareLink);

module.exports = router;
