// src/service/auth.js
import api from './index.js';
import axios from 'axios';

// Get API base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await api.post('auth/login/', credentials, {
        timeout: 30000, // 30 second timeout
        timeoutErrorMessage: 'Connection timeout. Please try again.'
      });
      return response.data;
    } catch (error) {
      // Enhance error object with more details
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        error.code = 'NETWORK_ERROR';
      }
      if (!error.response) {
        error.response = { status: 0 }; // No response means connection failed
      }
      throw error;
    }
  },

  register: async (userData) => {
    const isFormData = userData instanceof FormData;
    const config = {
      timeout: 30000,
      timeoutErrorMessage: 'Connection timeout. Please try again.'
    };

    if (isFormData) {
      config.headers = {
        'Content-Type': 'multipart/form-data',
      };
    }

    try {
      const response = await api.post('auth/users/register/', userData, config);
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        error.code = 'NETWORK_ERROR';
      }
      if (!error.response) {
        error.response = { status: 0 };
      }
      throw error;
    }
  },

  refreshToken: async (refreshToken) => {
    try {
      // Fixed: Added backticks for template literal
      const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
        refresh: refreshToken
      }, { timeout: 10000 });
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        error.code = 'NETWORK_ERROR';
      }
      if (!error.response) {
        error.response = { status: 0 };
      }
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  // Additional auth methods
  verifyEmail: async (token) => {
    try {
      const response = await api.post('auth/users/verify_email/', { token }, { timeout: 10000 });
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        error.code = 'NETWORK_ERROR';
      }
      if (!error.response) {
        error.response = { status: 0 };
      }
      throw error;
    }
  },

  resendVerification: async (email) => {
    try {
      const response = await api.post('auth/users/resend_verification/', { email }, { timeout: 30000 });
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        error.code = 'NETWORK_ERROR';
      }
      if (!error.response) {
        error.response = { status: 0 };
      }
      throw error;
    }
  },

  changePassword: async (data) => {
    try {
      const response = await api.post('auth/users/change_password/', data, { timeout: 10000 });
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        error.code = 'NETWORK_ERROR';
      }
      if (!error.response) {
        error.response = { status: 0 };
      }
      throw error;
    }
  },

  getProfile: async () => {
    try {
      const response = await api.get('auth/users/profile/', { timeout: 10000 });
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        error.code = 'NETWORK_ERROR';
      }
      if (!error.response) {
        error.response = { status: 0 };
      }
      throw error;
    }
  },

  updateProfile: async (data) => {
    try {
      const response = await api.patch('auth/users/profile/', data, { timeout: 10000 });
      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        error.code = 'NETWORK_ERROR';
      }
      if (!error.response) {
        error.response = { status: 0 };
      }
      throw error;
    }
  }
};

export default authAPI;