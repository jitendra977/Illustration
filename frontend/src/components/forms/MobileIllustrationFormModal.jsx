// src/components/forms/MobileIllustrationFormModal.jsx - Fixed Update Logic
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Stack,
  IconButton,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Autocomplete,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { illustrationAPI } from '../../api/illustrations';

const MobileIllustrationFormModal = ({
  open,
  onClose,
  onSuccess,
  mode = 'create',
  illustration = null,
  manufacturers = [],
  engineModels = [],
  categories = [],
  subCategories = [],
  carModels = [],
}) => {
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    engine_model: '',
    part_category: '',
    part_subcategory: '',
    applicable_car_models: [],
  });

  // File handling
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [filesToDelete, setFilesToDelete] = useState([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedManufacturer, setSelectedManufacturer] = useState('');

  // Filtered data
  const [filteredEngines, setFilteredEngines] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [filteredCarModels, setFilteredCarModels] = useState([]);

  // Initialize form data for edit mode
  useEffect(() => {
    if (mode === 'edit' && illustration) {
      setFormData({
        title: illustration.title || '',
        description: illustration.description || '',
        engine_model: illustration.engine_model || '',
        part_category: illustration.part_category || '',
        part_subcategory: illustration.part_subcategory || '',
        applicable_car_models: illustration.applicable_car_models || [],
      });

      if (illustration.files) {
        setExistingFiles(illustration.files);
      }

      // Set manufacturer for filtering
      const engine = engineModels.find(e => e.id === illustration.engine_model);
      if (engine) {
        setSelectedManufacturer(engine.manufacturer);
      }
    } else {
      resetForm();
    }
  }, [mode, illustration, engineModels]);

  // Filter engines by manufacturer
  useEffect(() => {
    if (selectedManufacturer) {
      setFilteredEngines(
        engineModels.filter(e => e.manufacturer === selectedManufacturer)
      );
      setFilteredCarModels(
        carModels.filter(c => c.manufacturer === selectedManufacturer)
      );
    } else {
      setFilteredEngines([]);
      setFilteredCarModels([]);
    }
  }, [selectedManufacturer, engineModels, carModels]);

  // Filter subcategories by category
  useEffect(() => {
    if (formData.part_category) {
      setFilteredSubCategories(
        subCategories.filter(s => s.part_category === formData.part_category)
      );
    } else {
      setFilteredSubCategories([]);
    }
  }, [formData.part_category, subCategories]);

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      engine_model: '',
      part_category: '',
      part_subcategory: '',
      applicable_car_models: [],
    });
    setSelectedFiles([]);
    setExistingFiles([]);
    setFilesToDelete([]);
    setSelectedManufacturer('');
    setError(null);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Reset dependent fields
    if (field === 'part_category') {
      setFormData(prev => ({ ...prev, part_subcategory: '' }));
    }
  };

  const handleManufacturerChange = (value) => {
    setSelectedManufacturer(value);
    setFormData(prev => ({
      ...prev,
      engine_model: '',
      applicable_car_models: [],
    }));
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!validTypes.includes(file.type)) {
        setError(`無効なファイル形式: ${file.name}`);
        return false;
      }

      if (file.size > maxSize) {
        setError(`ファイルが大きすぎます: ${file.name} (最大10MB)`);
        return false;
      }

      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
    setError(null);
  };

  const handleRemoveNewFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingFile = (fileId) => {
    setFilesToDelete(prev => [...prev, fileId]);
    setExistingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('タイトルを入力してください');
      return false;
    }

    if (!formData.engine_model) {
      setError('エンジンモデルを選択してください');
      return false;
    }

    if (!formData.part_category) {
      setError('カテゴリを選択してください');
      return false;
    }

    if (mode === 'create' && selectedFiles.length === 0) {
      setError('少なくとも1つのファイルをアップロードしてください');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      if (mode === 'create') {
        // Create new illustration
        const submitData = {
          ...formData,
          uploaded_files: selectedFiles,
        };
        await illustrationAPI.create(submitData);
      } else {
        // Update existing illustration

        // First, delete files if needed
        if (filesToDelete.length > 0) {
          // Backend should handle this through the illustration files endpoint
          for (const fileId of filesToDelete) {
            try {
              await illustrationAPI.deleteFile?.(fileId);
            } catch (err) {
              console.error('Failed to delete file:', err);
            }
          }
        }

        // Prepare update data - only changed fields
        const updateData = {
          title: formData.title,
          description: formData.description,
          engine_model: formData.engine_model,
          part_category: formData.part_category,
          part_subcategory: formData.part_subcategory || null,
          applicable_car_models: formData.applicable_car_models,
        };

        // Update the illustration
        await illustrationAPI.partialUpdate(illustration.id, updateData);

        // Add new files if any
        if (selectedFiles.length > 0) {
          await illustrationAPI.addFiles(illustration.id, selectedFiles);
        }
      }

      // Call success callback
      if (onSuccess) {
        await onSuccess();
      }

      resetForm();
      onClose();
    } catch (err) {
      console.error('Form submission error:', err);
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.detail ||
        Object.values(err.response?.data || {}).flat().join(', ') ||
        err.message ||
        'エラーが発生しました';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (file) => {
    if (file.file_type === 'pdf' || file.type === 'application/pdf') {
      return <PdfIcon sx={{ fontSize: 40 }} />;
    }
    return <ImageIcon sx={{ fontSize: 40 }} />;
  };

  const getFilePreview = (file) => {
    if (file instanceof File) {
      return URL.createObjectURL(file);
    }
    return file.file;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      PaperProps={{
        sx: {
          bgcolor: 'background.default',
          backgroundImage: 'none'
        }
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          color: 'text.primary'
        }}
      >
        <Typography variant="h6" fontWeight="800">
          {mode === 'create' ? '新規イラスト' : 'イラスト編集'}
        </Typography>
        <IconButton edge="end" onClick={onClose} disabled={loading} sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 2 }}>
        <Stack spacing={2.5}>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Title */}
          <TextField
            fullWidth
            label="タイトル *"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            disabled={loading}
            placeholder="例: ピストンアッセンブリー図"
          />

          {/* Description */}
          <TextField
            fullWidth
            multiline
            rows={3}
            label="説明"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            disabled={loading}
            placeholder="このイラストの詳細を入力..."
          />

          {/* Manufacturer */}
          <FormControl fullWidth>
            <InputLabel>メーカー *</InputLabel>
            <Select
              value={selectedManufacturer}
              onChange={(e) => handleManufacturerChange(e.target.value)}
              disabled={loading}
              label="メーカー *"
            >
              {manufacturers.map(m => (
                <MenuItem key={m.id} value={m.id}>
                  {m.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Engine Model */}
          <FormControl fullWidth disabled={!selectedManufacturer}>
            <InputLabel>エンジンモデル *</InputLabel>
            <Select
              value={formData.engine_model}
              onChange={(e) => handleChange('engine_model', e.target.value)}
              disabled={loading || !selectedManufacturer}
              label="エンジンモデル *"
            >
              {filteredEngines.map(e => (
                <MenuItem key={e.id} value={e.id}>
                  {e.name} {e.engine_code && `(${e.engine_code})`}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {!selectedManufacturer && 'まずメーカーを選択してください'}
            </FormHelperText>
          </FormControl>

          {/* Part Category */}
          <FormControl fullWidth>
            <InputLabel>パーツカテゴリ *</InputLabel>
            <Select
              value={formData.part_category}
              onChange={(e) => handleChange('part_category', e.target.value)}
              disabled={loading}
              label="パーツカテゴリ *"
            >
              {categories.map(c => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Part Subcategory */}
          <FormControl fullWidth disabled={!formData.part_category}>
            <InputLabel>パーツサブカテゴリ</InputLabel>
            <Select
              value={formData.part_subcategory}
              onChange={(e) => handleChange('part_subcategory', e.target.value)}
              disabled={loading || !formData.part_category}
              label="パーツサブカテゴリ"
            >
              <MenuItem value="">
                <em>なし</em>
              </MenuItem>
              {filteredSubCategories.map(s => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>
              {!formData.part_category && 'まずカテゴリを選択してください'}
            </FormHelperText>
          </FormControl>

          {/* Applicable Car Models */}
          <Autocomplete
            multiple
            options={filteredCarModels}
            getOptionLabel={(option) => option.name}
            value={filteredCarModels.filter(c =>
              formData.applicable_car_models.includes(c.id)
            )}
            onChange={(e, newValue) => {
              handleChange('applicable_car_models', newValue.map(v => v.id));
            }}
            disabled={loading || !selectedManufacturer}
            renderInput={(params) => (
              <TextField
                {...params}
                label="適用車種"
                placeholder="車種を選択..."
                helperText={!selectedManufacturer && 'まずメーカーを選択してください'}
              />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...otherProps } = getTagProps({ index });
                return (
                  <Chip
                    key={key}
                    label={option.name}
                    {...otherProps}
                    size="small"
                  />
                );
              })
            }
          />

          {/* File Upload Section */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              ファイル {mode === 'create' && '*'}
            </Typography>

            {/* Existing Files (Edit Mode) */}
            {existingFiles.length > 0 && (
              <Box mb={2}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  既存のファイル
                </Typography>
                <ImageList cols={2} gap={8} sx={{ mt: 1 }}>
                  {existingFiles.map((file) => (
                    <ImageListItem key={file.id}>
                      <Box
                        sx={{
                          position: 'relative',
                          height: 120,
                          borderRadius: 2,
                          overflow: 'hidden',
                          bgcolor: 'grey.100',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {file.file_type === 'image' ? (
                          <img
                            src={file.file}
                            alt="preview"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          getFileIcon(file)
                        )}
                      </Box>
                      <ImageListItemBar
                        actionIcon={
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveExistingFile(file.id)}
                            sx={{ color: 'white' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        }
                        sx={{ bgcolor: 'rgba(0,0,0,0.5)' }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}

            {/* New Files Preview */}
            {selectedFiles.length > 0 && (
              <Box mb={2}>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  新しいファイル
                </Typography>
                <ImageList cols={2} gap={8} sx={{ mt: 1 }}>
                  {selectedFiles.map((file, index) => (
                    <ImageListItem key={`new-file-${index}`}>
                      <Box
                        sx={{
                          position: 'relative',
                          height: 120,
                          borderRadius: 2,
                          overflow: 'hidden',
                          bgcolor: 'grey.100',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {file.type.startsWith('image/') ? (
                          <img
                            src={getFilePreview(file)}
                            alt="preview"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          getFileIcon(file)
                        )}
                      </Box>
                      <ImageListItemBar
                        title={file.name}
                        actionIcon={
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveNewFile(index)}
                            sx={{ color: 'white' }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        }
                        sx={{ bgcolor: 'rgba(0,0,0,0.5)' }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>
            )}

            {/* Upload Button */}
            <Button
              fullWidth
              variant="outlined"
              component="label"
              startIcon={<UploadIcon />}
              disabled={loading}
              sx={{ borderRadius: 2, py: 1.5 }}
            >
              ファイルを選択
              <input
                type="file"
                hidden
                multiple
                accept="image/*,application/pdf"
                onChange={handleFileSelect}
              />
            </Button>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              画像 (JPG, PNG, GIF, WEBP) または PDF (最大10MB)
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Button
          fullWidth
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={{
            borderRadius: 2,
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' }
          }}
        >
          キャンセル
        </Button>
        <Button
          fullWidth
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          sx={{
            borderRadius: 2,
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : mode === 'create' ? (
            '作成'
          ) : (
            '更新'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MobileIllustrationFormModal;