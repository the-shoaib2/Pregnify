import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const ProfileService = {
  async getProfile() {
    try {
      const response = await axios.get(`${API_URL}/account/profile`);
      console.log('ProfileService getProfile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  },

  async updateProfile(data) {
    try {
      const response = await axios.patch(`${API_URL}/account/profile`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  },

  async updateAvatar(file) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await axios.post(`${API_URL}/account/profile/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  },

  async updateCoverPhoto(file) {
    try {
      const formData = new FormData();
      formData.append('cover', file);
      
      const response = await axios.post(`${API_URL}/user/profile/cover`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating cover photo:', error);
      throw error;
    }
  }
};
