const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { uploadAlertMedia } = require('../middleware/alertUpload');

// Get all reports
router.get('/', reportController.getAllReports);

// Get single report by ID
router.get('/:id', reportController.getReportById);

// Create a new report (public - both logged in and guest users)
router.post('/', reportController.createReport);

// Update report (private - only creator, not anonymous)
router.put('/:id', reportController.updateReport);

// Upload media to report (private - only creator, not anonymous)
router.post('/:id/upload-media', uploadAlertMedia.array('media', 10), reportController.uploadReportMedia);

// Delete media from report (private - only creator, not anonymous)
router.delete('/:id/media/:mediaIndex', reportController.deleteReportMedia);

// Delete report (private - only creator)
router.delete('/:id', reportController.deleteReport);

module.exports = router;
