import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({});
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { socket } = useSocket();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        loadNotifications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated]);

    // Listen for new notifications via Socket.IO
    useEffect(() => {
        if (!socket) return;

        const handleNewNotification = () => {
            // Reload notifications when new one arrives
            loadNotifications(pagination.page || 1);
        };

        socket.on('new-notification', handleNewNotification);

        return () => {
            socket.off('new-notification', handleNewNotification);
        };
    }, [socket, pagination.page]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadNotifications = async (page = 1) => {
        try {
            setLoading(true);
            const data = await getNotifications(page);
            setNotifications(data.notifications);
            setPagination(data.pagination);
            setUnreadCount(data.unreadCount);
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = async (notification) => {
        // Mark as read if unread
        if (!notification.isRead) {
            try {
                await markAsRead(notification._id);
                // Update local state
                setNotifications(prev =>
                    prev.map(n =>
                        n._id === notification._id ? { ...n, isRead: true } : n
                    )
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                console.error('Failed to mark as read:', error);
            }
        }

        // Navigate to related content
        if (notification.relatedAlert) {
            navigate(`/alerts/${notification.relatedAlert._id}`);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const notifDate = new Date(date);
        const diffMs = now - notifDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return notifDate.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading notifications...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl" style={{ marginTop: '4rem' }}>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Notifications</h1>
                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <p className="text-gray-600">No notifications yet</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifications.map((notification) => (
                        <div
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow ${!notification.isRead ? 'border-l-4 border-blue-500' : ''
                                }`}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-900">
                                            {notification.title}
                                        </h3>
                                        {!notification.isRead && (
                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        )}
                                    </div>
                                    <p className="text-gray-700 mb-2">{notification.message}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>{formatTime(notification.createdAt)}</span>
                                        {notification.relatedAlert && (
                                            <span className="text-blue-600">
                                                View Alert →
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => loadNotifications(page)}
                            className={`px-4 py-2 rounded ${page === pagination.page
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;
