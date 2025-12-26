const Notification = require('../models/Notification');

// @desc    Get all notifications for current user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { unread, type, limit = 50 } = req.query;

    let query = {
      'recipient.userId': req.session.userId
    };

    if (unread === 'true') {
      query.isRead = false;
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    const notifications = await Notification.find(query)
      .populate('relatedAlert', 'title description location')
      .populate('relatedReport', 'title description location')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: notifications,
      count: notifications.length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const count = await Notification.countDocuments({
      'recipient.userId': req.session.userId,
      isRead: false
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        'recipient.userId': req.session.userId
      },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    await Notification.updateMany(
      {
        'recipient.userId': req.session.userId,
        isRead: false
      },
      { isRead: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Create facial recognition notification
// @route   POST /api/notifications/facial-recognition
// @access  Private (Police only)
exports.createFacialRecognitionNotification = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const {
      recipientUserId,
      alertId,
      confidence,
      matchedImageUrl,
      location
    } = req.body;

    if (!recipientUserId || !alertId || !confidence) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const notification = await Notification.create({
      recipient: {
        userId: recipientUserId,
        userType: 'User'
      },
      type: 'facial_recognition',
      title: 'Possible Match Found!',
      message: `There is a ${confidence}% similarity match. This could be your missing person.`,
      relatedAlert: alertId,
      matchData: {
        confidence,
        matchedImageUrl,
        location,
        timestamp: new Date()
      },
      priority: confidence > 80 ? 'urgent' : confidence > 60 ? 'high' : 'medium'
    });

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error creating facial recognition notification:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      'recipient.userId': req.session.userId
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = exports;
