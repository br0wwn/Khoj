const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');

// Get statistics for a specific area
router.get('/area', statisticsController.getAreaStatistics);

// Get all statistics by district
router.get('/district/:district', statisticsController.getDistrictStatistics);

// Get top dangerous areas
router.get('/dangerous-areas', statisticsController.getDangerousAreas);

// Get overall statistics
router.get('/overall', statisticsController.getOverallStatistics);

// Get trends data
router.get('/trends', statisticsController.getTrends);

// Update area statistics (system use)
router.post('/update', statisticsController.updateAreaStatistics);

module.exports = router;
