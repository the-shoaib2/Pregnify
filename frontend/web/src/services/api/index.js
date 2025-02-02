import api from '../config/config';
import { authAPI } from './auth/authAPI';
import { accountAPI } from './account/accountAPI';
import cloudinaryAPI from './cloudinary/cloudinaryAPI';

// Auth helpers
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    }
};

export const getAuthToken = () => localStorage.getItem('token');

// Export all APIs
export {
  api,
  authAPI,
  accountAPI,
  cloudinaryAPI
};