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
  Chip,
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

const CreateIllustrationModal = ({ open, onClose, onSuccess }) => {
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
      fetchCategories();  // Fetch categories independently
    }
  }, [open]);

  const fetchManufacturers = async () => {
    setLoadingManufacturers(true);
    try {
      const response = await manufacturerAPI.getAll();
      setManufacturers(response.data.results || response.data || []);
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
      setCarModels(response.data.results || response.data || []);
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
      setEngineModels(response.data.results || response.data || []);
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
      setCategories(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to fetch part categories:', error);
      setErrors(prev => ({ ...prev, categories: 'パーツカテゴリの読み込みに失敗しました' }));
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
      // Categories are independent, so don't reset them
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
      setCategories([]);  // No need to reset categories since they're independent
      fetchCarModels(value);
    } else if (name === 'car_model') {
      setFormData(prev => ({ 
        ...prev, 
        engine_model: '', 
        part_category: '' 
      }));
      setCategories([]);  // No need to reset categories
      fetchEngineModels(value);
    } else if (name === 'engine_model') {
      setFormData(prev => ({ ...prev, part_category: '' }));
      // No need to fetch categories again since they're independent
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
    if (!formData.title.trim()) newErrors.title = 'タイトルは必須です';
    if (!formData.engine_model) newErrors.engine_model = 'エンジンモデルは必須です';
    if (!formData.part_category) newErrors.part_category = 'パーツカテゴリは必須です';
    if (formData.uploaded_files.length === 0) newErrors.files = '少なくとも1つのファイルが必要です';
    
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
        uploaded_files: formData.uploaded_files
      };
      
      if (formData.description && formData.description.trim()) {
        dataToSend.description = formData.description.trim();
      }
      
      await illustrationAPI.create(dataToSend);
      
      if (onSuccess) {
        onSuccess();
      }
      
      handleClose();
    } catch (err) {
      console.error('Create illustration error:', err);
      
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
        setErrors({ submit: err.message || 'イラストの作成に失敗しました' });
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
    setErrors({});
    setLoading(false);
    setCarModels([]);
    setEngineModels([]);
    // Categories are independent, so don't reset them
    onClose();
  };

  const getFileIcon = (file) => {
    if (file.type === 'application/pdf') {
      return <PdfIcon color="error" />;
    }
    return <ImageIcon color="primary" />;
  };

  const formatFileSize = (bytes) => {
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
              新規イラスト作成
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
            {/* タイトル */}
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
                sx: {
                  borderRadius: isMobile ? 2 : 1,
                  fontSize: isMobile ? '1rem' : '0.875rem'
                }
              }}
              InputLabelProps={{
                sx: { fontSize: isMobile ? '1rem' : '0.875rem' }
              }}
            />

            {/* 説明 */}
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
                sx: {
                  borderRadius: isMobile ? 2 : 1,
                  fontSize: isMobile ? '1rem' : '0.875rem'
                }
              }}
              InputLabelProps={{
                sx: { fontSize: isMobile ? '1rem' : '0.875rem' }
              }}
            />

            {/* メーカー選択 */}
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
              disabled={loading || loadingManufacturers || manufacturers.length === 0}
              InputProps={{
                sx: {
                  borderRadius: isMobile ? 2 : 1,
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

            {/* 車種選択 */}
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
              InputProps={{
                sx: {
                  borderRadius: isMobile ? 2 : 1,
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

            {/* エンジンモデル選択 */}
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
              InputProps={{
                sx: {
                  borderRadius: isMobile ? 2 : 1,
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

            {/* パーツカテゴリ選択 */}
            <TextField
              select
              label="パーツカテゴリ"
              name="part_category"
              value={formData.part_category}
              onChange={handleChange}
              error={!!errors.part_category}
              helperText={errors.part_category || 'まずエンジンモデルを選択してください'}
              disabled={loading || loadingCategories || !formData.engine_model}
              size={isMobile ? 'medium' : 'small'}
              fullWidth
              required
              InputProps={{
                sx: {
                  borderRadius: isMobile ? 2 : 1,
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

            {/* ファイルアップロードセクション */}
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
                    fontSize: isMobile ? '1rem' : '0.875rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    ...(isMobile && {
                      background: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`
                    })
                  }}
                >
                  ファイルを選択
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
                対応形式: 画像（PNG、JPG、JPEG）、PDF（最大10MB/ファイル）
              </Typography>
            </Box>

            {/* ファイルリスト */}
            {formData.uploaded_files.length > 0 && (
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <CheckCircleIcon color="success" sx={{ fontSize: isMobile ? 20 : 18 }} />
                  <Typography 
                    variant="body2" 
                    fontWeight="bold"
                    sx={{ fontSize: isMobile ? '0.95rem' : '0.875rem' }}
                  >
                    選択済み ({formData.uploaded_files.length}ファイル)
                  </Typography>
                </Stack>
                <Stack spacing={isMobile ? 1.5 : 1}>
                  {formData.uploaded_files.map((file, index) => (
                    <Paper
                      key={index}
                      elevation={0}
                      sx={{ 
                        p: isMobile ? 1.5 : 1,
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                        borderRadius: isMobile ? 2 : 1,
                        border: `1px solid ${theme.palette.divider}`
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
                          width: isMobile ? 40 : 36,
                          height: isMobile ? 40 : 36,
                          borderRadius: isMobile ? 1.5 : 1,
                          bgcolor: 'background.paper',
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
                            {file.name}
                          </Typography>
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ fontSize: isMobile ? '0.75rem' : '0.7rem' }}
                          >
                            {formatFileSize(file.size)}
                          </Typography>
                        </Box>
                        <IconButton 
                          size="small" 
                          onClick={() => removeFile(index)}
                          disabled={loading}
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

            {/* エラーアラート */}
            {errors.submit && (
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: isMobile ? 2 : 1,
                  fontSize: isMobile ? '0.9rem' : '0.875rem'
                }}
              >
                {errors.submit}
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
            disabled={loading}
            fullWidth={isMobile}
            size={isMobile ? 'large' : 'medium'}
            sx={{
              py: isMobile ? 1.5 : 1,
              borderRadius: isMobile ? 2 : 1,
              fontSize: isMobile ? '1rem' : '0.875rem',
              fontWeight: 600,
              textTransform: 'none',
              order: isMobile ? 2 : 1
            }}
          >
            キャンセル
          </Button>
          <Button 
            type="submit" 
            variant="contained"
            disabled={loading || formData.uploaded_files.length === 0}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
            fullWidth={isMobile}
            size={isMobile ? 'large' : 'medium'}
            sx={{
              py: isMobile ? 1.5 : 1,
              borderRadius: isMobile ? 2 : 1,
              fontSize: isMobile ? '1rem' : '0.875rem',
              fontWeight: 600,
              textTransform: 'none',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
              boxShadow: isMobile ? 2 : 1,
              order: isMobile ? 1 : 2
            }}
          >
            {loading ? '作成中...' : 'イラストを作成'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateIllustrationModal;