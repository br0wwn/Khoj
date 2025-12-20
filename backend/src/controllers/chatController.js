const ChatMessage = require('../models/ChatMessage');
const Group = require('../models/Group');
const User = require('../models/User');

// Send a message to a group (with optional media)
exports.sendMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { message } = req.body;
    const userId = req.session.userId;

    if (!message && !req.file) {
      return res.status(400).json({ success: false, message: 'Message or media is required' });
    }

    // Verify user is a member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const isMember = group.members.some(
      m => m.userId.toString() === userId && m.status === 'accepted'
    );

    if (!isMember) {
      return res.status(403).json({ success: false, message: 'You are not a member of this group' });
    }

    // Get sender's name
    const user = await User.findById(userId).select('name');
    const senderName = user ? user.name : 'Unknown';

    // Determine media type
    let mediaUrl = null;
    let mediaType = null;
    if (req.file) {
      mediaUrl = req.file.path;
      mediaType = req.file.mimetype.startsWith('video') ? 'video' : 'image';
    }

    // Create and save message
    const chatMessage = new ChatMessage({
      groupId,
      senderId: userId,
      senderName,
      message: message ? message.trim() : '',
      mediaUrl,
      mediaType
    });

    await chatMessage.save();

    res.status(201).json({
      success: true,
      data: chatMessage,
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get messages for a group
exports.getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { limit = 50, skip = 0 } = req.query;
    const userId = req.session.userId;

    // Verify user is a member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const isMember = group.members.some(m => m.userId.toString() === userId);
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'You are not a member of this group' });
    }

    // Fetch messages, ordered by newest first
    const messages = await ChatMessage.find({ groupId })
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();

    // Reverse to get chronological order
    const orderedMessages = messages.reverse();

    // Get total count for pagination
    const totalCount = await ChatMessage.countDocuments({ groupId });

    res.json({
      success: true,
      data: orderedMessages,
      pagination: {
        skip: parseInt(skip),
        limit: parseInt(limit),
        total: totalCount
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
