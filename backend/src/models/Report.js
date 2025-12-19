const mongoose = require('mongoose');

const reportMediaSchema = new mongoose.Schema({
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
});

const geoLocationSchema = new mongoose.Schema({
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  }
}, { _id: false });

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true,
    trim: true
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
  media: [reportMediaSchema],
  geo: [geoLocationSchema],
  createdBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'createdBy.userType'
    },
    userType: {
      type: String,
      enum: ['User', 'Police']
    }
  }
}, {
  timestamps: true,
  collection: 'reports'
});

// Virtual for created_at and updated_at
reportSchema.virtual('created_at').get(function () {
  return this.createdAt;
});

reportSchema.virtual('updated_at').get(function () {
  return this.updatedAt;
});

// Ensure virtuals are included in JSON
reportSchema.set('toJSON', { virtuals: true });
reportSchema.set('toObject', { virtuals: true });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
