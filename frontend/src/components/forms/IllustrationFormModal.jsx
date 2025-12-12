// src/components/forms/IllustrationFormModal.jsx
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
  FormHelperText,
  Slide,
  useMediaQuery,
  useTheme,
  alpha,
  Paper,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { 
  illustrationAPI, 
  manufacturerAPI, 
  carModelAPI, 
  engineModelAPI, 
  partCategoryAPI,
  illustrationFileAPI 
} from '../../api/illustrations';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const IllustrationFormModal = ({ 
  open, 
  onClose, 
  onSuccess, 
  illustration = null, 
  mode = 'create'
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    manufacturer: '',
    car_model: '',
    engine_model: '',
    part_category: '',
    uploaded_files: []
  });
  
  const [existingFiles, setExistingFiles] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  
  const [manufacturers, setManufacturers] = useState([]);
  const [carModels, setCarModels] = useState([]);
  const [engineModels, setEngineModels] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [loadingManufacturers, setLoadingManufacturers] = useState(false);
  const [loadingCarModels, setLoadingCarModels] = useState(false);
  const [loadingEngineModels, setLoadingEngineModels] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const isEditMode = mode === 'edit';
  const title = isEditMode ? 'イラストを編集' : '新規イラスト作成';
  const submitButtonText = isEditMode ? '更新' : '作成';

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      console.log('Modal opening, mode:', mode, 'illustration:', illustration);
      setInitialDataLoaded(false);
      setFormData({
        title: '',
        description: '',
        manufacturer: '',
        car_model: '',
        engine_model: '',
        part_category: '',
        uploaded_files: []
      });
      setExistingFiles([]);
      setNewFiles([]);
      setFilesToDelete([]);
      setErrors({});
      setSubmitSuccess(false);
      
      // Always load manufacturers first
      loadManufacturers();
    }
  }, [open, mode]);

  // Load manufacturers
  const loadManufacturers = async () => {
    setLoadingManufacturers(true);
    try {
      const response = await manufacturerAPI.getAll({ 
        page_size: 1000,
        ordering: 'name'
      });
      const manufacturersData = response.data.results || response.data || [];
      setManufacturers(manufacturersData);
      console.log('Loaded manufacturers:', manufacturersData.length);
      
      // If edit mode and we have illustration data, set form data after manufacturers are loaded
      if (isEditMode && illustration) {
        await setEditFormData(illustration, manufacturersData);
      }
    } catch (error) {
      console.error('Error loading manufacturers:', error);
      setErrors(prev => ({ ...prev, submit: 'メーカーデータの読み込みに失敗しました' }));
    } finally {
      setLoadingManufacturers(false);
    }
  };

  // Set edit form data after manufacturers are loaded
  const setEditFormData = async (ill, manufacturersList) => {
    console.log('Setting edit form data for illustration:', ill);
    
    // Get IDs from the illustration object
    const manufacturerId = ill.car_model?.manufacturer?.id || 
                          ill.engine_model?.car_model?.manufacturer?.id || '';
    const carModelId = ill.car_model?.id || 
                      ill.engine_model?.car_model?.id || '';
    const engineModelId = ill.engine_model?.id || '';
    const partCategoryId = ill.part_category?.id || '';
    
    console.log('Extracted IDs:', { manufacturerId, carModelId, engineModelId, partCategoryId });
    
    // Set basic form data
    const initialFormData = {
      title: ill.title || '',
      description: ill.description || '',
      manufacturer: manufacturerId,
      car_model: carModelId,
      engine_model: engineModelId,
      part_category: partCategoryId,
      uploaded_files: []
    };
    
    setFormData(initialFormData);
    setExistingFiles(ill.files || []);
    
    // If we have manufacturer ID, load car models
    if (manufacturerId) {
      await loadCarModels(manufacturerId, carModelId, engineModelId, partCategoryId);
    } else {
      setInitialDataLoaded(true);
    }
  };

  const loadCarModels = async (manufacturerId, preSelectedCarModelId = '', preSelectedEngineModelId = '', preSelectedPartCategoryId = '') => {
    setLoadingCarModels(true);
    try {
      const response = await carModelAPI.getAll({ 
        manufacturer: manufacturerId,
        page_size: 1000,
        ordering: 'name'
      });
      const carModelsData = response.data.results || response.data || [];
      setCarModels(carModelsData);
      console.log('Loaded car models:', carModelsData.length);
      
      // If we have a pre-selected car model ID, load engine models
      if (preSelectedCarModelId) {
        await loadEngineModels(preSelectedCarModelId, preSelectedEngineModelId, preSelectedPartCategoryId);
      } else {
        setInitialDataLoaded(true);
      }
    } catch (error) {
      console.error('Error loading car models:', error);
      setCarModels([]);
    } finally {
      setLoadingCarModels(false);
    }
  };

  const loadEngineModels = async (carModelId, preSelectedEngineModelId = '', preSelectedPartCategoryId = '') => {
    setLoadingEngineModels(true);
    try {
      const response = await engineModelAPI.getAll({ 
        car_model: carModelId,
        page_size: 1000,
        ordering: 'name'
      });
      const engineModelsData = response.data.results || response.data || [];
      setEngineModels(engineModelsData);
      console.log('Loaded engine models:', engineModelsData.length);
      
      // If we have a pre-selected engine model ID, load categories
      if (preSelectedEngineModelId) {
        await loadCategories(preSelectedEngineModelId, preSelectedPartCategoryId);
      } else {
        setInitialDataLoaded(true);
      }
    } catch (error) {
      console.error('Error loading engine models:', error);
      setEngineModels([]);
    } finally {
      setLoadingEngineModels(false);
    }
  };

  const loadCategories = async (engineModelId, preSelectedPartCategoryId = '') => {
    setLoadingCategories(true);
    try {
      const response = await partCategoryAPI.getAll({ 
        engine_model: engineModelId,
        page_size: 1000,
        ordering: 'name'
      });
      const categoriesData = response.data.results || response.data || [];
      setCategories(categoriesData);
      console.log('Loaded categories:', categoriesData.length);
      setInitialDataLoaded(true);
    } catch (error) {
      console.error('Error loading part categories:', error);
      setCategories([]);
      setInitialDataLoaded(true);
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field ${name} changed to:`, value);
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Handle cascading dropdowns
    if (name === 'manufacturer') {
      setFormData(prev => ({ 
        ...prev, 
        car_model: '', 
        engine_model: '', 
        part_category: '' 
      }));
      setCarModels([]);
      setEngineModels([]);
      setCategories([]);
      if (value) {
        loadCarModels(value);
      }
    } else if (name === 'car_model') {
      setFormData(prev => ({ 
        ...prev, 
        engine_model: '', 
        part_category: '' 
      }));
      setEngineModels([]);
      setCategories([]);
      if (value) {
        loadEngineModels(value);
      }
    } else if (name === 'engine_model') {
      setFormData(prev => ({ ...prev, part_category: '' }));
      setCategories([]);
      if (value) {
        loadCategories(value);
      }
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 'image/webp'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setErrors(prev => ({ 
        ...prev, 
        files: `無効なファイル形式: ${invalidFiles.map(f => f.name).join(', ')}` 
      }));
      return;
    }
    
    // Validate file sizes (max 10MB per file)
    const maxSize = 10 * 1024 * 1024;
    const oversizedFiles = files.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      setErrors(prev => ({ 
        ...prev, 
        files: `ファイルサイズが大きすぎます（最大10MB）: ${oversizedFiles.map(f => f.name).join(', ')}` 
      }));
      return;
    }
    
    // Add to new files
    setNewFiles(prev => [...prev, ...files]);
    
    // Clear file error
    if (errors.files) {
      setErrors(prev => ({ ...prev, files: '' }));
    }
  };

  const removeNewFile = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = (fileId) => {
    if (isEditMode) {
      setFilesToDelete(prev => [...prev, fileId]);
      setExistingFiles(prev => prev.filter(f => f.id !== fileId));
    } else {
      // For create mode, we haven't uploaded files yet, so just remove from newFiles
      setNewFiles(prev => prev.filter((_, i) => i !== fileId));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = 'タイトルは必須です';
    if (!formData.engine_model) newErrors.engine_model = 'エンジンモデルは必須です';
    if (!formData.part_category) newErrors.part_category = 'パーツカテゴリは必須です';
    
    // Check total files
    const totalFiles = (isEditMode 
      ? (existingFiles.length - filesToDelete.length) + newFiles.length 
      : newFiles.length);
    
    if (totalFiles === 0) {
      newErrors.files = '少なくとも1つのファイルが必要です';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      if (isEditMode) {
        // EDIT MODE: Handle illustration update
        await handleEditSubmit();
      } else {
        // CREATE MODE: Handle new illustration
        await handleCreateSubmit();
      }
      
      setSubmitSuccess(true);
      
      // Call success callback after a short delay
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        handleClose();
      }, 1500);
      
    } catch (err) {
      console.error(`${isEditMode ? 'Update' : 'Create'} illustration error:`, err);
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    // Step 1: Delete files marked for removal
    if (filesToDelete.length > 0) {
      await Promise.all(
        filesToDelete.map(fileId => 
          illustrationFileAPI.delete(fileId).catch(err => {
            console.error(`Failed to delete file ${fileId}:`, err);
          })
        )
      );
    }

    // Step 2: Upload new files
    if (newFiles.length > 0) {
      await Promise.all(
        newFiles.map(file => {
          const fileFormData = new FormData();
          fileFormData.append('illustration', illustration.id.toString());
          fileFormData.append('file', file);
          return illustrationFileAPI.create(illustration.id, file);
        })
      );
    }

    // Step 3: Update illustration metadata
    const updateData = {
      title: formData.title.trim(),
      description: formData.description.trim() || '',
      engine_model: formData.engine_model,
      part_category: formData.part_category,
    };

    await illustrationAPI.partialUpdate(illustration.id, updateData);
  };

  const handleCreateSubmit = async () => {
    // Prepare form data for creation
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title.trim());
    formDataToSend.append('engine_model', formData.engine_model);
    formDataToSend.append('part_category', formData.part_category);
    
    if (formData.description && formData.description.trim()) {
      formDataToSend.append('description', formData.description.trim());
    }
    
    // Add files
    newFiles.forEach(file => {
      formDataToSend.append('uploaded_files', file);
    });
    
    await illustrationAPI.create(formDataToSend);
  };

  const handleApiError = (err) => {
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
          fieldErrors[key] = Array.isArray(apiError[key]) 
            ? apiError[key].join(', ') 
            : apiError[key];
        }
      });
      
      if (Object.keys(fieldErrors).length === 0) {
        fieldErrors.submit = JSON.stringify(apiError);
      }
      
      setErrors(fieldErrors);
    } else {
      setErrors({ submit: err.message || `イラストの${isEditMode ? '更新' : '作成'}に失敗しました` });
    }
  };

  const handleClose = () => {
    if (loading) return;
    
    setFormData({
      title: '',
      description: '',
      manufacturer: '',
      car_model: '',
      engine_model: '',
      part_category: '',
      uploaded_files: []
    });
    setExistingFiles([]);
    setNewFiles([]);
    setFilesToDelete([]);
    setErrors({});
    setLoading(false);
    setSubmitSuccess(false);
    setInitialDataLoaded(false);
    onClose();
  };

  const getFileIcon = (file) => {
    if (file instanceof File) {
      if (file.type === 'application/pdf') {
        return <PdfIcon color="error" />;
      }
      return <ImageIcon color="primary" />;
    } else {
      const fileUrl = file.file || '';
      if (fileUrl.toLowerCase().endsWith('.pdf')) {
        return <PdfIcon color="error" />;
      }
      return <ImageIcon color="primary" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileName = (file) => {
    if (file instanceof File) {
      return file.name;
    } else {
      return `ファイル ${file.id}`;
    }
  };

  const getFileSize = (file) => {
    if (file instanceof File) {
      return file.size;
    } else {
      return file.size || 0;
    }
  };

  const totalFiles = isEditMode 
    ? (existingFiles.length - filesToDelete.length) + newFiles.length 
    : newFiles.length;

  // Check if dropdowns are still loading data for edit mode
  const isDropdownLoading = isEditMode && !initialDataLoaded;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      fullScreen={isMobile}
      TransitionComponent={isMobile ? Transition : undefined}
      disableEscapeKeyDown={loading || isDropdownLoading}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          m: isMobile ? 0 : 2,
          overflow: 'visible'
        }
      }}
    >
      <DialogTitle sx={{ 
        p: isMobile ? 2 : 3,
        background: isMobile 
          ? `linear-gradient(135deg, ${isEditMode ? theme.palette.warning.main : theme.palette.primary.main} 0%, ${isEditMode ? theme.palette.warning.dark : theme.palette.primary.dark} 100%)`
          : 'transparent',
        color: isMobile ? 'white' : 'inherit',
        borderBottom: isMobile ? 'none' : `1px solid ${theme.palette.divider}`
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              {isEditMode ? (
                <EditIcon sx={{ fontSize: 20, opacity: isMobile ? 0.9 : 1 }} />
              ) : (
                <AddIcon sx={{ fontSize: 20, opacity: isMobile ? 0.9 : 1 }} />
              )}
              <Typography 
                variant={isMobile ? 'h6' : 'h6'} 
                fontWeight="bold"
                noWrap
                sx={{ 
                  fontSize: isMobile ? '1.1rem' : '1.25rem',
                  color: isMobile ? 'white' : 'inherit'
                }}
              >
                {title}
              </Typography>
            </Stack>
            {isMobile && (
              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                {isEditMode ? `ID: ${illustration?.id}` : '必要な情報を入力してください'}
              </Typography>
            )}
          </Box>
          <IconButton 
            onClick={handleClose} 
            disabled={loading || isDropdownLoading}
            sx={{
              color: isMobile ? 'white' : 'inherit',
              bgcolor: isMobile ? 'rgba(255,255,255,0.2)' : 'transparent',
              '&:hover': {
                bgcolor: isMobile ? 'rgba(255,255,255,0.3)' : 'action.hover'
              },
              ml: 1
            }}
          >
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ 
          p: isMobile ? 2 : 3,
          bgcolor: isMobile ? 'background.default' : 'transparent'
        }}>
          <Stack spacing={isMobile ? 2.5 : 2} sx={{ pt: isMobile ? 0 : 1 }}>
            {/* Loading indicator for dropdown data */}
            {isDropdownLoading && (
              <Alert 
                severity="info" 
                sx={{ 
                  borderRadius: 2,
                  '& .MuiAlert-icon': { alignItems: 'center' }
                }}
              >
                <CircularProgress size={16} sx={{ mr: 1 }} />
                データを読み込み中...
              </Alert>
            )}

            {/* Success Message */}
            {submitSuccess && (
              <Alert 
                severity="success" 
                icon={<CheckCircleIcon fontSize="inherit" />}
                sx={{ 
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.success.main}`,
                  bgcolor: alpha(theme.palette.success.main, 0.1)
                }}
              >
                <Typography variant="body2" fontWeight="bold">
                  {isEditMode ? '更新が完了しました！' : '作成が完了しました！'}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  {isEditMode 
                    ? '変更が反映されました' 
                    : '新しいイラストが作成されました'}
                </Typography>
              </Alert>
            )}

            {/* Title Field */}
            <TextField
              label="タイトル"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title}
              size={isMobile ? 'medium' : 'small'}
              fullWidth
              disabled={loading || isDropdownLoading}
              autoFocus={!isMobile && !isEditMode}
              required
              InputProps={{
                sx: {
                  borderRadius: 1.5,
                  fontSize: isMobile ? '1rem' : '0.875rem'
                }
              }}
              InputLabelProps={{
                sx: { fontSize: isMobile ? '1rem' : '0.875rem' }
              }}
            />

            {/* Description Field */}
            <TextField
              label="説明（任意）"
              name="description"
              value={formData.description}
              onChange={handleChange}
              error={!!errors.description}
              helperText={errors.description}
              multiline
              rows={isMobile ? 3 : 2}
              size={isMobile ? 'medium' : 'small'}
              fullWidth
              disabled={loading || isDropdownLoading}
              InputProps={{
                sx: {
                  borderRadius: 1.5,
                  fontSize: isMobile ? '1rem' : '0.875rem'
                }
              }}
              InputLabelProps={{
                sx: { fontSize: isMobile ? '1rem' : '0.875rem' }
              }}
            />

            {/* Manufacturer Dropdown */}
            <TextField
              select
              label="メーカー（任意）"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              error={!!errors.manufacturers}
              helperText={errors.manufacturers}
              size={isMobile ? 'medium' : 'small'}
              fullWidth
              disabled={loading || isDropdownLoading || loadingManufacturers || manufacturers.length === 0}
              InputProps={{
                sx: {
                  borderRadius: 1.5,
                  fontSize: isMobile ? '1rem' : '0.875rem'
                }
              }}
              InputLabelProps={{
                sx: { fontSize: isMobile ? '1rem' : '0.875rem' }
              }}
            >
              <MenuItem value="">
                {loadingManufacturers ? '読み込み中...' : 'メーカーを選択'}
              </MenuItem>
              {manufacturers.map(m => (
                <MenuItem key={m.id} value={m.id} sx={{ fontSize: isMobile ? '1rem' : '0.875rem' }}>
                  {m.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Car Model Dropdown */}
            <TextField
              select
              label="車種"
              name="car_model"
              value={formData.car_model}
              onChange={handleChange}
              error={!!errors.car_model}
              helperText={errors.car_model || 'まずメーカーを選択してください'}
              disabled={loading || isDropdownLoading || loadingCarModels || !formData.manufacturer}
              size={isMobile ? 'medium' : 'small'}
              fullWidth
              InputProps={{
                sx: {
                  borderRadius: 1.5,
                  fontSize: isMobile ? '1rem' : '0.875rem'
                }
              }}
              InputLabelProps={{
                sx: { fontSize: isMobile ? '1rem' : '0.875rem' }
              }}
            >
              <MenuItem value="">
                {loadingCarModels ? '読み込み中...' : '車種を選択'}
              </MenuItem>
              {carModels.map(c => (
                <MenuItem key={c.id} value={c.id} sx={{ fontSize: isMobile ? '1rem' : '0.875rem' }}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Engine Model Dropdown */}
            <TextField
              select
              label="エンジンモデル"
              name="engine_model"
              value={formData.engine_model}
              onChange={handleChange}
              error={!!errors.engine_model}
              helperText={errors.engine_model || 'まず車種を選択してください'}
              disabled={loading || isDropdownLoading || loadingEngineModels || !formData.car_model}
              size={isMobile ? 'medium' : 'small'}
              fullWidth
              required
              InputProps={{
                sx: {
                  borderRadius: 1.5,
                  fontSize: isMobile ? '1rem' : '0.875rem'
                }
              }}
              InputLabelProps={{
                sx: { fontSize: isMobile ? '1rem' : '0.875rem' }
              }}
            >
              <MenuItem value="">
                {loadingEngineModels ? '読み込み中...' : 'エンジンモデルを選択'}
              </MenuItem>
              {engineModels.map(e => (
                <MenuItem key={e.id} value={e.id} sx={{ fontSize: isMobile ? '1rem' : '0.875rem' }}>
                  {e.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Part Category Dropdown */}
            <TextField
              select
              label="パーツカテゴリ"
              name="part_category"
              value={formData.part_category}
              onChange={handleChange}
              error={!!errors.part_category}
              helperText={errors.part_category || 'まずエンジンモデルを選択してください'}
              disabled={loading || isDropdownLoading || loadingCategories || !formData.engine_model}
              size={isMobile ? 'medium' : 'small'}
              fullWidth
              required
              InputProps={{
                sx: {
                  borderRadius: 1.5,
                  fontSize: isMobile ? '1rem' : '0.875rem'
                }
              }}
              InputLabelProps={{
                sx: { fontSize: isMobile ? '1rem' : '0.875rem' }
              }}
            >
              <MenuItem value="">
                {loadingCategories ? '読み込み中...' : 'パーツカテゴリを選択'}
              </MenuItem>
              {categories.map(c => (
                <MenuItem key={c.id} value={c.id} sx={{ fontSize: isMobile ? '1rem' : '0.875rem' }}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Files Section Header */}
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                <Typography variant="body2" fontWeight="bold" sx={{ fontSize: isMobile ? '0.95rem' : '0.875rem' }}>
                  ファイル管理
                </Typography>
                <Chip 
                  label={`${totalFiles} ファイル`}
                  size="small"
                  color={totalFiles === 0 ? "error" : "success"}
                  variant="outlined"
                  sx={{ fontSize: isMobile ? '0.75rem' : '0.7rem' }}
                />
              </Stack>
              
              {totalFiles === 0 && (
                <Alert 
                  severity="warning" 
                  sx={{ 
                    borderRadius: 1.5,
                    fontSize: isMobile ? '0.9rem' : '0.875rem',
                    mb: 2
                  }}
                >
                  少なくとも1つのファイルを追加してください
                </Alert>
              )}
            </Box>

            {/* Existing Files (Edit Mode Only) */}
            {isEditMode && existingFiles.length > 0 && (
              <Box>
                <Typography variant="body2" fontWeight="bold" mb={1.5} sx={{ fontSize: isMobile ? '0.9rem' : '0.875rem' }}>
                  現在のファイル ({existingFiles.length})
                  {filesToDelete.length > 0 && (
                    <Typography component="span" variant="caption" color="error.main" sx={{ ml: 1 }}>
                      ({filesToDelete.length}個削除予定)
                    </Typography>
                  )}
                </Typography>
                <Stack spacing={isMobile ? 1.5 : 1}>
                  {existingFiles.map((file) => (
                    <Paper 
                      key={file.id} 
                      elevation={0} 
                      sx={{ 
                        p: isMobile ? 1.5 : 1, 
                        bgcolor: filesToDelete.includes(file.id) 
                          ? alpha(theme.palette.error.main, 0.05) 
                          : alpha(theme.palette.info.main, 0.04), 
                        borderRadius: 1.5, 
                        border: `1px solid ${filesToDelete.includes(file.id) 
                          ? theme.palette.error.main 
                          : theme.palette.divider}`,
                        opacity: filesToDelete.includes(file.id) ? 0.7 : 1
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={isMobile ? 1.5 : 1}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          width: 36, 
                          height: 36, 
                          borderRadius: 1, 
                          bgcolor: 'background.paper',
                          border: `1px solid ${theme.palette.divider}`
                        }}>
                          {getFileIcon(file)}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                            {getFileName(file)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(file.size)}
                          </Typography>
                        </Box>
                        <IconButton 
                          size="small" 
                          onClick={() => removeExistingFile(file.id)} 
                          disabled={loading || isDropdownLoading} 
                          color={filesToDelete.includes(file.id) ? "error" : "default"}
                          sx={{ 
                            bgcolor: filesToDelete.includes(file.id) 
                              ? alpha(theme.palette.error.main, 0.1) 
                              : alpha(theme.palette.grey[500], 0.1),
                            '&:hover': { 
                              bgcolor: filesToDelete.includes(file.id) 
                                ? alpha(theme.palette.error.main, 0.2) 
                                : alpha(theme.palette.grey[500], 0.2) 
                            } 
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}

            {/* File Upload Section */}
            <Box>
              <input
                accept="image/*,.pdf,.png,.jpg,.jpeg,.webp"
                style={{ display: 'none' }}
                id={`illustration-file-upload-${mode}`}
                type="file"
                multiple
                onChange={handleFileChange}
                disabled={loading || isDropdownLoading}
              />
              <label htmlFor={`illustration-file-upload-${mode}`}>
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  fullWidth
                  disabled={loading || isDropdownLoading}
                  size={isMobile ? 'large' : 'medium'}
                  sx={{
                    py: isMobile ? 1.5 : 1,
                    borderRadius: 1.5,
                    fontSize: isMobile ? '1rem' : '0.875rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    borderColor: 'primary.main',
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      borderColor: 'primary.dark'
                    }
                  }}
                >
                  ファイルを追加
                </Button>
              </label>
              {errors.files && (
                <FormHelperText error sx={{ fontSize: isMobile ? '0.8rem' : '0.75rem', mt: 1 }}>
                  {errors.files}
                </FormHelperText>
              )}
              <Typography 
                variant="caption" 
                color="text.secondary" 
                display="block" 
                sx={{ 
                  mt: 1,
                  fontSize: isMobile ? '0.8rem' : '0.75rem',
                  px: isMobile ? 0.5 : 0
                }}
              >
                対応形式: 画像（PNG、JPG、JPEG、WEBP）、PDF（最大10MB/ファイル）
              </Typography>
            </Box>

            {/* New Files List */}
            {newFiles.length > 0 && (
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <CheckCircleIcon color="success" sx={{ fontSize: isMobile ? 20 : 18 }} />
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    sx={{ fontSize: isMobile ? '0.9rem' : '0.875rem' }}
                  >
                    {isEditMode ? '追加するファイル' : 'アップロードするファイル'} ({newFiles.length})
                  </Typography>
                </Stack>
                <Stack spacing={isMobile ? 1.5 : 1}>
                  {newFiles.map((file, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{ 
                        p: isMobile ? 1.5 : 1,
                        bgcolor: alpha(theme.palette.success.main, 0.04),
                        borderRadius: 1.5,
                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                      }}
                    >
                      <Stack 
                        direction="row" 
                        alignItems="center" 
                        spacing={isMobile ? 1.5 : 1}
                      >
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 36,
                          height: 36,
                          borderRadius: 1,
                          bgcolor: 'background.paper',
                          border: `1px solid ${theme.palette.divider}`,
                          flexShrink: 0
                        }}>
                          {getFileIcon(file)}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="body2" 
                            noWrap
                            sx={{ 
                              fontWeight: 500,
                              fontSize: isMobile ? '0.9rem' : '0.875rem'
                            }}
                          >
                            {getFileName(file)}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ fontSize: isMobile ? '0.75rem' : '0.7rem' }}
                          >
                            {formatFileSize(getFileSize(file))}
                          </Typography>
                        </Box>
                        <IconButton 
                          size="small" 
                          onClick={() => removeNewFile(index)}
                          disabled={loading || isDropdownLoading}
                          color="error"
                          sx={{
                            bgcolor: alpha(theme.palette.error.main, 0.1),
                            '&:hover': {
                              bgcolor: alpha(theme.palette.error.main, 0.2)
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}

            {/* Error Alert */}
            {errors.submit && (
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: 1.5,
                  fontSize: isMobile ? '0.9rem' : '0.875rem'
                }}
              >
                <Typography variant="body2" fontWeight="bold">エラー</Typography>
                <Typography variant="body2">{errors.submit}</Typography>
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ 
          p: isMobile ? 2 : 2,
          pt: 0,
          gap: isMobile ? 1 : 0.5,
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <Button 
            onClick={handleClose} 
            disabled={loading || isDropdownLoading}
            fullWidth={isMobile}
            size={isMobile ? 'large' : 'medium'}
            sx={{
              py: isMobile ? 1.5 : 1,
              borderRadius: 1.5,
              fontSize: isMobile ? '1rem' : '0.875rem',
              fontWeight: 600,
              textTransform: 'none',
              order: isMobile ? 2 : 1
            }}
          >
            {submitSuccess ? '閉じる' : 'キャンセル'}
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={loading || isDropdownLoading || submitSuccess || totalFiles === 0}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            fullWidth={isMobile}
            size={isMobile ? 'large' : 'medium'}
            sx={{
              py: isMobile ? 1.5 : 1,
              borderRadius: 1.5,
              fontSize: isMobile ? '1rem' : '0.875rem',
              fontWeight: 600,
              textTransform: 'none',
              background: submitSuccess 
                ? `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`
                : isEditMode
                  ? `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`
                  : `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              boxShadow: isMobile ? 2 : 1,
              order: isMobile ? 1 : 2
            }}
          >
            {loading ? (isEditMode ? '更新中...' : '作成中...') 
             : submitSuccess ? (isEditMode ? '更新完了' : '作成完了')
             : isDropdownLoading ? 'データ読み込み中...'
             : submitButtonText}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default IllustrationFormModal;