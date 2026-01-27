// src/api/users.js
import api from './index';

const handleApiError = (error, operation) => {
  console.error(`Error ${operation}:`, error);
  throw error;
};

// Get base URL from environment
const getBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_BASE_URL || '/api';
  // Remove /api from the end if present to get the base URL
  return apiUrl.replace('/api', '');
};

export const usersAPI = {
  /**
   * Get current user's profile
   * @returns {Promise<Object>} User profile data
   */
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

  /**
   * Get current user info (alternative endpoint)
   * @returns {Promise<Object>} User data
   */
  getCurrentUser: async () => {
    try {
      const response = await api.get('auth/users/me/');
      const data = response.data;

      if (data?.profile_image && !data.profile_image.startsWith('http')) {
        data.profile_image = `${getBaseUrl()}${data.profile_image}`;
      }

      return data;
    } catch (error) {
      return handleApiError(error, 'fetching current user');
    }
  },

  /**
   * Update user profile
   * @param {FormData|Object} userData - User data to update
   * @returns {Promise<Object>} Updated user data
   */
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

  /**
   * Partial update of user profile (PATCH)
   * @param {FormData|Object} userData - User data to update
   * @returns {Promise<Object>} Updated user data
   */
  patchProfile: async (userData) => {
    try {
      const config = userData instanceof FormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : { headers: { 'Content-Type': 'application/json' } };

      const response = await api.patch('auth/users/profile/', userData, config);
      const data = response.data;

      if (data?.profile_image && !data.profile_image.startsWith('http')) {
        data.profile_image = `${getBaseUrl()}${data.profile_image}`;
      }

      return data;
    } catch (error) {
      return handleApiError(error, 'patching profile');
    }
  },

  /**
   * Change user password
   * @param {Object} passwordData - { old_password, new_password, confirm_password }
   * @returns {Promise<Object>} Success message
   */
  changePassword: async (passwordData) => {
    try {
      const response = await api.post('auth/users/change-password/', passwordData);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'changing password');
    }
  },

  /**
   * Verify email address
   * @param {string} token - Verification token (UUID)
   * @returns {Promise<Object>} Verification response
   */
  verifyEmail: async (token) => {
    try {
      const response = await api.post('auth/users/verify-email/', { token });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'verifying email');
    }
  },

  /**
   * Resend verification email
   * @returns {Promise<Object>} Success message
   */
  resendVerification: async () => {
    try {
      const response = await api.post('auth/users/resend-verification/');
      return response.data;
    } catch (error) {
      return handleApiError(error, 'resending verification');
    }
  },

  /**
   * Upload profile image
   * @param {File} imageFile - Image file to upload
   * @returns {Promise<Object>} Updated user data with new image
   */
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

  /**
   * Delete profile image
   * @returns {Promise<Object>} Updated user data
   */
  deleteProfileImage: async () => {
    try {
      const formData = new FormData();
      formData.append('profile_image', ''); // Send empty to delete

      const response = await api.patch('auth/users/profile/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return response.data;
    } catch (error) {
      return handleApiError(error, 'deleting profile image');
    }
  },

  /**
   * Get list of all users (admin only)
   * @param {Object} params - Query parameters (page, search, etc.)
   * @returns {Promise<Object>} Paginated users list
   */
  getAllUsers: async (params = {}) => {
    try {
      const response = await api.get('auth/users/', { params });
      const data = response.data;

      // Process profile images for all users
      if (data.results) {
        data.results = data.results.map(user => {
          if (user.profile_image && !user.profile_image.startsWith('http')) {
            user.profile_image = `${getBaseUrl()}${user.profile_image}`;
          }
          return user;
        });
      } else if (Array.isArray(data)) {
        // Handle non-paginated response
        return data.map(user => {
          if (user.profile_image && !user.profile_image.startsWith('http')) {
            user.profile_image = `${getBaseUrl()}${user.profile_image}`;
          }
          return user;
        });
      }

      return data;
    } catch (error) {
      return handleApiError(error, 'fetching users list');
    }
  },

  /**
   * Get user by ID (admin only)
   * @param {number} userId - User ID
   * @returns {Promise<Object>} User data
   */
  getUserById: async (userId) => {
    try {
      const response = await api.get(`auth/users/${userId}/`);
      const data = response.data;

      if (data?.profile_image && !data.profile_image.startsWith('http')) {
        data.profile_image = `${getBaseUrl()}${data.profile_image}`;
      }

      return data;
    } catch (error) {
      return handleApiError(error, `fetching user ${userId}`);
    }
  },

  /**
   * Create new user (admin only)
   * @param {FormData|Object} userData - User data
   * @returns {Promise<Object>} Created user data
   */
  createUser: async (userData) => {
    try {
      const config = userData instanceof FormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : { headers: { 'Content-Type': 'application/json' } };

      const response = await api.post('auth/users/', userData, config);
      const data = response.data;

      if (data?.profile_image && !data.profile_image.startsWith('http')) {
        data.profile_image = `${getBaseUrl()}${data.profile_image}`;
      }

      return data;
    } catch (error) {
      return handleApiError(error, 'creating user');
    }
  },

  /**
   * Update user (admin only)
   * @param {number} userId - User ID
   * @param {FormData|Object} userData - User data to update
   * @returns {Promise<Object>} Updated user data
   */
  updateUser: async (userId, userData) => {
    try {
      const config = userData instanceof FormData
        ? { headers: { 'Content-Type': 'multipart/form-data' } }
        : { headers: { 'Content-Type': 'application/json' } };

      const response = await api.put(`auth/users/${userId}/`, userData, config);
      const data = response.data;

      if (data?.profile_image && !data.profile_image.startsWith('http')) {
        data.profile_image = `${getBaseUrl()}${data.profile_image}`;
      }

      return data;
    } catch (error) {
      return handleApiError(error, `updating user ${userId}`);
    }
  },

  /**
   * Delete user (admin only)
   * @param {number} userId - User ID
   * @returns {Promise<void>}
   */
  deleteUser: async (userId) => {
    try {
      await api.delete(`auth/users/${userId}/`);
    } catch (error) {
      return handleApiError(error, `deleting user ${userId}`);
    }
  },

  /**
   * Helper function to get full image URL
   * @param {string} relativeUrl - Relative image URL
   * @returns {string|null} Full image URL
   */
  getFullImageUrl: (relativeUrl) => {
    if (!relativeUrl) return null;
    if (relativeUrl.startsWith('http')) return relativeUrl;
    return `${getBaseUrl()}${relativeUrl}`;
  }
};

// ============================================================================
// FACTORIES API (Management)
// ============================================================================
export const factoriesAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('auth/factories/', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'fetching factories');
    }
  },
  create: async (data) => {
    try {
      const response = await api.post('auth/factories/', data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'creating factory');
    }
  },
  update: async (id, data) => {
    try {
      const response = await api.put(`auth/factories/${id}/`, data);
      return response.data;
    } catch (error) {
      return handleApiError(error, `updating factory ${id}`);
    }
  },
  delete: async (id) => {
    try {
      await api.delete(`auth/factories/${id}/`);
    } catch (error) {
      return handleApiError(error, `deleting factory ${id}`);
    }
  }
};

// ============================================================================
// ROLES API
// ============================================================================
export const rolesAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('auth/roles/', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'fetching roles');
    }
  },
  create: async (data) => {
    try {
      const response = await api.post('auth/roles/', data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'creating role');
    }
  },
  update: async (id, data) => {
    try {
      const response = await api.put(`auth/roles/${id}/`, data);
      return response.data;
    } catch (error) {
      return handleApiError(error, `updating role ${id}`);
    }
  },
  delete: async (id) => {
    try {
      await api.delete(`auth/roles/${id}/`);
    } catch (error) {
      return handleApiError(error, `deleting role ${id}`);
    }
  }
};

// ============================================================================
// FACTORY MEMBERS API
// ============================================================================
export const factoryMembersAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('auth/factory-members/', { params });
      return response.data;
    } catch (error) {
      return handleApiError(error, 'fetching factory members');
    }
  },
  create: async (data) => {
    try {
      const response = await api.post('auth/factory-members/', data);
      return response.data;
    } catch (error) {
      return handleApiError(error, 'creating factory member');
    }
  },
  update: async (id, data) => {
    try {
      const response = await api.put(`auth/factory-members/${id}/`, data);
      return response.data;
    } catch (error) {
      return handleApiError(error, `updating factory member ${id}`);
    }
  },
  delete: async (id) => {
    try {
      await api.delete(`auth/factory-members/${id}/`);
    } catch (error) {
      return handleApiError(error, `deleting factory member ${id}`);
    }
  }
};