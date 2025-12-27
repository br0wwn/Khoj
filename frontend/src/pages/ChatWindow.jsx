import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getMessages, sendMessage, markAsRead } from '../services/chatService';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const ChatWindow = () => {
    const { chatId: conversationId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { socket } = useSocket();
    const { user } = useAuth();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [otherUser, setOtherUser] = useState(null);
    const [alert, setAlert] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const messageInputRef = useRef(null);

    useEffect(() => {
        if (location.state?.conversation) {
            setOtherUser(location.state.conversation.otherUser);
            setAlert(location.state.conversation.alert);
        }
        loadMessages();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId]);

    // Join conversation room and listen for real-time events
    useEffect(() => {
        if (!socket || !conversationId) return;

        socket.emit('join-conversation', conversationId);

        // Listen for new messages
        socket.on('new-message', (data) => {
            if (data.conversationId === conversationId) {
                setMessages(prev => [...prev, data.message]);
                scrollToBottom();
                // Mark as read if we're viewing the conversation
                markAsRead(conversationId).catch(err => console.error('Failed to mark as read:', err));
            }
        });

        // Listen for typing indicators
        socket.on('user-typing', ({ userId }) => {
            if (String(userId) !== String(user.id)) {
                setIsTyping(true);
            }
        });

        socket.on('user-stop-typing', ({ userId }) => {
            if (String(userId) !== String(user.id)) {
                setIsTyping(false);
            }
        });

        // Listen for messages read
        socket.on('messages-read', ({ userId }) => {
            if (String(userId) !== String(user.id)) {
                // Update message read status in UI
                setMessages(prev =>
                    prev.map(msg =>
                        String(msg.sender.userId._id || msg.sender.userId) === String(user.id)
                            ? { ...msg, isRead: true }
                            : msg
                    )
                );
            }
        });

        return () => {
            socket.emit('leave-conversation', conversationId);
            socket.off('new-message');
            socket.off('user-typing');
            socket.off('user-stop-typing');
            socket.off('messages-read');
        };
    }, [socket, conversationId, user]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        scrollToBottom();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages]);

    // Mark messages as read when viewing
    useEffect(() => {
        const markMessagesRead = async () => {
            if (conversationId && messages.length > 0) {
                try {
                    await markAsRead(conversationId);
                } catch (error) {
                    console.error('Failed to mark messages as read:', error);
                }
            }
        };
        markMessagesRead();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId, messages.length]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadMessages = async () => {
        try {
            setLoading(true);
            const data = await getMessages(conversationId);
            setMessages(data.messages || []);
        } catch (error) {
            console.error('Failed to load messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const getFilePreview = (file) => {
        return URL.createObjectURL(file);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!newMessage.trim() && selectedFiles.length === 0) || sending) return;

        try {
            setSending(true);

            // Send message with media files (empty string if no text)
            await sendMessage(conversationId, newMessage.trim() || '', selectedFiles);

            // Message will be added via socket event
            setNewMessage('');
            setSelectedFiles([]);

            // Keep focus on input
            setTimeout(() => {
                messageInputRef.current?.focus();
            }, 0);

            // Stop typing indicator
            if (socket) {
                socket.emit('stop-typing', {
                    conversationId,
                    userId: user._id
                });
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);

        if (!socket) return;

        // Emit typing event
        socket.emit('typing', {
            conversationId,
            userId: user._id
        });

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 1 second of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop-typing', {
                conversationId,
                userId: user._id
            });
        }, 1000);
    };

    const formatMessageTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Loading messages...</div>
            </div>
        );
    }

    return (
        <div className="flex flex-col max-w-4xl mx-auto" style={{ height: 'calc(100vh - 4rem)', marginTop: '4rem' }}>
            {/* Chat Header */}
            <div className="bg-white border-b px-3 py-2 flex items-center space-x-3 flex-shrink-0">
                <button
                    onClick={() => navigate('/chat')}
                    className="text-gray-600 hover:text-gray-900"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 19l-7-7 7-7"
                        />
                    </svg>
                </button>

                {otherUser && (
                    <>
                        {otherUser.profilePicture?.url ? (
                            <img
                                src={otherUser.profilePicture.url}
                                alt={otherUser.name}
                                className="w-10 h-10 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                {otherUser.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1">
                            <h2 className="font-semibold text-gray-900">{otherUser.name}</h2>
                            {alert && (
                                <p className="text-xs text-gray-500">Re: {alert.title}</p>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message, index) => {
                    // Safely handle sender data that might be null or incomplete
                    const senderId = message.sender?.userId?._id || message.sender?.userId;
                    const senderName = message.sender?.userId?.name || 'Unknown';
                    const senderPicture = message.sender?.userId?.profilePicture?.url;
                    
                    if (!senderId) return null; // Skip messages with no sender data
                    
                    const isOwnMessage = String(senderId) === String(user?.id);
                    const showAvatar =
                        index === 0 ||
                        (messages[index - 1]?.sender?.userId?._id !== senderId);

                    return (
                        <div
                            key={message._id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''
                                    }`}
                            >
                                {showAvatar && !isOwnMessage && (
                                    <div className="flex-shrink-0">
                                        {senderPicture ? (
                                            <img
                                                src={senderPicture}
                                                alt={senderName}
                                                className="w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs">
                                                {senderName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex flex-col space-y-2">
                                    {/* Display media if present - outside the bubble */}
                                    {message.media && message.media.length > 0 && (
                                        <div className="space-y-2">
                                            {message.media.map((item, idx) => (
                                                <div key={idx} className="rounded overflow-hidden">
                                                    {item.media_type === 'image' ? (
                                                        <img
                                                            src={item.media_url}
                                                            alt="Shared media"
                                                            className="max-w-full h-auto rounded cursor-pointer"
                                                            onClick={() => window.open(item.media_url, '_blank')}
                                                        />
                                                    ) : (
                                                        <video
                                                            src={item.media_url}
                                                            controls
                                                            className="max-w-full h-auto rounded"
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Display text if present - inside the bubble */}
                                    {message.messageText && (
                                        <div
                                            className={`rounded-lg px-4 py-2 ${isOwnMessage
                                                ? 'bg-green-600 text-white'
                                                : 'bg-white text-gray-900 border'
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap break-words">
                                                {message.messageText}
                                            </p>
                                            <div
                                                className={`flex items-center justify-end space-x-1 mt-1 text-xs ${isOwnMessage ? 'text-green-100' : 'text-gray-500'
                                                    }`}
                                            >
                                                <span>{formatMessageTime(message.createdAt)}</span>
                                                {isOwnMessage && (
                                                    <span>
                                                        {message.isRead ? (
                                                            <svg
                                                                className="w-4 h-4"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                                                <path d="M12.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-1-1a1 1 0 011.414-1.414l.293.293 7.293-7.293a1 1 0 011.414 0z" />
                                                            </svg>
                                                        ) : (
                                                            <svg
                                                                className="w-4 h-4"
                                                                fill="currentColor"
                                                                viewBox="0 0 20 20"
                                                            >
                                                                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                                            </svg>
                                                        )}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white border rounded-lg px-4 py-2">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t px-3 py-2 flex-shrink-0">
                {/* File Previews */}
                {selectedFiles.length > 0 && (
                    <div className="mb-2 flex gap-2 flex-wrap">
                        {selectedFiles.map((file, index) => (
                            <div key={index} className="relative group">
                                {file.type.startsWith('image/') ? (
                                    <img
                                        src={getFilePreview(file)}
                                        alt={`Preview ${index + 1}`}
                                        className="w-16 h-16 object-cover rounded border"
                                    />
                                ) : (
                                    <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center">
                                        <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFile(index)}
                                    className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <label htmlFor="file-upload" className="cursor-pointer text-gray-500 hover:text-gray-700">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <input
                            id="file-upload"
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={sending}
                        />
                    </label>
                    <input
                        ref={messageInputRef}
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="Type a message..."
                        className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        disabled={sending}
                    />
                    <button
                        type="submit"
                        disabled={(!newMessage.trim() && selectedFiles.length === 0) || sending}
                        className="bg-green-600 text-white rounded-full p-2 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                        </svg>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
