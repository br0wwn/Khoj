const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    sender: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'sender.userType'
        },
        userType: {
            type: String,
            required: true,
            enum: ['User', 'Police']
        }
    },
    receiver: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'receiver.userType'
        },
        userType: {
            type: String,
            required: true,
            enum: ['User', 'Police']
        }
    },
    messageText: {
        type: String,
        trim: true,
        maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    media: [{
        media_type: {
            type: String,
            enum: ['image', 'video'],
            required: true
        },
        media_url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        }
    }],
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    collection: 'messages',
    timestamps: true
});

// Indexes for efficient queries
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ 'sender.userId': 1 });
messageSchema.index({ 'receiver.userId': 1, isRead: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
