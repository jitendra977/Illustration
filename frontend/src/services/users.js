// users.js
import api from './index';

const handleApiError = (error, operation) => {
  console.error(`Error ${operation}:`, error);
  throw error;
};

// Get base URL from environment or API instance
const getBaseUrl = () => {
  return process.env.REACT_APP_API_URL || '';
};

export const usersAPI = {
  getProfile: async () => {
    try {
      const response = await api.get('auth/users/profile/');
      const data = response.data;
      
      // Convert relative profile image URL to absolute URL
      if (data?.profile_image && !data.profile_image.startsWith('http')) {
        data.profile_image = `${getBaseUrl()}${data.profile_image}`;
      }
      
      return data;
    } catch (error) {
      return handleApiError(error, 'fetching profile');
    }
  },

  // Add this new method to get the complete user data with proper image URLs
  getUserWithProfileImage: async () => {
    try {
      const response = await api.get('auth/users/profile/');
      const data = response.data;
      
      // Process user data to ensure profile_image has full URL
      if (data?.user?.profile_image && !data.user.profile_image.startsWith('http')) {
        data.user.profile_image = `${getBaseUrl()}${data.user.profile_image}`;
      }
      
      return data;
    } catch (error) {
      return handleApiError(error, 'fetching user with profile');
    }
  },

  verifyEmail: async (token) => {
    try {
      const response = await api.post('auth/users/verify_email/', { token });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'verifying email');
    }
  },

  updateProfile: async (userData) => {
    try {
      const config = userData instanceof FormData 
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : { headers: { 'Content-Type': 'application/json' } };

      const response = await api.put('auth/users/profile/', userData, config);
      const data = response.data;
      
      // Convert relative profile image URL to absolute URL
      if (data?.profile_image && !data.profile_image.startsWith('http')) {
        data.profile_image = `${getBaseUrl()}${data.profile_image}`;
      }
      
      return data;
    } catch (error) {
      return handleApiError(error, 'updating profile');
    }
  },

  updatePassword: async (passwordData) => {
    try {
      const response = await api.post('auth/users/change_password/', passwordData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'updating password');
    }
  },

  // Profile image specific methods
  uploadProfileImage: async (imageFile) => {
    try {
      const formData = new FormData();
      formData.append('profile_image', imageFile);

      const response = await api.patch('auth/users/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const data = response.data;
      // Convert relative URL to absolute
      if (data?.profile_image && !data.profile_image.startsWith('http')) {
        data.profile_image = `${getBaseUrl()}${data.profile_image}`;
      }
      
      return data;
    } catch (error) {
      return handleApiError(error, 'uploading profile image');
    }
  },

  // Helper function to get full image URL
  getFullImageUrl: (relativeUrl) => {
    if (!relativeUrl) return null;
    if (relativeUrl.startsWith('http')) return relativeUrl;
    return `${getBaseUrl()}${relativeUrl}`;
  }
};