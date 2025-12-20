import axios from 'axios';

const API_URL = '/api/reports';

// Configure axios to send cookies
axios.defaults.withCredentials = true;

const reportService = {
  // Get all reports (with optional params)
  getAllReports: async (params = {}) => {
    try {
      const response = await axios.get(API_URL, { params });
      return response.data;
    } catch (error) {
      console.error('Get reports error:', error.response || error);
      throw error;
    }
  },

  // Get single report by ID
  getReportById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get report error:', error.response || error);
      throw error;
    }
  }
};

export default reportService;
