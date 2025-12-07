// src/pages/mobile/MobilePartCategories.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  IconButton,
  TextField,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Alert,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  Button,
  Fab,
  SwipeableDrawer,
  Divider,
  Chip,
  alpha
} from '@mui/material';
import {
  Add as PlusIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  Close as CloseIcon,
  MoreVert as MoreIcon,
  Build as BuildIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { usePartCategories, useEngineModels } from '../../hooks/useIllustrations';

const MobilePartCategories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ 
    engine_model: '', 
    name: '', 
    slug: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showActions, setShowActions] = useState(false);

  const { 
    categories, 
    loading, 
    error, 
    fetchCategories,
    createCategory, 
    updateCategory,
    deleteCategory 
  } = usePartCategories();
  
  const { engineModels } = useEngineModels();

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.engine_model_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        engine_model: category.engine_model || category.engine_model_id || '',
        name: category.name,
        slug: category.slug,
        description: category.description || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({ engine_model: '', name: '', slug: '', description: '' });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'name' && !editingCategory) {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9\s\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, '')
        .replace(/\s+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
    
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.engine_model) newErrors.engine_model = 'エンジンモデルは必須です';
    if (!formData.name?.trim()) newErrors.name = '名前は必須です';
    if (!formData.slug?.trim()) newErrors.slug = 'スラッグは必須です';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        engine_model: formData.engine_model,
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim()
      };
      
      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
      } else {
        await createCategory(payload);
      }
      
      await fetchCategories();
      setShowModal(false);
      setFormData({ engine_model: '', name: '', slug: '', description: '' });
      setEditingCategory(null);
    } catch (err) {
      const apiError = err.response?.data;
      if (apiError) {
        const fieldErrors = {};
        Object.keys(apiError).forEach(key => {
          if (['slug', 'name', 'engine_model', 'description'].includes(key)) {
            fieldErrors[key] = Array.isArray(apiError[key]) 
              ? apiError[key].join(', ') 
              : apiError[key];
          } else if (key === 'non_field_errors') {
            fieldErrors.submit = apiError[key];
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ submit: err.message || '操作に失敗しました' });
      }
    }
  };

  const handleOpenActions = (category) => {
    setSelectedCategory(category);
    setShowActions(true);
  };

  const handleEdit = () => {
    setShowActions(false);
    handleOpenModal(selectedCategory);
  };

  const handleDelete = async () => {
    setShowActions(false);
    if (window.confirm(`${selectedCategory.name}を削除しますか？`)) {
      try {
        await deleteCategory(selectedCategory.id);
        await fetchCategories();
      } catch (err) {
        alert(`削除に失敗しました: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const PartCategoryCard = ({ category }) => (
    <Card 
      sx={{ 
        borderRadius: 3,
        transition: 'all 0.2s',
        border: 1,
        borderColor: 'divider',
        '&:active': {
          transform: 'scale(0.98)',
          boxShadow: 1
        }
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="start" mb={1.5}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body1" fontWeight="bold" noWrap mb={0.5}>
              {category.name}
            </Typography>
            
            <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
              <BuildIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" noWrap>
                {category.engine_model_name || 'N/A'}
              </Typography>
            </Stack>

            {category.description && (
              <Stack direction="row" alignItems="start" spacing={0.5} mt={0.5}>
                <DescriptionIcon sx={{ fontSize: 14, color: 'text.secondary', mt: 0.2 }} />
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {category.description}
                </Typography>
              </Stack>
            )}
          </Box>
          
          <IconButton 
            size="small" 
            onClick={() => handleOpenActions(category)}
            sx={{ ml: 1 }}
          >
            <MoreIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Box sx={{ 
          bgcolor: alpha('#9c27b0', 0.08), 
          px: 1.5, 
          py: 0.75, 
          borderRadius: 2,
          display: 'inline-block'
        }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
            {category.slug}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Container maxWidth="sm" sx={{ px: 2, py: 2 }}>
        {/* Search Bar */}
        <Paper
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 1,
            borderRadius: 3,
            mb: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <SearchIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
          <TextField
            fullWidth
            placeholder="カテゴリを検索..."
            variant="standard"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              disableUnderline: true
            }}
          />
          {searchTerm && (
            <IconButton
              size="small"
              onClick={() => setSearchTerm('')}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Paper>

        {/* Content */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        ) : filteredCategories.length === 0 ? (
          <Card sx={{ borderRadius: 3, p: 4, textAlign: 'center' }}>
            <CategoryIcon sx={{ fontSize: 56, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              カテゴリが見つかりません
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? '検索条件を変更してください' : '最初のカテゴリを追加しましょう'}
            </Typography>
          </Card>
        ) : (
          <>
            {/* Results Count */}
            <Typography variant="caption" color="text.secondary" display="block" mb={1.5} fontWeight={600}>
              {filteredCategories.length} 件のカテゴリ
            </Typography>

            {/* Category List */}
            <Stack spacing={1.5}>
              {filteredCategories.map((category) => (
                <PartCategoryCard key={category.id} category={category} />
              ))}
            </Stack>
          </>
        )}
      </Container>

      {/* Create/Edit Modal */}
      <Dialog 
        open={showModal} 
        onClose={() => setShowModal(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, m: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              {editingCategory ? 'カテゴリ編集' : 'カテゴリ追加'}
            </Typography>
            <IconButton
              onClick={() => setShowModal(false)}
              size="small"
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2.5}>
              <TextField
                select
                label="エンジンモデル"
                name="engine_model"
                value={formData.engine_model}
                onChange={handleChange}
                error={!!errors.engine_model}
                helperText={errors.engine_model}
                fullWidth
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              >
                <MenuItem value="">選択してください...</MenuItem>
                {engineModels.map(e => (
                  <MenuItem key={e.id} value={e.id}>
                    {e.name} ({e.car_model_name})
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="カテゴリ名"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                placeholder="例: エンジン部品"
                fullWidth
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />

              <TextField
                label="スラッグ"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                error={!!errors.slug}
                helperText={errors.slug || 'URL用の識別子（自動生成）'}
                placeholder="例: engine-parts"
                fullWidth
                required
                disabled={!!editingCategory}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontFamily: 'monospace'
                  }
                }}
              />

              <TextField
                label="説明（任意）"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                placeholder="カテゴリの詳細説明"
                fullWidth
                multiline
                rows={3}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />

              {errors.submit && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {errors.submit}
                </Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => setShowModal(false)}
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
            >
              キャンセル
            </Button>
            <Button 
              type="submit" 
              variant="contained"
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)'
              }}
            >
              {editingCategory ? '更新' : '作成'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Actions Bottom Sheet */}
      <SwipeableDrawer
        anchor="bottom"
        open={showActions}
        onClose={() => setShowActions(false)}
        onOpen={() => {}}
        disableSwipeToOpen
        PaperProps={{
          sx: {
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            pb: 2
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          {/* Drag Handle */}
          <Box sx={{ 
            width: 40, 
            height: 4, 
            bgcolor: 'grey.300', 
            borderRadius: 2, 
            mx: 'auto', 
            mb: 2 
          }} />

          {selectedCategory && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight="bold">
                {selectedCategory.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedCategory.engine_model_name || 'N/A'}
              </Typography>
              {selectedCategory.description && (
                <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                  {selectedCategory.description}
                </Typography>
              )}
            </Box>
          )}

          <Stack spacing={1}>
            <Button
              fullWidth
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{
                py: 1.5,
                justifyContent: 'flex-start',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2
              }}
            >
              編集
            </Button>
            <Divider />
            <Button
              fullWidth
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              sx={{
                py: 1.5,
                justifyContent: 'flex-start',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2
              }}
            >
              削除
            </Button>
          </Stack>
        </Box>
      </SwipeableDrawer>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => handleOpenModal()}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)'
        }}
      >
        <PlusIcon />
      </Fab>
    </Box>
  );
};

export default MobilePartCategories;