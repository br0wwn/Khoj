// API Configuration
// Uses environment variables or falls back to relative URLs (proxy)

const API_BASE_URL = process.env.REACT_APP_API_URL || '';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5001';

export const API_ENDPOINTS = {
  AUTH: `${API_BASE_URL}/api/auth`,
  ADMIN: `${API_BASE_URL}/api/admin`,
  ALERTS: `${API_BASE_URL}/api/alerts`,
  REPORTS: {
    GET_ALL: `${API_BASE_URL}/api/reports`,
    GET_BY_ID: (id) => `${API_BASE_URL}/api/reports/${id}`,
    CREATE: `${API_BASE_URL}/api/reports`,
    UPDATE: (id) => `${API_BASE_URL}/api/reports/${id}`,
    DELETE: (id) => `${API_BASE_URL}/api/reports/${id}`,
    UPLOAD_MEDIA: (id) => `${API_BASE_URL}/api/reports/${id}/upload-media`,
    DELETE_MEDIA: (id, mediaIndex) => `${API_BASE_URL}/api/reports/${id}/media/${mediaIndex}`,
  },
  GROUPS: `${API_BASE_URL}/api/groups`,
  CHAT: `${API_BASE_URL}/api/chat`,
  NOTIFICATIONS: `${API_BASE_URL}/api/notifications`,
  PROFILE: `${API_BASE_URL}/api/profile`,
  STATISTICS: `${API_BASE_URL}/api/statistics`,
  SOCIAL_SHARE: `${API_BASE_URL}/api/social-share`,
  REPORT_TO_ADMIN: `${API_BASE_URL}/api/report-to-admin`,
};

export { API_BASE_URL, SOCKET_URL };
