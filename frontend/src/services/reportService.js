import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiConfig';

// Configure axios to send cookies
axios.defaults.withCredentials = true;

const reportService = {
  // Get all reports (with optional params)
  getAllReports: async (params = {}) => {
    try {
      const response = await axios.get(API_ENDPOINTS.REPORTS.GET_ALL, { params });
      return response.data;
    } catch (error) {
      console.error('Get reports error:', error.response || error);
      throw error;
    }
  },

  // Get single report by ID
  getReportById: async (id) => {
    try {
      const response = await axios.get(API_ENDPOINTS.REPORTS.GET_BY_ID(id));
      return response.data;
    } catch (error) {
      console.error('Get report error:', error.response || error);
      throw error;
    }
  },

  // Create new report
  createReport: async (reportData) => {
    try {
      const response = await axios.post(API_ENDPOINTS.REPORTS.CREATE, reportData);
      return response.data;
    } catch (error) {
      console.error('Create report error:', error.response || error);
      throw error;
    }
  },

  // Update report
  updateReport: async (id, reportData) => {
    try {
      const response = await axios.put(API_ENDPOINTS.REPORTS.UPDATE(id), reportData);
      return response.data;
    } catch (error) {
      console.error('Update report error:', error.response || error);
      throw error;
    }
  },

  // Upload report media
  uploadReportMedia: async (id, files) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('media', file);
      });
      
      const response = await axios.post(API_ENDPOINTS.REPORTS.UPLOAD_MEDIA(id), formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Upload media error:', error.response || error);
      throw error;
    }
  },

  // Delete report media
  deleteReportMedia: async (id, mediaIndex) => {
    try {
      const response = await axios.delete(API_ENDPOINTS.REPORTS.DELETE_MEDIA(id, mediaIndex));
      return response.data;
    } catch (error) {
      console.error('Delete media error:', error.response || error);
      throw error;
    }
  },

  // Delete report
  deleteReport: async (id) => {
    try {
      const response = await axios.delete(API_ENDPOINTS.REPORTS.DELETE(id));
      return response.data;
    } catch (error) {
      console.error('Delete report error:', error.response || error);
      throw error;
    }
  }
};

export default reportService;
