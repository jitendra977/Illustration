import { useState, useEffect, useCallback } from 'react';
import {
  manufacturerAPI,
  carModelAPI,
  engineModelAPI,
  partCategoryAPI,
  partSubCategoryAPI,
  illustrationAPI,
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
      const data = await manufacturerAPI.getAll(params); // ✅ Fixed: No destructuring
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
      const data = await manufacturerAPI.create(manufacturerData); // ✅ Fixed
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
      const data = await manufacturerAPI.update(slug, manufacturerData); // ✅ Fixed
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
// ENGINE MODELS HOOK
// ============================================================================
export const useEngineModels = (manufacturerId = null) => {
  const [engineModels, setEngineModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEngineModels = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = manufacturerId // ✅ Fixed
        ? await engineModelAPI.getByManufacturer(manufacturerId)
        : await engineModelAPI.getAll(params);
      setEngineModels(data.results || data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to fetch engine models';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [manufacturerId]);

  const createEngineModel = useCallback(async (engineModelData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await engineModelAPI.create(engineModelData); // ✅ Fixed
      setEngineModels(prev => [data, ...prev]);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to create engine model';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEngineModel = useCallback(async (slug, engineModelData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await engineModelAPI.update(slug, engineModelData); // ✅ Fixed
      setEngineModels(prev => prev.map(e => e.slug === slug ? data : e));
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to update engine model';
      setError(errorMessage);
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
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to delete engine model';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEngineModels();
  }, [fetchEngineModels]);

  return {
    engineModels,
    loading,
    error,
    fetchEngineModels,
    createEngineModel,
    updateEngineModel,
    deleteEngineModel,
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
      const data = manufacturerId // ✅ Fixed
        ? await carModelAPI.getByManufacturer(manufacturerId)
        : await carModelAPI.getAll(params);
      setCarModels(data.results || data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to fetch car models';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [manufacturerId]);

  const createCarModel = useCallback(async (carModelData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await carModelAPI.create(carModelData); // ✅ Fixed
      setCarModels(prev => [data, ...prev]);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to create car model';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCarModel = useCallback(async (slug, carModelData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await carModelAPI.partialUpdate(slug, carModelData); // ✅ Fixed
      setCarModels(prev => prev.map(c => c.slug === slug ? data : c));
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          Object.values(err.response?.data || {}).join(', ') ||
                          'Failed to update car model';
      setError(errorMessage);
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
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to delete car model';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCarModels();
  }, [fetchCarModels]);

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
// PART CATEGORIES HOOK
// ============================================================================
export const usePartCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await partCategoryAPI.getAll(params); // ✅ Fixed
      setCategories(data.results || data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to fetch categories';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await partCategoryAPI.create(categoryData); // ✅ Fixed
      setCategories(prev => [data, ...prev]);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to create category';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id, categoryData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await partCategoryAPI.update(id, categoryData); // ✅ Fixed
      setCategories(prev => prev.map(c => c.id === id ? data : c));
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to update category';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await partCategoryAPI.delete(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to delete category';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
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
      const data = categoryId // ✅ Fixed
        ? await partSubCategoryAPI.getByCategory(categoryId)
        : await partSubCategoryAPI.getAll(params);
      setSubCategories(data.results || data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to fetch subcategories';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  const createSubCategory = useCallback(async (subCategoryData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await partSubCategoryAPI.create(subCategoryData); // ✅ Fixed
      setSubCategories(prev => [data, ...prev]);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to create subcategory';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSubCategory = useCallback(async (id, subCategoryData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await partSubCategoryAPI.update(id, subCategoryData); // ✅ Fixed
      setSubCategories(prev => prev.map(s => s.id === id ? data : s));
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to update subcategory';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSubCategory = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await partSubCategoryAPI.delete(id);
      setSubCategories(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to delete subcategory';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubCategories();
  }, [fetchSubCategories]);

  return {
    subCategories,
    loading,
    error,
    fetchSubCategories,
    createSubCategory,
    updateSubCategory,
    deleteSubCategory,
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
      const data = await illustrationAPI.getAll({ ...filters, ...params }); // ✅ Fixed
      setIllustrations(data.results || data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to fetch illustrations';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const createIllustration = useCallback(async (illustrationData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await illustrationAPI.create(illustrationData); // ✅ Fixed
      setIllustrations(prev => [data, ...prev]);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.detail || 
                          'Failed to create illustration';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateIllustration = useCallback(async (id, illustrationData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await illustrationAPI.update(id, illustrationData); // ✅ Fixed
      setIllustrations(prev => prev.map(i => i.id === id ? data : i));
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to update illustration';
      setError(errorMessage);
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
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to delete illustration';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addFilesToIllustration = useCallback(async (id, files) => {
    setLoading(true);
    setError(null);
    try {
      const data = await illustrationAPI.addFiles(id, files); // ✅ Fixed
      // Refresh illustrations to get updated file count
      await fetchIllustrations();
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to add files';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchIllustrations]);

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
    addFilesToIllustration,
  };
};

// ============================================================================
// VEHICLE TYPES HOOK
// ============================================================================
export const useVehicleTypes = () => {
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVehicleTypes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await carModelAPI.getVehicleTypes(); // ✅ Fixed
        setVehicleTypes(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch vehicle types');
      } finally {
        setLoading(false);
      }
    };
    fetchVehicleTypes();
  }, []);

  return { vehicleTypes, loading, error };
};

// ============================================================================
// FUEL TYPES HOOK
// ============================================================================
export const useFuelTypes = () => {
  const [fuelTypes, setFuelTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFuelTypes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await engineModelAPI.getFuelTypes(); // ✅ Fixed
        setFuelTypes(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch fuel types');
      } finally {
        setLoading(false);
      }
    };
    fetchFuelTypes();
  }, []);

  return { fuelTypes, loading, error };
};

// ============================================================================
// ILLUSTRATION FILES HOOK
// ============================================================================
export const useIllustrationFiles = (illustrationId = null, fileType = null) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });

  const fetchIllustrationFiles = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    
    // Build query parameters based on props
    const queryParams = { ...params };
    
    if (illustrationId) {
      queryParams.illustration = illustrationId;
    }
    
    if (fileType) {
      queryParams.file_type = fileType;
    }
    
    try {
      const data = await illustrationFileAPI.getAll(queryParams);
      setFiles(data.results || data);
      
      // Handle pagination if available
      if (data.count !== undefined) {
        setPagination({
          count: data.count,
          next: data.next,
          previous: data.previous,
        });
      }
      
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to fetch illustration files';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [illustrationId, fileType]);

  const createIllustrationFile = useCallback(async (fileData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await illustrationFileAPI.create(fileData);
      setFiles(prev => [data, ...prev]);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          Object.values(err.response?.data || {}).join(', ') ||
                          'Failed to create illustration file';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateIllustrationFile = useCallback(async (id, fileData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await illustrationFileAPI.partialUpdate(id, fileData);
      setFiles(prev => prev.map(f => f.id === id ? data : f));
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          Object.values(err.response?.data || {}).join(', ') ||
                          'Failed to update illustration file';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteIllustrationFile = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await illustrationFileAPI.delete(id);
      setFiles(prev => prev.filter(f => f.id !== id));
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to delete illustration file';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Function to upload multiple files to an illustration
  const uploadFilesToIllustration = useCallback(async (illustrationId, files) => {
    setLoading(true);
    setError(null);
    
    const uploadPromises = files.map(file => {
      return illustrationFileAPI.create({
        illustration: illustrationId,
        file: file,
        // You can specify file_type if you have different file types
        // file_type: 'IMAGE' // or 'PDF', 'DWG', etc.
      });
    });
    
    try {
      const results = await Promise.all(uploadPromises);
      // Refresh the files list
      await fetchIllustrationFiles({ illustration: illustrationId });
      return results;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to upload files';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchIllustrationFiles]);

  // Fetch files on component mount or when illustrationId/fileType changes
  useEffect(() => {
    if (illustrationId || fileType) {
      fetchIllustrationFiles();
    }
  }, [fetchIllustrationFiles]);

  return {
    files,
    loading,
    error,
    pagination,
    fetchIllustrationFiles,
    createIllustrationFile,
    updateIllustrationFile,
    deleteIllustrationFile,
    uploadFilesToIllustration,
  };
};

// ============================================================================
// FILE TYPES HOOK (for getting file type choices)
// ============================================================================
export const useFileTypes = () => {
  const [fileTypes, setFileTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFileTypes = async () => {
      setLoading(true);
      setError(null);
      try {
        // This would require adding an endpoint to your backend
        // For now, we'll use the hardcoded choices
        const mockFileTypes = [
          { value: 'IMAGE', label: 'Image' },
          { value: 'PDF', label: 'PDF Document' },
          { value: 'DWG', label: 'CAD Drawing' },
          { value: 'STEP', label: 'STEP File' },
          { value: 'OTHER', label: 'Other' },
        ];
        setFileTypes(mockFileTypes);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch file types');
      } finally {
        setLoading(false);
      }
    };
    fetchFileTypes();
  }, []);

  return { fileTypes, loading, error };
};

// ============================================================================
// COMPREHENSIVE ILLUSTRATION HOOK (with files management)
// ============================================================================
export const useIllustrationWithFiles = (illustrationId) => {
  const [illustration, setIllustration] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const {
    files: illustrationFiles,
    loading: filesLoading,
    error: filesError,
    fetchIllustrationFiles,
    createIllustrationFile,
    deleteIllustrationFile,
    uploadFilesToIllustration,
  } = useIllustrationFiles(illustrationId);

  const fetchIllustration = useCallback(async () => {
    if (!illustrationId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await illustrationAPI.getById(illustrationId);
      setIllustration(data);
      return data;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to fetch illustration';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [illustrationId]);

  const updateIllustrationWithFiles = useCallback(async (illustrationData, files = []) => {
    setLoading(true);
    setError(null);
    try {
      // Update illustration first
      const updatedIllustration = await illustrationAPI.update(
        illustrationId, 
        illustrationData
      );
      setIllustration(updatedIllustration);
      
      // Upload files if any
      if (files.length > 0) {
        await uploadFilesToIllustration(illustrationId, files);
      }
      
      return updatedIllustration;
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 
                          err.response?.data?.message || 
                          'Failed to update illustration';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [illustrationId, uploadFilesToIllustration]);

  useEffect(() => {
    if (illustrationId) {
      fetchIllustration();
      fetchIllustrationFiles();
    }
  }, [illustrationId, fetchIllustration, fetchIllustrationFiles]);

  return {
    illustration,
    files: illustrationFiles,
    loading: loading || filesLoading,
    error: error || filesError,
    fetchIllustration,
    updateIllustration: updateIllustrationWithFiles,
    uploadFilesToIllustration,
    deleteIllustrationFile,
    refresh: () => {
      fetchIllustration();
      fetchIllustrationFiles();
    },
  };
};
