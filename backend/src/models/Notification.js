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
        required: true,
        enum: ['new_alert', 'alert_update', 'message', 'report']
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
    relatedConversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    }
}, {
    collection: 'notifications',
    timestamps: true
});

// Indexes
notificationSchema.index({ 'recipient.userId': 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
