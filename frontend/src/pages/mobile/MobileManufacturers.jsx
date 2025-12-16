// src/pages/mobile/MobileManufacturers.jsx - CORRECTED VERSION
import { useState, useEffect } from 'react';
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
  Chip,
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
  Language as LanguageIcon,
  DirectionsCar as CarIcon,
  Build as EngineIcon
} from '@mui/icons-material';
import { useManufacturers } from '../../hooks/useIllustrations';
import ConfirmDialog from "../../components/dialog/ConfirmDialog";
const MobileManufacturers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingManufacturer, setEditingManufacturer] = useState(null);
  const [formData, setFormData] = useState({ name: '', slug: '' });
  const [errors, setErrors] = useState({});
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const {
    manufacturers,
    loading,
    error,
    fetchManufacturers,  // ✅ Make sure this is available
    createManufacturer,
    updateManufacturer,
    deleteManufacturer,
  } = useManufacturers();

  // ✅ Fetch on mount
  useEffect(() => {
    fetchManufacturers();
  }, [fetchManufacturers]);

  // ✅ Listen for modal trigger
  useEffect(() => {
    const handleOpenModal = () => setShowModal(true);
    window.addEventListener('openManufacturerModal', handleOpenModal);
    return () => window.removeEventListener('openManufacturerModal', handleOpenModal);
  }, []);

  const filteredManufacturers = manufacturers.filter(m =>
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (manufacturer = null) => {
    if (manufacturer) {
      setEditingManufacturer(manufacturer);
      setFormData({
        name: manufacturer.name,
        slug: manufacturer.slug || '',
      });
    } else {
      setEditingManufacturer(null);
      setFormData({ name: '', slug: '' });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ Validation
    const newErrors = {};
    if (!formData.name?.trim()) {
      newErrors.name = '名前は必須です';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // ✅ Prepare payload
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug?.trim()
           };

      console.log('Submitting:', payload); // ✅ Debug log

      if (editingManufacturer) {
        await updateManufacturer(editingManufacturer.id, payload);
      } else {
        await createManufacturer(payload);
      }
      
      // ✅ Refresh list after successful create/update
      await fetchManufacturers();
      
      // ✅ Close modal and reset
      setShowModal(false);
      setFormData({ name: '', slug: '' });
      setEditingManufacturer(null);
      
    } catch (err) {
      console.error('Submit error:', err); // ✅ Debug log
      
      // ✅ Better error handling
      const apiError = err.response?.data;
      if (apiError) {
        // Handle field-specific errors
        const fieldErrors = {};
        Object.keys(apiError).forEach(key => {
          if (['name', 'slug'].includes(key)) {
            fieldErrors[key] = Array.isArray(apiError[key]) 
              ? apiError[key].join(', ') 
              : apiError[key];
          } else if (key === 'non_field_errors' || key === 'detail') {
            fieldErrors.submit = Array.isArray(apiError[key])
              ? apiError[key].join(', ')
              : apiError[key];
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ submit: err.message || '操作に失敗しました' });
      }
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

const handleDelete = () => {
  setShowConfirmDelete(true);
};

const performDelete = async () => {
  try {
    await deleteManufacturer(selectedManufacturer.id);
    await fetchManufacturers();
    setShowActions(false);
    setShowConfirmDelete(false);
  } catch (err) {
    console.error('Delete error:', err);
    alert(`削除に失敗しました: ${err.response?.data?.message || err.message}`);
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
            {manufacturer.slug && (
              <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
                <LanguageIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {manufacturer.slug}
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

        {/* Stats */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            icon={<EngineIcon sx={{ fontSize: 16 }} />}
            label={`${manufacturer.engine_count || 0} エンジン`}
            size="small"
            sx={{
              bgcolor: alpha('#2196f3', 0.1),
              color: '#2196f3',
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 24,
              '& .MuiChip-icon': { color: '#2196f3' }
            }}
          />
          
          <Chip
            icon={<CarIcon sx={{ fontSize: 16 }} />}
            label={`${manufacturer.car_model_count || 0} 車両`}
            size="small"
            sx={{
              bgcolor: alpha('#4caf50', 0.1),
              color: '#4caf50',
              fontWeight: 600,
              fontSize: '0.75rem',
              height: 24,
              '& .MuiChip-icon': { color: '#4caf50' }
            }}
          />
        </Stack>

        {/* Slug */}
        <Box sx={{ 
          bgcolor: alpha('#1976d2', 0.08), 
          px: 1.5, 
          py: 0.5, 
          borderRadius: 1.5,
          display: 'inline-block',
          mt: 1.5
        }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.7rem' }}>
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
            slotProps={{ input: { disableUnderline: true } }}
          />
          {searchTerm && (
            <IconButton size="small" onClick={() => setSearchTerm('')}>
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
            <Typography variant="caption" color="text.secondary" display="block" mb={1.5} fontWeight={600}>
              {filteredManufacturers.length} 件のメーカー
            </Typography>

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
        slotProps={{ paper: { sx: { borderRadius: 3, m: 2 } } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              {editingManufacturer ? 'メーカー編集' : 'メーカー追加'}
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
                label="名前"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name || '例: Hino, Isuzu, Toyota'}
                placeholder="例: Hino"
                fullWidth
                required
                autoFocus
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                label="Slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                error={!!errors.slug}
                helperText={errors.slug || '例: hino, isuzu, toyota'}
                placeholder="例: hino"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              {editingManufacturer && (
                <Alert severity="info" sx={{ borderRadius: 2 }}>  
                  Slugは一度設定すると変更できません。新しいSlugが必要な場合は、メーカーを削除して再作成してください。
                </Alert>
              )}

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
        slotProps={{
          paper: {
            sx: { borderTopLeftRadius: 24, borderTopRightRadius: 24, pb: 2 }
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ width: 40, height: 4, bgcolor: 'grey.300', borderRadius: 2, mx: 'auto', mb: 2 }} />

          {selectedManufacturer && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight="bold">
                {selectedManufacturer.name}
              </Typography>
              <Stack direction="row" spacing={1} mt={1}>
                <Typography variant="caption" color="text.secondary">
                  {selectedManufacturer.engine_count || 0} エンジン
                </Typography>
                <Typography variant="caption" color="text.secondary">•</Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedManufacturer.car_model_count || 0} 車両
                </Typography>
              </Stack>
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

      <ConfirmDialog
        open={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        title="削除確認"
        content={`本当に「${selectedManufacturer?.name}」を削除しますか？この操作は取り消せません。`}
        onConfirm={performDelete}
        confirmText="削除"
        cancelText="キャンセル"
      />

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