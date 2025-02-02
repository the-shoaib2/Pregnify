// Advanced API Utility with Enhanced Security and Error Handling

import axios from 'axios';

// Custom API Error Class
export class APIError extends Error {
  constructor(message, status, details = {}) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.details = details;
  }
}

// API Configuration and Interceptors
export const createAPIClient = () => {
  const instance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
    timeout: 10000, // 10 seconds timeout
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest'
    }
  });

  // Request Interceptor for Authentication
  instance.interceptors.request.use(
    config => {
      const token = getToken();
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    error => Promise.reject(error)
  );

  // Response Interceptor for Error Handling
  instance.interceptors.response.use(
    response => response,
    error => {
      const originalRequest = error.config;

      // Handle specific error scenarios
      if (error.response) {
        switch (error.response.status) {
          case 401: // Unauthorized
            handleUnauthorized();
            break;
          case 403: // Forbidden
            handleForbidden();
            break;
          case 429: // Too Many Requests
            return retryRequest(originalRequest);
        }

        return Promise.reject(
          new APIError(
            error.response.data.message || 'An error occurred',
            error.response.status,
            error.response.data
          )
        );
      }

      // Network errors or timeout
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(new APIError('Request timed out', 408));
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Token Management
export const getToken = () => {
  return localStorage.getItem('token') || '';
};

export const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Error Handling Utilities
const handleUnauthorized = () => {
  // Clear token and redirect to login
  setToken(null);
  window.location.href = '/login';
};

const handleForbidden = () => {
  // Log the user out or show a forbidden error
  console.error('Access Forbidden');
};

// Retry Mechanism
const retryRequest = async (originalRequest, retries = 3) => {
  originalRequest._retryCount = (originalRequest._retryCount || 0) + 1;

  if (originalRequest._retryCount > retries) {
    return Promise.reject(new APIError('Max retries exceeded', 500));
  }

  await new Promise(resolve => setTimeout(resolve, 1000 * originalRequest._retryCount));
  return createAPIClient()(originalRequest);
};

// Image Upload with Enhanced Error Handling
export const uploadImage = async (file, folder = '') => {
  const formData = new FormData();
  formData.append('file', file);
  if (folder) formData.append('folder', folder);

  try {
    const response = await createAPIClient().post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Image Upload Error:', error);
    throw error;
  }
};

export const uploadMultipleImages = async (files, folder = '') => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  if (folder) formData.append('folder', folder);

  try {
    const response = await createAPIClient().post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  } catch (error) {
    console.error('Multiple Images Upload Error:', error);
    throw error;
  }
};