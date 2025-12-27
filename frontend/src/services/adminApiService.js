import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

// Create admin axios instance
const adminApi = axios.create({
  baseURL: API_BASE_URL,
});

// Add request interceptor to include token
adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default adminApi;
