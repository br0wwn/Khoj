import axios from 'axios';

const API_URL = '/api/notifications';

axios.defaults.withCredentials = true;

const notificationService = {
  // Get all notifications
  getNotifications: async (params = {}) => {
    try {
      const response = await axios.get(API_URL, { params });
      return response.data;
    } catch (error) {
      console.error('Get notifications error:', error.response || error);
      throw error;
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await axios.get(`${API_URL}/unread-count`);
      return response.data;
    } catch (error) {
      console.error('Get unread count error:', error.response || error);
      throw error;
    }
  },

  // Mark notification as read
  markAsRead: async (id) => {
    try {
      const response = await axios.put(`${API_URL}/${id}/read`);
      return response.data;
    } catch (error) {
      console.error('Mark as read error:', error.response || error);
      throw error;
    }
  },

  // Mark all as read
  markAllAsRead: async () => {
    try {
      const response = await axios.put(`${API_URL}/read-all`);
      return response.data;
    } catch (error) {
      console.error('Mark all as read error:', error.response || error);
      throw error;
    }
  },

  // Delete notification
  deleteNotification: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete notification error:', error.response || error);
      throw error;
    }
  },

  // Create facial recognition notification
  createFacialRecognitionNotification: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/facial-recognition`, data);
      return response.data;
    } catch (error) {
      console.error('Create facial recognition notification error:', error.response || error);
      throw error;
    }
  }
};

export default notificationService;
