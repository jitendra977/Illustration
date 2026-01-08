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
  Paper
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
} from '../../hooks/useIllustrations';

const FilterPanel = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    manufacturer: '',
    car_model: '',
    engine_model: '',
    part_category: '',
  });

  const { manufacturers } = useManufacturers();
  const { carModels, fetchCarModels } = useCarModels();
  const { engineModels, fetchEngineModels } = useEngineModels();
  const { categories, fetchCategories } = usePartCategories();

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

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    
    if (name === 'manufacturer') {
      newFilters.car_model = '';
      newFilters.engine_model = '';
      newFilters.part_category = '';
    } else if (name === 'car_model') {
      newFilters.engine_model = '';
      newFilters.part_category = '';
    } else if (name === 'engine_model') {
      newFilters.part_category = '';
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
    });
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(v => v);

  const getFilterLabel = (type, value) => {
    const items = {
      manufacturer: manufacturers,
      car_model: carModels,
      engine_model: engineModels,
      part_category: categories
    };
    const item = items[type]?.find(item => item.id == value);
    return item?.name || value;
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <FilterIcon fontSize="small" />
            <Typography variant="subtitle2" fontWeight="medium">
              Filters
            </Typography>
          </Stack>
          {hasActiveFilters && (
            <Button size="small" onClick={handleClearFilters}>
              Clear
            </Button>
          )}
        </Stack>

        <TextField
          select
          label="Manufacturer"
          value={filters.manufacturer}
          onChange={(e) => handleFilterChange('manufacturer', e.target.value)}
          size="small"
          fullWidth
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
        >
          <MenuItem value="">All models</MenuItem>
          {carModels.map(c => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Engine Model"
          value={filters.engine_model}
          onChange={(e) => handleFilterChange('engine_model', e.target.value)}
          disabled={!filters.car_model}
          size="small"
          fullWidth
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
        >
          <MenuItem value="">All categories</MenuItem>
          {categories.map(c => (
            <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
          ))}
        </TextField>

        <Button 
          variant="contained" 
          onClick={handleApplyFilters}
          fullWidth
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
                />
              )}
              {filters.car_model && (
                <Chip
                  label={`Model: ${getFilterLabel('car_model', filters.car_model)}`}
                  size="small"
                  onDelete={() => handleFilterChange('car_model', '')}
                />
              )}
              {filters.engine_model && (
                <Chip
                  label={`Engine: ${getFilterLabel('engine_model', filters.engine_model)}`}
                  size="small"
                  onDelete={() => handleFilterChange('engine_model', '')}
                />
              )}
              {filters.part_category && (
                <Chip
                  label={`Category: ${getFilterLabel('part_category', filters.part_category)}`}
                  size="small"
                  onDelete={() => handleFilterChange('part_category', '')}
                />
              )}
            </Stack>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default FilterPanel;