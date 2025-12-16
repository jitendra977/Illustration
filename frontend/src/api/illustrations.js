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
      return response.data; // ✅ Fixed
    } catch (error) {
      console.error('Manufacturer API error:', error);
      throw error;
    }
  },
  getBySlug: async (slug) => {
    const response = await api.get(`/manufacturers/${slug}/`);
    return response.data; // ✅ Fixed
  },
  create: async (data) => {
    const response = await api.post('/manufacturers/', data);
    return response.data; // ✅ Fixed
  },
  update: async (slug, data) => {
    const response = await api.put(`/manufacturers/${slug}/`, data);
    return response.data; // ✅ Fixed
  },
  partialUpdate: async (slug, data) => {
    const response = await api.patch(`/manufacturers/${slug}/`, data);
    return response.data; // ✅ Fixed
  },
  delete: async (slug) => {
    const response = await api.delete(`/manufacturers/${slug}/`);
    return response.data; // ✅ Fixed
  },
};

// ============================================================================
// ENGINE MODELS
// ============================================================================
export const engineModelAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/engine-models/', { params });
      return response.data; // ✅ Fixed
    } catch (error) {
      console.error('Engine Model API error:', error);
      throw error;
    }
  },
  getBySlug: async (slug) => {
    const response = await api.get(`/engine-models/${slug}/`);
    return response.data; // ✅ Fixed
  },
  getByManufacturer: async (manufacturerId) => {
    const response = await api.get('/engine-models/', { params: { manufacturer: manufacturerId } });
    return response.data; // ✅ Fixed
  },
  getFuelTypes: async () => {
    const response = await api.get('/engine-models/fuel-types/');
    return response.data; // ✅ Fixed
  },
  create: async (data) => {
    const response = await api.post('/engine-models/', data);
    return response.data; // ✅ Fixed
  },
  update: async (slug, data) => {
    const response = await api.put(`/engine-models/${slug}/`, data);
    return response.data; // ✅ Fixed
  },
  partialUpdate: async (slug, data) => {
    const response = await api.patch(`/engine-models/${slug}/`, data);
    return response.data; // ✅ Fixed
  },
  delete: async (slug) => {
    const response = await api.delete(`/engine-models/${slug}/`);
    return response.data; // ✅ Fixed
  },
};

// ============================================================================
// CAR MODELS
// ============================================================================
export const carModelAPI = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/car-models/', { params });
      return response.data; // ✅ Fixed
    } catch (error) {
      console.error('Car Model API error:', error);
      throw error;
    }
  },
  getBySlug: async (slug) => {
    const response = await api.get(`/car-models/${slug}/`);
    return response.data; // ✅ Fixed
  },
  getByManufacturer: async (manufacturerId) => {
    const response = await api.get('/car-models/', { params: { manufacturer: manufacturerId } });
    return response.data; // ✅ Fixed
  },
  create: async (data) => {
    const response = await api.post('/car-models/', data);
    return response.data; // ✅ Fixed
  },
  update: async (slug, data) => {
    const response = await api.put(`/car-models/${slug}/`, data);
    return response.data; // ✅ Fixed
  },
  partialUpdate: async (slug, data) => {
    const response = await api.patch(`/car-models/${slug}/`, data);
    return response.data; // ✅ Fixed
  },
  delete: async (slug) => {
    const response = await api.delete(`/car-models/${slug}/`);
    return response.data; // ✅ Fixed
  },
  getVehicleTypes: async () => {
    const response = await api.get('/car-models/vehicle-types/');
    return response.data; // ✅ Fixed
  },
};

// ============================================================================
// PART CATEGORIES (CORRECTED)
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
    const response = await api.get(`/part-categories/${id}/`);  // ✅ Correct syntax
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/part-categories/', data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`/part-categories/${id}/`, data);  // ✅ Correct syntax
    return response.data;
  },
  partialUpdate: async (id, data) => {
    const response = await api.patch(`/part-categories/${id}/`, data);  // ✅ Correct syntax
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/part-categories/${id}/`);  // ✅ Correct syntax
    return response.data;
  },
};

// ============================================================================
// PART SUBCATEGORIES (CORRECTED)
// ============================================================================
export const partSubCategoryAPI = {
  getAll: async (params = {}) => {  // ✅ Added default empty object
    const response = await api.get('/part-subcategories/', { params });
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/part-subcategories/${id}/`);  // ✅ Correct syntax
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
    const response = await api.put(`/part-subcategories/${id}/`, data);  // ✅ Correct syntax
    return response.data;
  },
  partialUpdate: async (id, data) => {
    const response = await api.patch(`/part-subcategories/${id}/`, data);  // ✅ Correct syntax
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/part-subcategories/${id}/`);  // ✅ Correct syntax
    return response.data;
  },
};
// ============================================================================
// ILLUSTRATIONS
// ============================================================================
export const illustrationAPI = {
  getAll: async (params) => {
    const response = await api.get('/illustrations/', { params });
    return response.data; // ✅ Fixed
  },
  getById: async (id) => {
    const response = await api.get(`/illustrations/${id}/`);
    return response.data; // ✅ Fixed
  },
  create: async (data) => {
    const formData = new FormData();
    
    // Add regular fields
    Object.keys(data).forEach(key => {
      if (key === 'uploaded_files' || key === 'applicable_car_models') {
        return; // Handle separately
      }
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    // Add applicable car models (ManyToMany)
    if (data.applicable_car_models && data.applicable_car_models.length > 0) {
      data.applicable_car_models.forEach(carModelId => {
        formData.append('applicable_car_models', carModelId);
      });
    }
    
    // Add files
    if (data.uploaded_files && data.uploaded_files.length > 0) {
      data.uploaded_files.forEach(file => {
        formData.append('uploaded_files', file);
      });
    }
    
    const response = await api.post('/illustrations/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data; // ✅ Fixed
  },
  update: async (id, data) => {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (key === 'uploaded_files' || key === 'applicable_car_models') {
        return;
      }
      if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    // Add applicable car models
    if (data.applicable_car_models) {
      data.applicable_car_models.forEach(carModelId => {
        formData.append('applicable_car_models', carModelId);
      });
    }
    
    const response = await api.put(`/illustrations/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data; // ✅ Fixed
  },
  partialUpdate: async (id, data) => {
    if (data instanceof FormData || (data.uploaded_files && data.uploaded_files.length > 0)) {
      const formData = data instanceof FormData ? data : new FormData();
      
      if (!(data instanceof FormData)) {
        Object.keys(data).forEach(key => {
          if (key === 'uploaded_files' || key === 'applicable_car_models') {
            return;
          }
          if (data[key] !== null && data[key] !== undefined) {
            formData.append(key, data[key]);
          }
        });
        
        if (data.applicable_car_models) {
          data.applicable_car_models.forEach(carModelId => {
            formData.append('applicable_car_models', carModelId);
          });
        }
        
        if (data.uploaded_files && data.uploaded_files.length > 0) {
          data.uploaded_files.forEach(file => {
            formData.append('uploaded_files', file);
          });
        }
      }
      
      const response = await api.patch(`/illustrations/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data; // ✅ Fixed
    } else {
      const response = await api.patch(`/illustrations/${id}/`, data);
      return response.data; // ✅ Fixed
    }
  },
  delete: async (id) => {
    const response = await api.delete(`/illustrations/${id}/`);
    return response.data; // ✅ Fixed
  },
  addFiles: async (id, files) => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    const response = await api.post(`/illustrations/${id}/add-files/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data; // ✅ Fixed
  },
};

// ============================================================================
// ILLUSTRATION FILES
// ============================================================================
export const illustrationFileAPI = {
  getAll: async (params) => {
    const response = await api.get('/illustration-files/', { params });
    return response.data; // ✅ Fixed
  },
  getById: async (id) => {
    const response = await api.get(`/illustration-files/${id}/`);
    return response.data; // ✅ Fixed
  },
  create: async (illustrationId, file) => {
    const formData = new FormData();
    formData.append('illustration', illustrationId);
    formData.append('file', file);
    const response = await api.post('/illustration-files/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data; // ✅ Fixed
  },
  update: async (id, data) => {
    const response = await api.patch(`/illustration-files/${id}/`, data);
    return response.data; // ✅ Fixed
  },
  delete: async (id) => {
    const response = await api.delete(`/illustration-files/${id}/`);
    return response.data; // ✅ Fixed
  },
};

export default api;