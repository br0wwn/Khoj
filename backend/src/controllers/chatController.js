const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Alert = require('../models/Alert');
const User = require('../models/User');
const Police = require('../models/police');

// Start or get existing conversation
exports.startConversation = async (req, res) => {
    try {
        const { alertId, receiverId, receiverType } = req.body;
        const senderId = req.session.userId;
        const sessionUserType = req.session.userType;

        // Debug logging
        console.log('Session data:', {
            userId: senderId,
            userType: sessionUserType
        });
        console.log('Request body:', req.body);

        // Convert session userType to model userType format
        // Session stores 'citizen' or 'police', but models use 'User' or 'Police'
        const senderType = sessionUserType === 'police' ? 'Police' : 'User';

        console.log('Converted senderType:', senderType);

        // Validate alert exists
        const alert = await Alert.findById(alertId);
        if (!alert) {
            return res.status(404).json({ message: 'Alert not found' });
        }

        // Validate receiver exists
        const ReceiverModel = receiverType === 'Police' ? Police : User;
        const receiver = await ReceiverModel.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        // Check if conversation already exists
        let conversation = await Conversation.findOne({
            alertId,
            $or: [
                {
                    'participants.0.userId': senderId,
                    'participants.1.userId': receiverId
                },
                {
                    'participants.0.userId': receiverId,
                    'participants.1.userId': senderId
                }
            ]
        });

        if (conversation) {
            // Return existing conversation
            return res.status(200).json({
                conversation,
                isNew: false
            });
        }

        // Create new conversation
        conversation = new Conversation({
            participants: [
                { userId: senderId, userType: senderType },
                { userId: receiverId, userType: receiverType }
            ],
            alertId,
            unreadCount: {
                [senderId]: 0,
                [receiverId]: 0
            }
        });

        await conversation.save();

        res.status(201).json({
            conversation,
            isNew: true
        });
    } catch (error) {
        console.error('Start conversation error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all conversations for current user
exports.getConversations = async (req, res) => {
    try {
        const userId = req.session.userId;

        console.log('Getting conversations for user:', userId);

        const conversations = await Conversation.find({
            'participants.userId': userId,
            isActive: true
        })
            .populate('alertId', 'title status district upazila')
            .sort({ updatedAt: -1 });

        console.log('Found conversations:', conversations.length);

        // Manually populate participants based on userType
        const formattedConversations = [];

        for (const conv of conversations) {
            try {
                const otherParticipant = conv.participants.find(
                    p => p.userId.toString() !== userId.toString()
                );

                if (!otherParticipant) {
                    console.warn('No other participant found for conversation:', conv._id);
                    continue;
                }

                // Fetch the user/police data based on userType
                let otherUser;
                if (otherParticipant.userType === 'Police') {
                    otherUser = await Police.findById(otherParticipant.userId).select('name email profilePicture rank station');
                } else {
                    otherUser = await User.findById(otherParticipant.userId).select('name email profilePicture');
                }

                if (!otherUser) {
                    console.warn('Other user not found:', otherParticipant.userId);
                    continue;
                }

                formattedConversations.push({
                    _id: conv._id,
                    alert: conv.alertId,
                    otherUser: otherUser,
                    otherUserType: otherParticipant.userType,
                    lastMessage: conv.lastMessage,
                    unreadCount: conv.unreadCount.get(userId.toString()) || 0,
                    updatedAt: conv.updatedAt
                });
            } catch (err) {
                console.error('Error formatting conversation:', conv._id, err);
            }
        }

        console.log('Formatted conversations:', formattedConversations.length);

        res.status(200).json({ conversations: formattedConversations });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get messages for a conversation
exports.getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.session.userId;
        const { page = 1, limit = 50 } = req.query;

        // Check if user is participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        if (!conversation.isParticipant(userId)) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        // Get messages with pagination
        const messages = await Message.find({
            conversationId,
            isDeleted: false
        })
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .populate('sender.userId', 'name profilePicture rank')
            .populate('receiver.userId', 'name profilePicture rank');

        const total = await Message.countDocuments({
            conversationId,
            isDeleted: false
        });

        res.status(200).json({
            messages: messages.reverse(), // Return in chronological order
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalMessages: total
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Send a message
exports.sendMessage = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { messageText } = req.body;
        const senderId = req.session.userId;
        const sessionUserType = req.session.userType;
        const files = req.files || [];

        // Convert session userType to model userType format
        const senderType = sessionUserType === 'police' ? 'Police' : 'User';

        // Validate message (text or media required)
        if ((!messageText || messageText.trim().length === 0) && files.length === 0) {
            return res.status(400).json({ message: 'Message text or media is required' });
        }

        // Check conversation exists and user is participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        if (!conversation.isParticipant(senderId)) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        // Find receiver
        const receiver = conversation.participants.find(
            p => p.userId.toString() !== senderId.toString()
        );

        // Process uploaded media
        const media = files.map(file => ({
            media_type: file.mimetype.startsWith('image/') ? 'image' : 'video',
            media_url: file.path,
            public_id: file.filename
        }));

        // Create message
        const message = new Message({
            conversationId,
            sender: {
                userId: senderId,
                userType: senderType
            },
            receiver: {
                userId: receiver.userId,
                userType: receiver.userType
            },
            messageText: messageText?.trim() || '',
            media: media
        });

        await message.save();

        // Update conversation
        const currentUnreadCount = conversation.unreadCount.get(receiver.userId.toString()) || 0;
        conversation.unreadCount.set(receiver.userId.toString(), currentUnreadCount + 1);
        conversation.lastMessage = {
            text: messageText.trim(),
            senderId: senderId,
            timestamp: new Date()
        };
        await conversation.save();

        // Populate sender info for response
        await message.populate('sender.userId', 'name profilePicture rank');

        // Emit Socket.IO event for real-time delivery
        const io = global.io;
        const connectedUsers = global.connectedUsers;

        if (io) {
            // Emit to conversation room
            io.to(conversationId).emit('new-message', {
                message,
                conversationId
            });

            // Also emit to receiver directly if they're connected but not in room
            const receiverSocketId = connectedUsers.get(receiver.userId.toString());
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('message-notification', {
                    conversationId,
                    senderId,
                    senderName: req.session.userName || 'Someone',
                    messagePreview: messageText.trim().substring(0, 50)
                });
            }
        }

        res.status(201).json({ message });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.session.userId;

        // Verify user is participant
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        if (!conversation.isParticipant(userId)) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        // Mark all unread messages as read
        const result = await Message.updateMany(
            {
                conversationId,
                'receiver.userId': userId,
                isRead: false
            },
            {
                isRead: true,
                readAt: new Date()
            }
        );

        // Reset unread count for this user
        conversation.unreadCount.set(userId.toString(), 0);
        await conversation.save();

        // Emit Socket.IO event to update read status
        const io = global.io;
        const connectedUsers = global.connectedUsers;

        if (io) {
            // Notify conversation room about read status
            io.to(conversationId).emit('messages-read', {
                conversationId,
                userId
            });

            // Notify the user who read the messages to update their badge
            const userSocketId = connectedUsers.get(userId.toString());
            if (userSocketId) {
                io.to(userSocketId).emit('unread-count-updated');
            }
        }

        res.status(200).json({
            message: 'Messages marked as read',
            updatedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete conversation (soft delete)
exports.deleteConversation = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const userId = req.session.userId;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        if (!conversation.isParticipant(userId)) {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        conversation.isActive = false;
        await conversation.save();

        res.status(200).json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        console.error('Delete conversation error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.session.userId;

        const conversations = await Conversation.find({
            'participants.userId': userId,
            isActive: true
        });

        const totalUnread = conversations.reduce((sum, conv) => {
            return sum + (conv.unreadCount.get(userId.toString()) || 0);
        }, 0);

        res.status(200).json({ unreadCount: totalUnread });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
