const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'participants.userType'
        },
        userType: {
            type: String,
            required: true,
            enum: ['User', 'Police']
        }
    }],
    alertId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Alert',
        required: true
    },
    lastMessage: {
        text: {
            type: String,
            default: ''
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    },
    unreadCount: {
        type: Map,
        of: Number,
        default: {}
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    collection: 'conversations',
    timestamps: true
});

// Indexes for efficient queries
conversationSchema.index({ 'participants.userId': 1 });
conversationSchema.index({ alertId: 1 });
conversationSchema.index({ updatedAt: -1 });

// Compound index to prevent duplicate conversations between same users for same alert
conversationSchema.index({
    'participants.0.userId': 1,
    'participants.1.userId': 1,
    alertId: 1
}, { unique: true });

// Method to check if user is participant
conversationSchema.methods.isParticipant = function (userId) {
    return this.participants.some(p => p.userId.toString() === userId.toString());
};

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
