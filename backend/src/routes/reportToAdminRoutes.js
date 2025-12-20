const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const {
  createReportToAdmin,
  getAllReportsToAdmin,
  getReportToAdminById,
  updateReportStatus,
  deleteReportToAdmin
} = require('../controllers/reportToAdminController');

// All routes require authentication
router.use(requireAuth);

// Create a report to admin (any authenticated user)
router.post('/', createReportToAdmin);

// Get all reports to admin (admin only - add admin middleware later)
router.get('/', getAllReportsToAdmin);

// Get single report to admin by ID (admin only - add admin middleware later)
router.get('/:id', getReportToAdminById);

// Update report status (admin only - add admin middleware later)
router.put('/:id/status', updateReportStatus);

// Delete report to admin (admin only - add admin middleware later)
router.delete('/:id', deleteReportToAdmin);

module.exports = router;
