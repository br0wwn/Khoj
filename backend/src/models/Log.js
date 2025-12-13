const mongoose = require('mongoose');

const logMediaSchema = new mongoose.Schema({
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

const logSchema = new mongoose.Schema({
  alert_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alert',
    required: true
  },
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
  media: [logMediaSchema],
  geo: [geoLocationSchema]
}, {
  timestamps: true,
  collection: 'alertLog'
});

// Virtual for created_at and updated_at
logSchema.virtual('created_at').get(function () {
  return this.createdAt;
});

logSchema.virtual('updated_at').get(function () {
  return this.updatedAt;
});

// Ensure virtuals are included in JSON
logSchema.set('toJSON', { virtuals: true });
logSchema.set('toObject', { virtuals: true });

const Log = mongoose.model('Log', logSchema);

module.exports = Log;
