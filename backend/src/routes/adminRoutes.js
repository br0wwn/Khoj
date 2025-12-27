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

// Update admin settings (admin only)
// PUT /api/admin/settings
router.put('/settings', requireAdminAuth, async (req, res) => {
  try {
    const Admin = require('../models/Admin');
    const { emailNotifications } = req.body;
    
    const admin = await Admin.findById(req.admin._id);
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    // Update settings
    if (typeof emailNotifications !== 'undefined') {
      admin.emailNotifications = emailNotifications;
    }
    
    await admin.save();
    
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        emailNotifications: admin.emailNotifications
      }
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message
    });
  }
});

// Get all approved admin emails (admin only)
// GET /api/admin/approved-admins
router.get('/approved-admins', requireAdminAuth, async (req, res) => {
  try {
    const ApprovedAdmin = require('../models/ApprovedAdmin');
    const approvedAdmins = await ApprovedAdmin.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      message: 'Approved admin emails fetched successfully',
      count: approvedAdmins.length,
      data: approvedAdmins
    });
  } catch (error) {
    console.error('Error fetching approved admins:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching approved admins',
      error: error.message
    });
  }
});

// Add approved admin email (admin only)
// POST /api/admin/approved-admins
router.post('/approved-admins', requireAdminAuth, async (req, res) => {
  try {
    const { email } = req.body;
    const ApprovedAdmin = require('../models/ApprovedAdmin');
    const Admin = require('../models/Admin');
    const emailService = require('../services/emailService');

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email already exists in approved list
    const existingApproved = await ApprovedAdmin.findOne({ email: email.toLowerCase() });
    if (existingApproved) {
      return res.status(400).json({
        success: false,
        message: 'This email is already in the approved admins list'
      });
    }

    // Check if email already has an admin account
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'An admin account with this email already exists'
      });
    }

    // Create approved admin entry
    const approvedAdmin = await ApprovedAdmin.create({
      email: email.toLowerCase(),
      addedBy: req.admin._id,
      addedByName: req.admin.name
    });

    // Send email notification
    try {
      await emailService.sendAdminApprovalEmail(email, req.admin.name);
    } catch (emailError) {
      console.error('Error sending approval email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Email added to approved admins list successfully',
      data: approvedAdmin
    });
  } catch (error) {
    console.error('Error adding approved admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding approved admin',
      error: error.message
    });
  }
});

// Remove approved admin email (admin only)
// DELETE /api/admin/approved-admins/:id
router.delete('/approved-admins/:id', requireAdminAuth, async (req, res) => {
  try {
    const ApprovedAdmin = require('../models/ApprovedAdmin');
    
    const approvedAdmin = await ApprovedAdmin.findById(req.params.id);
    if (!approvedAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Approved admin email not found'
      });
    }

    // Check if email has been used
    if (approvedAdmin.isUsed) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove email that has already been used to create an admin account'
      });
    }

    await ApprovedAdmin.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Approved admin email removed successfully'
    });
  } catch (error) {
    console.error('Error removing approved admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing approved admin',
      error: error.message
    });
  }
});

// Get all users (admin only)
// GET /api/admin/users
router.get('/users', requireAdminAuth, async (req, res) => {
  try {
    const User = require('../models/User');
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      message: 'Users fetched successfully',
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching users',
      error: error.message 
    });
  }
});

// Get all police (admin only)
// GET /api/admin/police
router.get('/police', requireAdminAuth, async (req, res) => {
  try {
    const Police = require('../models/police');
    const police = await Police.find().select('-password').sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      message: 'Police officers fetched successfully',
      count: police.length,
      police
    });
  } catch (error) {
    console.error('Error fetching police:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching police officers',
      error: error.message 
    });
  }
});

// Get single user by ID (admin only)
// GET /api/admin/users/:id
router.get('/users/:id', requireAdminAuth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'User fetched successfully',
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user',
      error: error.message 
    });
  }
});

// Get single police by ID (admin only)
// GET /api/admin/police/:id
router.get('/police/:id', requireAdminAuth, async (req, res) => {
  try {
    const Police = require('../models/police');
    const police = await Police.findById(req.params.id).select('-password');
    
    if (!police) {
      return res.status(404).json({ 
        success: false, 
        message: 'Police officer not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Police officer fetched successfully',
      data: police
    });
  } catch (error) {
    console.error('Error fetching police officer:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching police officer',
      error: error.message 
    });
  }
});

// Get user's alerts (admin only)
// GET /api/admin/users/:id/alerts
router.get('/users/:id/alerts', requireAdminAuth, async (req, res) => {
  try {
    const Alert = require('../models/Alert');
    const alerts = await Alert.find({ 
      'createdBy.userId': req.params.id,
      'createdBy.userType': 'User'
    })
    .populate('createdBy.userId', 'name email profilePicture')
    .sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      message: 'User alerts fetched successfully',
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching user alerts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user alerts',
      error: error.message 
    });
  }
});

// Get police's alerts (admin only)
// GET /api/admin/police/:id/alerts
router.get('/police/:id/alerts', requireAdminAuth, async (req, res) => {
  try {
    const Alert = require('../models/Alert');
    const alerts = await Alert.find({ 
      'createdBy.userId': req.params.id,
      'createdBy.userType': 'Police'
    })
    .populate('createdBy.userId', 'name email rank station')
    .sort({ createdAt: -1 });
    
    res.json({ 
      success: true, 
      message: 'Police alerts fetched successfully',
      count: alerts.length,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching police alerts:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching police alerts',
      error: error.message 
    });
  }
});

// Update user profile (admin only)
// PUT /api/admin/users/:id
router.put('/users/:id', requireAdminAuth, async (req, res) => {
  try {
    const User = require('../models/User');
    const { name, email, bio, dateOfBirth } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, bio, dateOfBirth },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating user',
      error: error.message 
    });
  }
});

// Update police profile (admin only)
// PUT /api/admin/police/:id
router.put('/police/:id', requireAdminAuth, async (req, res) => {
  try {
    const Police = require('../models/police');
    const { name, email, dateOfBirth, rank, department, station, district, phoneNumber, joiningDate } = req.body;
    
    const police = await Police.findByIdAndUpdate(
      req.params.id,
      { name, email, dateOfBirth, rank, department, station, district, phoneNumber, joiningDate },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!police) {
      return res.status(404).json({ 
        success: false, 
        message: 'Police officer not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Police officer updated successfully',
      data: police
    });
  } catch (error) {
    console.error('Error updating police officer:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating police officer',
      error: error.message 
    });
  }
});

// Upload user profile picture (admin only)
// POST /api/admin/users/:id/upload-picture
router.post('/users/:id/upload-picture', requireAdminAuth, async (req, res) => {
  try {
    const upload = require('../middleware/upload');
    const cloudinary = require('../config/cloudinary');
    const User = require('../models/User');
    
    // Use multer middleware
    upload.single('profilePicture')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      // Delete old image if exists
      if (user.profilePicture && user.profilePicture.publicId) {
        await cloudinary.uploader.destroy(user.profilePicture.publicId);
      }
      
      // Upload new image
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'profile_pictures'
      });
      
      user.profilePicture = {
        url: result.secure_url,
        publicId: result.public_id
      };
      
      await user.save();
      
      res.json({ 
        success: true, 
        message: 'Profile picture uploaded successfully',
        profilePicture: user.profilePicture
      });
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading profile picture',
      error: error.message 
    });
  }
});

// Upload police profile picture (admin only)
// POST /api/admin/police/:id/upload-picture
router.post('/police/:id/upload-picture', requireAdminAuth, async (req, res) => {
  try {
    const upload = require('../middleware/upload');
    const cloudinary = require('../config/cloudinary');
    const Police = require('../models/police');
    
    // Use multer middleware
    upload.single('profilePicture')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
      
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }
      
      const police = await Police.findById(req.params.id);
      if (!police) {
        return res.status(404).json({ success: false, message: 'Police officer not found' });
      }
      
      // Delete old image if exists
      if (police.profilePicture && police.profilePicture.publicId) {
        await cloudinary.uploader.destroy(police.profilePicture.publicId);
      }
      
      // Upload new image
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'profile_pictures'
      });
      
      police.profilePicture = {
        url: result.secure_url,
        publicId: result.public_id
      };
      
      await police.save();
      
      res.json({ 
        success: true, 
        message: 'Profile picture uploaded successfully',
        profilePicture: police.profilePicture
      });
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading profile picture',
      error: error.message 
    });
  }
});

// Delete user profile picture (admin only)
// DELETE /api/admin/users/:id/delete-picture
router.delete('/users/:id/delete-picture', requireAdminAuth, async (req, res) => {
  try {
    const cloudinary = require('../config/cloudinary');
    const User = require('../models/User');
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (user.profilePicture && user.profilePicture.publicId) {
      await cloudinary.uploader.destroy(user.profilePicture.publicId);
    }
    
    user.profilePicture = { url: null, publicId: null };
    await user.save();
    
    res.json({ 
      success: true, 
      message: 'Profile picture deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting profile picture',
      error: error.message 
    });
  }
});

// Delete police profile picture (admin only)
// DELETE /api/admin/police/:id/delete-picture
router.delete('/police/:id/delete-picture', requireAdminAuth, async (req, res) => {
  try {
    const cloudinary = require('../config/cloudinary');
    const Police = require('../models/police');
    
    const police = await Police.findById(req.params.id);
    if (!police) {
      return res.status(404).json({ success: false, message: 'Police officer not found' });
    }
    
    if (police.profilePicture && police.profilePicture.publicId) {
      await cloudinary.uploader.destroy(police.profilePicture.publicId);
    }
    
    police.profilePicture = { url: null, publicId: null };
    await police.save();
    
    res.json({ 
      success: true, 
      message: 'Profile picture deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting profile picture',
      error: error.message 
    });
  }
});

// Delete User (admin only)
// DELETE /api/admin/users/:id
router.delete('/users/:id', requireAdminAuth, async (req, res) => {
  try {
    const User = require('../models/User');
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'User deleted successfully',
      deletedUser: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting user',
      error: error.message 
    });
  }
});

// Delete Police (admin only)
// DELETE /api/admin/police/:id
router.delete('/police/:id', requireAdminAuth, async (req, res) => {
  try {
    const Police = require('../models/police');
    const police = await Police.findByIdAndDelete(req.params.id);
    
    if (!police) {
      return res.status(404).json({ 
        success: false, 
        message: 'Police not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Police deleted successfully',
      deletedPolice: {
        id: police._id,
        name: police.name,
        badgeNumber: police.badgeNumber
      }
    });
  } catch (error) {
    console.error('Error deleting police:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting police',
      error: error.message 
    });
  }
});

// Update Alert Status (admin only)
// PUT /api/admin/alerts/:id
router.put('/alerts/:id', requireAdminAuth, async (req, res) => {
  try {
    const Alert = require('../models/Alert');
    const { status } = req.body;

    // Validate status
    const allowedStatuses = ['active', 'resolved', 'archived'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: active, resolved, or archived'
      });
    }

    // Find and update alert
    const alert = await Alert.findById(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ 
        success: false, 
        message: 'Alert not found' 
      });
    }

    // Update status
    alert.status = status;
    await alert.save();

    res.json({ 
      success: true, 
      message: 'Alert status updated successfully',
      data: alert
    });
  } catch (error) {
    console.error('Error updating alert status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating alert status',
      error: error.message 
    });
  }
});

// Delete Alert (admin only)
// DELETE /api/admin/alerts/:id
router.delete('/alerts/:id', requireAdminAuth, async (req, res) => {
  try {
    const Alert = require('../models/Alert');
    const alert = await Alert.findByIdAndDelete(req.params.id);
    
    if (!alert) {
      return res.status(404).json({ 
        success: false, 
        message: 'Alert not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Alert deleted successfully',
      deletedAlert: {
        id: alert._id,
        title: alert.title,
        type: alert.type
      }
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting alert',
      error: error.message 
    });
  }
});

// Delete Report (admin only)
// DELETE /api/admin/reports/:id
router.delete('/reports/:id', requireAdminAuth, async (req, res) => {
  try {
    const Report = require('../models/Report');
    const report = await Report.findByIdAndDelete(req.params.id);
    
    if (!report) {
      return res.status(404).json({ 
        success: false, 
        message: 'Report not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Report deleted successfully',
      deletedReport: {
        id: report._id,
        title: report.title,
        type: report.type
      }
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting report',
      error: error.message 
    });
  }
});

module.exports = router;
