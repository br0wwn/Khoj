const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');

// All routes require authentication
router.use(requireAuth);

// Update profile (name, bio, dateOfBirth)
router.put('/update', profileController.updateProfile);

// Change password
router.put('/change-password', profileController.changePassword);

// Upload profile picture
router.post('/upload-picture', upload.single('profilePicture'), profileController.uploadProfilePicture);

// Delete profile picture
router.delete('/delete-picture', profileController.deleteProfilePicture);

// Toggle email notifications
router.put('/email-notifications', profileController.toggleEmailNotifications);

// Toggle in-app notifications
router.put('/inapp-notifications', profileController.toggleInAppNotifications);

module.exports = router;
