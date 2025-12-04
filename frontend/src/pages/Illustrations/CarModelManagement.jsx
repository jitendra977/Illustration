import React, { useState } from 'react';
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
  useTheme
} from '@mui/material';
import {
  Add as PlusIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DirectionsCar as CarIcon,
  Error as ErrorIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useCarModels, useManufacturers } from '../../hooks/useIllustrations';

const CarModelManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCarModel, setEditingCarModel] = useState(null);
  const [formData, setFormData] = useState({
    manufacturer: '',
    name: '',
    slug: ''
  });
  const [errors, setErrors] = useState({});

  const { carModels, loading, error, createCarModel, updateCarModel, deleteCarModel } = useCarModels();
  const { manufacturers } = useManufacturers();

  const theme = useTheme();

const filteredCarModels = carModels.filter(c =>
  c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  c.manufacturer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
  (c.manufacturer?.name && c.manufacturer.name.toLowerCase().includes(searchTerm.toLowerCase()))
);

  const handleOpenModal = (carModel = null) => {
    if (carModel) {
      setEditingCarModel(carModel);
      setFormData({
        manufacturer: carModel.manufacturer || carModel.manufacturer_id, // Handle both field names
        name: carModel.name,
        slug: carModel.slug,
      });
    } else {
      setEditingCarModel(null);
      setFormData({ manufacturer: '', name: '', slug: '' });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Only auto-generate slug for new entries (not when editing)
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
    if (!formData.manufacturer) newErrors.manufacturer = 'Manufacturer is required';
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.slug?.trim()) newErrors.slug = 'Slug is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        manufacturer: formData.manufacturer,
        name: formData.name.trim(),
        slug: formData.slug.trim()
      };

      if (editingCarModel) {
        await updateCarModel(editingCarModel.slug, payload);
      } else {
        await createCarModel(payload);
      }
      setShowModal(false);
      setFormData({ manufacturer: '', name: '', slug: '' });
      setEditingCarModel(null);
    } catch (err) {
      // Handle API validation errors
      const apiError = err.response?.data;
      if (apiError) {
        const fieldErrors = {};

        // Check for common error field names
        const errorFields = {
          'manufacturer': 'manufacturer',
          'name': 'name',
          'slug': 'slug',
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

        // If no specific field errors but there's a detail message
        if (Object.keys(fieldErrors).length === 0 && apiError.detail) {
          fieldErrors.submit = apiError.detail;
        }

        setErrors(fieldErrors);
      } else {
        setErrors({ submit: err.message || 'Operation failed' });
      }
    }
  };

  const handleDelete = async (carModel) => {
    if (window.confirm(`Are you sure you want to delete "${carModel.name}"? This action cannot be undone.`)) {
      try {
        await deleteCarModel(carModel.slug);
      } catch (err) {
        alert(`Delete failed: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Header */}
      <Paper elevation={0} sx={{
        borderBottom: 1,
        borderColor: 'divider',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        bgcolor: 'background.paper'
      }}>
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Car Models
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage vehicle models
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<PlusIcon />}
                onClick={() => handleOpenModal()}
                size="small"
              >
                Add Model
              </Button>
            </Stack>

            <TextField
              placeholder="Search models..."
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

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : filteredCarModels.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CarIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No car models found
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {searchTerm ? 'Try different search' : 'Add your first car model'}
            </Typography>
            {!searchTerm && (
              <Button
                variant="outlined"
                startIcon={<PlusIcon />}
                onClick={() => handleOpenModal()}
              >
                Add Car Model
              </Button>
            )}
          </Paper>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Model</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Manufacturer</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Slug</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', py: 1.5 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCarModels.map((carModel) => (
                  <TableRow key={carModel.id} hover>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {carModel.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip
                        label={carModel.manufacturer_name}
                        size="small"
                        sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {carModel.slug}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5 }}>
                      <IconButton size="small" onClick={() => handleOpenModal(carModel)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(carModel)}>
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

      {/* Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCarModel ? 'Edit Car Model' : 'Add Car Model'}
          <IconButton
            onClick={() => setShowModal(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                select
                label="Manufacturer"
                name="manufacturer"
                value={formData.manufacturer}
                onChange={handleChange}
                error={!!errors.manufacturer}
                helperText={errors.manufacturer}
                size="small"
                fullWidth
              >
                <MenuItem value="">Select...</MenuItem>
                {manufacturers.map(m => (
                  <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                ))}
              </TextField>

              <TextField
                label="Model Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                placeholder="e.g., Corolla"
                size="small"
                fullWidth
              />

              <TextField
                label="Slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                error={!!errors.slug}
                helperText={errors.slug}
                placeholder="e.g., corolla"
                size="small"
                fullWidth
                sx={{ fontFamily: 'monospace' }}
              />

              {errors.submit && (
                <Alert severity="error">{errors.submit}</Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingCarModel ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CarModelManagement;