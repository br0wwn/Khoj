const SocialShare = require('../models/SocialShare');
const Alert = require('../models/Alert');

// @desc    Track social share
// @route   POST /api/social-shares
// @access  Public (can be anonymous)
exports.trackShare = async (req, res) => {
  try {
    const { alertId, platform, shareUrl } = req.body;
    
    if (!alertId || !platform) {
      return res.status(400).json({
        success: false,
        error: 'Alert ID and platform are required'
      });
    }
    
    // Verify alert exists
    const alert = await Alert.findById(alertId);
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }
    
    // Create share record
    const shareData = {
      alert: alertId,
      platform,
      shareUrl,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      }
    };
    
    // Add user info if authenticated
    if (req.session && req.session.userId) {
      const userModel = req.session.userType === 'police' ? 'Police' : 'User';
      shareData.sharedBy = {
        userId: req.session.userId,
        userType: userModel
      };
    }
    
    const share = await SocialShare.create(shareData);
    
    // Update alert share count
    alert.socialShares.count += 1;
    if (alert.socialShares.platforms[platform] !== undefined) {
      alert.socialShares.platforms[platform] += 1;
    } else {
      alert.socialShares.platforms.other += 1;
    }
    await alert.save();
    
    res.status(201).json({
      success: true,
      data: share,
      message: 'Share tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking share:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get share statistics for an alert
// @route   GET /api/social-shares/alert/:alertId
// @access  Public
exports.getAlertShares = async (req, res) => {
  try {
    const { alertId } = req.params;
    
    const shares = await SocialShare.find({ alert: alertId })
      .sort({ createdAt: -1 })
      .lean();
    
    // Calculate platform distribution
    const platformStats = {};
    shares.forEach(share => {
      platformStats[share.platform] = (platformStats[share.platform] || 0) + 1;
    });
    
    res.json({
      success: true,
      data: {
        totalShares: shares.length,
        shares,
        platformStats
      }
    });
  } catch (error) {
    console.error('Error fetching alert shares:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get user's share history
// @route   GET /api/social-shares/my-shares
// @access  Private
exports.getMyShares = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }
    
    const shares = await SocialShare.find({
      'sharedBy.userId': req.session.userId
    })
      .populate('alert', 'title description location status')
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({
      success: true,
      data: shares
    });
  } catch (error) {
    console.error('Error fetching user shares:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get sharing analytics
// @route   GET /api/social-shares/analytics
// @access  Public
exports.getSharingAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = {};
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const analytics = await SocialShare.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 },
          uniqueAlerts: { $addToSet: '$alert' }
        }
      },
      {
        $project: {
          platform: '$_id',
          count: 1,
          uniqueAlerts: { $size: '$uniqueAlerts' },
          _id: 0
        }
      }
    ]);
    
    const totalShares = analytics.reduce((sum, stat) => sum + stat.count, 0);
    
    res.json({
      success: true,
      data: {
        totalShares,
        byPlatform: analytics
      }
    });
  } catch (error) {
    console.error('Error fetching sharing analytics:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Generate shareable link for alert
// @route   GET /api/social-shares/generate-link/:alertId
// @access  Public
exports.generateShareLink = async (req, res) => {
  try {
    const { alertId } = req.params;
    const { platform } = req.query;
    
    const alert = await Alert.findById(alertId).lean();
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: 'Alert not found'
      });
    }
    
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const alertUrl = `${baseUrl}/alerts/${alertId}`;
    const encodedUrl = encodeURIComponent(alertUrl);
    const encodedTitle = encodeURIComponent(alert.title);
    const encodedDescription = encodeURIComponent(
      alert.description.substring(0, 150) + '...'
    );
    
    let shareUrl = alertUrl;
    
    // Generate platform-specific share URLs
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`;
        break;
      default:
        shareUrl = alertUrl;
    }
    
    res.json({
      success: true,
      data: {
        alertId,
        platform,
        shareUrl,
        alertUrl,
        metadata: {
          title: alert.title,
          description: alert.description,
          location: alert.location
        }
      }
    });
  } catch (error) {
    console.error('Error generating share link:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = exports;
