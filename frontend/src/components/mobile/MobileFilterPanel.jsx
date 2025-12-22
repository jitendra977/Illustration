// src/components/mobile/MobileFilterPanel.jsx
import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useManufacturers, useEngineModels, usePartCategories, usePartSubCategories, useCarModels } from '../../hooks/useIllustrations';

const MobileFilterPanel = ({
  open,
  onClose,
  onFilterChange,
  currentFilters = {},
}) => {
  const [filters, setFilters] = useState({
    manufacturer: '',
    engine_model: '',
    part_category: '',
    part_subcategory: '',
    car_model: '',
  });

  const { manufacturers } = useManufacturers();
  const { engineModels } = useEngineModels();
  const { categories } = usePartCategories();
  const { subCategories } = usePartSubCategories();
  const { carModels } = useCarModels();

  // Filtered data
  const [filteredEngines, setFilteredEngines] = useState([]);
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [filteredCarModels, setFilteredCarModels] = useState([]);

  // Initialize filters from current filters
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      ...currentFilters,
    }));
  }, [currentFilters]);

  // Filter engines by manufacturer
  useEffect(() => {
    if (filters.manufacturer) {
      setFilteredEngines(
        engineModels.filter(e => e.manufacturer === filters.manufacturer)
      );
      setFilteredCarModels(
        carModels.filter(c => c.manufacturer === filters.manufacturer)
      );
    } else {
      setFilteredEngines(engineModels);
      setFilteredCarModels(carModels);
    }
  }, [filters.manufacturer, engineModels, carModels]);

  // Filter subcategories by category
  useEffect(() => {
    if (filters.part_category) {
      setFilteredSubCategories(
        subCategories.filter(s => s.part_category === filters.part_category)
      );
    } else {
      setFilteredSubCategories(subCategories);
    }
  }, [filters.part_category, subCategories]);

  const handleChange = (field, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [field]: value };

      // Reset dependent fields
      if (field === 'manufacturer') {
        newFilters.engine_model = '';
        newFilters.car_model = '';
      }
      if (field === 'part_category') {
        newFilters.part_subcategory = '';
      }

      return newFilters;
    });
  };

  const handleApply = () => {
    // Remove empty filters
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value) {
        acc[key] = value;
      }
      return acc;
    }, {});

    onFilterChange(activeFilters);
  };

  const handleClear = () => {
    const clearedFilters = {
      manufacturer: '',
      engine_model: '',
      part_category: '',
      part_subcategory: '',
      car_model: '',
    };
    setFilters(clearedFilters);
    onFilterChange({});
  };

  const activeFilterCount = Object.values(filters).filter(v => v).length;

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: '85vh',
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FilterIcon />
            <Typography variant="h6">フィルター</Typography>
            {activeFilterCount > 0 && (
              <Chip
                label={activeFilterCount}
                size="small"
                color="primary"
              />
            )}
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Filter Controls */}
        <Stack spacing={2}>
          {/* Manufacturer */}
          <FormControl fullWidth>
            <InputLabel>メーカー</InputLabel>
            <Select
              value={filters.manufacturer}
              onChange={(e) => handleChange('manufacturer', e.target.value)}
              label="メーカー"
            >
              <MenuItem value="">
                <em>すべて</em>
              </MenuItem>
              {manufacturers.map(m => (
                <MenuItem key={m.id} value={m.id}>
                  {m.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Engine Model */}
          <FormControl fullWidth disabled={!filters.manufacturer}>
            <InputLabel>エンジンモデル</InputLabel>
            <Select
              value={filters.engine_model}
              onChange={(e) => handleChange('engine_model', e.target.value)}
              label="エンジンモデル"
            >
              <MenuItem value="">
                <em>すべて</em>
              </MenuItem>
              {filteredEngines.map(e => (
                <MenuItem key={e.id} value={e.id}>
                  {e.name} {e.engine_code && `(${e.engine_code})`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Part Category */}
          <FormControl fullWidth>
            <InputLabel>パーツカテゴリ</InputLabel>
            <Select
              value={filters.part_category}
              onChange={(e) => handleChange('part_category', e.target.value)}
              label="パーツカテゴリ"
            >
              <MenuItem value="">
                <em>すべて</em>
              </MenuItem>
              {categories.map(c => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Part Subcategory */}
          <FormControl fullWidth disabled={!filters.part_category}>
            <InputLabel>パーツサブカテゴリ</InputLabel>
            <Select
              value={filters.part_subcategory}
              onChange={(e) => handleChange('part_subcategory', e.target.value)}
              label="パーツサブカテゴリ"
            >
              <MenuItem value="">
                <em>すべて</em>
              </MenuItem>
              {filteredSubCategories.map(s => (
                <MenuItem key={s.id} value={s.id}>
                  {s.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Car Model */}
          <FormControl fullWidth disabled={!filters.manufacturer}>
            <InputLabel>車種</InputLabel>
            <Select
              value={filters.car_model}
              onChange={(e) => handleChange('car_model', e.target.value)}
              label="車種"
            >
              <MenuItem value="">
                <em>すべて</em>
              </MenuItem>
              {filteredCarModels.map(c => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleClear}
            disabled={activeFilterCount === 0}
          >
            クリア
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleApply}
          >
            適用
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default MobileFilterPanel;