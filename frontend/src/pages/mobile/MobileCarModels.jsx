// src/pages/mobile/MobileCarModels.jsx
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
  Store as StoreIcon
} from '@mui/icons-material';
import { useCarModels, useManufacturers, useVehicleTypes, useFuelTypes } from '../../hooks/useIllustrations';

const MobileCarModels = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCarModel, setEditingCarModel] = useState(null);
  const [formData, setFormData] = useState({
    manufacturer: '',
    vehicle_type: '',
    year: '',
    first_registration: '',
    model_code: '',
    chassis_number: '',
    fuel_type: '',
    name: '',
    slug: ''
  });
  const [errors, setErrors] = useState({});
  const [selectedCarModel, setSelectedCarModel] = useState(null);
  const [showActions, setShowActions] = useState(false);

  const { carModels, loading, error, createCarModel, updateCarModel, deleteCarModel } = useCarModels();
  const { manufacturers } = useManufacturers();
  const { vehicleTypes, loading: vehicleTypesLoading } = useVehicleTypes();
  const { fuelTypes, loading: fuelTypesLoading } = useFuelTypes();

  const filteredCarModels = carModels.filter(c =>
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.manufacturer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.manufacturer?.name && c.manufacturer.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (carModel = null) => {
    if (carModel) {
      setEditingCarModel(carModel);
      
      // Check if vehicle_type value exists in available options
      const validVehicleType = vehicleTypes.some(type => type.value === carModel.vehicle_type) 
        ? carModel.vehicle_type 
        : '';
      
      // Check if fuel_type value exists in available options
      const validFuelType = fuelTypes.some(type => type.value === carModel.fuel_type)
        ? carModel.fuel_type
        : '';
      
      setFormData({
        manufacturer: carModel.manufacturer || carModel.manufacturer_id,
        vehicle_type: validVehicleType,
        year: carModel.year || '',
        first_registration: carModel.first_registration || '',
        model_code: carModel.model_code || '',
        chassis_number: carModel.chassis_number || '',
        fuel_type: validFuelType,
        name: carModel.name || '',
        slug: carModel.slug || '',
      });
    } else {
      setEditingCarModel(null);
      setFormData({
        manufacturer: '',
        vehicle_type: '',
        year: '',
        first_registration: '',
        model_code: '',
        chassis_number: '',
        fuel_type: '',
        name: '',
        slug: ''
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-generate slug from name when creating (not editing)
    if (name === 'name' && !editingCarModel) {
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
    if (!formData.manufacturer) newErrors.manufacturer = 'メーカーは必須です';
    if (!formData.name?.trim()) newErrors.name = '名前は必須です';
    if (!formData.slug?.trim()) newErrors.slug = 'スラッグは必須です';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        manufacturer: formData.manufacturer,
        name: formData.name.trim(),
        slug: formData.slug.trim(), // ✅ Now slug is included for both create and update
        vehicle_type: formData.vehicle_type || null,
        fuel_type: formData.fuel_type || null,
        year: formData.year || null,
        first_registration: formData.first_registration || null,
        model_code: formData.model_code || null,
        chassis_number: formData.chassis_number || null,
      };

      // Remove null/empty values for cleaner payload
      Object.keys(payload).forEach(key => {
        if (payload[key] === null || payload[key] === '') {
          delete payload[key];
        }
      });

      if (editingCarModel) {
        // ✅ Use ID for updates
        console.log('Updating car model with ID:', editingCarModel.id, 'payload:', payload);
        await updateCarModel(editingCarModel.id, payload);
      } else {
        console.log('Creating car model with payload:', payload);
        await createCarModel(payload);
      }
      
      setShowModal(false);
      setFormData({
        manufacturer: '',
        vehicle_type: '',
        year: '',
        first_registration: '',
        model_code: '',
        chassis_number: '',
        fuel_type: '',
        name: '',
        slug: ''
      });
      setEditingCarModel(null);
    } catch (err) {
      console.error('Submit error:', err);
      const apiError = err.response?.data;
      if (apiError) {
        const fieldErrors = {};
        const errorFields = {
          'manufacturer': 'manufacturer',
          'name': 'name',
          'slug': 'slug',
          'vehicle_type': 'vehicle_type',
          'fuel_type': 'fuel_type',
          'year': 'year',
          'manufacturer_id': 'manufacturer',
          'manufacturer_name': 'manufacturer'
        };

        Object.keys(apiError).forEach(key => {
          if (errorFields[key]) {
            fieldErrors[errorFields[key]] = Array.isArray(apiError[key])
              ? apiError[key].join(', ')
              : apiError[key];
          } else if (key === 'non_field_errors') {
            fieldErrors.submit = Array.isArray(apiError[key])
              ? apiError[key].join(', ')
              : apiError[key];
          } else if (typeof apiError === 'string') {
            fieldErrors.submit = apiError;
          }
        });

        if (Object.keys(fieldErrors).length === 0 && apiError.detail) {
          fieldErrors.submit = apiError.detail;
        }

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
        // ✅ Use ID for deletes
        await deleteCarModel(selectedCarModel.id);
      } catch (err) {
        alert(`削除に失敗しました: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  // Helper function to get label for vehicle type
  const getVehicleTypeLabel = (value) => {
    const type = vehicleTypes.find(t => t.value === value);
    return type ? type.label : value;
  };

  // Helper function to get label for fuel type
  const getFuelTypeLabel = (value) => {
    const type = fuelTypes.find(t => t.value === value);
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
              <Typography variant="caption" color="text.secondary">
                {carModel.manufacturer_name}
                {carModel.year ? ` | ${carModel.year}年式` : ''}
                {carModel.first_registration ? ` | 初度登録: ${carModel.first_registration}` : ''}
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

        <Box sx={{
          bgcolor: alpha('#2196f3', 0.08),
          px: 1.5,
          py: 0.75,
          borderRadius: 2,
          display: 'inline-block'
        }}>
          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
            {carModel.slug}
            {carModel.vehicle_type ? ` | ${getVehicleTypeLabel(carModel.vehicle_type)}` : ''}
            {carModel.fuel_type ? ` | ${getFuelTypeLabel(carModel.fuel_type)}` : ''}
            {carModel.chassis_number ? ` | シャーシ: ${carModel.chassis_number}` : ''}
            {carModel.model_code ? ` | 型式: ${carModel.model_code}` : ''}
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
            placeholder="車種を検索..."
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
            {/* Results Count */}
            <Typography variant="caption" color="text.secondary" display="block" mb={1.5} fontWeight={600}>
              {filteredCarModels.length} 件の車種
            </Typography>

            {/* Car Model List */}
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
        PaperProps={{
          sx: { borderRadius: 3, m: 2 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              {editingCarModel ? '車種編集' : '車種追加'}
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
                error={!!errors.manufacturer}
                helperText={errors.manufacturer}
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
                label="車種名"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                placeholder="例: カローラ"
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
                placeholder="例: corolla"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    fontFamily: 'monospace'
                  }
                }}
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              >
                <MenuItem value="">選択してください...</MenuItem>
                {vehicleTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="燃料タイプ"
                name="fuel_type"
                value={formData.fuel_type}
                onChange={handleChange}
                error={!!errors.fuel_type}
                helperText={errors.fuel_type}
                fullWidth
                disabled={fuelTypesLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              >
                <MenuItem value="">選択してください...</MenuItem>
                {fuelTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="年式"
                name="year"
                value={formData.year}
                onChange={handleChange}
                error={!!errors.year}
                helperText={errors.year}
                placeholder="例: 2020"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />

              <TextField
                label="初度登録"
                name="first_registration"
                value={formData.first_registration}
                onChange={handleChange}
                error={!!errors.first_registration}
                helperText={errors.first_registration}
                placeholder="例: 2020-01"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />

              <TextField
                label="型式"
                name="model_code"
                value={formData.model_code}
                onChange={handleChange}
                error={!!errors.model_code}
                helperText={errors.model_code}
                placeholder="例: ZRE212"
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />

              <TextField
                label="シャーシ番号"
                name="chassis_number"
                value={formData.chassis_number}
                onChange={handleChange}
                error={!!errors.chassis_number}
                helperText={errors.chassis_number}
                placeholder="例: 123456"
                fullWidth
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
              disabled={vehicleTypesLoading || fuelTypesLoading}
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

          {selectedCarModel && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight="bold">
                {selectedCarModel.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedCarModel.manufacturer_name}
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

export default MobileCarModels;