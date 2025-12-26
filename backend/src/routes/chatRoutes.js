const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { requireAuth } = require('../middleware/auth');
const { uploadChatMedia } = require('../middleware/chatUpload');

// All routes require authentication
router.use(requireAuth);

// Start or get conversation
router.post('/conversation', chatController.startConversation);

// Get all conversations for current user
router.get('/conversations', chatController.getConversations);

// Get messages for a conversation
router.get('/conversation/:conversationId/messages', chatController.getMessages);

// Send a message (with optional media)
router.post('/conversation/:conversationId/message', uploadChatMedia.array('media', 10), chatController.sendMessage);

// Mark messages as read
router.put('/conversation/:conversationId/read', chatController.markAsRead);

// Delete conversation
router.delete('/conversation/:conversationId', chatController.deleteConversation);

// Get unread message count
router.get('/unread-count', chatController.getUnreadCount);

module.exports = router;
