import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Alert,
  CircularProgress,
  Stack,
  Chip,
  alpha,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Add as PlusIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  Close as CloseIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import { usePartCategories, useEngineModels } from '../../hooks/useIllustrations';

const PartCategoryManagement = () => {
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

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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
    
    // 新規作成時のみスラッグ自動生成
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

  const handleDelete = async (category) => {
    if (window.confirm(`「${category.name}」を削除してもよろしいですか？この操作は元に戻せません。`)) {
      try {
        await deleteCategory(category.id);
        await fetchCategories();
      } catch (err) {
        alert(`削除に失敗しました: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  // モバイル用カード表示
  const CategoryCard = ({ category }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ p: 2 }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="start">
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom noWrap>
                {category.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                {category.slug}
              </Typography>
            </Box>
            <Stack direction="row" spacing={0.5}>
              <IconButton size="small" onClick={() => handleOpenModal(category)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleDelete(category)} color="error">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                エンジンモデル
              </Typography>
              <Chip 
                label={category.engine_model_name || 'N/A'}
                size="small"
                icon={<BuildIcon sx={{ fontSize: 14 }} />}
                sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}
              />
            </Box>
            
            {category.description && (
              <Box>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  説明
                </Typography>
                <Typography variant="body2">
                  {category.description}
                </Typography>
              </Box>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* ヘッダー */}
      <Paper elevation={0} sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        bgcolor: 'background.paper'
      }}>
        <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 2.5 } }}>
          <Stack spacing={2}>
            <Stack 
              direction="row" 
              justifyContent="space-between" 
              alignItems="center"
              spacing={1}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight="bold" noWrap>
                  パーツカテゴリ管理
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary"
                  sx={{ display: { xs: 'none', sm: 'block' } }}
                >
                  パーツのカテゴリを管理
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<PlusIcon />}
                onClick={() => handleOpenModal()}
                size={isMobile ? 'small' : 'medium'}
                sx={{ flexShrink: 0 }}
              >
                {isMobile ? '追加' : 'カテゴリ追加'}
              </Button>
            </Stack>

            <TextField
              placeholder="カテゴリを検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              size="small"
              fullWidth
            />
          </Stack>
        </Container>
      </Paper>

      {/* コンテンツ */}
      <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : filteredCategories.length === 0 ? (
          <Paper sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
            <CategoryIcon sx={{ fontSize: { xs: 48, sm: 64 }, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              パーツカテゴリがありません
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {searchTerm ? '別の検索条件をお試しください' : '最初のパーツカテゴリを追加してください'}
            </Typography>
            {!searchTerm && (
              <Button
                variant="outlined"
                startIcon={<PlusIcon />}
                onClick={() => handleOpenModal()}
              >
                カテゴリを追加
              </Button>
            )}
          </Paper>
        ) : isMobile || isTablet ? (
          // モバイル/タブレット表示
          filteredCategories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))
        ) : (
          // デスクトップ表示（テーブル）
          <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Table>
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>カテゴリ名</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>エンジンモデル</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>スラッグ</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>説明</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', py: 1.5 }}>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {category.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip 
                        label={category.engine_model_name || 'N/A'}
                        size="small"
                        icon={<BuildIcon sx={{ fontSize: 14 }} />}
                        sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {category.slug}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5, maxWidth: 300 }}>
                      <Typography variant="body2" noWrap>
                        {category.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5 }}>
                      <IconButton size="small" onClick={() => handleOpenModal(category)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(category)} color="error">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>

      {/* モーダル */}
      <Dialog 
        open={showModal} 
        onClose={() => setShowModal(false)} 
        maxWidth="sm" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {editingCategory ? 'カテゴリを編集' : 'カテゴリを追加'}
          <IconButton
            onClick={() => setShowModal(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2.5}>
              <TextField
                select
                label="エンジンモデル"
                name="engine_model"
                value={formData.engine_model}
                onChange={handleChange}
                error={!!errors.engine_model}
                helperText={errors.engine_model}
                size="small"
                fullWidth
                required
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
                size="small"
                fullWidth
                required
              />

              <TextField
                label="スラッグ"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                error={!!errors.slug}
                helperText={errors.slug || '英数字とハイフンのみ使用可能'}
                placeholder="例: engine-parts"
                size="small"
                fullWidth
                required
                sx={{ fontFamily: 'monospace' }}
                disabled={!!editingCategory}
              />

              <TextField
                label="説明（任意）"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                placeholder="カテゴリの詳細説明"
                size="small"
                fullWidth
                multiline
                rows={3}
              />

              {errors.submit && (
                <Alert severity="error">{errors.submit}</Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setShowModal(false)}>
              キャンセル
            </Button>
            <Button type="submit" variant="contained">
              {editingCategory ? '更新' : '作成'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default PartCategoryManagement;