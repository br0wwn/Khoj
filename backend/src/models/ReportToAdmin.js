const mongoose = require('mongoose');

const reportToAdminSchema = new mongoose.Schema({
  reportid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'reportModel'
  },
  reportModel: {
    type: String,
    required: true,
    enum: ['User', 'Police', 'Alert', 'Group', 'Report']
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  details: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true,
  collection: 'reportsToAdmin'
});

module.exports = mongoose.model('ReportToAdmin', reportToAdminSchema);