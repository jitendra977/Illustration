// src/pages/mobile/masters/MobileCarModels.jsx
import React, { useState } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  alpha
} from '@mui/material';
import {
  Add as PlusIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsCar as CarIcon,
  Close as CloseIcon,
  MoreVert as MoreIcon,
  Store as StoreIcon,
  Build as EngineIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import { useCarModels, useManufacturers, useVehicleTypes, useEngineModels } from '../../../hooks/useIllustrations';

const MobileCarModels = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCarModel, setEditingCarModel] = useState(null);
  const [formData, setFormData] = useState({
    manufacturer: '',
    name: '',
    vehicle_type: '',
    year_from: '',
    year_to: '',
    model_code: '',
    chassis_code: '',
    engines: [] // ManyToMany field
  });
  const [errors, setErrors] = useState({});
  const [selectedCarModel, setSelectedCarModel] = useState(null);
  const [showActions, setShowActions] = useState(false);

  const { carModels, loading, error, createCarModel, updateCarModel, deleteCarModel } = useCarModels();
  const { manufacturers } = useManufacturers();
  const { vehicleTypes, loading: vehicleTypesLoading } = useVehicleTypes();
  const { engineModels } = useEngineModels();

  const filteredCarModels = carModels.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.manufacturer_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (carModel = null) => {
    if (carModel) {
      setEditingCarModel(carModel);
      setFormData({
        manufacturer: carModel.manufacturer || '',
        name: carModel.name || '',
        vehicle_type: vehicleTypes.some(t => t.value === carModel.vehicle_type)
          ? carModel.vehicle_type
          : '',
        year_from: carModel.year_from || '',
        year_to: carModel.year_to || '',
        model_code: carModel.model_code || '',
        chassis_code: carModel.chassis_code || '',
        engines: carModel.engines || []
      });
    } else {
      setEditingCarModel(null);
      setFormData({
        manufacturer: '',
        name: '',
        vehicle_type: '',
        year_from: '',
        year_to: '',
        model_code: '',
        chassis_code: '',
        engines: []
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

  const handleEnginesChange = (event) => {
    const { value } = event.target;
    setFormData(prev => ({
      ...prev,
      engines: typeof value === 'string' ? value.split(',') : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.manufacturer) newErrors.manufacturer = 'メーカーは必須です';
    if (!formData.name?.trim()) newErrors.name = '名前は必須です';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        manufacturer: parseInt(formData.manufacturer),
        name: formData.name.trim(),
        vehicle_type: formData.vehicle_type || undefined,
        year_from: formData.year_from ? parseInt(formData.year_from) : undefined,
        year_to: formData.year_to ? parseInt(formData.year_to) : undefined,
        model_code: formData.model_code?.trim() || undefined,
        chassis_code: formData.chassis_code?.trim() || undefined,
        engines: formData.engines.map(id => parseInt(id))
      };

      // Remove undefined values
      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === '' ||
          (Array.isArray(payload[key]) && payload[key].length === 0)) {
          delete payload[key];
        }
      });

      if (editingCarModel) {
        console.log('Updating car model:', editingCarModel.slug, payload);
        await updateCarModel(editingCarModel.slug, payload);
      } else {
        console.log('Creating car model:', payload);
        await createCarModel(payload);
      }

      setShowModal(false);
      setFormData({
        manufacturer: '',
        name: '',
        vehicle_type: '',
        year_from: '',
        year_to: '',
        model_code: '',
        chassis_code: '',
        engines: []
      });
      setEditingCarModel(null);
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

  const handleOpenActions = (carModel) => {
    setSelectedCarModel(carModel);
    setShowActions(true);
  };

  const handleEdit = () => {
    setShowActions(false);
    handleOpenModal(selectedCarModel);
  };

  const handleDelete = async () => {
    setShowActions(false);
    if (window.confirm(`${selectedCarModel.name}を削除しますか？`)) {
      try {
        await deleteCarModel(selectedCarModel.slug);
      } catch (err) {
        alert(`削除に失敗しました: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  const getVehicleTypeLabel = (value) => {
    const type = vehicleTypes.find(t => t.value === value);
    return type ? type.label : value;
  };

  const CarModelCard = ({ carModel }) => (
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
              {carModel.name}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
              <StoreIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary" noWrap>
                {carModel.manufacturer_name}
              </Typography>
            </Stack>
          </Box>
          <IconButton
            size="small"
            onClick={() => handleOpenActions(carModel)}
            sx={{ ml: 1 }}
          >
            <MoreIcon fontSize="small" />
          </IconButton>
        </Stack>

        {/* Stats */}
        <Stack direction="row" spacing={1} mb={1.5} flexWrap="wrap">
          {carModel.engine_count > 0 && (
            <Chip
              icon={<EngineIcon sx={{ fontSize: 16 }} />}
              label={`${carModel.engine_count} エンジン`}
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
          )}

          {(carModel.year_from || carModel.year_to) && (
            <Chip
              icon={<CalendarIcon sx={{ fontSize: 16 }} />}
              label={
                carModel.year_to
                  ? `${carModel.year_from}-${carModel.year_to}`
                  : `${carModel.year_from}-現在`
              }
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

          {carModel.vehicle_type && (
            <Chip
              label={getVehicleTypeLabel(carModel.vehicle_type)}
              size="small"
              sx={{
                bgcolor: alpha('#ff9800', 0.1),
                color: '#ff9800',
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 24
              }}
            />
          )}
        </Stack>

        {/* Details */}
        <Stack spacing={0.5}>
          <Box sx={{
            bgcolor: alpha('#1976d2', 0.08),
            px: 1.5,
            py: 0.5,
            borderRadius: 1.5,
            display: 'inline-block'
          }}>
            <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '0.7rem' }}>
              {carModel.slug}
            </Typography>
          </Box>

          {(carModel.model_code || carModel.chassis_code) && (
            <Typography variant="caption" color="text.secondary">
              {carModel.model_code && `型式: ${carModel.model_code}`}
              {carModel.model_code && carModel.chassis_code && ' | '}
              {carModel.chassis_code && `シャーシ: ${carModel.chassis_code}`}
            </Typography>
          )}
        </Stack>
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
            placeholder="車種を検索..."
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

        {/* Content */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        ) : filteredCarModels.length === 0 ? (
          <Card sx={{ borderRadius: 3, p: 4, textAlign: 'center' }}>
            <CarIcon sx={{ fontSize: 56, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              車種が見つかりません
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? '検索条件を変更してください' : '最初の車種を追加しましょう'}
            </Typography>
          </Card>
        ) : (
          <>
            <Typography variant="caption" color="text.secondary" display="block" mb={1.5} fontWeight={600}>
              {filteredCarModels.length} 件の車種
            </Typography>
            <Stack spacing={1.5}>
              {filteredCarModels.map((carModel) => (
                <CarModelCard key={carModel.id} carModel={carModel} />
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
        PaperProps={{ sx: { borderRadius: 3, m: 2 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              {editingCarModel ? '車種編集' : '車種追加'}
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
                label="車種名"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name || '例: Profia, Ranger'}
                placeholder="例: Profia"
                required
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                select
                label="車両タイプ"
                name="vehicle_type"
                value={formData.vehicle_type}
                onChange={handleChange}
                error={!!errors.vehicle_type}
                helperText={errors.vehicle_type}
                fullWidth
                disabled={vehicleTypesLoading}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                <MenuItem value="">選択してください...</MenuItem>
                {vehicleTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>

              <Stack direction="row" spacing={2}>
                <TextField
                  label="生産開始年"
                  name="year_from"
                  type="number"
                  value={formData.year_from}
                  onChange={handleChange}
                  error={!!errors.year_from}
                  helperText={errors.year_from}
                  placeholder="2003"
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  label="生産終了年"
                  name="year_to"
                  type="number"
                  value={formData.year_to}
                  onChange={handleChange}
                  error={!!errors.year_to}
                  helperText={errors.year_to || '空白=現在'}
                  placeholder="2017"
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Stack>

              <TextField
                label="型式"
                name="model_code"
                value={formData.model_code}
                onChange={handleChange}
                error={!!errors.model_code}
                helperText={errors.model_code}
                placeholder="例: FR1EXEG"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                label="シャーシコード"
                name="chassis_code"
                value={formData.chassis_code}
                onChange={handleChange}
                error={!!errors.chassis_code}
                helperText={errors.chassis_code}
                placeholder="例: FR1E"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <FormControl fullWidth>
                <InputLabel>エンジンオプション</InputLabel>
                <Select
                  multiple
                  value={formData.engines}
                  onChange={handleEnginesChange}
                  input={<OutlinedInput label="エンジンオプション" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => {
                        const engine = engineModels.find(e => e.id === parseInt(value));
                        return (
                          <Chip
                            key={value}
                            label={engine?.name || value}
                            size="small"
                          />
                        );
                      })}
                    </Box>
                  )}
                  sx={{ borderRadius: 2 }}
                >
                  {engineModels
                    .filter(e => !formData.manufacturer || e.manufacturer === parseInt(formData.manufacturer))
                    .map((engine) => (
                      <MenuItem key={engine.id} value={engine.id}>
                        {engine.name} ({engine.manufacturer_name})
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              {editingCarModel && (
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  スラッグは自動生成されます: <strong>{editingCarModel.slug}</strong>
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
              disabled={vehicleTypesLoading}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)'
              }}
            >
              {editingCarModel ? '更新' : '作成'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Actions Bottom Sheet */}
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
          {selectedCarModel && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight="bold">
                {selectedCarModel.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedCarModel.manufacturer_name} | {selectedCarModel.engine_count || 0} エンジン
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

export default MobileCarModels;