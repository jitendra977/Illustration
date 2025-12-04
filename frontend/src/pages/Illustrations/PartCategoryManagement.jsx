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
  Category as CategoryIcon,
  Error as ErrorIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { usePartCategories, useManufacturers, useCarModels, useEngineModels } from '../../hooks/useIllustrations';

const PartCategoryManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ 
    manufacturer: '', 
    car_model: '', 
    engine_model: '', 
    name: '', 
    slug: '' 
  });
  const [errors, setErrors] = useState({});

  const { categories, loading, error, createCategory } = usePartCategories();
  const { manufacturers } = useManufacturers();
  const { carModels, fetchCarModels } = useCarModels();
  const { engineModels, fetchEngineModels } = useEngineModels();

  const theme = useTheme();

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.engine_model_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        manufacturer: '',
        car_model: '',
        engine_model: category.engine_model,
        name: category.name,
        slug: category.slug,
      });
    } else {
      setEditingCategory(null);
      setFormData({ manufacturer: '', car_model: '', engine_model: '', name: '', slug: '' });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'manufacturer') {
      setFormData(prev => ({ ...prev, car_model: '', engine_model: '' }));
      fetchCarModels({ manufacturer: value });
    } else if (name === 'car_model') {
      setFormData(prev => ({ ...prev, engine_model: '' }));
      fetchEngineModels({ car_model: value });
    }
    
    if (name === 'name' && !editingCategory) {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
    
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.engine_model) newErrors.engine_model = 'Engine model is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await createCategory({ 
        engine_model: formData.engine_model, 
        name: formData.name, 
        slug: formData.slug 
      });
      setShowModal(false);
      setFormData({ manufacturer: '', car_model: '', engine_model: '', name: '', slug: '' });
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Operation failed' });
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
                  Part Categories
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage part groups
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<PlusIcon />}
                onClick={() => handleOpenModal()}
                size="small"
              >
                Add Category
              </Button>
            </Stack>

            <TextField
              placeholder="Search categories..."
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
        ) : filteredCategories.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CategoryIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No categories
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {searchTerm ? 'Try different search' : 'Add your first category'}
            </Typography>
            {!searchTerm && (
              <Button
                variant="outlined"
                startIcon={<PlusIcon />}
                onClick={() => handleOpenModal()}
              >
                Add Category
              </Button>
            )}
          </Paper>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Engine Model</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Slug</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', py: 1.5 }}>Actions</TableCell>
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
                        label={category.engine_model_name} 
                        size="small" 
                        sx={{ bgcolor: alpha(theme.palette.success.main, 0.1) }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {category.slug}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5 }}>
                      <IconButton size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small">
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
          Add Part Category
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
                disabled={!formData.manufacturer}
                size="small"
                fullWidth
              >
                <MenuItem value="">Select...</MenuItem>
                {carModels.map(c => (
                  <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Engine Model"
                name="engine_model"
                value={formData.engine_model}
                onChange={handleChange}
                error={!!errors.engine_model}
                helperText={errors.engine_model}
                disabled={!formData.car_model}
                size="small"
                fullWidth
              >
                <MenuItem value="">Select...</MenuItem>
                {engineModels.map(e => (
                  <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>
                ))}
              </TextField>

              <TextField
                label="Category Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                placeholder="e.g., Engine Parts"
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
                placeholder="e.g., engine-parts"
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
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default PartCategoryManagement;