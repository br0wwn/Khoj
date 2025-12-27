import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConversations } from '../services/chatService';
import { useSocket } from '../context/SocketContext';

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
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading conversations...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Messages</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {conversations.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <svg
                        className="mx-auto h-12 w-12 text-gray-400"
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
                    <p className="mt-4 text-gray-600">No conversations yet</p>
                    <p className="mt-2 text-sm text-gray-500">
                        Start chatting by messaging alert creators from the feed
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {conversations.map((conversation) => (
                        <div
                            key={conversation._id}
                            onClick={() => handleConversationClick(conversation)}
                            className="bg-white border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start space-x-3 flex-1">
                                    {/* Profile Picture */}
                                    <div className="flex-shrink-0">
                                        {conversation.otherUser?.profilePicture?.url ? (
                                            <img
                                                src={conversation.otherUser.profilePicture.url}
                                                alt={conversation.otherUser.name}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                                {conversation.otherUser?.name?.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Conversation Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-900 truncate">
                                                {conversation.otherUser?.name}
                                            </h3>
                                            <span className="text-xs text-gray-500 ml-2">
                                                {formatTimestamp(conversation.lastMessage?.timestamp)}
                                            </span>
                                        </div>

                                        {conversation.otherUserType === 'Police' && (
                                            <span className="text-xs text-blue-600 font-medium">
                                                {conversation.otherUser?.rank} • {conversation.otherUser?.station}
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
                                        <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-600 rounded-full">
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
    );
};

export default Chat;
