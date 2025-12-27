import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiConfig';

const API_URL = API_ENDPOINTS.NOTIFICATIONS;

const axiosInstance = axios.create({
    withCredentials: true
});

// Get user notifications
export const getNotifications = async (page = 1, limit = 20) => {
    try {
        const response = await axiosInstance.get(`${API_URL}`, {
            params: { page, limit }
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Get unread count
export const getUnreadCount = async () => {
    try {
        const response = await axiosInstance.get(`${API_URL}/unread-count`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Mark notification as read
export const markAsRead = async (notificationId) => {
    try {
        const response = await axiosInstance.put(`${API_URL}/${notificationId}/read`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
    try {
        const response = await axiosInstance.put(`${API_URL}/read-all`);
        return response.data;
    } catch (error) {
        throw error.response?.data || error.message;
    }
};
