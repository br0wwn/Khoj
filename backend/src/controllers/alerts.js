const Alert = require('../models/Alert');
const cloudinary = require('../config/cloudinary');

// @desc    Get all alerts with optional status filter
// @route   GET /api/alerts
// @access  Public (shows all, but can filter by ownership)
exports.getAllAlerts = async (req, res) => {
  try {
    const { status, mine } = req.query;
    
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // If 'mine=true' and user is authenticated, filter by ownership
    if (mine === 'true' && req.session && req.session.userId) {
      query['createdBy.userId'] = req.session.userId;
    }
    
    const alerts = await Alert.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({
      success: true,
      data: alerts
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single alert by ID
// @route   GET /api/alerts/:id
// @access  Public
exports.getAlertById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const alert = await Alert.findById(id)
      .populate('createdBy.userId', 'name email')
      .lean();
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }
    
    res.json({
      success: true,
      data: alert
    });
  } catch (error) {
    console.error('Error fetching alert:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create a new alert
// @route   POST /api/alerts
// @access  Private (requires authentication)
exports.createAlert = async (req, res) => {
  try {
    // Check authentication
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please login to create alerts.'
      });
    }

    const { title, description, district, upazila, location, contact_info, media, geo } = req.body;
    
    // Validate required fields
    if (!title || !description || !district || !upazila || !location) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, district, upazila, location'
      });
    }
    
    // Determine user model based on userType
    const userModel = req.session.userType === 'police' ? 'Police' : 'User';
    
    // Create new alert with ownership
    const alertData = {
      title,
      description,
      district,
      upazila,
      location,
      contact_info: contact_info || '',
      status: 'active',
      createdBy: {
        userId: req.session.userId,
        userType: userModel
      },
      media: media || []
    };
    
    // Add geo if provided
    if (geo && geo.longitude !== undefined && geo.latitude !== undefined) {
      alertData.geo = {
        longitude: geo.longitude,
        latitude: geo.latitude
      };
    }
    
    const newAlert = new Alert(alertData);
    
    await newAlert.save();
    
    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      alert_id: newAlert._id,
      data: newAlert
    });
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update alert status
// @route   PUT /api/alerts/:id
// @access  Private (owner only)
exports.updateAlertStatus = async (req, res) => {
  try {
    // Check authentication
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { id } = req.params;
    const { status } = req.body;
    
    // Validate status
    const allowedStatuses = ['active', 'resolved', 'archived'];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be: active, resolved, or archived'
      });
    }
    
    // Find alert and check ownership
    const alert = await Alert.findOne({
      _id: id,
      'createdBy.userId': req.session.userId
    });
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found or you do not have permission to update it'
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
    console.error('Error updating alert:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update alert details
// @route   PUT /api/alerts/:id/details
// @access  Private (owner only)
exports.updateAlertDetails = async (req, res) => {
  try {
    // Check authentication
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { id } = req.params;
    const { title, description, district, upazila, location, contact_info, media, geo } = req.body;
    
    // Find alert and check ownership
    const alert = await Alert.findOne({
      _id: id,
      'createdBy.userId': req.session.userId
    });
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found or you do not have permission to update it'
      });
    }
    
    // Update fields
    if (title) alert.title = title;
    if (description) alert.description = description;
    if (district) alert.district = district;
    if (upazila) alert.upazila = upazila;
    if (location) alert.location = location;
    if (contact_info !== undefined) alert.contact_info = contact_info;
    if (media) alert.media = media;
    if (geo && geo.longitude !== undefined && geo.latitude !== undefined) {
      alert.geo = {
        longitude: geo.longitude,
        latitude: geo.latitude
      };
    }
    
    await alert.save();
    
    res.json({
      success: true,
      message: 'Alert details updated successfully',
      data: alert
    });
  } catch (error) {
    console.error('Error updating alert details:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete alert
// @route   DELETE /api/alerts/:id
// @access  Private (owner only)
exports.deleteAlert = async (req, res) => {
  try {
    // Check authentication
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { id } = req.params;
    
    // Find and delete only if user owns it
    const alert = await Alert.findOneAndDelete({
      _id: id,
      'createdBy.userId': req.session.userId
    });
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found or you do not have permission to delete it'
      });
    }
    
    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting alert:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Upload media to alert
// @route   POST /api/alerts/:id/upload-media
// @access  Private (owner only)
exports.uploadAlertMedia = async (req, res) => {
  try {
    // Check authentication
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    // Find alert and check ownership
    const alert = await Alert.findOne({
      _id: id,
      'createdBy.userId': req.session.userId
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found or you do not have permission to update it'
      });
    }

    // Add new media to alert
    const newMedia = req.files.map(file => ({
      media_url: file.path,
      media_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
      is_sensitive: false
    }));

    alert.media.push(...newMedia);
    await alert.save();

    res.status(200).json({
      success: true,
      message: 'Media uploaded successfully',
      data: alert
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete media from alert
// @route   DELETE /api/alerts/:id/media/:mediaIndex
// @access  Private (owner only)
exports.deleteAlertMedia = async (req, res) => {
  try {
    // Check authentication
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { id, mediaIndex } = req.params;

    // Find alert and check ownership
    const alert = await Alert.findOne({
      _id: id,
      'createdBy.userId': req.session.userId
    });

    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found or you do not have permission to update it'
      });
    }

    const index = parseInt(mediaIndex);
    if (index < 0 || index >= alert.media.length) {
      return res.status(404).json({
        success: false,
        error: 'Media not found'
      });
    }

    // Get the media URL to delete from Cloudinary
    const mediaToDelete = alert.media[index];
    const urlParts = mediaToDelete.media_url.split('/');
    const publicIdWithExtension = urlParts.slice(-2).join('/'); // folder/filename.ext
    const publicId = publicIdWithExtension.split('.')[0]; // Remove extension

    try {
      // Delete from Cloudinary
      const resourceType = mediaToDelete.media_type === 'video' ? 'video' : 'image';
      await cloudinary.uploader.destroy(`khoj/alert-media/${publicId.split('/')[1]}`, { 
        resource_type: resourceType 
      });
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError);
      // Continue even if Cloudinary deletion fails
    }

    // Remove from alert
    alert.media.splice(index, 1);
    await alert.save();

    res.json({
      success: true,
      message: 'Media deleted successfully',
      data: alert
    });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
