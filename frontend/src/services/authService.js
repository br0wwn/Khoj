import axios from 'axios';

const API_URL = '/api/auth';

// Configure axios to send cookies
axios.defaults.withCredentials = true;

const authService = {
  // Signup
  signup: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/signup`, userData);
      return response.data;
    } catch (error) {
      console.error('Signup error:', error.response || error);
      throw error;
    }
  },

  // Login
  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/login`, credentials);
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response || error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      const response = await axios.post(`${API_URL}/logout`);
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
  }
};

export default authService;
