// Centralized Services Export

// Core API Configuration
export { default as api } from './config/config';
export { 
  createAPIClient, 
  getToken, 
  setToken, 
  APIError, 
  uploadImage, 
  uploadMultipleImages 
} from './utils/api';

// Authentication Services
export { authAPI } from './api/auth/authAPI';
export { setAuthToken, getAuthToken } from './api/index';

// Account Services
export { default as accountAPI } from './api/account/accountAPI';

// Cloudinary Integration
export { default as cloudinaryAPI } from './api/cloudinary/cloudinaryAPI';
