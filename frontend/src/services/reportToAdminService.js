import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiConfig';

const API_URL = API_ENDPOINTS.REPORT_TO_ADMIN;

const reportToAdminService = {
  // Create a report to admin
  createReport: async (reportData) => {
    try {
      const response = await axios.post(API_URL, reportData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to submit report' };
    }
  },

  // Get all reports (admin)
  getAllReports: async (filters = {}) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await axios.get(`${API_URL}?${params}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch reports' };
    }
  },

  // Get single report by ID
  getReportById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch report' };
    }
  },

  // Update report status
  updateStatus: async (id, status) => {
    try {
      const response = await axios.put(`${API_URL}/${id}/status`, 
        { status },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to update status' };
    }
  },

  // Delete report
  deleteReport: async (id) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to delete report' };
    }
  }
};

export default reportToAdminService;
