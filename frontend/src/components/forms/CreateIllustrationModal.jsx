import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
  Box,
  IconButton,
  Alert,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import {
  Close as CloseIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { 
  illustrationAPI, 
  manufacturerAPI, 
  carModelAPI, 
  engineModelAPI, 
  partCategoryAPI 
} from '../../api/illustrations';

const CreateIllustrationModal = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    manufacturer: '',
    car_model: '',
    engine_model: '',
    part_category: '',
    uploaded_files: []
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Data states
  const [manufacturers, setManufacturers] = useState([]);
  const [carModels, setCarModels] = useState([]);
  const [engineModels, setEngineModels] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // Loading states
  const [loadingManufacturers, setLoadingManufacturers] = useState(false);
  const [loadingCarModels, setLoadingCarModels] = useState(false);
  const [loadingEngineModels, setLoadingEngineModels] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch manufacturers on mount
  useEffect(() => {
    if (open) {
      fetchManufacturers();
    }
  }, [open]);

  const fetchManufacturers = async () => {
    setLoadingManufacturers(true);
    try {
      const response = await manufacturerAPI.getAll();
      setManufacturers(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to fetch manufacturers:', error);
      setErrors(prev => ({ ...prev, manufacturers: 'Failed to load manufacturers' }));
    } finally {
      setLoadingManufacturers(false);
    }
  };

  const fetchCarModels = async (manufacturerId) => {
    if (!manufacturerId) {
      setCarModels([]);
      return;
    }
    
    setLoadingCarModels(true);
    try {
      const response = await carModelAPI.getAll({ manufacturer: manufacturerId });
      setCarModels(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to fetch car models:', error);
      setErrors(prev => ({ ...prev, car_models: 'Failed to load car models' }));
    } finally {
      setLoadingCarModels(false);
    }
  };

  const fetchEngineModels = async (carModelId) => {
    if (!carModelId) {
      setEngineModels([]);
      return;
    }
    
    setLoadingEngineModels(true);
    try {
      const response = await engineModelAPI.getAll({ car_model: carModelId });
      setEngineModels(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to fetch engine models:', error);
      setErrors(prev => ({ ...prev, engine_models: 'Failed to load engine models' }));
    } finally {
      setLoadingEngineModels(false);
    }
  };

  const fetchCategories = async (engineModelId) => {
    if (!engineModelId) {
      setCategories([]);
      return;
    }
    
    setLoadingCategories(true);
    try {
      const response = await partCategoryAPI.getAll({ engine_model: engineModelId });
      setCategories(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to fetch part categories:', error);
      setErrors(prev => ({ ...prev, categories: 'Failed to load part categories' }));
    } finally {
      setLoadingCategories(false);
    }
  };

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setFormData({
        title: '',
        description: '',
        manufacturer: '',
        car_model: '',
        engine_model: '',
        part_category: '',
        uploaded_files: []
      });
      setErrors({});
      setCarModels([]);
      setEngineModels([]);
      setCategories([]);
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'manufacturer') {
      setFormData(prev => ({ 
        ...prev, 
        car_model: '', 
        engine_model: '', 
        part_category: '' 
      }));
      setEngineModels([]);
      setCategories([]);
      fetchCarModels(value);
    } else if (name === 'car_model') {
      setFormData(prev => ({ 
        ...prev, 
        engine_model: '', 
        part_category: '' 
      }));
      setCategories([]);
      fetchEngineModels(value);
    } else if (name === 'engine_model') {
      setFormData(prev => ({ ...prev, part_category: '' }));
      fetchCategories(value);
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setErrors(prev => ({ 
        ...prev, 
        files: `Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}` 
      }));
      return;
    }
    
    // Validate file sizes (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      setErrors(prev => ({ 
        ...prev, 
        files: `Files too large (max 10MB): ${oversizedFiles.map(f => f.name).join(', ')}` 
      }));
      return;
    }
    
    setFormData(prev => ({ 
      ...prev, 
      uploaded_files: [...prev.uploaded_files, ...files] 
    }));
    
    // Clear file error
    if (errors.files) {
      setErrors(prev => ({ ...prev, files: '' }));
    }
  };

  const removeFile = (index) => {
    setFormData(prev => ({
      ...prev,
      uploaded_files: prev.uploaded_files.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.engine_model) newErrors.engine_model = 'Engine model is required';
    if (!formData.part_category) newErrors.part_category = 'Part category is required';
    if (formData.uploaded_files.length === 0) newErrors.files = 'At least one file is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Prepare data object (not FormData) - the API will handle FormData creation
      const dataToSend = {
        title: formData.title.trim(),
        engine_model: formData.engine_model,
        part_category: formData.part_category,
        uploaded_files: formData.uploaded_files
      };
      
      // Add optional description
      if (formData.description && formData.description.trim()) {
        dataToSend.description = formData.description.trim();
      }
      
      // Create the illustration - let the API handle FormData creation
      await illustrationAPI.create(dataToSend);
      
      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
      
      // Close the modal
      handleClose();
    } catch (err) {
      console.error('Create illustration error:', err);
      
      // Handle API validation errors
      const apiError = err.response?.data;
      if (apiError) {
        const fieldErrors = {};
        Object.keys(apiError).forEach(key => {
          if (['title', 'description', 'engine_model', 'part_category'].includes(key)) {
            fieldErrors[key] = Array.isArray(apiError[key]) 
              ? apiError[key].join(', ') 
              : apiError[key];
          } else if (key === 'non_field_errors' || key === 'detail') {
            fieldErrors.submit = Array.isArray(apiError[key])
              ? apiError[key].join(', ')
              : apiError[key];
          } else if (key === 'uploaded_files' || key === 'files') {
            fieldErrors.files = Array.isArray(apiError[key]) 
              ? apiError[key].join(', ') 
              : apiError[key];
          } else {
            // Catch any other field errors
            fieldErrors[key] = Array.isArray(apiError[key]) 
              ? apiError[key].join(', ') 
              : apiError[key];
          }
        });
        
        // If there are field errors but no specific mapping, show as general error
        if (Object.keys(fieldErrors).length === 0) {
          fieldErrors.submit = JSON.stringify(apiError);
        }
        
        setErrors(fieldErrors);
      } else {
        setErrors({ submit: err.message || 'Failed to create illustration' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return; // Prevent closing while loading
    
    setFormData({
      title: '',
      description: '',
      manufacturer: '',
      car_model: '',
      engine_model: '',
      part_category: '',
      uploaded_files: []
    });
    setErrors({});
    setLoading(false);
    setCarModels([]);
    setEngineModels([]);
    setCategories([]);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      disableEscapeKeyDown={loading}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">New Illustration</Typography>
          <IconButton onClick={handleClose} disabled={loading}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Title *"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title}
              size="small"
              fullWidth
              disabled={loading}
              autoFocus
            />

            <TextField
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description}
              multiline
              rows={2}
              size="small"
              fullWidth
              disabled={loading}
            />

            {/* Manufacturer selection (optional, for filtering) */}
            <TextField
              select
              label="Manufacturer"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              error={!!errors.manufacturers}
              helperText={errors.manufacturers}
              size="small"
              fullWidth
              disabled={loading || loadingManufacturers || manufacturers.length === 0}
            >
              <MenuItem value="">
                {loadingManufacturers ? 'Loading...' : 'Select manufacturer (optional)'}
              </MenuItem>
              {manufacturers.map(m => (
                <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
              ))}
            </TextField>

            {/* Car Model selection */}
            <TextField
              select
              label="Car Model"
              name="car_model"
              value={formData.car_model}
              onChange={handleChange}
              error={!!errors.car_model}
              helperText={errors.car_model || 'Select a manufacturer first'}
              disabled={loading || loadingCarModels || !formData.manufacturer}
              size="small"
              fullWidth
            >
              <MenuItem value="">
                {loadingCarModels ? 'Loading...' : 'Select car model'}
              </MenuItem>
              {carModels.map(c => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Engine Model selection */}
            <TextField
              select
              label="Engine Model *"
              name="engine_model"
              value={formData.engine_model}
              onChange={handleChange}
              error={!!errors.engine_model}
              helperText={errors.engine_model || 'Select a car model first'}
              disabled={loading || loadingEngineModels || !formData.car_model}
              size="small"
              fullWidth
            >
              <MenuItem value="">
                {loadingEngineModels ? 'Loading...' : 'Select engine model'}
              </MenuItem>
              {engineModels.map(e => (
                <MenuItem key={e.id} value={e.id}>
                  {e.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Part Category selection */}
            <TextField
              select
              label="Part Category *"
              name="part_category"
              value={formData.part_category}
              onChange={handleChange}
              error={!!errors.part_category}
              helperText={errors.part_category || 'Select an engine model first'}
              disabled={loading || loadingCategories || !formData.engine_model}
              size="small"
              fullWidth
            >
              <MenuItem value="">
                {loadingCategories ? 'Loading...' : 'Select part category'}
              </MenuItem>
              {categories.map(c => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            {/* File Upload Section */}
            <Box>
              <input
                accept="image/*,.pdf,.png,.jpg,.jpeg"
                style={{ display: 'none' }}
                id="illustration-file-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                disabled={loading}
              />
              <label htmlFor="illustration-file-upload">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  fullWidth
                  disabled={loading}
                >
                  Upload Files
                </Button>
              </label>
              {errors.files && (
                <FormHelperText error>{errors.files}</FormHelperText>
              )}
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                Supported: Images (PNG, JPG, JPEG), PDF. Max 10MB per file.
              </Typography>
            </Box>

            {/* File List */}
            {formData.uploaded_files.length > 0 && (
              <Box>
                <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                  Selected Files ({formData.uploaded_files.length})
                </Typography>
                <Stack spacing={1}>
                  {formData.uploaded_files.map((file, index) => (
                    <Stack 
                      key={index} 
                      direction="row" 
                      alignItems="center" 
                      justifyContent="space-between"
                      sx={{ 
                        p: 1, 
                        bgcolor: 'grey.50', 
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" noWrap>
                          {file.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {(file.size / 1024).toFixed(2)} KB
                        </Typography>
                      </Box>
                      <IconButton 
                        size="small" 
                        onClick={() => removeFile(index)}
                        disabled={loading}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Error Alert */}
            {errors.submit && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errors.submit}
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={handleClose} 
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={loading || formData.uploaded_files.length === 0}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {loading ? 'Creating...' : 'Create Illustration'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateIllustrationModal;