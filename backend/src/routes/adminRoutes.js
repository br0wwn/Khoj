const express = require('express');
const router = express.Router();
const { requireAdminAuth } = require('../middleware/adminAuth');

// Example: Protected admin-only route
// GET /api/admin/dashboard
router.get('/dashboard', requireAdminAuth, async (req, res) => {
  try {
    // req.admin contains the authenticated admin object
    res.status(200).json({
      success: true,
      message: 'Admin dashboard data',
      admin: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email
      },
      stats: {
        // Add your dashboard statistics here
        totalUsers: 0,
        totalReports: 0,
        totalAlerts: 0
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
});

// Example: Get all admins (admin only)
// GET /api/admin/list
router.get('/list', requireAdminAuth, async (req, res) => {
  try {
    const Admin = require('../models/Admin');
    const admins = await Admin.find().select('-password');
    
    res.status(200).json({
      success: true,
      message: 'Admins fetched successfully',
      count: admins.length,
      admins
    });
  } catch (error) {
    console.error('Error fetching admins:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching admins'
    });
  }
});

module.exports = router;
