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
  Paper
} from '@mui/material';
import {
  Close as CloseIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import {
  illustrationAPI,
  manufacturerAPI,
  carModelAPI,
  engineModelAPI,
  partCategoryAPI
} from '../../api/illustrations';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CreateIllustrationModal = ({ open, onClose, onSuccess, mode = 'create', illustration = null }) => {
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
  const [filesToDelete, setFilesToDelete] = useState([]);
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

  // Fetch initial data on mount/open
  useEffect(() => {
    if (open) {
      initializeData();
    }
  }, [open, mode, illustration]);

  const initializeData = async () => {
    // 1. Load manufacturers and categories (always needed)
    await Promise.all([
      fetchManufacturers(),
      fetchCategories()
    ]);

    // 2. If in Edit mode, populate form and load dependent data
    if (mode === 'edit' && illustration) {
      console.log('Initializing Edit Mode with:', illustration);

      // Populate basic fields
      setFormData({
        title: illustration.title || '',
        description: illustration.description || '',
        manufacturer: '', // Will be set after finding the correct car model -> manufacturer map
        car_model: '',
        engine_model: illustration.engine_model || '', // ID
        part_category: illustration.part_category || '', // ID
        uploaded_files: []
      });

      setExistingFiles(illustration.files || []);
      setFilesToDelete([]);

      // 3. Resolve dependencies: Engine -> Car -> Manufacturer
      if (illustration.engine_model) {
        try {
          const engineData = await engineModelAPI.getById(illustration.engine_model);
          const carData = await carModelAPI.getById(engineData.car_model);

          await fetchCarModels(carData.manufacturer);
          await fetchEngineModels(carData.id);

          setFormData(prev => ({
            ...prev,
            manufacturer: carData.manufacturer,
            car_model: carData.id,
            engine_model: engineData.id
          }));

        } catch (err) {
          console.error('Failed to resolve dependencies for edit:', err);
          setErrors(prev => ({ ...prev, general: 'データの読み込みに失敗しました' }));
        }
      }
    } else {
      // Create mode: reset
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
      setFilesToDelete([]);
      setCarModels([]);
      setEngineModels([]);
    }
  };

  const fetchManufacturers = async () => {
    setLoadingManufacturers(true);
    try {
      const response = await manufacturerAPI.getAll();
      setManufacturers(response.results || response || []);
    } catch (error) {
      console.error('Failed to fetch manufacturers:', error);
      setErrors(prev => ({ ...prev, manufacturers: 'メーカーの読み込みに失敗しました' }));
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
      setCarModels(response.results || response || []);
    } catch (error) {
      console.error('Failed to fetch car models:', error);
      setErrors(prev => ({ ...prev, car_models: '車種の読み込みに失敗しました' }));
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
      setEngineModels(response.results || response || []);
    } catch (error) {
      console.error('Failed to fetch engine models:', error);
      setErrors(prev => ({ ...prev, engine_models: 'エンジンモデルの読み込みに失敗しました' }));
    } finally {
      setLoadingEngineModels(false);
    }
  };

  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await partCategoryAPI.getAll();
      setCategories(response.results || response || []);
    } catch (error) {
      console.error('Failed to fetch part categories:', error);
      setErrors(prev => ({ ...prev, categories: 'パーツカテゴリの読み込みに失敗しました' }));
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'manufacturer') {
      setFormData(prev => ({
        ...prev,
        car_model: '',
        engine_model: '',
      }));
      setEngineModels([]);
      fetchCarModels(value);
    } else if (name === 'car_model') {
      setFormData(prev => ({
        ...prev,
        engine_model: '',
      }));
      fetchEngineModels(value);
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
        files: `無効なファイル形式: ${invalidFiles.map(f => f.name).join(', ')}`
      }));
      return;
    }

    // Validate file sizes (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const oversizedFiles = files.filter(file => file.size > maxSize);

    if (oversizedFiles.length > 0) {
      setErrors(prev => ({
        ...prev,
        files: `ファイルサイズが大きすぎます（最大10MB）: ${oversizedFiles.map(f => f.name).join(', ')}`
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      uploaded_files: [...prev.uploaded_files, ...files]
    }));

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

  const removeExistingFile = (fileId) => {
    setFilesToDelete(prev => [...prev, fileId]);
    setExistingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'タイトルは必須です';
    if (!formData.engine_model) newErrors.engine_model = 'エンジンモデルは必須です';
    if (!formData.part_category) newErrors.part_category = 'パーツカテゴリは必須です';

    if (mode === 'create' && formData.uploaded_files.length === 0) {
      newErrors.files = '少なくとも1つのファイルが必要です';
    }
    if (mode === 'edit' && formData.uploaded_files.length === 0 && existingFiles.length === 0) {
      newErrors.files = '少なくとも1つのファイルが必要です（既存または新規）';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const dataToSend = {
        title: formData.title.trim(),
        engine_model: formData.engine_model,
        part_category: formData.part_category,
      };

      if (formData.description && formData.description.trim()) {
        dataToSend.description = formData.description.trim();
      }

      if (mode === 'create') {
        dataToSend.uploaded_files = formData.uploaded_files;
        await illustrationAPI.create(dataToSend);
      } else {
        // Edit Logic
        await illustrationAPI.update(illustration.id, dataToSend);

        // Delete removed files
        if (filesToDelete.length > 0) {
          for (const fileId of filesToDelete) {
            await illustrationAPI.deleteFile(illustration.id, fileId).catch(console.error);
          }
        }

        // Upload new files
        if (formData.uploaded_files.length > 0) {
          await illustrationAPI.addFiles(illustration.id, formData.uploaded_files);
        }
      }

      if (onSuccess) {
        onSuccess();
      }

      handleClose();
    } catch (err) {
      console.error('Illustration submit error:', err);

      const apiError = err.response?.data || err;
      if (apiError && typeof apiError === 'object') {
        const fieldErrors = {};
        if (apiError.title) fieldErrors.title = String(apiError.title);
        if (apiError.description) fieldErrors.description = String(apiError.description);
        if (apiError.engine_model) fieldErrors.engine_model = String(apiError.engine_model);
        if (apiError.part_category) fieldErrors.part_category = String(apiError.part_category);
        if (!Object.keys(fieldErrors).length) {
          fieldErrors.submit = apiError.detail || apiError.message || JSON.stringify(apiError);
        }
        setErrors(fieldErrors);
      } else {
        setErrors({ submit: '処理に失敗しました' });
      }
    } finally {
      setLoading(false);
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
    setFilesToDelete([]);
    setErrors({});
    setLoading(false);
    setCarModels([]);
    setEngineModels([]);
    onClose();
  };

  const getFileIcon = (file) => {
    const isPdf = file.type === 'application/pdf' || (file.url && file.url.endsWith('.pdf')) || (file.file_type === 'pdf') || (file.file && file.file.endsWith('.pdf'));
    if (isPdf) {
      return <PdfIcon color="error" />;
    }
    return <ImageIcon color="primary" />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      TransitionComponent={isMobile ? Transition : undefined}
      disableEscapeKeyDown={loading}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : 2,
          m: isMobile ? 0 : 2
        }
      }}
    >
      <DialogTitle sx={{
        p: isMobile ? 2 : 3,
        background: isMobile
          ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
          : 'transparent',
        color: isMobile ? 'white' : 'inherit',
        borderBottom: isMobile ? 'none' : `1px solid ${theme.palette.divider}`
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant={isMobile ? 'h6' : 'h6'} fontWeight="bold">
              {mode === 'edit' ? 'イラスト編集' : '新規イラスト作成'}
            </Typography>
            {isMobile && (
              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                必要な情報を入力してください
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={handleClose}
            disabled={loading}
            sx={{
              color: isMobile ? 'white' : 'inherit',
              bgcolor: isMobile ? 'rgba(255,255,255,0.2)' : 'transparent',
              '&:hover': {
                bgcolor: isMobile ? 'rgba(255,255,255,0.3)' : 'action.hover'
              }
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
            {/* Title */}
            <TextField
              label="タイトル"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title}
              size={isMobile ? 'medium' : 'small'}
              fullWidth
              disabled={loading}
              autoFocus={!isMobile}
              required
              InputProps={{
                sx: { borderRadius: isMobile ? 2 : 1 }
              }}
            />

            {/* Description */}
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
              disabled={loading}
              InputProps={{
                sx: { borderRadius: isMobile ? 2 : 1 }
              }}
            />

            {/* Manufacturer Selection */}
            <TextField
              select
              label="メーカー"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              error={!!errors.manufacturers}
              helperText={errors.manufacturers}
              size={isMobile ? 'medium' : 'small'}
              fullWidth
              disabled={loading || loadingManufacturers || manufacturers.length === 0}
            >
              <MenuItem value="">
                {loadingManufacturers ? '読み込み中...' : 'メーカーを選択'}
              </MenuItem>
              {manufacturers.map(m => (
                <MenuItem key={m.id} value={m.id}>
                  {m.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Car Model Selection */}
            <TextField
              select
              label="車種"
              name="car_model"
              value={formData.car_model}
              onChange={handleChange}
              error={!!errors.car_model}
              helperText={errors.car_model || 'まずメーカーを選択してください'}
              disabled={loading || loadingCarModels || !formData.manufacturer}
              size={isMobile ? 'medium' : 'small'}
              fullWidth
            >
              <MenuItem value="">
                {loadingCarModels ? '読み込み中...' : '車種を選択'}
              </MenuItem>
              {carModels.map(c => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Engine Model Selection */}
            <TextField
              select
              label="エンジンモデル"
              name="engine_model"
              value={formData.engine_model}
              onChange={handleChange}
              error={!!errors.engine_model}
              helperText={errors.engine_model || 'まず車種を選択してください'}
              disabled={loading || loadingEngineModels || !formData.car_model}
              size={isMobile ? 'medium' : 'small'}
              fullWidth
              required
            >
              <MenuItem value="">
                {loadingEngineModels ? '読み込み中...' : 'エンジンモデルを選択'}
              </MenuItem>
              {engineModels.map(e => (
                <MenuItem key={e.id} value={e.id}>
                  {e.name}
                </MenuItem>
              ))}
            </TextField>

            {/* Part Category Selection */}
            <TextField
              select
              label="パーツカテゴリ"
              name="part_category"
              value={formData.part_category}
              onChange={handleChange}
              error={!!errors.part_category}
              helperText={errors.part_category}
              disabled={loading || loadingCategories}
              size={isMobile ? 'medium' : 'small'}
              fullWidth
              required
            >
              <MenuItem value="">
                {loadingCategories ? '読み込み中...' : 'パーツカテゴリを選択'}
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
                  variant={isMobile ? 'contained' : 'outlined'}
                  startIcon={<UploadIcon />}
                  fullWidth
                  disabled={loading}
                  size={isMobile ? 'large' : 'medium'}
                  sx={{
                    py: isMobile ? 1.5 : 1,
                    borderRadius: isMobile ? 2 : 1,
                    textTransform: 'none',
                    ...(isMobile && {
                      background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`
                    })
                  }}
                >
                  ファイルを選択（追加）
                </Button>
              </label>
              {errors.files && (
                <FormHelperText error sx={{ mt: 1 }}>{errors.files}</FormHelperText>
              )}
            </Box>

            {/* Existing Files List (Edit Mode) */}
            {existingFiles.length > 0 && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                  既存のファイル
                </Typography>
                <Stack spacing={1}>
                  {existingFiles.map((file) => (
                    <Paper
                      key={file.id}
                      elevation={0}
                      sx={{
                        p: 1,
                        bgcolor: 'background.default',
                        border: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100', borderRadius: 1 }}>
                          {getFileIcon(file)}
                        </Box>
                        <Box sx={{ flex: 1, overflow: 'hidden' }}>
                          <Typography variant="body2" noWrap>{file.file_name || 'File'}</Typography>
                        </Box>
                        <IconButton size="small" color="error" onClick={() => removeExistingFile(file.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}

            {/* New Files List */}
            {formData.uploaded_files.length > 0 && (
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                  <CheckCircleIcon color="success" fontSize="small" />
                  <Typography variant="caption" fontWeight="bold">
                    追加するファイル ({formData.uploaded_files.length})
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  {formData.uploaded_files.map((file, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{
                        p: 1,
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                        border: `1px solid ${theme.palette.divider}`
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Box sx={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'white', borderRadius: 1 }}>
                          {getFileIcon(file)}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" noWrap>{file.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{formatFileSize(file.size)}</Typography>
                        </Box>
                        <IconButton size="small" color="error" onClick={() => removeFile(index)}>
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
              <Alert severity="error">{errors.submit}</Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: isMobile ? 2 : 2, pt: 0 }}>
          <Button onClick={handleClose} disabled={loading} fullWidth={isMobile}>
            キャンセル
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            fullWidth={isMobile}
          >
            {loading ? '処理中...' : mode === 'edit' ? '更新する' : '作成する'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateIllustrationModal;