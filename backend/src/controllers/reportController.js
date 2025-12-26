const Report = require('../models/Report');
const cloudinary = require('../config/cloudinary');
const AreaStatistics = require('../models/AreaStatistics');

// @desc    Get all reports
// @route   GET /api/reports
// @access  Public
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate({
        path: 'createdBy.userId',
        select: 'name email'
      })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single report by ID
// @route   GET /api/reports/:id
// @access  Public
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const report = await Report.findById(id)
      .populate({
        path: 'createdBy.userId',
        select: 'name email'
      })
      .lean();
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create a new report
// @route   POST /api/reports
// @access  Public (Both logged in and guest users can create)
exports.createReport = async (req, res) => {
  try {
    const { title, description, location, district, upazila, is_anonymous, media, geo } = req.body;
    
    // Validate required fields
    if (!title || !description || !location || !district || !upazila) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: title, description, location, district, upazila'
      });
    }
    
    // Prepare report data
    const reportData = {
      title,
      description,
      location,
      district,
      upazila,
      media: media || [],
      geo: geo || []
    };
    
    // Add creator information if user is logged in and not posting anonymously
    if (req.session && req.session.userId && !is_anonymous) {
      const userModel = req.session.userType === 'police' ? 'Police' : 'User';
      reportData.createdBy = {
        userId: req.session.userId,
        userType: userModel
      };
    }
    // Note: If is_anonymous is true, createdBy will remain undefined (anonymous report)
    
    // Create new report
    const newReport = new Report(reportData);
    await newReport.save();

    // Update area statistics asynchronously
    updateAreaStatisticsAsync(district, upazila);

    res.status(201).json({
      success: true,
      message: 'Report created successfully',
      data: newReport
    });
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update report
// @route   PUT /api/reports/:id
// @access  Private (Only creator can update, not anonymous reports)
exports.updateReport = async (req, res) => {
  try {
    // Check authentication
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please login to update reports.'
      });
    }

    const { id } = req.params;
    const { title, description, location, district, upazila, status } = req.body;
    
    // Find the report
    const report = await Report.findById(id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    
    // Check if report has a creator (anonymous reports have no createdBy)
    if (!report.createdBy || !report.createdBy.userId) {
      return res.status(403).json({
        success: false,
        error: 'Anonymous reports cannot be updated'
      });
    }
    
    // Check ownership
    if (report.createdBy.userId.toString() !== req.session.userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to update this report'
      });
    }
    
    // Update fields
    if (title) report.title = title;
    if (description) report.description = description;
    if (location) report.location = location;
    if (district) report.district = district;
    if (upazila) report.upazila = upazila;
    if (status) report.status = status;
    
    await report.save();
    
    res.json({
      success: true,
      message: 'Report updated successfully',
      data: report
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private (Only creator can delete, not anonymous reports)
exports.deleteReport = async (req, res) => {
  try {
    // Check authentication
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please login to delete reports.'
      });
    }

    const { id } = req.params;
    
    // Find the report
    const report = await Report.findById(id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    
    // Check if report has a creator (anonymous reports have no createdBy)
    if (!report.createdBy || !report.createdBy.userId) {
      return res.status(403).json({
        success: false,
        error: 'Anonymous reports cannot be deleted'
      });
    }
    
    // Check ownership
    if (report.createdBy.userId.toString() !== req.session.userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this report'
      });
    }
    
    // Delete media from cloudinary if exists
    if (report.media && report.media.length > 0) {
      for (const mediaItem of report.media) {
        if (mediaItem.public_id) {
          try {
            await cloudinary.uploader.destroy(mediaItem.public_id);
          } catch (error) {
            console.error('Error deleting media from cloudinary:', error);
          }
        }
      }
    }
    
    await Report.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Upload media to report
// @route   POST /api/reports/:id/upload-media
// @access  Private (Only creator can upload, not anonymous reports)
exports.uploadReportMedia = async (req, res) => {
  try {
    // Check authentication
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { id } = req.params;
    
    // Find the report
    const report = await Report.findById(id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    
    // Check if report has a creator (anonymous reports have no createdBy)
    if (!report.createdBy || !report.createdBy.userId) {
      return res.status(403).json({
        success: false,
        error: 'Cannot upload media to anonymous reports'
      });
    }
    
    // Check ownership
    if (report.createdBy.userId.toString() !== req.session.userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to upload media to this report'
      });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No media files provided'
      });
    }
    
    // Add new media to report
    const newMedia = req.files.map(file => ({
      media_url: file.path,
      media_type: file.mimetype.startsWith('video/') ? 'video' : 'image',
      public_id: file.filename
    }));
    
    report.media.push(...newMedia);
    await report.save();
    
    res.json({
      success: true,
      message: 'Media uploaded successfully',
      data: report
    });
  } catch (error) {
    console.error('Error uploading media:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete media from report
// @route   DELETE /api/reports/:id/media/:mediaIndex
// @access  Private (Only creator can delete, not anonymous reports)
exports.deleteReportMedia = async (req, res) => {
  try {
    // Check authentication
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { id, mediaIndex } = req.params;
    
    // Find the report
    const report = await Report.findById(id);
    
    if (!report) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }
    
    // Check if report has a creator (anonymous reports have no createdBy)
    if (!report.createdBy || !report.createdBy.userId) {
      return res.status(403).json({
        success: false,
        error: 'Cannot delete media from anonymous reports'
      });
    }
    
    // Check ownership
    if (report.createdBy.userId.toString() !== req.session.userId) {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete media from this report'
      });
    }
    
    const index = parseInt(mediaIndex);
    if (isNaN(index) || index < 0 || index >= report.media.length) {
      return res.status(400).json({
        success: false,
        error: 'Invalid media index'
      });
    }
    
    // Delete from cloudinary
    const mediaItem = report.media[index];
    if (mediaItem.public_id) {
      try {
        await cloudinary.uploader.destroy(mediaItem.public_id);
      } catch (error) {
        console.error('Error deleting from cloudinary:', error);
      }
    }
    
    // Remove from array
    report.media.splice(index, 1);
    await report.save();
    
    res.json({
      success: true,
      message: 'Media deleted successfully',
      data: report
    });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Helper function to update area statistics asynchronously
async function updateAreaStatisticsAsync(district, upazila) {
  try {
    const totalReports = await Report.countDocuments({ district, upazila });

    let stats = await AreaStatistics.findOne({ district, upazila });

    if (!stats) {
      stats = new AreaStatistics({
        district,
        upazila,
        statistics: { totalReports }
      });
    } else {
      stats.statistics.totalReports = totalReports;
    }

    stats.calculateDangerLevel();

    // Update monthly trends
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long' });
    const currentYear = now.getFullYear();

    const existingTrendIndex = stats.monthlyTrends.findIndex(
      t => t.month === currentMonth && t.year === currentYear
    );

    if (existingTrendIndex >= 0) {
      stats.monthlyTrends[existingTrendIndex].reportCount = totalReports;
      stats.monthlyTrends[existingTrendIndex].dangerScore = stats.dangerScore;
    } else {
      stats.monthlyTrends.push({
        month: currentMonth,
        year: currentYear,
        alertCount: stats.statistics.totalAlerts,
        reportCount: totalReports,
        dangerScore: stats.dangerScore
      });

      if (stats.monthlyTrends.length > 12) {
        stats.monthlyTrends = stats.monthlyTrends.slice(-12);
      }
    }

    await stats.save();
  } catch (error) {
    console.error('Error updating area statistics:', error);
  }
}
