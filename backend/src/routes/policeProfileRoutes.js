const express = require('express');
const router = express.Router();
const policeProfileController = require('../controllers/policeProfileController');
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');

// All routes require authentication
router.use(requireAuth);

// Get police profile by ID (public for logged-in users)
router.get('/:id', policeProfileController.getPoliceProfileById);

// Update police profile
router.put('/update', policeProfileController.updateProfile);

// Change password
router.put('/change-password', policeProfileController.changePassword);

// Upload profile picture
router.post('/upload-picture', upload.single('profilePicture'), policeProfileController.uploadProfilePicture);

// Delete profile picture
router.delete('/delete-picture', policeProfileController.deleteProfilePicture);

module.exports = router;
