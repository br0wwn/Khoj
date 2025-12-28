import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiConfig';

const API_URL = API_ENDPOINTS.ALERTS;

// Configure axios to send cookies
axios.defaults.withCredentials = true;

const alertService = {
  // Get all alerts (with optional filters)
  getAllAlerts: async (params = {}) => {
    try {
      const response = await axios.get(API_URL, { params });
      return response.data;
    } catch (error) {
      console.error('Get alerts error:', error.response || error);
      throw error;
    }
  },

  // Get my alerts
  getMyAlerts: async (params = {}) => {
    try {
      const response = await axios.get(API_URL, { 
        params: { ...params, mine: 'true' }
      });
      return response.data;
    } catch (error) {
      console.error('Get my alerts error:', error.response || error);
      throw error;
    }
  },

  // Get single alert by ID
  getAlertById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get alert error:', error.response || error);
      throw error;
    }
  },

  // Create new alert
  createAlert: async (alertData) => {
    try {
      const response = await axios.post(API_URL, alertData);
      return response.data;
    } catch (error) {
      console.error('Create alert error:', error.response || error);
      throw error;
    }
  },

  // Update alert status
  updateAlertStatus: async (id, status) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, { status });
      return response.data;
    } catch (error) {
      console.error('Update alert status error:', error.response || error);
      throw error;
    }
  },

  // Update alert details
  updateAlertDetails: async (id, alertData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}/details`, alertData);
      return response.data;
    } catch (error) {
      console.error('Update alert details error:', error.response || error);
      throw error;
    }
  },

  // Delete alert
  deleteAlert: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete alert error:', error.response || error);
      throw error;
    }
  },

  // Upload media to alert
  uploadAlertMedia: async (id, files) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('media', file);
      });

      const response = await axios.post(`${API_URL}/${id}/upload-media`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Upload media error:', error.response || error);
      throw error;
    }
  },

  // Delete media from alert
  deleteAlertMedia: async (id, mediaIndex) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}/media/${mediaIndex}`);
      return response.data;
    } catch (error) {
      console.error('Delete media error:', error.response || error);
      throw error;
    }
  },

  // Add log to alert
  addLog: async (id, formData) => {
    try {
      const response = await axios.post(`${API_URL}/${id}/logs`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Add log error:', error.response || error);
      throw error;
    }
  },

  // Get logs for alert
  getLogs: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}/logs`);
      return response.data;
    } catch (error) {
      console.error('Get logs error:', error.response || error);
      throw error;
    }
  }
};

export default alertService;
