const mongoose = require('mongoose');

const approvedAdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  addedByName: {
    type: String,
    required: true
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  usedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  collection: 'approvedadmins'
});

// Index for faster email lookups
approvedAdminSchema.index({ email: 1 });

const ApprovedAdmin = mongoose.model('ApprovedAdmin', approvedAdminSchema);

module.exports = ApprovedAdmin;
