// src/pages/mobile/MobileEngineModels.jsx
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
  Speed as SpeedIcon,
  Close as CloseIcon,
  MoreVert as MoreIcon,
  DirectionsCar as CarIcon,
  Store as StoreIcon
} from '@mui/icons-material';
import { useEngineModels, useManufacturers, useCarModels } from '../../hooks/useIllustrations';

const MobileEngineModels = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEngine, setEditingEngine] = useState(null);
  const [formData, setFormData] = useState({ 
    manufacturer: '', 
    car_model: '', 
    name: '', 
    slug: '' 
  });
  const [errors, setErrors] = useState({});
  const [selectedEngine, setSelectedEngine] = useState(null);
  const [showActions, setShowActions] = useState(false);

  const { 
    engineModels, 
    loading, 
    error, 
    createEngineModel, 
    updateEngineModel,
    deleteEngineModel 
  } = useEngineModels();
  
  const { manufacturers } = useManufacturers();
  const { carModels, fetchCarModels } = useCarModels();

  const filteredEngines = engineModels.filter(e =>
    e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.car_model_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.manufacturer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (engine = null) => {
    if (engine) {
      setEditingEngine(engine);
      setFormData({
        manufacturer: engine.car_model?.manufacturer || engine.car_model_manufacturer || '',
        car_model: engine.car_model || engine.car_model_id,
        name: engine.name,
        slug: engine.slug,
      });
    } else {
      setEditingEngine(null);
      setFormData({ manufacturer: '', car_model: '', name: '', slug: '' });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'manufacturer') {
      setFormData(prev => ({ ...prev, car_model: '' }));
      fetchCarModels({ manufacturer: value });
    }
    
    if (name === 'name' && !editingEngine) {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9\s]+/g, '')
        .replace(/\s+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
    
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.car_model) newErrors.car_model = '車種は必須です';
    if (!formData.name?.trim()) newErrors.name = '名前は必須です';
    if (!formData.slug?.trim()) newErrors.slug = 'スラッグは必須です';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        car_model: formData.car_model,
        name: formData.name.trim(),
        slug: formData.slug.trim()
      };
      
      if (editingEngine) {
        await updateEngineModel(editingEngine.slug, payload);
      } else {
        await createEngineModel(payload);
      }
      setShowModal(false);
      setFormData({ manufacturer: '', car_model: '', name: '', slug: '' });
      setEditingEngine(null);
    } catch (err) {
      const apiError = err.response?.data;
      if (apiError) {
        const fieldErrors = {};
        Object.keys(apiError).forEach(key => {
          if (['slug', 'name', 'car_model'].includes(key)) {
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

  const handleOpenActions = (engine) => {
    setSelectedEngine(engine);
    setShowActions(true);
  };

  const handleEdit = () => {
    setShowActions(false);
    handleOpenModal(selectedEngine);
  };

  const handleDelete = async () => {
    setShowActions(false);
    if (window.confirm(`${selectedEngine.name}を削除しますか？`)) {
      try {
        await deleteEngineModel(selectedEngine.slug);
      } catch (err) {
        alert(`削除に失敗しました: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const filteredCarModels = formData.manufacturer 
    ? carModels.filter(c => c.manufacturer === formData.manufacturer || c.manufacturer_id === formData.manufacturer)
    : carModels;

  const EngineCard = ({ engine }) => (
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
              {engine.name}
            </Typography>
            
            <Stack spacing={0.5}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <CarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary" noWrap>
                  {engine.car_model_name || engine.car_model?.name}
                </Typography>
              </Stack>
              
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <StoreIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary" noWrap>
                  {engine.manufacturer_name || engine.car_model?.manufacturer?.name}
                </Typography>
              </Stack>
            </Stack>
          </Box>
          
          <IconButton 
            size="small" 
            onClick={() => handleOpenActions(engine)}
            sx={{ ml: 1 }}
          >
            <MoreIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Box sx={{ 
          bgcolor: alpha('#43a047', 0.08), 
          px: 1.5, 
          py: 0.75, 
          borderRadius: 2,
          display: 'inline-block'
        }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
            {engine.slug}
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
            placeholder="エンジンを検索..."
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
        ) : filteredEngines.length === 0 ? (
          <Card sx={{ borderRadius: 3, p: 4, textAlign: 'center' }}>
            <SpeedIcon sx={{ fontSize: 56, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              エンジンが見つかりません
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? '検索条件を変更してください' : '最初のエンジンを追加しましょう'}
            </Typography>
          </Card>
        ) : (
          <>
            {/* Results Count */}
            <Typography variant="caption" color="text.secondary" display="block" mb={1.5} fontWeight={600}>
              {filteredEngines.length} 件のエンジン
            </Typography>

            {/* Engine List */}
            <Stack spacing={1.5}>
              {filteredEngines.map((engine) => (
                <EngineCard key={engine.id} engine={engine} />
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
              {editingEngine ? 'エンジン編集' : 'エンジン追加'}
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
                label="メーカー"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              >
                <MenuItem value="">選択してください...</MenuItem>
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
                disabled={!formData.manufacturer}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              >
                <MenuItem value="">選択してください...</MenuItem>
                {filteredCarModels.map(c => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="エンジン名"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                placeholder="例: 2.0L ターボ"
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
                placeholder="例: 2-0l-turbo"
                fullWidth
                disabled={!!editingEngine}
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
              {editingEngine ? '更新' : '作成'}
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

          {selectedEngine && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight="bold">
                {selectedEngine.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedEngine.car_model_name || selectedEngine.car_model?.name}
              </Typography>
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

export default MobileEngineModels;