const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'recipient.userType'
    },
    userType: {
      type: String,
      required: true,
      enum: ['User', 'Police']
    }
  },
  type: {
    type: String,
    enum: ['facial_recognition', 'alert_update', 'report_update', 'general'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedAlert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert'
  },
  relatedReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  },
  matchData: {
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    matchedImageUrl: String,
    location: String,
    timestamp: Date
  },
  isRead: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ 'recipient.userId': 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
