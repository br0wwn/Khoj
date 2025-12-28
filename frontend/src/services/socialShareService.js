import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiConfig';

const API_URL = API_ENDPOINTS.SOCIAL_SHARE;

axios.defaults.withCredentials = true;

const socialShareService = {
  // Track a social share
  trackShare: async (alertId, platform, shareUrl = null) => {
    try {
      const response = await axios.post(API_URL, {
        alertId,
        platform,
        shareUrl
      });
      return response.data;
    } catch (error) {
      console.error('Track share error:', error.response || error);
      throw error;
    }
  },

  // Get share statistics for an alert
  getAlertShares: async (alertId) => {
    try {
      const response = await axios.get(`${API_URL}/alert/${alertId}`);
      return response.data;
    } catch (error) {
      console.error('Get alert shares error:', error.response || error);
      throw error;
    }
  },

  // Get user's share history
  getMyShares: async () => {
    try {
      const response = await axios.get(`${API_URL}/my-shares`);
      return response.data;
    } catch (error) {
      console.error('Get my shares error:', error.response || error);
      throw error;
    }
  },

  // Get sharing analytics
  getSharingAnalytics: async (startDate = null, endDate = null) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axios.get(`${API_URL}/analytics`, { params });
      return response.data;
    } catch (error) {
      console.error('Get sharing analytics error:', error.response || error);
      throw error;
    }
  },

  // Generate shareable link
  generateShareLink: async (alertId, platform) => {
    try {
      const response = await axios.get(`${API_URL}/generate-link/${alertId}`, {
        params: { platform }
      });
      return response.data;
    } catch (error) {
      console.error('Generate share link error:', error.response || error);
      throw error;
    }
  },

  // Share to platform and track
  shareToSocial: async (alertId, platform) => {
    try {
      // Generate the share link
      const linkResponse = await socialShareService.generateShareLink(alertId, platform);

      // Open the share URL in a new window
      if (linkResponse.success && linkResponse.data.shareUrl) {
        window.open(linkResponse.data.shareUrl, '_blank');

        // Track the share
        await socialShareService.trackShare(alertId, platform, linkResponse.data.shareUrl);

        return linkResponse;
      }
    } catch (error) {
      console.error('Share to social error:', error);
      throw error;
    }
  },

  // Copy link and track
  copyLink: async (alertId) => {
    try {
      const linkResponse = await socialShareService.generateShareLink(alertId, 'copy_link');

      if (linkResponse.success && linkResponse.data.alertUrl) {
        await navigator.clipboard.writeText(linkResponse.data.alertUrl);

        // Track the share
        await socialShareService.trackShare(alertId, 'copy_link', linkResponse.data.alertUrl);

        return linkResponse;
      }
    } catch (error) {
      console.error('Copy link error:', error);
      throw error;
    }
  }
};

export default socialShareService;
