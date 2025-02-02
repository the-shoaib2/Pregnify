import api from '../../config/config';

export const accountAPI = {
  // Profile
  getProfile: async () => {
    try {
      const response = await api.get('/api/accounts/me');
      return {
        success: true,
        data: response.data?.data || null,
        message: response.data?.message
      };
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get profile',
        data: null
      };
    }
  },

  updateProfile: async (profileData) => {
    try {
      // Only send the fields that should be updated
      const formattedData = {
        fullName: profileData.fullName,
        phone: profileData.phone,
        address: profileData.address,
        description: profileData.description,
        avatarUrl: profileData.avatarUrl,
        isEmailVisible: profileData.isEmailVisible,
        isPhoneVisible: profileData.isPhoneVisible,
        isOnline: profileData.isOnline,
        isActive: profileData.isActive,
        websites: Array.isArray(profileData.websites) 
          ? profileData.websites.filter(website => 
              website.name?.trim() && website.url?.trim()
            ).map(website => ({
              name: website.name.trim(),
              url: website.url.trim()
            }))
          : []
      }

      const response = await api.put('/api/accounts/me', formattedData)
      
      if (response.data?.success) {
        return {
          success: true,
          data: response.data.data,
          message: 'Profile updated successfully'
        }
      }

      return {
        success: false,
        error: response.data?.message || 'Failed to update profile',
        data: null
      }
    } catch (error) {
      console.error('Update profile error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile',
        data: null
      }
    }
  },

  //Upload Avatar
  uploadAvatar: async (formData) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          if (formData.onProgress) {
            formData.onProgress(progress);
          }
        }
      };

      // First upload the image to the general upload endpoint
      const uploadResponse = await api.post('/api/upload/image', formData, config);
      
      if (!uploadResponse.data?.success) {
        throw new Error(uploadResponse.data?.message || 'Failed to upload image');
      }

      const imageUrl = uploadResponse.data.data.url;

      // Then update the profile with the new avatar URL
      const updateResponse = await api.put('/api/accounts/me', {
        avatarUrl: imageUrl
      });

      if (!updateResponse.data?.success) {
        throw new Error(updateResponse.data?.message || 'Failed to update profile with new avatar');
      }

      return {
        success: true,
        data: {
          ...updateResponse.data.data,
          url: imageUrl,
          message: 'Avatar uploaded successfully'
        }
      };
    } catch (error) {
      console.error('Avatar upload error:', error);
      return {
        success: false,
        error: error.message || 'Failed to upload avatar',
        data: null
      };
    }
  },

  // Settings
  getSettings: async () => {
    try {
      const response = await api.get('/api/account/settings');
      return {
        success: true,
        data: response.data?.data || null,
        message: response.data?.message
      };
    } catch (error) {
      console.error('Get settings error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get settings',
        data: null
      };
    }
  },

  // Appearance Settings
  updateAppearanceSettings: async (settings) => {
    try {
      const response = await api.put('/api/account/settings/appearance', settings);
      return {
        success: true,
        data: response.data?.data || null,
        message: response.data?.message
      };
    } catch (error) {
      console.error('Update appearance settings error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update appearance settings',
        data: null
      };
    }
  },

  // Language Settings
  updateLanguageSettings: async (settings) => {
    try {
      const response = await api.put('/api/account/settings/language', settings);
      return {
        success: true,
        data: response.data?.data || null,
        message: response.data?.message
      };
    } catch (error) {
      console.error('Update language settings error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update language settings',
        data: null
      };
    }
  },

  // Notification Settings
  updateNotificationSettings: async (settings) => {
    try {
      const response = await api.put('/api/account/settings/notifications', settings);
      return {
        success: true,
        data: response.data?.data || null,
        message: response.data?.message
      };
    } catch (error) {
      console.error('Update notification settings error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update notification settings',
        data: null
      };
    }
  }
};

export default accountAPI; 