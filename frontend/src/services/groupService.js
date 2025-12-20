import axios from 'axios';

const API_URL = '/api/groups';

axios.defaults.withCredentials = true;

const groupService = {
  // Create group with invites
  createGroupWithInvites: async (groupData) => {
    try {
      const response = await axios.post(API_URL, groupData);
      return response.data;
    } catch (error) {
      console.error('Create group error:', error.response || error);
      throw error;
    }
  },

  // Get all groups
  getAllGroups: async (params = {}) => {
    try {
      const response = await axios.get(API_URL, { params });
      return response.data;
    } catch (error) {
      console.error('Get all groups error:', error.response || error);
      throw error;
    }
  },

  // Get single group
  getGroupById: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get group error:', error.response || error);
      throw error;
    }
  },

  // Get user's groups (accepted invitations)
  getUserGroups: async () => {
    try {
      const response = await axios.get(`${API_URL}/my/groups`);
      return response.data;
    } catch (error) {
      console.error('Get user groups error:', error.response || error);
      throw error;
    }
  },

  // Get user's pending invitations
  getPendingInvitations: async () => {
    try {
      const response = await axios.get(`${API_URL}/invitations/pending`);
      return response.data;
    } catch (error) {
      console.error('Get invitations error:', error.response || error);
      throw error;
    }
  },

  // Accept invitation
  acceptInvitation: async (groupId) => {
    try {
      const response = await axios.post(`${API_URL}/${groupId}/accept`);
      return response.data;
    } catch (error) {
      console.error('Accept invitation error:', error.response || error);
      throw error;
    }
  },

  // Reject invitation
  rejectInvitation: async (groupId) => {
    try {
      const response = await axios.post(`${API_URL}/${groupId}/reject`);
      return response.data;
    } catch (error) {
      console.error('Reject invitation error:', error.response || error);
      throw error;
    }
  },

  // Leave group
  leaveGroup: async (groupId) => {
    try {
      const response = await axios.post(`${API_URL}/${groupId}/leave`);
      return response.data;
    } catch (error) {
      console.error('Leave group error:', error.response || error);
      throw error;
    }
  },

  // Delete group
  deleteGroup: async (groupId) => {
    try {
      const response = await axios.delete(`${API_URL}/${groupId}`);
      return response.data;
    } catch (error) {
      console.error('Delete group error:', error.response || error);
      throw error;
    }
  },

  // Get all users for invite selection
  getAllUsersForInvite: async () => {
    try {
      console.log('Calling /api/groups/users/all');
      const response = await axios.get(`${API_URL}/users/all`);
      console.log('getAllUsersForInvite response:', response);
      return response.data;
    } catch (error) {
      console.error('Get users error:', error.response?.data || error.message);
      console.error('Full error:', error);
      throw error;
    }
  }
};

export default groupService;
