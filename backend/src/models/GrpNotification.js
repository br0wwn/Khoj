const mongoose = require('mongoose');

const grpNotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['group_invitation', 'group_accepted', 'group_rejected', 'group_deleted'],
    default: 'group_invitation'
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  groupName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'read', 'actioned'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  collection: 'grpNotifications'
});

const grpNotification = mongoose.model('GroupNotification', grpNotificationSchema);

module.exports = grpNotification;
