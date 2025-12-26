import axios from 'axios';

const API_URL = 'http://localhost:3000/api/groups';

const chatService = {
  // Send a message to a group (with optional media)
  grpSendMessage: async (groupId, message, mediaFile = null) => {
    try {
      const formData = new FormData();
      formData.append('message', message);
      
      if (mediaFile) {
        formData.append('media', mediaFile);
      }

      const response = await axios.post(
        `${API_URL}/${groupId}/messages`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      console.error('Send message error:', error.response || error);
      throw error;
    }
  },

  // Get all messages for a group
  getGroupMessages: async (groupId, limit = 50, skip = 0) => {
    try {
      const response = await axios.get(
        `${API_URL}/${groupId}/messages`,
        {
          params: { limit, skip },
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      console.error('Get messages error:', error.response || error);
      throw error;
    }
  }
};

export default chatService;
