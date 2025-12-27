import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConversations } from '../services/chatService';
import { useSocket } from '../context/SocketContext';
import { ConversationSkeleton } from '../components/SkeletonLoader';

const Chat = () => {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { socket } = useSocket();
    const navigate = useNavigate();

    useEffect(() => {
        loadConversations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Listen for new messages
    useEffect(() => {
        if (!socket) return;

        socket.on('message-notification', (data) => {
            // Reload conversations to update last message
            loadConversations();
        });

        socket.on('unread-count-updated', () => {
            // Reload conversations to update unread counts
            loadConversations();
        });

        return () => {
            socket.off('message-notification');
            socket.off('unread-count-updated');
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket]);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const data = await getConversations();
            setConversations(data.conversations || []);
        } catch (err) {
            setError(err.message || 'Failed to load conversations');
        } finally {
            setLoading(false);
        }
    };

    const handleConversationClick = (conversation) => {
        navigate(`/chat/${conversation._id}`, {
            state: { conversation }
        });
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="mb-8">
                        <div className="h-10 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
                        <div className="h-5 w-64 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <ConversationSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent mb-2">Messages</h1>
                    <p className="text-gray-600">Stay connected with your community</p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {conversations.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-green-100 rounded-full mb-4">
                            <svg
                                className="h-10 w-10 text-blue-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                />
                            </svg>
                        </div>
                        <p className="mt-4 text-xl font-semibold text-gray-800">No conversations yet</p>
                        <p className="mt-2 text-gray-600">
                            Start chatting by messaging alert creators from the feed
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {conversations.map((conversation) => (
                            <div
                                key={conversation._id}
                                onClick={() => handleConversationClick(conversation)}
                                className="bg-white rounded-xl shadow-sm hover:shadow-lg border border-gray-100 p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start space-x-4 flex-1">
                                        {/* Profile Picture */}
                                        <div className="flex-shrink-0">
                                            <div className="p-0.5 rounded-full bg-gradient-to-br from-blue-500 to-green-500">
                                                {conversation.otherUser?.profilePicture?.url ? (
                                                    <img
                                                        src={conversation.otherUser.profilePicture.url}
                                                        alt={conversation.otherUser.name}
                                                        className="w-14 h-14 rounded-full object-cover border-2 border-white"
                                                    />
                                                ) : (
                                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white font-bold text-lg">
                                                        {conversation.otherUser?.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Conversation Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-bold text-gray-900 text-lg truncate">
                                                    {conversation.otherUser?.name}
                                                </h3>
                                                <span className="text-xs text-gray-500 ml-3 flex-shrink-0">
                                                    {formatTimestamp(conversation.lastMessage?.timestamp)}
                                                </span>
                                            </div>

                                            {conversation.otherUserType === 'Police' && (
                                                <span className="inline-flex items-center text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium mb-1">
                                                    👮 {conversation.otherUser?.rank} • {conversation.otherUser?.station}
                                                </span>
                                            )}

                                            <p className="text-sm text-gray-600 mt-1 truncate">
                                                Re: {conversation.alert?.title}
                                            </p>

                                            <p className="text-sm text-gray-500 mt-1 truncate">
                                                {conversation.lastMessage?.text || 'No messages yet'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Unread Badge */}
                                    {conversation.unreadCount > 0 && (
                                        <div className="ml-2 flex-shrink-0">
                                            <span className="inline-flex items-center justify-center w-7 h-7 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg">
                                                {conversation.unreadCount}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
