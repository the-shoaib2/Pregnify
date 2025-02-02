import api from '../../config/config';

export const USER_ROLES = {
  // SUPER_ADMIN: 'SUPER_ADMIN',
  // ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  PATIENT: 'PATIENT',
  GUEST: 'GUEST'
};

// Add rate limit tracking
let lastLoginAttempt = 0;
const RATE_LIMIT_DELAY = 2000; // 2 seconds between attempts
let lastMeRequest = 0;
const ME_REQUEST_COOLDOWN = 2000; // 2 seconds between requests
let cachedUserData = null;

// const formatUserData = (userData) => ({
//   role: userData.role,
//   firstName: userData.firstName,
//   lastName: userData.lastName,
//   email: userData.email,
//   phone: userData.phone,
//   dateOfBirth: userData.dateOfBirth,
//   gender: userData.gender,
//   termsAccepted: userData.termsAccepted,
//   description: userData.description
// });


export const authAPI = {
  login: async (credentials) => {
    try {
      // Rate limit check
      const now = Date.now();
      if (now - lastLoginAttempt < RATE_LIMIT_DELAY) {
        throw {
          message: 'Please wait a few seconds before trying again',
          status: 429,
          isRateLimit: true
        };
      }
      lastLoginAttempt = now;

      // Login request
      const response = await api.post('/api/v1/auth/login', {
        emailOrUsername: credentials.email,
        password: credentials.password
      });

      const { success, message, user, tokens } = response.data;

      if (success && tokens?.accessToken) {
        // Store token
        localStorage.setItem('token', tokens.accessToken);
        
        // Format and return user data directly from login response
        return {
          success: true,
          data: formatUserData(user),
          message
        };
      }

      throw new Error(message || 'Invalid login response');
    } catch (error) {
      console.error('Login error:', {
        status: error.response?.status,
        message: error.message,
        isRateLimit: error.isRateLimit
      });
      
      throw {
        message: error.response?.data?.message || error.message || 'Login failed',
        status: error.response?.status,
        isRateLimit: error.isRateLimit
      };
    }
  },
  
  register: async (userData) => {
    try {
      const formattedData = {
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        dateOfBirth: {
          day: userData.dateOfBirth.day,
          month: userData.dateOfBirth.month,
          year: userData.dateOfBirth.year
        },
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        gender: userData.gender,
        termsAccepted: true,
        description: userData.description || "New user registration"
      };

      console.log("Submitting data:", formattedData);


      const response = await api.post('/api/v1/auth/register', formattedData);

      if (response.data?.success) {
        toast.success('Account created successfully!');
      }

      if (!response.data?.success) {
        toast.error('Account already exists');
        return {
          success: false,
          message: 'Account already exists'
        };
      }

      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      throw {
        message: error.response?.data?.message || 'Registration failed',
        status: error.response?.status
      };
    }
  },
  
  logout: async () => {
    try {
      cachedUserData = null;
      await api.post('/api/v1/auth/logout');
      localStorage.removeItem('token');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('token');
      return { success: false, error: error.message };
    }
  },

  checkAuth: async () => {
    try {
      // Check if we have cached data and are within cooldown period
      const now = Date.now();
      if (cachedUserData && now - lastMeRequest < ME_REQUEST_COOLDOWN) {
        return cachedUserData;
      }

      lastMeRequest = now;
      const response = await api.get('/api/v1/auth/me');
      const { success, message, user } = response.data;

      if (!success || !user) {
        throw new Error(message || 'Invalid auth check response');
      }

      // Cache the successful response
      cachedUserData = {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          fullName: user.name,
          role: user.role,
          username: user.username,
          userID: user.userID,
          phoneNumber: user.phoneNumber,
          isEmailVerified: user.isEmailVerified,
          is2FAEnabled: user.is2FAEnabled,
          lastLoginAt: user.lastLoginAt,
          status: user.isActive,
          notifications: user.notifications,
          preferences: user.preferences,
          personalInfo: user.personalInfo
        }
      };

      return cachedUserData;
    } catch (error) {
      // Clear cache on error
      cachedUserData = null;
      
      console.error('Auth check failed:', {
        status: error.response?.status,
        message: error.message
      });
      
      throw {
        message: error.response?.data?.message || 'Failed to verify authentication',
        status: error.response?.status
      };
    }
  }
}; 