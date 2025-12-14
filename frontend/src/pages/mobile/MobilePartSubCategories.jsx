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
  Alert,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  Button,
  Fab,
  SwipeableDrawer,
  Divider,
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
  Description as DescriptionIcon,
  Numbers as NumbersIcon,
  Language as LanguageIcon
} from '@mui/icons-material';
import { usePartSubCategories } from '../../hooks/useIllustrations';

const MobilePartSubCategories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    name_ja: '',
    slug: '',
    description: '',
    order: 0
  });
  const [errors, setErrors] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null); // Fixed: was incorrectly declared as [setSelectedSubCategory, setSelectedSubCategory]
  const [showActions, setShowActions] = useState(false);

  const { 
    categories, 
    loading, 
    error, 
    fetchCategories,
    createCategory, 
    updateCategory,
    deleteCategory 
  } = usePartSubCategories();

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.name_ja?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        name_ja: category.name_ja || '',
        slug: category.slug,
        description: category.description || '',
        order: category.order || 0
      });
    } else {
      setEditingCategory(null);
      setFormData({ 
        name: '', 
        name_ja: '', 
        slug: '', 
        description: '',
        order: categories.length > 0 ? Math.max(...categories.map(c => c.order || 0)) + 1 : 1
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Auto-generate slug from name (English)
    if (name === 'name' && !editingCategory) {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
    
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = '英語名は必須です';
    if (!formData.slug?.trim()) newErrors.slug = 'スラッグは必須です';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        name_ja: formData.name_ja.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim(),
        order: parseInt(formData.order) || 0
      };
      
      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
      } else {
        await createCategory(payload);
      }
      
      await fetchCategories();
      setShowModal(false);
      setFormData({ name: '', name_ja: '', slug: '', description: '', order: 0 });
      setEditingCategory(null);
    } catch (err) {
      const apiError = err.response?.data;
      if (apiError) {
        const fieldErrors = {};
        Object.keys(apiError).forEach(key => {
          if (['slug', 'name', 'name_ja', 'description', 'order'].includes(key)) {
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
    if (window.confirm(`${selectedCategory.name}を削除しますか？関連するサブカテゴリも削除されます。`)) {
      try {
        await deleteCategory(selectedCategory.id);
        await fetchCategories();
      } catch (err) {
        alert(`削除に失敗しました: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const PartSubCategoryCard = ({ category }) => (
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
            {/* English & Japanese Names */}
            <Typography variant="body1" fontWeight="bold" noWrap mb={0.5}>
              {category.name}
            </Typography>
            
            {category.name_ja && (
              <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
                <LanguageIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary" noWrap>
                  {category.name_ja}
                </Typography>
              </Stack>
            )}

            {/* Subcategory & Illustration Count */}
            <Stack direction="row" spacing={2} mb={0.5}>
              {category.subcategory_count !== undefined && category.subcategory_count > 0 && (
                <Typography variant="caption" color="primary.main" fontWeight={600}>
                  サブカテゴリ: {category.subcategory_count}
                </Typography>
              )}
              {category.illustration_count !== undefined && category.illustration_count > 0 && (
                <Typography variant="caption" color="success.main" fontWeight={600}>
                  図: {category.illustration_count}
                </Typography>
              )}
            </Stack>

            {/* Description */}
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

        {/* Slug & Order Badge */}
        <Stack direction="row" spacing={1} alignItems="center">
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
          
          {category.order !== undefined && category.order > 0 && (
            <Box sx={{ 
              bgcolor: alpha('#2196f3', 0.08), 
              px: 1, 
              py: 0.5, 
              borderRadius: 2,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5
            }}>
              <NumbersIcon sx={{ fontSize: 12, color: 'primary.main' }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
                {category.order}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Container maxWidth="sm" sx={{ px: 2, py: 2 }}>
        {/* Header Info */}
        <Paper
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 3,
            bgcolor: alpha('#9c27b0', 0.05),
            border: 1,
            borderColor: alpha('#9c27b0', 0.1)
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" mb={1}>
            <CategoryIcon sx={{ color: 'primary.main' }} />
            <Typography variant="body2" fontWeight="bold">
              ユニバーサルカテゴリ
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            すべてのエンジンで共通して使用できる部品カテゴリです
          </Typography>
        </Paper>

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
            <Typography variant="caption" color="text.secondary" display="block" mb={1.5} fontWeight={600}>
              {filteredCategories.length} 件のカテゴリ
            </Typography>

            <Stack spacing={1.5}>
              {filteredCategories.map((category) => (
                <PartSubCategoryCard key={category.id} category={category} />
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
            <IconButton onClick={() => setShowModal(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2.5}>
              <TextField
                label="カテゴリ名（英語）"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name || 'Example: Engine Components'}
                placeholder="Engine Components"
                fullWidth
                required
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                label="カテゴリ名（日本語）"
                name="name_ja"
                value={formData.name_ja}
                onChange={handleChange}
                error={!!errors.name_ja}
                helperText={errors.name_ja || '例: エンジン本体'}
                placeholder="エンジン本体"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                label="スラッグ"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                error={!!errors.slug}
                helperText={errors.slug || 'URL用の識別子（自動生成）'}
                placeholder="engine-components"
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
                label="表示順序"
                name="order"
                type="number"
                value={formData.order}
                onChange={handleChange}
                error={!!errors.order}
                helperText={errors.order || '小さい数字が先に表示されます'}
                placeholder="1"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}
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
          sx: { borderTopLeftRadius: 24, borderTopRightRadius: 24, pb: 2 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ width: 40, height: 4, bgcolor: 'grey.300', borderRadius: 2, mx: 'auto', mb: 2 }} />
          
          {selectedCategory && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight="bold">
                {selectedCategory.name}
              </Typography>
              {selectedCategory.name_ja && (
                <Typography variant="caption" color="text.secondary" display="block">
                  {selectedCategory.name_ja}
                </Typography>
              )}
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
              sx={{ py: 1.5, justifyContent: 'flex-start', textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
            >
              編集
            </Button>
            <Divider />
            <Button
              fullWidth
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              sx={{ py: 1.5, justifyContent: 'flex-start', textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
            >
              削除
            </Button>
          </Stack>
        </Box>
      </SwipeableDrawer>

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

export default MobilePartSubCategories;