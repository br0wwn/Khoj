const Police = require('../models/police');
const cloudinary = require('../config/cloudinary');
const bcrypt = require('bcryptjs');

// @desc    Update police officer profile
// @route   PUT /api/profile/police/update
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { name, rank, department, station, district, phoneNumber, dateOfBirth, joiningDate } = req.body;
        const policeId = req.session.userId;

        const police = await Police.findById(policeId);
        if (!police) {
            return res.status(404).json({
                success: false,
                message: 'Police officer not found'
            });
        }

        // Update fields if provided
        if (name) police.name = name;
        if (rank) police.rank = rank;
        if (department) police.department = department;
        if (station) police.station = station;
        if (district) police.district = district;
        if (phoneNumber) police.phoneNumber = phoneNumber;
        if (dateOfBirth) police.dateOfBirth = dateOfBirth;
        if (joiningDate) police.joiningDate = joiningDate;

        await police.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            police: {
                id: police._id,
                name: police.name,
                email: police.email,
                policeId: police.policeId,
                badgeNumber: police.badgeNumber,
                rank: police.rank,
                department: police.department,
                station: police.station,
                district: police.district,
                phoneNumber: police.phoneNumber,
                dateOfBirth: police.dateOfBirth,
                joiningDate: police.joiningDate,
                profilePicture: police.profilePicture,
                createdAt: police.createdAt
            }
        });
    } catch (error) {
        console.error('Update police profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Error updating profile'
        });
    }
};

// @desc    Change police officer password
// @route   PUT /api/profile/police/change-password
// @access  Private
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const policeId = req.session.userId;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current password and new password'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        const police = await Police.findById(policeId);
        if (!police) {
            return res.status(404).json({
                success: false,
                message: 'Police officer not found'
            });
        }

        // Verify current password
        const isPasswordValid = await police.comparePassword(currentPassword);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        police.password = newPassword;
        await police.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change police password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password'
        });
    }
};

// @desc    Upload police officer profile picture
// @route   POST /api/profile/police/upload-picture
// @access  Private
exports.uploadProfilePicture = async (req, res) => {
    try {
        const policeId = req.session.userId;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const police = await Police.findById(policeId);
        if (!police) {
            return res.status(404).json({
                success: false,
                message: 'Police officer not found'
            });
        }

        // Delete old profile picture from Cloudinary if exists
        if (police.profilePicture && police.profilePicture.publicId) {
            try {
                await cloudinary.uploader.destroy(police.profilePicture.publicId);
            } catch (error) {
                console.error('Error deleting old image:', error);
            }
        }

        // Update police with new profile picture
        police.profilePicture = {
            url: req.file.path,
            publicId: req.file.filename
        };

        await police.save();

        res.status(200).json({
            success: true,
            message: 'Profile picture uploaded successfully',
            profilePicture: police.profilePicture
        });
    } catch (error) {
        console.error('Upload police profile picture error:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading profile picture'
        });
    }
};

// @desc    Delete police officer profile picture
// @route   DELETE /api/profile/police/delete-picture
// @access  Private
exports.deleteProfilePicture = async (req, res) => {
    try {
        const policeId = req.session.userId;

        const police = await Police.findById(policeId);
        if (!police) {
            return res.status(404).json({
                success: false,
                message: 'Police officer not found'
            });
        }

        // Delete from Cloudinary if exists
        if (police.profilePicture && police.profilePicture.publicId) {
            try {
                await cloudinary.uploader.destroy(police.profilePicture.publicId);
            } catch (error) {
                console.error('Error deleting image from Cloudinary:', error);
            }
        }

        // Remove profile picture from police
        police.profilePicture = {
            url: null,
            publicId: null
        };

        await police.save();

        res.status(200).json({
            success: true,
            message: 'Profile picture deleted successfully'
        });
    } catch (error) {
        console.error('Delete police profile picture error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting profile picture'
        });
    }
};
