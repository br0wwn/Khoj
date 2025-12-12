const mongoose = require('mongoose');

const alertMediaSchema = new mongoose.Schema({
  media_url: {
    type: String,
    required: true
  },
  media_type: {
    type: String,
    enum: ['image', 'video'],
    default: 'image'
  },
  is_sensitive: {
    type: Boolean,
    default: false
  }
});

const alertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  upazila: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  contact_info: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'archived'],
    default: 'active'
  },
  createdBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'createdBy.userType'
    },
    userType: {
      type: String,
      required: true,
      enum: ['User', 'Police']
    }
  },
  media: [alertMediaSchema]
}, {
  timestamps: true
});

// Virtual for created_at and updated_at to match old API response
alertSchema.virtual('created_at').get(function() {
  return this.createdAt;
});

alertSchema.virtual('updated_at').get(function() {
  return this.updatedAt;
});

// Ensure virtuals are included in JSON
alertSchema.set('toJSON', { virtuals: true });
alertSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Alert', alertSchema);
