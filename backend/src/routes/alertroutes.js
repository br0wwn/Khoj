const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alerts');
const logController = require('../controllers/logController');
const { uploadAlertMedia, uploadLogMedia } = require('../middleware/alertUpload');

// Get all alerts with optional status filter
router.get('/', alertController.getAllAlerts);

// Get single alert by ID
router.get('/:id', alertController.getAlertById);

// Create a new alert
router.post('/', alertController.createAlert);

// Update alert status
router.put('/:id', alertController.updateAlertStatus);

// Update alert details (additional endpoint)
router.put('/:id/details', alertController.updateAlertDetails);

// Upload media to alert
router.post('/:id/upload-media', uploadAlertMedia.array('media', 10), alertController.uploadAlertMedia);

// Delete media from alert
router.delete('/:id/media/:mediaIndex', alertController.deleteAlertMedia);

// Delete alert
router.delete('/:id', alertController.deleteAlert);

// Log routes
router.post('/:id/logs', uploadLogMedia.array('media', 10), logController.addLog);
router.get('/:id/logs', logController.getLogs);

module.exports = router;
