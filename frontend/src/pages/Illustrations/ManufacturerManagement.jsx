import React, { useState ,useEffect} from 'react';
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
  Public as PublicIcon,
  Error as ErrorIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useManufacturers } from '../../hooks/useIllustrations';

const ManufacturerManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingManufacturer, setEditingManufacturer] = useState(null);
  const [formData, setFormData] = useState({ name: '', country: '', slug: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
  const handleOpenModal = () => handleOpenModal();
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

  const theme = useTheme();

  const filteredManufacturers = manufacturers.filter(m =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (manufacturer = null) => {
    if (manufacturer) {
      setEditingManufacturer(manufacturer);
      setFormData({
        name: manufacturer.name,
        country: manufacturer.country,
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
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    
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
      setErrors({ submit: err.response?.data?.message || 'Operation failed' });
    }
  };

  const handleDelete = async (manufacturer) => {
    if (window.confirm(`Delete ${manufacturer.name}?`)) {
      try {
        await deleteManufacturer(manufacturer.slug);
      } catch (err) {
        alert('Delete failed');
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
                  Manufacturers
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage vehicle brands
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<PlusIcon />}
                onClick={() => handleOpenModal()}
                size="small"
              >
                Add Brand
              </Button>
            </Stack>

            <TextField
              placeholder="Search manufacturers..."
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
        ) : filteredManufacturers.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <PublicIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No manufacturers
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {searchTerm ? 'Try different search' : 'Add your first brand'}
            </Typography>
            {!searchTerm && (
              <Button
                variant="outlined"
                startIcon={<PlusIcon />}
                onClick={() => handleOpenModal()}
              >
                Add Manufacturer
              </Button>
            )}
          </Paper>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
            <Table size="small">
              <TableHead sx={{ bgcolor: 'grey.50' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Country</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Slug</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', py: 1.5 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredManufacturers.map((manufacturer) => (
                  <TableRow key={manufacturer.id} hover>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {manufacturer.name}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      {manufacturer.country ? (
                        <Chip 
                          label={manufacturer.country} 
                          size="small" 
                          sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1) }}
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ py: 1.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {manufacturer.slug}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.5 }}>
                      <IconButton size="small" onClick={() => handleOpenModal(manufacturer)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(manufacturer)}>
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
          {editingManufacturer ? 'Edit Manufacturer' : 'Add Manufacturer'}
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
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                placeholder="e.g., Toyota"
                size="small"
                fullWidth
              />

              <TextField
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="e.g., Japan"
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
                placeholder="e.g., toyota"
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
              {editingManufacturer ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default ManufacturerManagement;