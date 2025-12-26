const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const { requireAuth } = require('../middleware/auth');

// All routes require authentication
router.use(requireAuth);

// Get user notifications
router.get('/', async (req, res) => {
    try {
        const userId = req.session.userId;
        const userType = req.session.userType === 'police' ? 'Police' : 'User';
        const { page = 1, limit = 20 } = req.query;

        const result = await notificationService.getUserNotifications(
            userId,
            userType,
            parseInt(page),
            parseInt(limit)
        );

        res.status(200).json(result);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get unread count
router.get('/unread-count', async (req, res) => {
    try {
        const userId = req.session.userId;
        const userType = req.session.userType === 'police' ? 'Police' : 'User';

        const count = await notificationService.getUnreadCount(userId, userType);

        res.status(200).json({ unreadCount: count });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Mark notification as read
router.put('/:notificationId/read', async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.session.userId;

        const notification = await notificationService.markAsRead(notificationId, userId);

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json({ message: 'Notification marked as read', notification });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Mark all notifications as read
router.put('/read-all', async (req, res) => {
    try {
        const userId = req.session.userId;
        const userType = req.session.userType === 'police' ? 'Police' : 'User';

        const result = await notificationService.markAllAsRead(userId, userType);

        res.status(200).json({
            message: 'All notifications marked as read',
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
