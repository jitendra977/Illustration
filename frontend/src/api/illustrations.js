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
      return response;
    } catch (error) {
      console.error('Manufacturer API error:', error);
      throw error;
    }
  },
  getBySlug: (slug) => api.get(`/manufacturers/${slug}/`),
  create: (data) => api.post('/manufacturers/', data),
  update: (slug, data) => api.put(`/manufacturers/${slug}/`, data),
  partialUpdate: (slug, data) => api.patch(`/manufacturers/${slug}/`, data),
  delete: (slug) => api.delete(`/manufacturers/${slug}/`),
};

// ============================================================================
// CAR MODELS - ✅ UPDATED: Use ID for all operations
// ============================================================================
export const carModelAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/car-models/', { params });
      return response;
    } catch (error) {
      console.error('Car Model API error:', error);
      throw error;
    }
  },
  getById: (id) => api.get(`/car-models/${id}/`),
  getByManufacturer: (manufacturerId) => 
    api.get('/car-models/', { params: { manufacturer: manufacturerId } }),
  create: (data) => api.post('/car-models/', data),
  update: (id, data) => api.put(`/car-models/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`/car-models/${id}/`, data),
  delete: (id) => api.delete(`/car-models/${id}/`),
  getVehicleTypes: () => api.get('/car-models/vehicle-types/'),
  getFuelTypes: () => api.get('/car-models/fuel-types/'),
};

// ============================================================================
// ENGINE MODELS
// ============================================================================
export const engineModelAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/engine-models/', { params });
      return response;
    } catch (error) {
      console.error('Engine Model API error:', error);
      throw error;
    }
  },
  getBySlug: (slug) => api.get(`/engine-models/${slug}/`),
  getByCarModel: (carModelId) => 
    api.get('/engine-models/', { params: { car_model: carModelId } }),
  getByManufacturer: (manufacturerId) => 
    api.get('/engine-models/', { params: { car_model__manufacturer: manufacturerId } }),
  create: (data) => api.post('/engine-models/', data),
  update: (slug, data) => api.put(`/engine-models/${slug}/`, data),
  partialUpdate: (slug, data) => api.patch(`/engine-models/${slug}/`, data),
  delete: (slug) => api.delete(`/engine-models/${slug}/`),
};

// ============================================================================
// PART CATEGORIES
// ============================================================================
export const partCategoryAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/part-categories/', { params });
      return response;
    } catch (error) {
      console.error('Part Category API error:', error);
      throw error;
    }
  },
  getById: (id) => api.get(`/part-categories/${id}/`),
  getByEngineModel: (engineModelId) => 
    api.get('/part-categories/', { params: { engine_model: engineModelId } }),
  create: (data) => api.post('/part-categories/', data),
  update: (id, data) => api.put(`/part-categories/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`/part-categories/${id}/`, data),
  delete: (id) => api.delete(`/part-categories/${id}/`),
};

// ============================================================================
// PART SUBCATEGORIES
// ============================================================================
export const partSubCategoryAPI = {
  getAll: (params) => api.get('/part-subcategories/', { params }),
  getById: (id) => api.get(`/part-subcategories/${id}/`),
  getByCategory: (categoryId) => 
    api.get('/part-subcategories/', { params: { part_category: categoryId } }),
  create: (data) => api.post('/part-subcategories/', data),
  update: (id, data) => api.put(`/part-subcategories/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`/part-subcategories/${id}/`, data),
  delete: (id) => api.delete(`/part-subcategories/${id}/`),
};

// ============================================================================
// ILLUSTRATIONS
// ============================================================================
export const illustrationAPI = {
  getAll: (params) => api.get('/illustrations/', { params }),
  getById: (id) => api.get(`/illustrations/${id}/`),
  create: (data) => {
    const formData = new FormData();
    
    // Add regular fields
    Object.keys(data).forEach(key => {
      if (key !== 'uploaded_files' && data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    // Add files
    if (data.uploaded_files && data.uploaded_files.length > 0) {
      data.uploaded_files.forEach(file => {
        formData.append('uploaded_files', file);
      });
    }
    
    return api.post('/illustrations/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key !== 'uploaded_files' && data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    // Use PUT for full updates
    return api.put(`/illustrations/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  partialUpdate: (id, data) => {
    // Handle both FormData and regular JSON for PATCH
    if (data instanceof FormData || (data.uploaded_files && data.uploaded_files.length > 0)) {
      const formData = data instanceof FormData ? data : new FormData();
      
      if (!(data instanceof FormData)) {
        Object.keys(data).forEach(key => {
          if (key !== 'uploaded_files' && data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
          }
        });
        
        if (data.uploaded_files && data.uploaded_files.length > 0) {
          data.uploaded_files.forEach(file => {
            formData.append('uploaded_files', file);
          });
        }
      }
      
      return api.patch(`/illustrations/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      return api.patch(`/illustrations/${id}/`, data);
    }
  },
  delete: (id) => api.delete(`/illustrations/${id}/`),
};

// ============================================================================
// ILLUSTRATION FILES
// ============================================================================
export const illustrationFileAPI = {
  getAll: (params) => api.get('/illustration-files/', { params }),
  getById: (id) => api.get(`/illustration-files/${id}/`),
  create: (illustrationId, file) => {
    const formData = new FormData();
    formData.append('illustration', illustrationId);
    formData.append('file', file);
    return api.post('/illustration-files/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  update: (id, data) => api.patch(`/illustration-files/${id}/`, data),
  delete: (id) => api.delete(`/illustration-files/${id}/`),
};

export default api;