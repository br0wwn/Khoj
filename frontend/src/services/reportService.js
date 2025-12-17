import axios from 'axios';

const API_URL = '/api/reports';

// Configure axios to send cookies
axios.defaults.withCredentials = true;

const reportService = {
  // Get all reports (with optional filters)
  getAllReports: async (params = {}) => {
    try {
      const response = await axios.get(API_URL, { params });
      return response.data.data || [];
    } catch (error) {
      console.error('Get reports error:', error.response || error);
      throw error;
    }
  },

  // Get single report by ID
  getReportById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Get report error:', error.response || error);
      throw error;
    }
  },

  // Create new report
  createReport: async (reportData) => {
    try {
      const response = await axios.post(API_URL, reportData);
      return response.data;
    } catch (error) {
      console.error('Create report error:', error.response || error);
      throw error;
    }
  },

  // Update report
  updateReport: async (id, reportData) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, reportData);
      return response.data;
    } catch (error) {
      console.error('Update report error:', error.response || error);
      throw error;
    }
  },

  // Delete report
  deleteReport: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete report error:', error.response || error);
      throw error;
    }
  },

  // Upload media to report
  uploadReportMedia: async (id, files) => {
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

  // Delete media from report
  deleteReportMedia: async (id, mediaIndex) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}/media/${mediaIndex}`);
      return response.data;
    } catch (error) {
      console.error('Delete media error:', error.response || error);
      throw error;
    }
  }
};

export default reportService;
