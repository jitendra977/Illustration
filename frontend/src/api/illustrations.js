import axios from 'axios';

// Use environment variable or default to localhost with /api prefix
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with auth token
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          localStorage.setItem('access_token', data.access);
          error.config.headers.Authorization = `Bearer ${data.access}`;
          return axios(error.config);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// MANUFACTURERS
// ============================================================================
export const manufacturerAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/manufacturers/', { params });
      return response.data;
    } catch (error) {
      console.error('Manufacturer API error:', error);
      throw error;
    }
  },
  getBySlug: async (slug) => {
    const response = await api.get(`/manufacturers/${slug}/`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/manufacturers/', data);
    return response.data;
  },
  update: async (slug, data) => {
    const response = await api.put(`/manufacturers/${slug}/`, data);
    return response.data;
  },
  partialUpdate: async (slug, data) => {
    const response = await api.patch(`/manufacturers/${slug}/`, data);
    return response.data;
  },
  delete: async (slug) => {
    const response = await api.delete(`/manufacturers/${slug}/`);
    return response.data;
  },
};

// ============================================================================
// ENGINE MODELS
// ============================================================================
export const engineModelAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/engine-models/', { params });
      return response.data;
    } catch (error) {
      console.error('Engine Model API error:', error);
      throw error;
    }
  },
  getBySlug: async (slug) => {
    const response = await api.get(`/engine-models/${slug}/`);
    return response.data;
  },
  getByManufacturer: async (manufacturerId) => {
    const response = await api.get('/engine-models/', { params: { manufacturer: manufacturerId } });
    return response.data;
  },
  getFuelTypes: async () => {
    const response = await api.get('/engine-models/fuel-types/');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/engine-models/', data);
    return response.data;
  },
  update: async (slug, data) => {
    const response = await api.put(`/engine-models/${slug}/`, data);
    return response.data;
  },
  partialUpdate: async (slug, data) => {
    const response = await api.patch(`/engine-models/${slug}/`, data);
    return response.data;
  },
  delete: async (slug) => {
    const response = await api.delete(`/engine-models/${slug}/`);
    return response.data;
  },
};

// ============================================================================
// CAR MODELS
// ============================================================================
export const carModelAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/car-models/', { params });
      return response.data;
    } catch (error) {
      console.error('Car Model API error:', error);
      throw error;
    }
  },
  getBySlug: async (slug) => {
    const response = await api.get(`/car-models/${slug}/`);
    return response.data;
  },
  getByManufacturer: async (manufacturerId) => {
    const response = await api.get('/car-models/', { params: { manufacturer: manufacturerId } });
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/car-models/', data);
    return response.data;
  },
  update: async (slug, data) => {
    const response = await api.put(`/car-models/${slug}/`, data);
    return response.data;
  },
  partialUpdate: async (slug, data) => {
    const response = await api.patch(`/car-models/${slug}/`, data);
    return response.data;
  },
  delete: async (slug) => {
    const response = await api.delete(`/car-models/${slug}/`);
    return response.data;
  },
  getVehicleTypes: async () => {
    const response = await api.get('/car-models/vehicle-types/');
    return response.data;
  },
};

// ============================================================================
// PART CATEGORIES
// ============================================================================
export const partCategoryAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/part-categories/', { params });
      return response.data;
    } catch (error) {
      console.error('Part Category API error:', error);
      throw error;
    }
  },
  getById: async (id) => {
    const response = await api.get(`/part-categories/${id}/`);
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/part-categories/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/part-categories/${id}/`, data);
    return response.data;
  },
  partialUpdate: async (id, data) => {
    const response = await api.patch(`/part-categories/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/part-categories/${id}/`);
    return response.data;
  },
};

// ============================================================================
// PART SUBCATEGORIES
// ============================================================================
export const partSubCategoryAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/part-subcategories/', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/part-subcategories/${id}/`);
    return response.data;
  },
  getByCategory: async (categoryId) => {
    const response = await api.get('/part-subcategories/', {
      params: { part_category: categoryId }
    });
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/part-subcategories/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/part-subcategories/${id}/`, data);
    return response.data;
  },
  partialUpdate: async (id, data) => {
    const response = await api.patch(`/part-subcategories/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/part-subcategories/${id}/`);
    return response.data;
  },
};

// ============================================================================
// ILLUSTRATIONS API
// ============================================================================
export const illustrationAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/illustrations/', { params });
      return response.data;
    } catch (error) {
      console.error('Illustration API error:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/illustrations/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Illustration API error:', error);
      throw error;
    }
  },

  create: async (data) => {
    const formData = new FormData();

    // Add regular fields
    Object.keys(data).forEach(key => {
      if (key === 'uploaded_files') {
        return; // Handle files separately
      }
      if (key === 'applicable_car_models' && Array.isArray(data[key])) {
        data[key].forEach(id => {
          formData.append('applicable_car_models', id);
        });
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    // Add files
    if (data.uploaded_files && data.uploaded_files.length > 0) {
      data.uploaded_files.forEach(file => {
        formData.append('uploaded_files', file);
      });
    }

    try {
      const response = await api.post('/illustrations/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Illustration API error:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    const formData = new FormData();

    // Add regular fields
    Object.keys(data).forEach(key => {
      if (key === 'uploaded_files') {
        return; // Handle files separately
      }
      if (key === 'applicable_car_models' && Array.isArray(data[key])) {
        data[key].forEach(id => {
          formData.append('applicable_car_models', id);
        });
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });

    // Add files
    if (data.uploaded_files && data.uploaded_files.length > 0) {
      data.uploaded_files.forEach(file => {
        formData.append('uploaded_files', file);
      });
    }

    try {
      const response = await api.put(`/illustrations/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Illustration API error:', error);
      throw error;
    }
  },

  partialUpdate: async (id, data) => {
    try {
      const response = await api.patch(`/illustrations/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Illustration API error:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/illustrations/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Illustration API error:', error);
      throw error;
    }
  },

  // File management methods
  uploadFiles: async (id, files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await api.post(`/illustrations/${id}/upload-files/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Illustration API error:', error);
      throw error;
    }
  },

  deleteFile: async (illustrationId, fileId) => {
    try {
      const response = await api.delete(`/illustrations/${illustrationId}/files/${fileId}/`);
      return response.data;
    } catch (error) {
      console.error('Illustration API error:', error);
      throw error;
    }
  },

  // Statistics
  getStats: async () => {
    try {
      const response = await api.get('/illustrations/stats/');
      return response.data;
    } catch (error) {
      console.error('Illustration API error:', error);
      throw error;
    }
  },

  // Batch operations
  bulkDelete: async (ids) => {
    try {
      const response = await api.post('/illustrations/bulk-delete/', { ids });
      return response.data;
    } catch (error) {
      console.error('Illustration API error:', error);
      throw error;
    }
  },
};

// ============================================================================
// ILLUSTRATION FILES API
// ============================================================================
export const illustrationFileAPI = {
  getByIllustration: async (illustrationId) => {
    try {
      const response = await api.get(`/illustration-files/?illustration=${illustrationId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch illustration files:', error);
      throw error;
    }
  },


  getById: async (id) => {
    try {
      const response = await api.get(`/illustration-files/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Illustration File API error:', error);
      throw error;
    }
  },

  create: async (data) => {
    const formData = new FormData();

    // Add fields to form data
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
        // For file field, append as is
        if (key === 'file') {
          formData.append(key, data[key]);
        } else {
          formData.append(key, data[key].toString());
        }
      }
    });

    try {
      const response = await api.post('/illustration-files/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Illustration File API error:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const response = await api.put(`/illustration-files/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Illustration File API error:', error);
      throw error;
    }
  },

  partialUpdate: async (id, data) => {
    try {
      const response = await api.patch(`/illustration-files/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Illustration File API error:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/illustration-files/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Illustration File API error:', error);
      throw error;
    }
  },

  // Additional helper methods
  getByIllustration: async (illustrationId) => {
    try {
      const response = await api.get('/illustration-files/', {
        params: { illustration: illustrationId }
      });
      return response.data;
    } catch (error) {
      console.error('Illustration File API error:', error);
      throw error;
    }
  },

  getByFileType: async (fileType) => {
    try {
      const response = await api.get('/illustration-files/', {
        params: { file_type: fileType }
      });
      return response.data;
    } catch (error) {
      console.error('Illustration File API error:', error);
      throw error;
    }
  },

  // Helper method for backward compatibility
  createWithIllustrationId: async (illustrationId, file) => {
    return illustrationFileAPI.create({
      illustration: illustrationId,
      file: file,
    });
  },
  download: async (fileId) => {
    try {
      const response = await api.get(`/illustration-files/${fileId}/download/`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Download failed:', error);
      throw error;
    }
  },


};

export default api;