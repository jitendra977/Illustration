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
  useTheme
} from '@mui/material';
import {
  Add as PlusIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Speed as SpeedIcon,
  Error as ErrorIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useEngineModels, useManufacturers, useCarModels } from '../../hooks/useIllustrations';

const EngineModelManagement = () => {
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

  const { 
    engineModels, 
    loading, 
    error, 
    createEngineModel, 
    updateEngineModel,  // Added update function
    deleteEngineModel 
  } = useEngineModels();
  
  const { manufacturers } = useManufacturers();
  const { carModels, fetchCarModels } = useCarModels();

  const theme = useTheme();

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
    
    // Auto-generate slug only for new entries
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
    if (!formData.car_model) newErrors.car_model = 'Car model is required';
    if (!formData.name?.trim()) newErrors.name = 'Name is required';
    if (!formData.slug?.trim()) newErrors.slug = 'Slug is required';
    
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
      // Handle API validation errors
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
        setErrors({ submit: err.message || 'Operation failed' });
      }
    }
  };

  const handleDelete = async (engine) => {
    if (window.confirm(`Are you sure you want to delete "${engine.name}"? This action cannot be undone.`)) {
      try {
        await deleteEngineModel(engine.slug);
      } catch (err) {
        alert(`Delete failed: ${err.response?.data?.message || err.message}`);
      }
    }
  };

  // Filter car models by selected manufacturer
  const filteredCarModels = formData.manufacturer 
    ? carModels.filter(c => c.manufacturer === formData.manufacturer || c.manufacturer_id === formData.manufacturer)
    : carModels;

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
                  Engine Models
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage engine specs
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<PlusIcon />}
                onClick={() => handleOpenModal()}
                size="small"
              >
                Add Engine
              </Button>
            </Stack>

            <TextField
              placeholder="Search engines..."
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
        ) : filteredEngines.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <SpeedIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No engine models
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {searchTerm ? 'Try different search' : 'Add your first engine'}
            </Typography>
            {!searchTerm && (
              <Button
                variant="outlined"
                startIcon={<PlusIcon />}
                onClick={() => handleOpenModal()}
              >
                Add Engine Model
              </Button>
            )}
          </Paper>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Engine</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Car Model</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Manufacturer</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Slug</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', py: 1.5 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEngines.map((engine) => (
                  <TableRow key={engine.id} hover>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {engine.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip 
                        label={engine.car_model_name || engine.car_model?.name} 
                        size="small" 
                        sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2">
                        {engine.manufacturer_name || engine.car_model?.manufacturer?.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {engine.slug}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5 }}>
                      <IconButton size="small" onClick={() => handleOpenModal(engine)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(engine)}>
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
          {editingEngine ? 'Edit Engine Model' : 'Add Engine Model'}
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
                size="small"
                fullWidth
              >
                <MenuItem value="">Select...</MenuItem>
                {manufacturers.map(m => (
                  <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Car Model"
                name="car_model"
                value={formData.car_model}
                onChange={handleChange}
                error={!!errors.car_model}
                helperText={errors.car_model}
                disabled={!formData.manufacturer}
                size="small"
                fullWidth
              >
                <MenuItem value="">Select...</MenuItem>
                {filteredCarModels.map(c => (
                  <MenuItem key={c.id} value={c.id}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Engine Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                placeholder="e.g., 2.0L Turbo"
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
                placeholder="e.g., 2-0l-turbo"
                size="small"
                fullWidth
                sx={{ fontFamily: 'monospace' }}
                disabled={!!editingEngine} // Disable slug editing for existing engines
              />

              {errors.submit && (
                <Alert severity="error">{errors.submit}</Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setShowModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingEngine ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default EngineModelManagement;