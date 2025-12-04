import { useState, useEffect, useCallback } from 'react';
import {
  manufacturerAPI,
  carModelAPI,
  engineModelAPI,
  partCategoryAPI,
  partSubCategoryAPI,
  illustrationAPI,
  illustrationFileAPI,
} from '../api/illustrations';

// ============================================================================
// MANUFACTURERS HOOK
// ============================================================================
export const useManufacturers = () => {
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchManufacturers = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await manufacturerAPI.getAll(params);
      setManufacturers(data.results || data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch manufacturers');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createManufacturer = useCallback(async (manufacturerData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await manufacturerAPI.create(manufacturerData);
      setManufacturers(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create manufacturer');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateManufacturer = useCallback(async (slug, manufacturerData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await manufacturerAPI.update(slug, manufacturerData);
      setManufacturers(prev => prev.map(m => m.slug === slug ? data : m));
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update manufacturer');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteManufacturer = useCallback(async (slug) => {
    setLoading(true);
    setError(null);
    try {
      await manufacturerAPI.delete(slug);
      setManufacturers(prev => prev.filter(m => m.slug !== slug));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete manufacturer');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchManufacturers();
  }, [fetchManufacturers]);

  return {
    manufacturers,
    loading,
    error,
    fetchManufacturers,
    createManufacturer,
    updateManufacturer,
    deleteManufacturer,
  };
};

// ============================================================================
// CAR MODELS HOOK
// ============================================================================
export const useCarModels = (manufacturerId = null) => {
  const [carModels, setCarModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCarModels = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = manufacturerId
        ? await carModelAPI.getByManufacturer(manufacturerId)
        : await carModelAPI.getAll(params);
      setCarModels(data.results || data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch car models');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [manufacturerId]);

  const createCarModel = useCallback(async (carModelData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await carModelAPI.create(carModelData);
      setCarModels(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create car model');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCarModel = useCallback(async (slug, carModelData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await carModelAPI.update(slug, carModelData);
      setCarModels(prev => prev.map(c => c.slug === slug ? data : c));
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update car model');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCarModel = useCallback(async (slug) => {
    setLoading(true);
    setError(null);
    try {
      await carModelAPI.delete(slug);
      setCarModels(prev => prev.filter(c => c.slug !== slug));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete car model');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (manufacturerId) {
      fetchCarModels();
    }
  }, [manufacturerId, fetchCarModels]);

  return {
    carModels,
    loading,
    error,
    fetchCarModels,
    createCarModel,
    updateCarModel,
    deleteCarModel,
  };
};

// ============================================================================
// ENGINE MODELS HOOK
// ============================================================================
export const useEngineModels = (carModelId = null) => {
  const [engineModels, setEngineModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEngineModels = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = carModelId
        ? await engineModelAPI.getByCarModel(carModelId)
        : await engineModelAPI.getAll(params);
      setEngineModels(data.results || data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch engine models');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [carModelId]);

  const createEngineModel = useCallback(async (engineModelData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await engineModelAPI.create(engineModelData);
      setEngineModels(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create engine model');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteEngineModel = useCallback(async (slug) => {
    setLoading(true);
    setError(null);
    try {
      await engineModelAPI.delete(slug);
      setEngineModels(prev => prev.filter(e => e.slug !== slug));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete engine model');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (carModelId) {
      fetchEngineModels();
    }
  }, [carModelId, fetchEngineModels]);

  return {
    engineModels,
    loading,
    error,
    fetchEngineModels,
    createEngineModel,
    deleteEngineModel,
  };
};

// ============================================================================
// PART CATEGORIES HOOK
// ============================================================================
export const usePartCategories = (engineModelId = null) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = engineModelId
        ? await partCategoryAPI.getByEngineModel(engineModelId)
        : await partCategoryAPI.getAll(params);
      setCategories(data.results || data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [engineModelId]);

  const createCategory = useCallback(async (categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await partCategoryAPI.create(categoryData);
      setCategories(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (engineModelId) {
      fetchCategories();
    }
  }, [engineModelId, fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
  };
};

// ============================================================================
// PART SUBCATEGORIES HOOK
// ============================================================================
export const usePartSubCategories = (categoryId = null) => {
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSubCategories = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = categoryId
        ? await partSubCategoryAPI.getByCategory(categoryId)
        : await partSubCategoryAPI.getAll(params);
      setSubCategories(data.results || data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch subcategories');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  const createSubCategory = useCallback(async (subCategoryData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await partSubCategoryAPI.create(subCategoryData);
      setSubCategories(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create subcategory');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (categoryId) {
      fetchSubCategories();
    }
  }, [categoryId, fetchSubCategories]);

  return {
    subCategories,
    loading,
    error,
    fetchSubCategories,
    createSubCategory,
  };
};

// ============================================================================
// ILLUSTRATIONS HOOK
// ============================================================================
export const useIllustrations = (filters = {}) => {
  const [illustrations, setIllustrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIllustrations = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await illustrationAPI.getAll({ ...filters, ...params });
      setIllustrations(data.results || data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch illustrations');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createIllustration = useCallback(async (illustrationData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await illustrationAPI.create(illustrationData);
      setIllustrations(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create illustration');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateIllustration = useCallback(async (id, illustrationData) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await illustrationAPI.update(id, illustrationData);
      setIllustrations(prev => prev.map(i => i.id === id ? data : i));
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update illustration');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteIllustration = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await illustrationAPI.delete(id);
      setIllustrations(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete illustration');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIllustrations();
  }, [fetchIllustrations]);

  return {
    illustrations,
    loading,
    error,
    fetchIllustrations,
    createIllustration,
    updateIllustration,
    deleteIllustration,
  };
};