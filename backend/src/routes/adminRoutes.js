const express = require('express');
const router = express.Router();
const { requireAdminAuth } = require('../middleware/adminAuth');

// Example: Protected admin-only route
// GET /api/admin/dashboard
router.get('/dashboard', requireAdminAuth, async (req, res) => {
  try {
    const User = require('../models/User');
    const Alert = require('../models/Alert');
    const Police = require('../models/police');
    const ReportToAdmin = require('../models/ReportToAdmin');

    console.log('Fetching dashboard stats...');

    // Get counts from database
    const totalUsers = await User.countDocuments();
    console.log('Total users:', totalUsers);
    
    const totalAlerts = await Alert.countDocuments();
    console.log('Total alerts:', totalAlerts);
    
    const totalPolice = await Police.countDocuments();
    console.log('Total police:', totalPolice);
    
    const pendingReports = await ReportToAdmin.countDocuments({ status: 'pending' });
    console.log('Pending reports:', pendingReports);

    res.status(200).json({
      success: true,
      message: 'Admin dashboard data',
      admin: {
        id: req.admin._id,
        name: req.admin.name,
        email: req.admin.email
      },
      stats: {
        totalUsers,
        pendingReports,
        totalAlerts,
        totalPolice
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
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
