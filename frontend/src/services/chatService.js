import axios from 'axios';

const API_URL = 'http://localhost:5001/api/chat';

// Create axios instance with credentials
const axiosInstance = axios.create({
    withCredentials: true
});

// Start or get conversation
export const startConversation = async (alertId, receiverId, receiverType) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/conversation`, {
            alertId,
            receiverId,
            receiverType
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get all conversations
export const getConversations = async () => {
    try {
        const response = await axiosInstance.get(`${API_URL}/conversations`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get messages for a conversation
export const getMessages = async (conversationId, page = 1, limit = 50) => {
    try {
        const response = await axiosInstance.get(
            `${API_URL}/conversation/${conversationId}/messages`,
            { params: { page, limit } }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Send a message (with optional media files)
export const sendMessage = async (conversationId, messageText, mediaFiles = []) => {
    try {
        const formData = new FormData();

        if (messageText) {
            formData.append('messageText', messageText);
        }

        // Append media files if any
        if (mediaFiles.length > 0) {
            mediaFiles.forEach(file => {
                formData.append('media', file);
            });
        }

        const response = await axiosInstance.post(
            `${API_URL}/conversation/${conversationId}/message`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Mark messages as read
export const markAsRead = async (conversationId) => {
    try {
        const response = await axiosInstance.put(
            `${API_URL}/conversation/${conversationId}/read`
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Delete conversation
export const deleteConversation = async (conversationId) => {
    try {
        const response = await axiosInstance.delete(
            `${API_URL}/conversation/${conversationId}`
        );
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get unread message count
export const getUnreadCount = async () => {
    try {
        const response = await axiosInstance.get(`${API_URL}/unread-count`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
