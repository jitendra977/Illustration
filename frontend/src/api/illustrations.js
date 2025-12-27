// src/api/illustrations.js - Unified and Optimized
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
// CACHING UTILITY
// ============================================================================
const cache = new Map();
const CACHE_TTL = 30000; // 30 seconds

const getCacheKey = (endpoint, params) => {
  return `${endpoint}:${JSON.stringify(params || {})}`;
};

const getFromCache = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;
  
  const isExpired = Date.now() - cached.timestamp > CACHE_TTL;
  if (isExpired) {
    cache.delete(key);
    return null;
  }
  
  return cached.data;
};

const setCache = (key, data) => {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
};

// Clear cache manually
export const clearCache = () => {
  cache.clear();
};

// ============================================================================
// MANUFACTURERS
// ============================================================================
export const manufacturerAPI = {
  getAll: async (params = {}) => {
    const cacheKey = getCacheKey('manufacturers', params);
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get('/manufacturers/', { params });
      setCache(cacheKey, response.data);
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
    clearCache();
    const response = await api.post('/manufacturers/', data);
    return response.data;
  },
  update: async (slug, data) => {
    clearCache();
    const response = await api.put(`/manufacturers/${slug}/`, data);
    return response.data;
  },
  partialUpdate: async (slug, data) => {
    clearCache();
    const response = await api.patch(`/manufacturers/${slug}/`, data);
    return response.data;
  },
  delete: async (slug) => {
    clearCache();
    const response = await api.delete(`/manufacturers/${slug}/`);
    return response.data;
  },
};

// ============================================================================
// ENGINE MODELS
// ============================================================================
export const engineModelAPI = {
  getAll: async (params = {}) => {
    const cacheKey = getCacheKey('engine-models', params);
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get('/engine-models/', { params });
      setCache(cacheKey, response.data);
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
    const cacheKey = `engine-models-by-manufacturer:${manufacturerId}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    const response = await api.get('/engine-models/', { 
      params: { manufacturer: manufacturerId } 
    });
    setCache(cacheKey, response.data);
    return response.data;
  },
  getFuelTypes: async () => {
    const cacheKey = 'fuel-types';
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    const response = await api.get('/engine-models/fuel-types/');
    setCache(cacheKey, response.data);
    return response.data;
  },
  create: async (data) => {
    clearCache();
    const response = await api.post('/engine-models/', data);
    return response.data;
  },
  update: async (slug, data) => {
    clearCache();
    const response = await api.put(`/engine-models/${slug}/`, data);
    return response.data;
  },
  partialUpdate: async (slug, data) => {
    clearCache();
    const response = await api.patch(`/engine-models/${slug}/`, data);
    return response.data;
  },
  delete: async (slug) => {
    clearCache();
    const response = await api.delete(`/engine-models/${slug}/`);
    return response.data;
  },
};

// ============================================================================
// CAR MODELS
// ============================================================================
export const carModelAPI = {
  getAll: async (params = {}) => {
    const cacheKey = getCacheKey('car-models', params);
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get('/car-models/', { params });
      setCache(cacheKey, response.data);
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
    const cacheKey = `car-models-by-manufacturer:${manufacturerId}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    const response = await api.get('/car-models/', { 
      params: { manufacturer: manufacturerId } 
    });
    setCache(cacheKey, response.data);
    return response.data;
  },
  create: async (data) => {
    clearCache();
    const response = await api.post('/car-models/', data);
    return response.data;
  },
  update: async (slug, data) => {
    clearCache();
    const response = await api.put(`/car-models/${slug}/`, data);
    return response.data;
  },
  partialUpdate: async (slug, data) => {
    clearCache();
    const response = await api.patch(`/car-models/${slug}/`, data);
    return response.data;
  },
  delete: async (slug) => {
    clearCache();
    const response = await api.delete(`/car-models/${slug}/`);
    return response.data;
  },
  getVehicleTypes: async () => {
    const cacheKey = 'vehicle-types';
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    const response = await api.get('/car-models/vehicle-types/');
    setCache(cacheKey, response.data);
    return response.data;
  },
};

// ============================================================================
// PART CATEGORIES
// ============================================================================
export const partCategoryAPI = {
  getAll: async (params = {}) => {
    const cacheKey = getCacheKey('part-categories', params);
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get('/part-categories/', { params });
      setCache(cacheKey, response.data);
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
    clearCache();
    const response = await api.post('/part-categories/', data);
    return response.data;
  },
  update: async (id, data) => {
    clearCache();
    const response = await api.put(`/part-categories/${id}/`, data);
    return response.data;
  },
  partialUpdate: async (id, data) => {
    clearCache();
    const response = await api.patch(`/part-categories/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    clearCache();
    const response = await api.delete(`/part-categories/${id}/`);
    return response.data;
  },
};

// ============================================================================
// PART SUBCATEGORIES
// ============================================================================
export const partSubCategoryAPI = {
  getAll: async (params = {}) => {
    const cacheKey = getCacheKey('part-subcategories', params);
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    const response = await api.get('/part-subcategories/', { params });
    setCache(cacheKey, response.data);
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/part-subcategories/${id}/`);
    return response.data;
  },
  getByCategory: async (categoryId) => {
    const cacheKey = `part-subcategories-by-category:${categoryId}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    const response = await api.get('/part-subcategories/', {
      params: { part_category: categoryId }
    });
    setCache(cacheKey, response.data);
    return response.data;
  },
  create: async (data) => {
    clearCache();
    const response = await api.post('/part-subcategories/', data);
    return response.data;
  },
  update: async (id, data) => {
    clearCache();
    const response = await api.put(`/part-subcategories/${id}/`, data);
    return response.data;
  },
  partialUpdate: async (id, data) => {
    clearCache();
    const response = await api.patch(`/part-subcategories/${id}/`, data);
    return response.data;
  },
  delete: async (id) => {
    clearCache();
    const response = await api.delete(`/part-subcategories/${id}/`);
    return response.data;
  },
};

// ============================================================================
// ILLUSTRATIONS API - OPTIMIZED
// ============================================================================
export const illustrationAPI = {
  /**
   * Get all illustrations - OPTIMIZED
   * By default, doesn't include file data for speed
   * Use include_files=true to get file data
   */
  getAll: async (params = {}) => {
    const cacheKey = getCacheKey('illustrations', params);
    const cached = getFromCache(cacheKey);
    if (cached && !params.include_files) {
      console.log('Cache hit for illustrations list');
      return cached;
    }

    try {
      const response = await api.get('/illustrations/', { 
        params: {
          ...params,
          // DON'T include files by default for speed
          include_files: params.include_files || false,
        }
      });
      
      if (!params.include_files) {
        setCache(cacheKey, response.data);
      }
      return response.data;
    } catch (error) {
      console.error('Illustration API error:', error);
      throw error;
    }
  },

  /**
   * Get single illustration - includes all files
   */
  getById: async (id) => {
    const cacheKey = `illustration:${id}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log('Cache hit for illustration detail');
      return cached;
    }

    try {
      const response = await api.get(`/illustrations/${id}/`);
      setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Illustration API error:', error);
      throw error;
    }
  },

  /**
   * Get quick stats - just counts
   */
  getStats: async () => {
    const cacheKey = 'illustration-stats';
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get('/illustrations/stats/');
      setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Illustration stats error:', error);
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
      clearCache();
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
      clearCache();
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
      clearCache();
      const response = await api.patch(`/illustrations/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Illustration API error:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      clearCache();
      const response = await api.delete(`/illustrations/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Illustration API error:', error);
      throw error;
    }
  },

  // File management methods
  addFiles: async (id, files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      clearCache();
      const response = await api.post(`/illustrations/${id}/add_files/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to add files:', error);
      throw error;
    }
  },

  uploadFiles: async (id, files) => {
    // Alias for addFiles to maintain compatibility
    return illustrationAPI.addFiles(id, files);
  },

  deleteFile: async (illustrationId, fileId) => {
    try {
      clearCache();
      const response = await api.delete(`/illustrations/${illustrationId}/files/${fileId}/`);
      return response.data;
    } catch (error) {
      console.error('Illustration API error:', error);
      throw error;
    }
  },

  // Batch operations
  bulkDelete: async (ids) => {
    try {
      clearCache();
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
  getAll: async (params = {}) => {
    const cacheKey = getCacheKey('illustration-files', params);
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get('/illustration-files/', { params });
      setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch illustration files:', error);
      throw error;
    }
  },

  getByIllustration: async (illustrationId) => {
    const cacheKey = `illustration-files:${illustrationId}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get(`/illustration-files/?illustration=${illustrationId}`);
      setCache(cacheKey, response.data);
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
      clearCache();
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
      clearCache();
      const response = await api.put(`/illustration-files/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Illustration File API error:', error);
      throw error;
    }
  },

  partialUpdate: async (id, data) => {
    try {
      clearCache();
      const response = await api.patch(`/illustration-files/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Illustration File API error:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      clearCache();
      const response = await api.delete(`/illustration-files/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Illustration File API error:', error);
      throw error;
    }
  },

  getByFileType: async (fileType) => {
    const cacheKey = `illustration-files-by-type:${fileType}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get('/illustration-files/', {
        params: { file_type: fileType }
      });
      setCache(cacheKey, response.data);
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