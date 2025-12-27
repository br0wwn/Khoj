const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Group name is required'],
    trim: true,
    minlength: [2, 'Group name must be at least 2 characters long'],
    maxlength: [100, 'Group name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  district: {
    type: String,
    required: [true, 'District is required'],
    trim: true
  },
  thanaUpazila: {
    type: String,
    required: [true, 'Thana/Upazila is required'],
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'members.userType'
    },
    userType: {
      type: String,
      enum: ['User', 'Police'],
      default: 'User'
    },
    status: {
      type: String,
      enum: ['accepted', 'invited', 'rejected'],
      default: 'accepted'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  highlightedAlerts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert',
    validate: {
      validator: function(alerts) {
        return alerts.length <= 3;
      },
      message: 'Cannot have more than 3 highlighted alerts'
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'groups',
  timestamps: true
});

// Index for efficient queries
groupSchema.index({ district: 1, thanaUpazila: 1 });
groupSchema.index({ 'members.userId': 1 });

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
