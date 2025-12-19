const Alert = require('../models/Alert');
const Police = require('../models/police');
const cloudinary = require('../config/cloudinary');

/**
 * Add a log entry to an alert (police only)
 */
exports.addLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, location, district, upazila } = req.body || {};

    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Check if user is police
    if (req.session.userType !== 'police') {
      return res.status(403).json({
        success: false,
        error: 'Only police officers can add logs'
      });
    }

    // Validate required field
    if (!description) {
      return res.status(400).json({
        success: false,
        error: 'Description is required'
      });
    }

    // Get police details
    const police = await Police.findById(req.session.userId).select('name');
    if (!police) {
      return res.status(404).json({
        success: false,
        error: 'Police officer not found'
      });
    }

    // Find alert and add log
    const alert = await Alert.findById(id);
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    // Process uploaded media files
    const mediaArray = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const isVideo = file.mimetype.startsWith('video/');
        mediaArray.push({
          media_url: file.path,
          media_type: isVideo ? 'video' : 'image',
          public_id: file.filename
        });
      }
    }

    // Add log entry
    const logEntry = {
      title: title ? title.trim() : '',
      description: description.trim(),
      location: location ? location.trim() : '',
      district: district ? district.trim() : '',
      upazila: upazila ? upazila.trim() : '',
      media: mediaArray,
      geo: [],
      createdBy: {
        policeId: police._id,
        policeName: police.name
      },
      timestamp: new Date()
    };

    alert.logs.push(logEntry);
    await alert.save();

    res.status(201).json({
      success: true,
      message: 'Log added successfully',
      data: logEntry
    });
  } catch (error) {
    console.error('Error adding log:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to add log'
    });
  }
};

/**
 * Get all logs for an alert
 */
exports.getLogs = async (req, res) => {
  try {
    const { id } = req.params;

    const alert = await Alert.findById(id).select('logs');
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }

    res.status(200).json({
      success: true,
      data: alert.logs
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch logs'
    });
  }
};
