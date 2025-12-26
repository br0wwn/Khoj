const mongoose = require('mongoose');

const socialShareSchema = new mongoose.Schema({
  alert: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert',
    required: true
  },
  sharedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'sharedBy.userType'
    },
    userType: {
      type: String,
      required: true,
      enum: ['User', 'Police']
    }
  },
  platform: {
    type: String,
    enum: ['facebook', 'twitter', 'whatsapp', 'telegram', 'email', 'copy_link', 'other'],
    required: true
  },
  shareUrl: {
    type: String
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    location: String
  }
}, {
  timestamps: true
});

// Index for analytics
socialShareSchema.index({ alert: 1, createdAt: -1 });
socialShareSchema.index({ platform: 1, createdAt: -1 });
socialShareSchema.index({ 'sharedBy.userId': 1, createdAt: -1 });

module.exports = mongoose.model('SocialShare', socialShareSchema);
