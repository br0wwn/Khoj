const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth');
const { requireAdminAuth } = require('../middleware/adminAuth');
const {
  createReportToAdmin,
  getAllReportsToAdmin,
  getReportToAdminById,
  updateReportStatus,
  deleteReportToAdmin
} = require('../controllers/reportToAdminController');

// Create a report to admin (any authenticated user - uses session auth)
router.post('/', requireAuth, createReportToAdmin);

// Get all reports to admin (admin only - uses JWT auth)
router.get('/', requireAdminAuth, getAllReportsToAdmin);

// Get single report to admin by ID (admin only - uses JWT auth)
router.get('/:id', requireAdminAuth, getReportToAdminById);

// Update report status (admin only - uses JWT auth)
router.put('/:id/status', requireAdminAuth, updateReportStatus);

// Delete report to admin (admin only - uses JWT auth)
router.delete('/:id', deleteReportToAdmin);

module.exports = router;
