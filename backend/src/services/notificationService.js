const Notification = require('../models/Notification');
const User = require('../models/User');
const Police = require('../models/police');

// Create notification for new alert
exports.createAlertNotification = async (alert, excludeUserId = null) => {
    try {
        // Get users (all) and police (same district only) - limit to prevent overwhelming
        const [users, police] = await Promise.all([
            User.find({
                _id: { $ne: excludeUserId }
            }).select('_id').limit(200).lean(),
            Police.find({
                district: alert.district,
                _id: { $ne: excludeUserId }
            }).select('_id').limit(200).lean()
        ]);

        const notifications = [];

        // Create notifications for users
        for (const user of users) {
            notifications.push({
                recipient: {
                    userId: user._id,
                    userType: 'User'
                },
                type: 'new_alert',
                title: 'New Alert Posted',
                message: `${alert.title} - ${alert.location}, ${alert.district}`,
                relatedAlert: alert._id
            });
        }

        // Create notifications for police
        for (const officer of police) {
            notifications.push({
                recipient: {
                    userId: officer._id,
                    userType: 'Police'
                },
                type: 'new_alert',
                title: 'New Alert in Your District',
                message: `${alert.title} - ${alert.location}, ${alert.district}`,
                relatedAlert: alert._id
            });
        }

        // Bulk insert
        if (notifications.length > 0) {
            await Notification.insertMany(notifications);
            console.log(`Created ${notifications.length} notifications for new alert`);
        }

        return { success: true, count: notifications.length, users, police };
    } catch (error) {
        console.error('Error creating notifications:', error);
        return { success: false, error: error.message };
    }
};

// Get notifications for a user
exports.getUserNotifications = async (userId, userType, page = 1, limit = 20) => {
    try {
        const skip = (page - 1) * limit;

        const notifications = await Notification.find({
            'recipient.userId': userId,
            'recipient.userType': userType
        })
            .populate('relatedAlert', 'title status location district upazila')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Notification.countDocuments({
            'recipient.userId': userId,
            'recipient.userType': userType
        });

        const unreadCount = await Notification.countDocuments({
            'recipient.userId': userId,
            'recipient.userType': userType,
            isRead: false
        });

        return {
            notifications,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            },
            unreadCount
        };
    } catch (error) {
        console.error('Error fetching notifications:', error);
        throw error;
    }
};

// Mark notification as read
exports.markAsRead = async (notificationId, userId) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            {
                _id: notificationId,
                'recipient.userId': userId
            },
            {
                isRead: true,
                readAt: new Date()
            },
            { new: true }
        );

        return notification;
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (userId, userType) => {
    try {
        const result = await Notification.updateMany(
            {
                'recipient.userId': userId,
                'recipient.userType': userType,
                isRead: false
            },
            {
                isRead: true,
                readAt: new Date()
            }
        );

        return result;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
};

// Get unread count
exports.getUnreadCount = async (userId, userType) => {
    try {
        const count = await Notification.countDocuments({
            'recipient.userId': userId,
            'recipient.userType': userType,
            isRead: false
        });

        return count;
    } catch (error) {
        console.error('Error getting unread count:', error);
        throw error;
    }
};
