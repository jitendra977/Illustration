// src/api/illustrations.js - COMPLETE CORRECTED VERSION
import axios from 'axios';

// Use environment variable or default to localhost with /api prefix
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
// MANUFACTURERS API - CORRECTED WITH FALLBACK
// ============================================================================
export const manufacturerAPI = {
  /**
   * Get all manufacturers with optional filtering
   */
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
      throw {
        error: error.response?.data?.detail || error.message || 'メーカー一覧の取得に失敗しました',
        code: error.response?.status === 404 ? 'NOT_FOUND' : 'UNKNOWN',
        details: error.response?.data
      };
    }
  },

  /**
   * Get manufacturer by ID (PRIMARY METHOD)
   * Tries ID-based endpoint first, falls back to list search
   */
  getById: async (id) => {
    const cacheKey = `manufacturer:${id}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log('✅ Cache hit for manufacturer ID:', id);
      return cached;
    }

    try {
      console.log('🔍 Fetching manufacturer by ID from API:', id);

      // Try ID-based endpoint first
      const response = await api.get(`/manufacturers/${id}/`);
      setCache(cacheKey, response.data);
      console.log('✅ Manufacturer fetched successfully:', response.data);
      return response.data;

    } catch (error) {
      // If 404, try fallback to list search
      if (error.response?.status === 404) {
        console.warn('⚠️ ID-based endpoint not found, trying list search...');

        try {
          const list = await manufacturerAPI.getAll();
          const manufacturers = list.results || list;
          const manufacturer = manufacturers.find(m => m.id === parseInt(id));

          if (!manufacturer) {
            throw new Error(`Manufacturer with ID ${id} not found`);
          }

          setCache(cacheKey, manufacturer);
          console.log('✅ Manufacturer found in list:', manufacturer);
          return manufacturer;

        } catch (listError) {
          console.error('❌ List search also failed:', listError);
          throw {
            error: `メーカーID ${id} が見つかりません`,
            code: 'NOT_FOUND',
            details: listError
          };
        }
      }

      console.error('❌ Manufacturer fetch failed:', error);
      throw {
        error: error.response?.data?.detail || error.message || `メーカーID ${id} の取得に失敗しました`,
        code: error.response?.status === 404 ? 'NOT_FOUND' : 'UNKNOWN',
        details: error.response?.data
      };
    }
  },

  /**
   * Get manufacturer by slug (backward compatibility)
   */
  getBySlug: async (slug) => {
    const cacheKey = `manufacturer-slug:${slug}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get(`/manufacturers/${slug}/`);
      setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Manufacturer API error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'メーカーの取得に失敗しました',
        code: 'UNKNOWN',
        details: error.response?.data
      };
    }
  },

  /**
   * Create new manufacturer
   */
  create: async (data) => {
    try {
      clearCache();
      const response = await api.post('/manufacturers/', data);
      return response.data;
    } catch (error) {
      console.error('Manufacturer create error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'メーカーの作成に失敗しました',
        details: error.response?.data
      };
    }
  },

  /**
   * Update manufacturer (full update)
   */
  update: async (idOrSlug, data) => {
    try {
      clearCache();
      const response = await api.put(`/manufacturers/${idOrSlug}/`, data);
      return response.data;
    } catch (error) {
      console.error('Manufacturer update error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'メーカーの更新に失敗しました',
        details: error.response?.data
      };
    }
  },

  /**
   * Update manufacturer (partial update)
   */
  partialUpdate: async (idOrSlug, data) => {
    try {
      clearCache();
      const response = await api.patch(`/manufacturers/${idOrSlug}/`, data);
      return response.data;
    } catch (error) {
      console.error('Manufacturer partial update error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'メーカーの更新に失敗しました',
        details: error.response?.data
      };
    }
  },

  /**
   * Delete manufacturer
   */
  delete: async (idOrSlug) => {
    try {
      clearCache();
      const response = await api.delete(`/manufacturers/${idOrSlug}/`);
      return response.data;
    } catch (error) {
      console.error('Manufacturer delete error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'メーカーの削除に失敗しました',
        details: error.response?.data
      };
    }
  },
};

// ============================================================================
// ENGINE MODELS API - CORRECTED WITH FALLBACK
// ============================================================================
export const engineModelAPI = {
  /**
   * Get all engine models with optional filtering
   */
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
      throw {
        error: error.response?.data?.detail || error.message || 'エンジン一覧の取得に失敗しました',
        code: 'UNKNOWN',
        details: error.response?.data
      };
    }
  },

  /**
   * Get engine model by ID (PRIMARY METHOD)
   * Tries ID-based endpoint first, falls back to list search
   */
  getById: async (id) => {
    const cacheKey = `engine-model:${id}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log('✅ Cache hit for engine ID:', id);
      return cached;
    }

    try {
      console.log('🔍 Fetching engine by ID from API:', id);

      // Try ID-based endpoint first
      const response = await api.get(`/engine-models/${id}/`);
      setCache(cacheKey, response.data);
      console.log('✅ Engine fetched successfully:', response.data);
      return response.data;

    } catch (error) {
      // If 404, try fallback to list search
      if (error.response?.status === 404) {
        console.warn('⚠️ ID-based endpoint not found, trying list search...');

        try {
          const list = await engineModelAPI.getAll();
          const engines = list.results || list;
          const engine = engines.find(e => e.id === parseInt(id));

          if (!engine) {
            throw new Error(`Engine model with ID ${id} not found`);
          }

          setCache(cacheKey, engine);
          console.log('✅ Engine found in list:', engine);
          return engine;

        } catch (listError) {
          console.error('❌ List search also failed:', listError);
          throw {
            error: `エンジンID ${id} が見つかりません`,
            code: 'NOT_FOUND',
            details: listError
          };
        }
      }

      console.error('❌ Engine fetch failed:', error);
      throw {
        error: error.response?.data?.detail || error.message || `エンジンID ${id} の取得に失敗しました`,
        code: error.response?.status === 404 ? 'NOT_FOUND' : 'UNKNOWN',
        details: error.response?.data
      };
    }
  },

  /**
   * Get engine model by slug (backward compatibility)
   */
  getBySlug: async (slug) => {
    const cacheKey = `engine-model-slug:${slug}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get(`/engine-models/${slug}/`);
      setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Engine Model API error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'エンジンの取得に失敗しました',
        code: 'UNKNOWN',
        details: error.response?.data
      };
    }
  },

  /**
   * Get engines by manufacturer ID
   */
  getByManufacturer: async (manufacturerId) => {
    const cacheKey = `engine-models-by-manufacturer:${manufacturerId}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get('/engine-models/', {
        params: { manufacturer: manufacturerId }
      });
      setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Engine Model API error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'エンジン一覧の取得に失敗しました',
        details: error.response?.data
      };
    }
  },

  /**
   * Get available fuel types
   */
  getFuelTypes: async () => {
    const cacheKey = 'fuel-types';
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get('/engine-models/fuel-types/');
      setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Fuel types API error:', error);
      // Return default fuel types as fallback
      return [
        { value: 'diesel', label: 'ディーゼル' },
        { value: 'petrol', label: 'ガソリン' },
        { value: 'hybrid', label: 'ハイブリッド' },
        { value: 'electric', label: '電気(EV)' },
        { value: 'lpg', label: 'LPG(液化プロパンガス)' }
      ];
    }
  },

  /**
   * Create new engine model
   */
  create: async (data) => {
    try {
      clearCache();
      const response = await api.post('/engine-models/', data);
      return response.data;
    } catch (error) {
      console.error('Engine Model create error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'エンジンの作成に失敗しました',
        details: error.response?.data
      };
    }
  },

  /**
   * Update engine model (full update)
   */
  update: async (idOrSlug, data) => {
    try {
      clearCache();
      const response = await api.put(`/engine-models/${idOrSlug}/`, data);
      return response.data;
    } catch (error) {
      console.error('Engine Model update error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'エンジンの更新に失敗しました',
        details: error.response?.data
      };
    }
  },

  /**
   * Update engine model (partial update)
   */
  partialUpdate: async (idOrSlug, data) => {
    try {
      clearCache();
      const response = await api.patch(`/engine-models/${idOrSlug}/`, data);
      return response.data;
    } catch (error) {
      console.error('Engine Model partial update error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'エンジンの更新に失敗しました',
        details: error.response?.data
      };
    }
  },

  /**
   * Delete engine model
   */
  delete: async (idOrSlug) => {
    try {
      clearCache();
      const response = await api.delete(`/engine-models/${idOrSlug}/`);
      return response.data;
    } catch (error) {
      console.error('Engine Model delete error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'エンジンの削除に失敗しました',
        details: error.response?.data
      };
    }
  },
};

// ============================================================================
// CAR MODELS API
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
      throw {
        error: error.response?.data?.detail || error.message || '車種一覧の取得に失敗しました',
        details: error.response?.data
      };
    }
  },

  getBySlug: async (slug) => {
    try {
      const response = await api.get(`/car-models/${slug}/`);
      return response.data;
    } catch (error) {
      console.error('Car Model API error:', error);
      throw {
        error: error.response?.data?.detail || error.message || '車種の取得に失敗しました',
        details: error.response?.data
      };
    }
  },

  getByManufacturer: async (manufacturerId) => {
    const cacheKey = `car-models-by-manufacturer:${manufacturerId}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get('/car-models/', {
        params: { manufacturer: manufacturerId }
      });
      setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Car Model API error:', error);
      throw {
        error: error.response?.data?.detail || error.message || '車種一覧の取得に失敗しました',
        details: error.response?.data
      };
    }
  },

  create: async (data) => {
    try {
      clearCache();
      const response = await api.post('/car-models/', data);
      return response.data;
    } catch (error) {
      console.error('Car Model create error:', error);
      throw {
        error: error.response?.data?.detail || error.message || '車種の作成に失敗しました',
        details: error.response?.data
      };
    }
  },

  update: async (slug, data) => {
    try {
      clearCache();
      const response = await api.put(`/car-models/${slug}/`, data);
      return response.data;
    } catch (error) {
      console.error('Car Model update error:', error);
      throw {
        error: error.response?.data?.detail || error.message || '車種の更新に失敗しました',
        details: error.response?.data
      };
    }
  },

  partialUpdate: async (slug, data) => {
    try {
      clearCache();
      const response = await api.patch(`/car-models/${slug}/`, data);
      return response.data;
    } catch (error) {
      console.error('Car Model partial update error:', error);
      throw {
        error: error.response?.data?.detail || error.message || '車種の更新に失敗しました',
        details: error.response?.data
      };
    }
  },

  delete: async (slug) => {
    try {
      clearCache();
      const response = await api.delete(`/car-models/${slug}/`);
      return response.data;
    } catch (error) {
      console.error('Car Model delete error:', error);
      throw {
        error: error.response?.data?.detail || error.message || '車種の削除に失敗しました',
        details: error.response?.data
      };
    }
  },

  getVehicleTypes: async () => {
    const cacheKey = 'vehicle-types';
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get('/car-models/vehicle-types/');
      setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Vehicle types API error:', error);
      // Return default types as fallback
      return [
        { value: 'truck', label: 'トラック' },
        { value: 'bus', label: 'バス' },
        { value: 'van', label: 'バン' }
      ];
    }
  },
};

// ============================================================================
// PART CATEGORIES API
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
      throw {
        error: error.response?.data?.detail || error.message || 'カテゴリ一覧の取得に失敗しました',
        details: error.response?.data
      };
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/part-categories/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Part Category API error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'カテゴリの取得に失敗しました',
        details: error.response?.data
      };
    }
  },

  create: async (data) => {
    try {
      clearCache();
      const response = await api.post('/part-categories/', data);
      return response.data;
    } catch (error) {
      console.error('Part Category create error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'カテゴリの作成に失敗しました',
        details: error.response?.data
      };
    }
  },

  update: async (id, data) => {
    try {
      clearCache();
      const response = await api.put(`/part-categories/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Part Category update error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'カテゴリの更新に失敗しました',
        details: error.response?.data
      };
    }
  },

  partialUpdate: async (id, data) => {
    try {
      clearCache();
      const response = await api.patch(`/part-categories/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Part Category partial update error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'カテゴリの更新に失敗しました',
        details: error.response?.data
      };
    }
  },

  delete: async (id) => {
    try {
      clearCache();
      const response = await api.delete(`/part-categories/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Part Category delete error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'カテゴリの削除に失敗しました',
        details: error.response?.data
      };
    }
  },
};

// ============================================================================
// PART SUBCATEGORIES API
// ============================================================================
export const partSubCategoryAPI = {
  getAll: async (params = {}) => {
    const cacheKey = getCacheKey('part-subcategories', params);
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get('/part-subcategories/', { params });
      setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Part SubCategory API error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'サブカテゴリ一覧の取得に失敗しました',
        details: error.response?.data
      };
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/part-subcategories/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Part SubCategory API error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'サブカテゴリの取得に失敗しました',
        details: error.response?.data
      };
    }
  },

  getByCategory: async (categoryId) => {
    const cacheKey = `part-subcategories-by-category:${categoryId}`;
    const cached = getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const response = await api.get('/part-subcategories/', {
        params: { part_category: categoryId }
      });
      setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Part SubCategory API error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'サブカテゴリ一覧の取得に失敗しました',
        details: error.response?.data
      };
    }
  },

  create: async (data) => {
    try {
      clearCache();
      const response = await api.post('/part-subcategories/', data);
      return response.data;
    } catch (error) {
      console.error('Part SubCategory create error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'サブカテゴリの作成に失敗しました',
        details: error.response?.data
      };
    }
  },

  update: async (id, data) => {
    try {
      clearCache();
      const response = await api.put(`/part-subcategories/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Part SubCategory update error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'サブカテゴリの更新に失敗しました',
        details: error.response?.data
      };
    }
  },

  partialUpdate: async (id, data) => {
    try {
      clearCache();
      const response = await api.patch(`/part-subcategories/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Part SubCategory partial update error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'サブカテゴリの更新に失敗しました',
        details: error.response?.data
      };
    }
  },

  delete: async (id) => {
    try {
      clearCache();
      const response = await api.delete(`/part-subcategories/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Part SubCategory delete error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'サブカテゴリの削除に失敗しました',
        details: error.response?.data
      };
    }
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
      console.log('✅ Cache hit for illustrations list');
      return cached;
    }

    try {
      const response = await api.get('/illustrations/', {
        params: {
          ...params,
          include_files: params.include_files || false,
        }
      });

      if (!params.include_files) {
        setCache(cacheKey, response.data);
      }
      return response.data;
    } catch (error) {
      console.error('Illustration API error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'イラスト一覧の取得に失敗しました',
        details: error.response?.data
      };
    }
  },

  /**
   * Get single illustration - includes all files
   */
  getById: async (id) => {
    const cacheKey = `illustration:${id}`;
    const cached = getFromCache(cacheKey);
    if (cached) {
      console.log('✅ Cache hit for illustration detail');
      return cached;
    }

    try {
      const response = await api.get(`/illustrations/${id}/`);
      setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Illustration API error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'イラストの取得に失敗しました',
        details: error.response?.data
      };
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
      throw {
        error: error.response?.data?.detail || error.message || '統計情報の取得に失敗しました',
        details: error.response?.data
      };
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
      console.error('Illustration create error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'イラストの作成に失敗しました',
        details: error.response?.data
      };
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
      console.error('Illustration update error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'イラストの更新に失敗しました',
        details: error.response?.data
      };
    }
  },

  partialUpdate: async (id, data) => {
    try {
      clearCache();
      const response = await api.patch(`/illustrations/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Illustration partial update error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'イラストの更新に失敗しました',
        details: error.response?.data
      };
    }
  },

  delete: async (id) => {
    try {
      clearCache();
      const response = await api.delete(`/illustrations/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Illustration delete error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'イラストの削除に失敗しました',
        details: error.response?.data
      };
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
      throw {
        error: error.response?.data?.detail || error.message || 'ファイルの追加に失敗しました',
        details: error.response?.data
      };
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
      console.error('File delete error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'ファイルの削除に失敗しました',
        details: error.response?.data
      };
    }
  },

  // Batch operations
  bulkDelete: async (ids) => {
    try {
      clearCache();
      const response = await api.post('/illustrations/bulk-delete/', { ids });
      return response.data;
    } catch (error) {
      console.error('Bulk delete error:', error);
      throw {
        error: error.response?.data?.detail || error.message || '一括削除に失敗しました',
        details: error.response?.data
      };
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
      throw {
        error: error.response?.data?.detail || error.message || 'ファイル一覧の取得に失敗しました',
        details: error.response?.data
      };
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
      throw {
        error: error.response?.data?.detail || error.message || 'ファイル一覧の取得に失敗しました',
        details: error.response?.data
      };
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/illustration-files/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Illustration File API error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'ファイルの取得に失敗しました',
        details: error.response?.data
      };
    }
  },

  create: async (data) => {
    const formData = new FormData();

    // Add fields to form data
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined) {
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
      console.error('Illustration File create error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'ファイルの作成に失敗しました',
        details: error.response?.data
      };
    }
  },

  update: async (id, data) => {
    try {
      clearCache();
      const response = await api.put(`/illustration-files/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Illustration File update error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'ファイルの更新に失敗しました',
        details: error.response?.data
      };
    }
  },

  partialUpdate: async (id, data) => {
    try {
      clearCache();
      const response = await api.patch(`/illustration-files/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Illustration File partial update error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'ファイルの更新に失敗しました',
        details: error.response?.data
      };
    }
  },

  delete: async (id) => {
    try {
      clearCache();
      const response = await api.delete(`/illustration-files/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Illustration File delete error:', error);
      throw {
        error: error.response?.data?.detail || error.message || 'ファイルの削除に失敗しました',
        details: error.response?.data
      };
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
      throw {
        error: error.response?.data?.detail || error.message || 'ファイル一覧の取得に失敗しました',
        details: error.response?.data
      };
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
      throw {
        error: error.response?.data?.detail || error.message || 'ダウンロードに失敗しました',
        details: error.response?.data
      };
    }
  },
};

export default api;