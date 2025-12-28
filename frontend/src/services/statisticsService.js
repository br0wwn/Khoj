import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiConfig';

const API_URL = API_ENDPOINTS.STATISTICS;

axios.defaults.withCredentials = true;

const statisticsService = {
  // Get all district statistics
  getAllDistrictStatistics: async () => {
    try {
      const response = await axios.get(`${API_URL}/districts`);
      return response.data;
    } catch (error) {
      console.error('Get district statistics error:', error.response || error);
      throw error;
    }
  },

  // Get upazila statistics for a district
  getUpazilaStatistics: async (district) => {
    try {
      const response = await axios.get(`${API_URL}/upazilas`, {
        params: { district }
      });
      return response.data;
    } catch (error) {
      console.error('Get upazila statistics error:', error.response || error);
      throw error;
    }
  },

  // Get alerts with locations for map
  getAlertsForMap: async (district, upazila = null) => {
    try {
      const params = { district };
      if (upazila) params.upazila = upazila;
      
      const response = await axios.get(`${API_URL}/alerts-map`, { params });
      return response.data;
    } catch (error) {
      console.error('Get alerts for map error:', error.response || error);
      throw error;
    }
  },

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
