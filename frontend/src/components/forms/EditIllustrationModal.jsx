// src/components/forms/EditIllustrationModal.jsx
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
  Edit as EditIcon
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

const EditIllustrationModal = ({ open, onClose, onSuccess, illustration }) => {
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
  
  const [manufacturers, setManufacturers] = useState([]);
  const [carModels, setCarModels] = useState([]);
  const [engineModels, setEngineModels] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [loadingManufacturers, setLoadingManufacturers] = useState(false);
  const [loadingCarModels, setLoadingCarModels] = useState(false);
  const [loadingEngineModels, setLoadingEngineModels] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    if (open && illustration) {
      setFormData({
        title: illustration.title || '',
        description: illustration.description || '',
        manufacturer: illustration.car_model?.manufacturer?.id || 
                     illustration.engine_model?.car_model?.manufacturer?.id || '',
        car_model: illustration.car_model?.id || 
                  illustration.engine_model?.car_model?.id || '',
        engine_model: illustration.engine_model?.id || '',
        part_category: illustration.part_category?.id || '',
        uploaded_files: []
      });
      setExistingFiles(illustration.files || []);
      setFilesToDelete([]);
      setErrors({});
      
      fetchManufacturers();
      
      const manufacturerId = illustration.car_model?.manufacturer?.id || 
                            illustration.engine_model?.car_model?.manufacturer?.id;
      const carModelId = illustration.car_model?.id || 
                        illustration.engine_model?.car_model?.id;
      const engineModelId = illustration.engine_model?.id;
      
      if (manufacturerId) {
        fetchCarModels(manufacturerId);
      }
      if (carModelId) {
        fetchEngineModels(carModelId);
      }
      if (engineModelId) {
        fetchCategories(engineModelId);
      }
    }
  }, [open, illustration]);

  const fetchManufacturers = async () => {
    setLoadingManufacturers(true);
    try {
      const response = await manufacturerAPI.getAll();
      setManufacturers(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to fetch manufacturers:', error);
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
      setCarModels([]);
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
      setEngineModels([]);
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
      setCategories([]);
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
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      setErrors(prev => ({ 
        ...prev, 
        files: `無効なファイル形式: ${invalidFiles.map(f => f.name).join(', ')}` 
      }));
      return;
    }
    
    const maxSize = 10 * 1024 * 1024;
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

  const removeNewFile = (index) => {
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
    
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'タイトルは必須です';
    if (!formData.engine_model) newErrors.engine_model = 'エンジンモデルは必須です';
    if (!formData.part_category) newErrors.part_category = 'パーツカテゴリは必須です';
    
    const totalFiles = existingFiles.length + formData.uploaded_files.length;
    if (totalFiles === 0) {
      newErrors.files = '少なくとも1つのファイルが必要です';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      if (filesToDelete.length > 0) {
        await Promise.all(
          filesToDelete.map(fileId => 
            illustrationFileAPI.delete(fileId).catch(err => {
              console.error(`Failed to delete file ${fileId}:`, err);
            })
          )
        );
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title.trim());
      formDataToSend.append('engine_model', formData.engine_model);
      formDataToSend.append('part_category', formData.part_category);
      
      if (formData.description && formData.description.trim()) {
        formDataToSend.append('description', formData.description.trim());
      }
      
      if (formData.uploaded_files.length > 0) {
        formData.uploaded_files.forEach(file => {
          formDataToSend.append('uploaded_files', file);
        });
      }
      
      await illustrationAPI.partialUpdate(illustration.id, formDataToSend);
      
      if (onSuccess) {
        await onSuccess();
      }
      
      handleClose();
    } catch (err) {
      console.error('Update illustration error:', err);
      
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
        setErrors({ submit: err.message || 'イラストの更新に失敗しました' });
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
    onClose();
  };

  const getFileIcon = (file) => {
    const fileType = file.type || file.file?.split('.').pop();
    if (fileType === 'application/pdf' || fileType === 'pdf') {
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
          ? `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`
          : 'transparent',
        color: isMobile ? 'white' : 'inherit',
        borderBottom: isMobile ? 'none' : `1px solid ${theme.palette.divider}`
      }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant={isMobile ? 'h6' : 'h6'} fontWeight="bold">
              <EditIcon sx={{ fontSize: 20, mr: 1, verticalAlign: 'middle' }} />
              イラストを編集
            </Typography>
            {isMobile && (
              <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                変更する情報を編集してください
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
              required
            />

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
            />

            <TextField
              select
              label="メーカー（任意）"
              name="manufacturer"
              value={formData.manufacturer}
              onChange={handleChange}
              size={isMobile ? 'medium' : 'small'}
              fullWidth
              disabled={loading || loadingManufacturers}
            >
              <MenuItem value="">メーカーを選択</MenuItem>
              {manufacturers.map(m => (
                <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="車種"
              name="car_model"
              value={formData.car_model}
              onChange={handleChange}
              error={!!errors.car_model}
              helperText={errors.car_model}
              disabled={loading || loadingCarModels || !formData.manufacturer}
              size={isMobile ? 'medium' : 'small'}
              fullWidth
            >
              <MenuItem value="">車種を選択</MenuItem>
              {carModels.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="エンジンモデル"
              name="engine_model"
              value={formData.engine_model}
              onChange={handleChange}
              error={!!errors.engine_model}
              helperText={errors.engine_model}
              disabled={loading || loadingEngineModels || !formData.car_model}
              size={isMobile ? 'medium' : 'small'}
              fullWidth
              required
            >
              <MenuItem value="">エンジンモデルを選択</MenuItem>
              {engineModels.map(e => (
                <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="パーツカテゴリ"
              name="part_category"
              value={formData.part_category}
              onChange={handleChange}
              error={!!errors.part_category}
              helperText={errors.part_category}
              disabled={loading || loadingCategories || !formData.engine_model}
              size={isMobile ? 'medium' : 'small'}
              fullWidth
              required
            >
              <MenuItem value="">パーツカテゴリを選択</MenuItem>
              {categories.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </TextField>

            {existingFiles.length > 0 && (
              <Box>
                <Typography variant="body2" fontWeight="bold" mb={1.5}>
                  現在のファイル ({existingFiles.length})
                </Typography>
                <Stack spacing={isMobile ? 1.5 : 1}>
                  {existingFiles.map((file) => (
                    <Paper key={file.id} elevation={0} sx={{ p: isMobile ? 1.5 : 1, bgcolor: alpha(theme.palette.info.main, 0.04), borderRadius: isMobile ? 2 : 1, border: `1px solid ${theme.palette.divider}` }}>
                      <Stack direction="row" alignItems="center" spacing={isMobile ? 1.5 : 1}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 1, bgcolor: 'background.paper' }}>
                          {getFileIcon(file)}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>
                            既存ファイル #{file.id}
                          </Typography>
                        </Box>
                        <IconButton size="small" onClick={() => removeExistingFile(file.id)} disabled={loading} color="error" sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) } }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}

            <Box>
              <input accept="image/*,.pdf,.png,.jpg,.jpeg" style={{ display: 'none' }} id="edit-illustration-file-upload" type="file" multiple onChange={handleFileChange} disabled={loading} />
              <label htmlFor="edit-illustration-file-upload">
                <Button component="span" variant={isMobile ? 'contained' : 'outlined'} startIcon={<UploadIcon />} fullWidth disabled={loading} size={isMobile ? 'large' : 'medium'} sx={{ py: isMobile ? 1.5 : 1, borderRadius: isMobile ? 2 : 1, fontWeight: 600 }}>
                  新しいファイルを追加
                </Button>
              </label>
              {errors.files && <FormHelperText error sx={{ mt: 1 }}>{errors.files}</FormHelperText>}
            </Box>

            {formData.uploaded_files.length > 0 && (
              <Box>
                <Typography variant="body2" fontWeight="bold" mb={1.5}>
                  追加するファイル ({formData.uploaded_files.length})
                </Typography>
                <Stack spacing={isMobile ? 1.5 : 1}>
                  {formData.uploaded_files.map((file, index) => (
                    <Paper key={index} elevation={0} sx={{ p: isMobile ? 1.5 : 1, bgcolor: alpha(theme.palette.success.main, 0.04), borderRadius: isMobile ? 2 : 1, border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
                      <Stack direction="row" alignItems="center" spacing={isMobile ? 1.5 : 1}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 1, bgcolor: 'background.paper' }}>
                          {getFileIcon(file)}
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" noWrap sx={{ fontWeight: 500 }}>{file.name}</Typography>
                          <Typography variant="caption" color="text.secondary">{formatFileSize(file.size)}</Typography>
                        </Box>
                        <IconButton size="small" onClick={() => removeNewFile(index)} disabled={loading} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              </Box>
            )}

            {errors.submit && <Alert severity="error">{errors.submit}</Alert>}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: isMobile ? 2 : 2, pt: 0, gap: isMobile ? 1 : 0.5, flexDirection: isMobile ? 'column' : 'row' }}>
          <Button onClick={handleClose} disabled={loading} fullWidth={isMobile} size={isMobile ? 'large' : 'medium'} sx={{ py: isMobile ? 1.5 : 1, borderRadius: isMobile ? 2 : 1, order: isMobile ? 2 : 1 }}>
            キャンセル
          </Button>
          <Button type="submit" variant="contained" disabled={loading} startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <EditIcon />} fullWidth={isMobile} size={isMobile ? 'large' : 'medium'} sx={{ py: isMobile ? 1.5 : 1, borderRadius: isMobile ? 2 : 1, background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`, order: isMobile ? 1 : 2 }}>
            {loading ? '更新中...' : '更新'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EditIllustrationModal;

export const DeleteIllustrationDialog = ({ open, onClose, onConfirm, illustration, loading }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: isMobile ? 3 : 2, m: isMobile ? 2 : 3 } }}>
      <DialogTitle sx={{ pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DeleteIcon sx={{ color: 'error.main', fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight="bold">イラストを削除</Typography>
            <Typography variant="caption" color="text.secondary">この操作は取り消せません</Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>このイラストとすべての関連ファイルが完全に削除されます。</Alert>
        {illustration && (
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default', borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>削除対象:</Typography>
            <Typography variant="body1" fontWeight="bold" gutterBottom>{illustration.title}</Typography>
            {illustration.files && illustration.files.length > 0 && (
              <Typography variant="caption" color="text.secondary">{illustration.files.length}個のファイルが含まれています</Typography>
            )}
          </Paper>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} disabled={loading} fullWidth={isMobile} size={isMobile ? 'large' : 'medium'} sx={{ borderRadius: isMobile ? 2 : 1, py: isMobile ? 1.5 : 1 }}>
          キャンセル
        </Button>
        <Button onClick={onConfirm} disabled={loading} variant="contained" color="error" startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon />} fullWidth={isMobile} size={isMobile ? 'large' : 'medium'} sx={{ borderRadius: isMobile ? 2 : 1, py: isMobile ? 1.5 : 1 }}>
          {loading ? '削除中...' : '削除する'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};