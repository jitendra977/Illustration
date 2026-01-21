// src/pages/mobile/masters/MobileEngineModels.jsx
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
  Store as StoreIcon,
  LocalGasStation as FuelIcon
} from '@mui/icons-material';
import { useEngineModels, useManufacturers } from '../../../hooks/useIllustrations';
import ConfirmDialog from "../../../components/dialogs/ConfirmDialog";

// ✅ Static fuel types - matches backend FUEL_TYPES choices
const FUEL_TYPES = [
  { value: 'diesel', label: 'ディーゼル' },
  { value: 'petrol', label: 'ガソリン' },
  { value: 'hybrid', label: 'ハイブリッド' },
  { value: 'electric', label: '電気(EV)' },
  { value: 'lpg', label: 'LPG(液化プロパンガス)' }
];

const MobileEngineModels = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEngine, setEditingEngine] = useState(null);
  const [formData, setFormData] = useState({
    manufacturer: '',
    name: '',
    engine_code: '',
    fuel_type: 'diesel'
  });
  const [errors, setErrors] = useState({});
  const [selectedEngine, setSelectedEngine] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const {
    engineModels,
    loading,
    error,
    fetchEngineModels, // ✅ Add this
    createEngineModel,
    updateEngineModel,
    deleteEngineModel
  } = useEngineModels();

  const { manufacturers } = useManufacturers();

  // ✅ Fetch engines on mount
  useEffect(() => {
    fetchEngineModels();
  }, []);

  const filteredEngines = engineModels.filter(e =>
    e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.engine_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.manufacturer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (engine = null) => {
    if (engine) {
      setEditingEngine(engine);
      setFormData({
        manufacturer: engine.manufacturer || '',
        name: engine.name || '',
        engine_code: engine.engine_code || '',
        fuel_type: engine.fuel_type || 'diesel'
      });
    } else {
      setEditingEngine(null);
      setFormData({
        manufacturer: '',
        name: '',
        engine_code: '',
        fuel_type: 'diesel'
      });
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

    const newErrors = {};
    if (!formData.manufacturer) newErrors.manufacturer = 'メーカーは必須です';
    if (!formData.name?.trim()) newErrors.name = '名前は必須です';
    if (!formData.fuel_type) newErrors.fuel_type = '燃料タイプは必須です';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        manufacturer: parseInt(formData.manufacturer),
        name: formData.name.trim(),
        engine_code: formData.engine_code?.trim() || '',
        fuel_type: formData.fuel_type
      };

      if (editingEngine) {
        await updateEngineModel(editingEngine.id, payload);
      } else {
        await createEngineModel(payload);
      }

      // ✅ Refresh the list after create/update
      await fetchEngineModels();

      setShowModal(false);
      setFormData({
        manufacturer: '',
        name: '',
        engine_code: '',
        fuel_type: 'diesel'
      });
      setEditingEngine(null);
    } catch (err) {
      console.error('Submit error:', err);
      const apiError = err.response?.data;
      if (apiError) {
        const fieldErrors = {};
        Object.keys(apiError).forEach(key => {
          fieldErrors[key] = Array.isArray(apiError[key])
            ? apiError[key].join(', ')
            : apiError[key];
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

  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  const performDelete = async () => {
    setShowActions(false);
    try {
      await deleteEngineModel(selectedEngine.id);
      // ✅ Refresh the list after delete
      await fetchEngineModels();
      setShowConfirmDelete(false);
    } catch (err) {
      alert(`削除に失敗しました: ${err.response?.data?.message || err.message}`);
    }
  };

  const getFuelTypeLabel = (value) => {
    const type = FUEL_TYPES.find(t => t.value === value);
    return type ? type.label : value;
  };

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
              {engine.engine_code && (
                <Typography component="span" variant="body2" color="text.secondary" ml={1}>
                  ({engine.engine_code})
                </Typography>
              )}
            </Typography>

            <Stack direction="row" alignItems="center" spacing={0.5}>
              <StoreIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" noWrap>
                {engine.manufacturer_name}
              </Typography>
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

        <Stack direction="row" spacing={1} mb={1.5} flexWrap="wrap">
          {engine.fuel_type && (
            <Chip
              icon={<FuelIcon sx={{ fontSize: 16 }} />}
              label={engine.fuel_type_display || getFuelTypeLabel(engine.fuel_type)}
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
          )}

          {engine.car_model_count > 0 && (
            <Chip
              icon={<CarIcon sx={{ fontSize: 16 }} />}
              label={`${engine.car_model_count} 車両`}
              size="small"
              sx={{
                bgcolor: alpha('#9c27b0', 0.1),
                color: '#9c27b0',
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 24,
                '& .MuiChip-icon': { color: '#9c27b0' }
              }}
            />
          )}
        </Stack>

        <Box sx={{
          bgcolor: alpha('#43a047', 0.08),
          px: 1.5,
          py: 0.5,
          borderRadius: 1.5,
          display: 'inline-block'
        }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.7rem' }}>
            {engine.slug}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Container maxWidth="sm" sx={{ px: 2, py: 2 }}>
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
            InputProps={{ disableUnderline: true }}
          />
          {searchTerm && (
            <IconButton size="small" onClick={() => setSearchTerm('')}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Paper>

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
            <Typography variant="caption" color="text.secondary" display="block" mb={1.5} fontWeight={600}>
              {filteredEngines.length} 件のエンジン
            </Typography>
            <Stack spacing={1.5}>
              {filteredEngines.map((engine) => (
                <EngineCard key={engine.id} engine={engine} />
              ))}
            </Stack>
          </>
        )}
      </Container>

      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, m: 2 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              {editingEngine ? 'エンジン編集' : 'エンジン追加'}
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
                select
                label="メーカー"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                error={!!errors.manufacturer}
                helperText={errors.manufacturer}
                required
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                <MenuItem value="">選択してください...</MenuItem>
                {manufacturers.map(m => (
                  <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                ))}
              </TextField>

              <TextField
                label="エンジン名"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name || '例: A09C, 6HK1, P11C'}
                placeholder="例: A09C"
                required
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                label="エンジンコード（任意）"
                name="engine_code"
                value={formData.engine_code}
                onChange={handleChange}
                error={!!errors.engine_code}
                helperText={errors.engine_code || '例: A09C-TT, 6HK1-TC'}
                placeholder="例: A09C-TT"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                select
                label="燃料タイプ"
                name="fuel_type"
                value={formData.fuel_type}
                onChange={handleChange}
                error={!!errors.fuel_type}
                helperText={errors.fuel_type || '燃料の種類を選択してください'}
                required
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                {FUEL_TYPES.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>

              {editingEngine && (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  スラッグは自動生成されます: <strong>{editingEngine.slug}</strong>
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
              {editingEngine ? '更新' : '作成'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <SwipeableDrawer
        anchor="bottom"
        open={showActions}
        onClose={() => setShowActions(false)}
        onOpen={() => { }}
        disableSwipeToOpen
        PaperProps={{ sx: { borderTopLeftRadius: 24, borderTopRightRadius: 24, pb: 2 } }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ width: 40, height: 4, bgcolor: 'grey.300', borderRadius: 2, mx: 'auto', mb: 2 }} />
          {selectedEngine && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight="bold">
                {selectedEngine.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedEngine.manufacturer_name}
                {selectedEngine.fuel_type_display && ` | ${selectedEngine.fuel_type_display}`}
                {selectedEngine.car_model_count > 0 && ` | ${selectedEngine.car_model_count} 車両`}
              </Typography>
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

      <ConfirmDialog
        open={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        title="削除確認"
        content={`本当に「${selectedEngine?.name}」を削除しますか？この操作は取り消せません。`}
        onConfirm={performDelete}
        confirmText="削除"
        cancelText="キャンセル"
      />

      <Fab
        color="primary"
        aria-label="add"
        onClick={() => handleOpenModal()}
        sx={{ position: 'fixed', bottom: 80, right: 16, zIndex: 1000, boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)' }}
      >
        <PlusIcon />
      </Fab>
    </Box>
  );
};

export default MobileEngineModels;