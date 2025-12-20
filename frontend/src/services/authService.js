import axios from 'axios';

const API_URL = '/api/auth';

// Configure axios to send cookies
axios.defaults.withCredentials = true;

const authService = {
  // Signup
  signup: async (userData, userType = 'citizen') => {
    try {
      const endpoint = userType === 'police' ? `${API_URL}/police/signup` : `${API_URL}/signup`;
      const response = await axios.post(endpoint, userData);
      return response.data;
    } catch (error) {
      console.error('Signup error:', error.response || error);
      throw error;
    }
  },

  // Login
  login: async (credentials, userType = 'citizen') => {
    try {
      const endpoint = userType === 'police' ? `${API_URL}/police/login` : `${API_URL}/login`;
      const response = await axios.post(endpoint, credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response || error);
      throw error;
    }
  },

  // Logout
  logout: async (userType = 'citizen') => {
    try {
      const endpoint = userType === 'police' ? `${API_URL}/police/logout` : `${API_URL}/logout`;
      const response = await axios.post(endpoint);
      return response.data;
    } catch (error) {
      console.error('Logout error:', error.response || error);
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await axios.get(`${API_URL}/me`);
      return response.data;
    } catch (error) {
      console.error('Get user error:', error.response || error);
      throw error;
    }
  },

  // Get current police officer
  getCurrentPolice: async () => {
    try {
      const response = await axios.get(`${API_URL}/police/me`);
      return response.data;
    } catch (error) {
      console.error('Get police error:', error.response || error);
      throw error;
    }
  }
};

export default authService;
