import React, { useState, useEffect, useRef, useCallback } from 'react';
import chatService from '../services/grpChatService';

const GroupChat = ({ groupId, currentUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const previousMessagesLength = useRef(0);
  const isInitialLoad = useRef(true);

  const loadMessages = useCallback(async () => {
    try {
      setError(null);
      const response = await chatService.getGroupMessages(groupId);
      if (response.success) {
        console.log('Current User ID:', currentUser);
        console.log('Sample message senderId:', response.data[0]?.senderId);
        setMessages(response.data);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      if (!loading) {
        setError('Failed to load messages');
      }
    } finally {
      setLoading(false);
    }
  }, [groupId, loading, currentUser]);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
    // Poll for new messages every 2 seconds
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [groupId, loadMessages]);

  // Scroll to bottom only when new messages arrive (not on initial load)
  useEffect(() => {
    if (isInitialLoad.current) {
      // Skip auto-scroll on initial load
      isInitialLoad.current = false;
      previousMessagesLength.current = messages.length;
    } else if (messages.length > previousMessagesLength.current) {
      // Only scroll if new messages were added
      scrollToBottom();
      previousMessagesLength.current = messages.length;
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only images and videos are allowed.');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const clearFileSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() && !selectedFile) {
      return;
    }

    setSending(true);
    setError(null);

    try {
      const response = await chatService.grpSendMessage(groupId, newMessage.trim(), selectedFile);
      if (response.success) {
        setNewMessage('');
        clearFileSelection();
        setMessages([...messages, response.data]);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-white rounded-lg shadow">
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-gray-500">Loading chat...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => {
            const msgSenderId = typeof msg.senderId === 'object' ? msg.senderId?._id : msg.senderId;
            const isCurrentUser = msgSenderId === currentUser;
            
            console.log('Message senderId:', msgSenderId, 'Current User:', currentUser, 'Match:', isCurrentUser);
            
            return (
            <div
              key={msg._id}
              className={`flex ${
                isCurrentUser ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  isCurrentUser
                    ? 'bg-[#8E1616] text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {!isCurrentUser && (
                  <div className="text-sm font-semibold opacity-75">
                    {msg.senderName}
                  </div>
                )}

                {/* Display Media */}
                {msg.mediaUrl && (
                  <div className="mb-2">
                    {msg.mediaType === 'image' ? (
                      <img
                        src={msg.mediaUrl}
                        alt="shared media"
                        className="rounded max-w-xs h-auto"
                      />
                    ) : msg.mediaType === 'video' ? (
                      <video
                        src={msg.mediaUrl}
                        controls
                        className="rounded max-w-xs h-auto"
                      />
                    ) : null}
                  </div>
                )}

                {/* Display Text */}
                {msg.message && (
                  <div className="text-sm break-words">{msg.message}</div>
                )}

                <div
                  className={`text-xs mt-1 ${
                    isCurrentUser
                      ? 'text-red-100'
                      : 'text-gray-500'
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error message */}
      {error && (
        <div className="px-6 py-2 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Media Preview */}
      {previewUrl && (
        <div className="px-6 py-2 bg-gray-100 border-t">
          <div className="flex items-center gap-2">
            {selectedFile.type.startsWith('image') ? (
              <img
                src={previewUrl}
                alt="preview"
                className="h-16 w-16 object-cover rounded"
              />
            ) : (
              <div className="h-16 w-16 bg-gray-400 rounded flex items-center justify-center text-white text-xs">
                Video
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-700">{selectedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={clearFileSelection}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Message input form */}
      <form
        onSubmit={handleSendMessage}
        className="border-t p-4 flex flex-col gap-2 bg-gray-50"
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*,video/*"
            disabled={sending}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            className="px-3 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
            title="Attach media (images or videos)"
          >
            📎
          </button>
          <button
            type="submit"
            disabled={sending || (!newMessage.trim() && !selectedFile)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default GroupChat;
