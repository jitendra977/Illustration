import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  IconButton,
  Stack,
  Typography,
  Divider,
  Chip,
  Paper,
  useTheme,
  alpha
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Close as CloseIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import {
  useManufacturers,
  useCarModels,
  useEngineModels,
  usePartCategories,
  usePartSubCategories,
  useFactories,
  useUsersList,
} from '../../hooks/useIllustrations';

const FilterPanel = ({ onFilterChange, initialFilters = {} }) => {
  const [filters, setFilters] = useState({
    manufacturer: initialFilters.manufacturer || '',
    car_model: initialFilters.car_model || '',
    engine_model: initialFilters.engine_model || '',
    part_category: initialFilters.part_category || '',
    part_subcategory: initialFilters.part_subcategory || '',
    factory: initialFilters.factory || '',
    user: initialFilters.user || '',
  });

  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      setFilters(prev => ({
        ...prev,
        ...initialFilters
      }));
    }
  }, [initialFilters]);

  const { manufacturers } = useManufacturers();
  const { carModels, fetchCarModels } = useCarModels();
  const { engineModels, fetchEngineModels } = useEngineModels();
  const { categories, fetchCategories } = usePartCategories();
  const { subCategories, fetchSubCategories } = usePartSubCategories();
  const { factories } = useFactories();
  const { users } = useUsersList(filters.factory);

  useEffect(() => {
    if (filters.manufacturer) {
      fetchCarModels({ manufacturer: filters.manufacturer });
    }
  }, [filters.manufacturer]);

  useEffect(() => {
    if (filters.car_model) {
      fetchEngineModels({ car_model: filters.car_model });
    }
  }, [filters.car_model]);

  useEffect(() => {
    if (filters.engine_model) {
      fetchCategories({ engine_model: filters.engine_model });
    }
  }, [filters.engine_model]);

  useEffect(() => {
    if (filters.part_category) {
      fetchSubCategories({ part_category: filters.part_category });
    }
  }, [filters.part_category]);

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };

    if (name === 'manufacturer') {
      newFilters.car_model = '';
      newFilters.engine_model = '';
      newFilters.part_category = '';
      newFilters.part_subcategory = '';
    } else if (name === 'car_model') {
      newFilters.engine_model = '';
      newFilters.part_category = '';
      newFilters.part_subcategory = '';
    } else if (name === 'engine_model') {
      newFilters.part_category = '';
      newFilters.part_subcategory = '';
    } else if (name === 'part_category') {
      newFilters.part_subcategory = '';
    } else if (name === 'factory') {
      newFilters.user = '';
    }

    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value) acc[key] = value;
      return acc;
    }, {});
    onFilterChange(activeFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      manufacturer: '',
      car_model: '',
      engine_model: '',
      part_category: '',
      part_subcategory: '',
      factory: '',
      user: '',
    });
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v);

  const getFilterLabel = (type, value) => {
    const items = {
      manufacturer: manufacturers,
      car_model: carModels,
      engine_model: engineModels,
      part_category: categories,
      part_subcategory: subCategories,
      factory: factories,
      user: users,
    };
    const item = items[type]?.find(item => item.id == value);
    if (type === 'user' && item) return item.username;
    return item?.name || value;
  };

  const theme = useTheme();

  return (
    <Box sx={{
      p: 0,
      bgcolor: 'transparent',
    }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <FilterIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            <Typography variant="subtitle2" fontWeight="800" sx={{ color: 'text.primary', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Filters
            </Typography>
          </Stack>
          {hasActiveFilters && (
            <Button size="small" onClick={handleClearFilters} sx={{ color: 'primary.main', fontWeight: 700 }}>
              Clear
            </Button>
          )}
        </Stack>

        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem', opacity: 0.8, mb: -1 }}>
          Vehicle Information
        </Typography>

        <TextField
          select
          label="Manufacturer"
          value={filters.manufacturer}
          onChange={(e) => handleFilterChange('manufacturer', e.target.value)}
          size="small"
          fullWidth
          sx={{
            '& .MuiInputLabel-root': { color: 'text.secondary' },
            '& .MuiOutlinedInput-root': {
              bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.grey[900], 0.5) : theme.palette.background.paper,
              '& fieldset': { borderColor: theme.palette.divider },
              '&:hover fieldset': { borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.2) : alpha(theme.palette.common.black, 0.2) },
              '&.Mui-focused fieldset': { borderColor: 'primary.main' }
            }
          }}
        >
          <MenuItem value="">All manufacturers</MenuItem>
          {manufacturers.map(m => (
            <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Car Model"
          value={filters.car_model}
          onChange={(e) => handleFilterChange('car_model', e.target.value)}
          disabled={!filters.manufacturer}
          size="small"
          fullWidth
          sx={{
            '& .MuiInputLabel-root': { color: 'text.secondary' },
            '& .MuiOutlinedInput-root': {
              bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.grey[900], 0.5) : theme.palette.background.paper,
              '& fieldset': { borderColor: theme.palette.divider },
              '&:hover fieldset': { borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.2) : alpha(theme.palette.common.black, 0.2) },
              '&.Mui-focused fieldset': { borderColor: 'primary.main' }
            }
          }}
        >
          <MenuItem value="">All models</MenuItem>
          {carModels.map(c => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </TextField>

        <Divider sx={{ my: 0.5 }} />
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem', opacity: 0.8 }}>
          Technical Details
        </Typography>

        <TextField
          select
          label="Engine Model"
          value={filters.engine_model}
          onChange={(e) => handleFilterChange('engine_model', e.target.value)}
          disabled={!filters.car_model}
          size="small"
          fullWidth
          sx={{
            '& .MuiInputLabel-root': { color: 'text.secondary' },
            '& .MuiOutlinedInput-root': {
              bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.grey[900], 0.5) : theme.palette.background.paper,
              '& fieldset': { borderColor: theme.palette.divider },
              '&:hover fieldset': { borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.2) : alpha(theme.palette.common.black, 0.2) },
              '&.Mui-focused fieldset': { borderColor: 'primary.main' }
            }
          }}
        >
          <MenuItem value="">All engines</MenuItem>
          {engineModels.map(e => (
            <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Part Category"
          value={filters.part_category}
          onChange={(e) => handleFilterChange('part_category', e.target.value)}
          disabled={!filters.engine_model}
          size="small"
          fullWidth
          sx={{
            '& .MuiInputLabel-root': { color: 'text.secondary' },
            '& .MuiOutlinedInput-root': {
              bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.grey[900], 0.5) : theme.palette.background.paper,
              '& fieldset': { borderColor: theme.palette.divider },
              '&:hover fieldset': { borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.2) : alpha(theme.palette.common.black, 0.2) },
              '&.Mui-focused fieldset': { borderColor: 'primary.main' }
            }
          }}
        >
          <MenuItem value="">All categories</MenuItem>
          {categories.map(c => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Part Subcategory"
          value={filters.part_subcategory}
          onChange={(e) => handleFilterChange('part_subcategory', e.target.value)}
          disabled={!filters.part_category}
          size="small"
          fullWidth
          sx={{
            '& .MuiInputLabel-root': { color: 'text.secondary' },
            '& .MuiOutlinedInput-root': {
              bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.grey[900], 0.5) : theme.palette.background.paper,
              '& fieldset': { borderColor: theme.palette.divider },
              '&:hover fieldset': { borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.2) : alpha(theme.palette.common.black, 0.2) },
              '&.Mui-focused fieldset': { borderColor: 'primary.main' }
            }
          }}
        >
          <MenuItem value="">All subcategories</MenuItem>
          {subCategories.map(sc => (
            <MenuItem key={sc.id} value={sc.id}>{sc.name}</MenuItem>
          ))}
        </TextField>

        <Divider sx={{ my: 0.5 }} />
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem', opacity: 0.8 }}>
          Organization
        </Typography>

        <TextField
          select
          label="Factory"
          value={filters.factory}
          onChange={(e) => handleFilterChange('factory', e.target.value)}
          size="small"
          fullWidth
          sx={{
            '& .MuiInputLabel-root': { color: 'text.secondary' },
            '& .MuiOutlinedInput-root': {
              bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.grey[900], 0.5) : theme.palette.background.paper,
              '& fieldset': { borderColor: theme.palette.divider },
              '&:hover fieldset': { borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.2) : alpha(theme.palette.common.black, 0.2) },
              '&.Mui-focused fieldset': { borderColor: 'primary.main' }
            }
          }}
        >
          <MenuItem value="">All factories</MenuItem>
          {factories.map(f => (
            <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="User"
          value={filters.user}
          onChange={(e) => handleFilterChange('user', e.target.value)}
          disabled={!filters.factory}
          size="small"
          fullWidth
          sx={{
            '& .MuiInputLabel-root': { color: 'text.secondary' },
            '& .MuiOutlinedInput-root': {
              bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[900], 0.5) : alpha(theme.palette.text.primary, 0.03),
              '& fieldset': { borderColor: theme.palette.divider },
              '&:hover fieldset': { borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.2) : alpha(theme.palette.common.black, 0.2) },
              '&.Mui-focused fieldset': { borderColor: 'primary.main' }
            }
          }}
        >
          <MenuItem value="">All users</MenuItem>
          {users.map(u => (
            <MenuItem key={u.id} value={u.id}>{u.username}</MenuItem>
          ))}
        </TextField>

        <Button
          variant="contained"
          onClick={handleApplyFilters}
          fullWidth
          sx={{
            borderRadius: 2,
            py: 1,
            fontWeight: 700,
            textTransform: 'none',
            bgcolor: 'primary.main',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          Apply Filters
        </Button>

        {hasActiveFilters && (
          <Box>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" color="text.secondary">
              Active Filters:
            </Typography>
            <Stack spacing={0.5} mt={1}>
              {filters.manufacturer && (
                <Chip
                  label={`Manufacturer: ${getFilterLabel('manufacturer', filters.manufacturer)}`}
                  size="small"
                  onDelete={() => handleFilterChange('manufacturer', '')}
                  sx={{
                    borderRadius: 1.5,
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[800], 0.5) : theme.palette.action.hover,
                    color: 'text.primary',
                    '& .MuiChip-deleteIcon': { color: 'text.disabled' }
                  }}
                />
              )}
              {filters.car_model && (
                <Chip
                  label={`Model: ${getFilterLabel('car_model', filters.car_model)}`}
                  size="small"
                  onDelete={() => handleFilterChange('car_model', '')}
                  sx={{
                    borderRadius: 1.5,
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.grey[800], 0.5) : theme.palette.action.hover,
                    color: 'text.primary',
                    '& .MuiChip-deleteIcon': { color: 'text.disabled' }
                  }}
                />
              )}
              {filters.engine_model && (
                <Chip
                  label={`Engine: ${getFilterLabel('engine_model', filters.engine_model)}`}
                  size="small"
                  onDelete={() => handleFilterChange('engine_model', '')}
                  sx={{
                    borderRadius: 1.5,
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.grey[800], 0.5) : theme.palette.action.hover,
                    color: 'text.primary',
                    '& .MuiChip-deleteIcon': { color: 'text.disabled' }
                  }}
                />
              )}
              {filters.part_category && (
                <Chip
                  label={`Category: ${getFilterLabel('part_category', filters.part_category)}`}
                  size="small"
                  onDelete={() => handleFilterChange('part_category', '')}
                  sx={{
                    borderRadius: 1.5,
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.grey[800], 0.5) : theme.palette.action.hover,
                    color: 'text.primary',
                    '& .MuiChip-deleteIcon': { color: 'text.disabled' }
                  }}
                />
              )}
              {filters.part_subcategory && (
                <Chip
                  label={`Subcategory: ${getFilterLabel('part_subcategory', filters.part_subcategory)}`}
                  size="small"
                  onDelete={() => handleFilterChange('part_subcategory', '')}
                  sx={{
                    borderRadius: 1.5,
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.grey[800], 0.5) : theme.palette.action.hover,
                    color: 'text.primary',
                    '& .MuiChip-deleteIcon': { color: 'text.disabled' }
                  }}
                />
              )}
              {filters.factory && (
                <Chip
                  label={`Factory: ${getFilterLabel('factory', filters.factory)}`}
                  size="small"
                  onDelete={() => handleFilterChange('factory', '')}
                  sx={{
                    borderRadius: 1.5,
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.grey[800], 0.5) : theme.palette.action.hover,
                    color: 'text.primary',
                    '& .MuiChip-deleteIcon': { color: 'text.disabled' }
                  }}
                />
              )}
              {filters.user && (
                <Chip
                  label={`User: ${getFilterLabel('user', filters.user)}`}
                  size="small"
                  onDelete={() => handleFilterChange('user', '')}
                  sx={{
                    borderRadius: 1.5,
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.grey[800], 0.5) : theme.palette.action.hover,
                    color: 'text.primary',
                    '& .MuiChip-deleteIcon': { color: 'text.disabled' }
                  }}
                />
              )}
            </Stack>
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default FilterPanel;