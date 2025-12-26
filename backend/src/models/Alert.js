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
  geo: {
    longitude: {
      type: Number
    },
    latitude: {
      type: Number
    }
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
  media: [alertMediaSchema],
    socialShares: {
    count: {
      type: Number,
      default: 0
    },
    platforms: {
      facebook: { type: Number, default: 0 },
      twitter: { type: Number, default: 0 },
      whatsapp: { type: Number, default: 0 },
      telegram: { type: Number, default: 0 },
      email: { type: Number, default: 0 },
      other: { type: Number, default: 0 }
    }
  },
  visibility: {
    type: String,
    enum: ['public', 'restricted', 'private'],
    default: 'public'
  },
  logs: [{
    title: {
      type: String,
      trim: true,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    location: {
      type: String,
      trim: true,
      default: ''
    },
    district: {
      type: String,
      trim: true,
      default: ''
    },
    upazila: {
      type: String,
      trim: true,
      default: ''
    },
    media: [{
      media_url: {
        type: String,
        required: true
      },
      media_type: {
        type: String,
        enum: ['image', 'video'],
        default: 'image'
      },
      public_id: {
        type: String
      }
    }],
    geo: [{
      latitude: {
        type: Number,
        required: true
      },
      longitude: {
        type: Number,
        required: true
      }
    }],
    createdBy: {
      policeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Police',
        required: true
      },
      policeName: {
        type: String,
        required: true
      }
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
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
