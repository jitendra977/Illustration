import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Create axios instance with auth token
const api = axios.create({
  baseURL: API_BASE_URL,
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
  getAll: (params) => api.get('/illustrations/manufacturers/', { params }),
  getBySlug: (slug) => api.get(`/illustrations/manufacturers/${slug}/`),
  create: (data) => api.post('/illustrations/manufacturers/', data),
  update: (slug, data) => api.put(`/illustrations/manufacturers/${slug}/`, data),
  partialUpdate: (slug, data) => api.patch(`/illustrations/manufacturers/${slug}/`, data),
  delete: (slug) => api.delete(`/illustrations/manufacturers/${slug}/`),
};

// ============================================================================
// CAR MODELS
// ============================================================================
export const carModelAPI = {
  getAll: (params) => api.get('/illustrations/car-models/', { params }),
  getBySlug: (slug) => api.get(`/illustrations/car-models/${slug}/`),
  getByManufacturer: (manufacturerId) => 
    api.get('/illustrations/car-models/', { params: { manufacturer: manufacturerId } }),
  create: (data) => api.post('/illustrations/car-models/', data),
  update: (slug, data) => api.put(`/illustrations/car-models/${slug}/`, data),
  partialUpdate: (slug, data) => api.patch(`/illustrations/car-models/${slug}/`, data),
  delete: (slug) => api.delete(`/illustrations/car-models/${slug}/`),
};

// ============================================================================
// ENGINE MODELS
// ============================================================================
export const engineModelAPI = {
  getAll: (params) => api.get('/illustrations/engine-models/', { params }),
  getBySlug: (slug) => api.get(`/illustrations/engine-models/${slug}/`),
  getByCarModel: (carModelId) => 
    api.get('/illustrations/engine-models/', { params: { car_model: carModelId } }),
  getByManufacturer: (manufacturerId) => 
    api.get('/illustrations/engine-models/', { params: { car_model__manufacturer: manufacturerId } }),
  create: (data) => api.post('/illustrations/engine-models/', data),
  update: (slug, data) => api.put(`/illustrations/engine-models/${slug}/`, data),
  partialUpdate: (slug, data) => api.patch(`/illustrations/engine-models/${slug}/`, data),
  delete: (slug) => api.delete(`/illustrations/engine-models/${slug}/`),
};

// ============================================================================
// PART CATEGORIES
// ============================================================================
export const partCategoryAPI = {
  getAll: (params) => api.get('/illustrations/part-categories/', { params }),
  getById: (id) => api.get(`/illustrations/part-categories/${id}/`),
  getByEngineModel: (engineModelId) => 
    api.get('/illustrations/part-categories/', { params: { engine_model: engineModelId } }),
  create: (data) => api.post('/illustrations/part-categories/', data),
  update: (id, data) => api.put(`/illustrations/part-categories/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`/illustrations/part-categories/${id}/`, data),
  delete: (id) => api.delete(`/illustrations/part-categories/${id}/`),
};

// ============================================================================
// PART SUBCATEGORIES
// ============================================================================
export const partSubCategoryAPI = {
  getAll: (params) => api.get('/illustrations/part-subcategories/', { params }),
  getById: (id) => api.get(`/illustrations/part-subcategories/${id}/`),
  getByCategory: (categoryId) => 
    api.get('/illustrations/part-subcategories/', { params: { part_category: categoryId } }),
  create: (data) => api.post('/illustrations/part-subcategories/', data),
  update: (id, data) => api.put(`/illustrations/part-subcategories/${id}/`, data),
  partialUpdate: (id, data) => api.patch(`/illustrations/part-subcategories/${id}/`, data),
  delete: (id) => api.delete(`/illustrations/part-subcategories/${id}/`),
};

// ============================================================================
// ILLUSTRATIONS
// ============================================================================
export const illustrationAPI = {
  getAll: (params) => api.get('/illustrations/illustrations/', { params }),
  getById: (id) => api.get(`/illustrations/illustrations/${id}/`),
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
    
    return api.post('/illustrations/illustrations/', formData, {
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
    return api.put(`/illustrations/illustrations/${id}/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  partialUpdate: (id, data) => api.patch(`/illustrations/illustrations/${id}/`, data),
  delete: (id) => api.delete(`/illustrations/illustrations/${id}/`),
};

// ============================================================================
// ILLUSTRATION FILES
// ============================================================================
export const illustrationFileAPI = {
  getAll: (params) => api.get('/illustrations/illustration-files/', { params }),
  create: (illustrationId, file) => {
    const formData = new FormData();
    formData.append('illustration', illustrationId);
    formData.append('file', file);
    return api.post('/illustrations/illustration-files/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  delete: (id) => api.delete(`/illustrations/illustration-files/${id}/`),
};

export default api;