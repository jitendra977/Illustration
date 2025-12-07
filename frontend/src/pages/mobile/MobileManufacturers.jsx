// src/pages/mobile/MobileManufacturers.jsx
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
  Public as PublicIcon,
  Close as CloseIcon,
  MoreVert as MoreIcon,
  Language as LanguageIcon
} from '@mui/icons-material';
import { useManufacturers } from '../../hooks/useIllustrations';

const MobileManufacturers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingManufacturer, setEditingManufacturer] = useState(null);
  const [formData, setFormData] = useState({ name: '', country: '', slug: '' });
  const [errors, setErrors] = useState({});
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [showActions, setShowActions] = useState(false);

  useEffect(() => {
    const handleOpenModal = () => setShowModal(true);
    window.addEventListener('openManufacturerModal', handleOpenModal);
    return () => window.removeEventListener('openManufacturerModal', handleOpenModal);
  }, []);

  const {
    manufacturers,
    loading,
    error,
    createManufacturer,
    updateManufacturer,
    deleteManufacturer,
  } = useManufacturers();

  const filteredManufacturers = manufacturers.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (manufacturer = null) => {
    if (manufacturer) {
      setEditingManufacturer(manufacturer);
      setFormData({
        name: manufacturer.name,
        country: manufacturer.country || '',
        slug: manufacturer.slug,
      });
    } else {
      setEditingManufacturer(null);
      setFormData({ name: '', country: '', slug: '' });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'name' && !editingManufacturer) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
    
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = '名前は必須です';
    if (!formData.slug.trim()) newErrors.slug = 'スラッグは必須です';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (editingManufacturer) {
        await updateManufacturer(editingManufacturer.slug, formData);
      } else {
        await createManufacturer(formData);
      }
      setShowModal(false);
      setFormData({ name: '', country: '', slug: '' });
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || '操作に失敗しました' });
    }
  };

  const handleOpenActions = (manufacturer) => {
    setSelectedManufacturer(manufacturer);
    setShowActions(true);
  };

  const handleEdit = () => {
    setShowActions(false);
    handleOpenModal(selectedManufacturer);
  };

  const handleDelete = async () => {
    setShowActions(false);
    if (window.confirm(`${selectedManufacturer.name}を削除しますか？`)) {
      try {
        await deleteManufacturer(selectedManufacturer.slug);
      } catch (err) {
        alert('削除に失敗しました');
      }
    }
  };

  const ManufacturerCard = ({ manufacturer }) => (
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
            <Typography variant="body1" fontWeight="bold" noWrap>
              {manufacturer.name}
            </Typography>
            {manufacturer.country && (
              <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
                <LanguageIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {manufacturer.country}
                </Typography>
              </Stack>
            )}
          </Box>
          <IconButton 
            size="small" 
            onClick={() => handleOpenActions(manufacturer)}
            sx={{ ml: 1 }}
          >
            <MoreIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Box sx={{ 
          bgcolor: alpha('#1976d2', 0.08), 
          px: 1.5, 
          py: 0.75, 
          borderRadius: 2,
          display: 'inline-block'
        }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
            {manufacturer.slug}
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
            placeholder="メーカーを検索..."
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
        ) : filteredManufacturers.length === 0 ? (
          <Card sx={{ borderRadius: 3, p: 4, textAlign: 'center' }}>
            <PublicIcon sx={{ fontSize: 56, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              メーカーが見つかりません
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? '検索条件を変更してください' : '最初のメーカーを追加しましょう'}
            </Typography>
          </Card>
        ) : (
          <>
            {/* Results Count */}
            <Typography variant="caption" color="text.secondary" display="block" mb={1.5} fontWeight={600}>
              {filteredManufacturers.length} 件のメーカー
            </Typography>

            {/* Manufacturer List */}
            <Stack spacing={1.5}>
              {filteredManufacturers.map((manufacturer) => (
                <ManufacturerCard key={manufacturer.id} manufacturer={manufacturer} />
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
              {editingManufacturer ? 'メーカー編集' : 'メーカー追加'}
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
                label="名前"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                placeholder="例: Toyota"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />

              <TextField
                label="国"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="例: 日本"
                fullWidth
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
                placeholder="例: toyota"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontFamily: 'monospace'
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
              {editingManufacturer ? '更新' : '作成'}
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

          {selectedManufacturer && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight="bold">
                {selectedManufacturer.name}
              </Typography>
              {selectedManufacturer.country && (
                <Typography variant="caption" color="text.secondary">
                  {selectedManufacturer.country}
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

export default MobileManufacturers;