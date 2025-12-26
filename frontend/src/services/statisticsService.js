import axios from 'axios';

const API_URL = '/api/statistics';

axios.defaults.withCredentials = true;

const statisticsService = {
  // Get area statistics
  getAreaStatistics: async (district, upazila) => {
    try {
      const response = await axios.get(`${API_URL}/area`, {
        params: { district, upazila }
      });
      return response.data;
    } catch (error) {
      console.error('Get area statistics error:', error.response || error);
      throw error;
    }
  },

  // Get district statistics
  getDistrictStatistics: async (district) => {
    try {
      const response = await axios.get(`${API_URL}/district/${district}`);
      return response.data;
    } catch (error) {
      console.error('Get district statistics error:', error.response || error);
      throw error;
    }
  },

  // Get dangerous areas
  getDangerousAreas: async (limit = 10) => {
    try {
      const response = await axios.get(`${API_URL}/dangerous-areas`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get dangerous areas error:', error.response || error);
      throw error;
    }
  },

  // Get overall statistics
  getOverallStatistics: async () => {
    try {
      const response = await axios.get(`${API_URL}/overall`);
      return response.data;
    } catch (error) {
      console.error('Get overall statistics error:', error.response || error);
      throw error;
    }
  },

  // Get trends
  getTrends: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/trends`, { params });
      return response.data;
    } catch (error) {
      console.error('Get trends error:', error.response || error);
      throw error;
    }
  }
};

export default statisticsService;
