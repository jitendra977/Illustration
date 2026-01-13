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
  alpha
} from '@mui/material';
import {
  X,
  Filter,
} from 'lucide-react';
import { useManufacturers, useEngineModels, usePartCategories, usePartSubCategories, useCarModels } from '../../hooks/useIllustrations';

// Zinc color palette
const zinc = {
  50: '#fafafa',
  100: '#f4f4f5',
  200: '#e4e4e7',
  300: '#d4d4d8',
  400: '#a1a1aa',
  500: '#71717a',
  600: '#52525b',
  700: '#3f3f46',
  800: '#27272a',
  900: '#18181b',
  950: '#09090b',
};

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
          bgcolor: zinc[950],
          backgroundImage: 'none',
          color: '#fff'
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
            <Filter size={20} color={zinc[400]} />
            <Typography variant="h6" sx={{ color: '#fff' }}>フィルター</Typography>
            {activeFilterCount > 0 && (
              <Chip
                label={activeFilterCount}
                size="small"
                sx={{
                  bgcolor: alpha('#3b82f6', 0.2),
                  color: '#3b82f6',
                  fontWeight: 700,
                  height: 20,
                  fontSize: '11px'
                }}
              />
            )}
          </Box>
          <IconButton onClick={onClose} sx={{ color: zinc[400], '&:hover': { bgcolor: alpha('#fff', 0.05) } }}>
            <X size={20} />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2, borderColor: alpha('#fff', 0.1) }} />

        {/* Filter Controls */}
        <Stack spacing={2}>
          {/* Manufacturer */}
          <FormControl fullWidth>
            <InputLabel sx={{ color: zinc[400], '&.Mui-focused': { color: '#3b82f6' } }}>メーカー</InputLabel>
            <Select
              value={filters.manufacturer}
              onChange={(e) => handleChange('manufacturer', e.target.value)}
              label="メーカー"
              sx={{
                bgcolor: alpha(zinc[900], 0.5),
                color: '#fff',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha('#fff', 0.1)
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha('#fff', 0.2)
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6'
                },
                '& .MuiSvgIcon-root': { color: zinc[400] }
              }}
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
            <InputLabel sx={{ color: zinc[400], '&.Mui-focused': { color: '#3b82f6' } }}>エンジンモデル</InputLabel>
            <Select
              value={filters.engine_model}
              onChange={(e) => handleChange('engine_model', e.target.value)}
              label="エンジンモデル"
              sx={{
                bgcolor: alpha(zinc[900], 0.5),
                color: '#fff',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha('#fff', 0.1)
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha('#fff', 0.2)
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6'
                },
                '& .MuiSvgIcon-root': { color: zinc[400] }
              }}
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
            <InputLabel sx={{ color: zinc[400], '&.Mui-focused': { color: '#3b82f6' } }}>パーツカテゴリ</InputLabel>
            <Select
              value={filters.part_category}
              onChange={(e) => handleChange('part_category', e.target.value)}
              label="パーツカテゴリ"
              sx={{
                bgcolor: alpha(zinc[900], 0.5),
                color: '#fff',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha('#fff', 0.1)
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha('#fff', 0.2)
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6'
                },
                '& .MuiSvgIcon-root': { color: zinc[400] }
              }}
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
            <InputLabel sx={{ color: zinc[400], '&.Mui-focused': { color: '#3b82f6' } }}>パーツサブカテゴリ</InputLabel>
            <Select
              value={filters.part_subcategory}
              onChange={(e) => handleChange('part_subcategory', e.target.value)}
              label="パーツサブカテゴリ"
              sx={{
                bgcolor: alpha(zinc[900], 0.5),
                color: '#fff',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha('#fff', 0.1)
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha('#fff', 0.2)
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6'
                },
                '& .MuiSvgIcon-root': { color: zinc[400] }
              }}
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
            <InputLabel sx={{ color: zinc[400], '&.Mui-focused': { color: '#3b82f6' } }}>車種</InputLabel>
            <Select
              value={filters.car_model}
              onChange={(e) => handleChange('car_model', e.target.value)}
              label="車種"
              sx={{
                bgcolor: alpha(zinc[900], 0.5),
                color: '#fff',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha('#fff', 0.1)
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha('#fff', 0.2)
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3b82f6'
                },
                '& .MuiSvgIcon-root': { color: zinc[400] }
              }}
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
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              borderColor: alpha('#fff', 0.1),
              color: zinc[300],
              '&:hover': {
                borderColor: alpha('#fff', 0.2),
                bgcolor: alpha('#fff', 0.05)
              },
              '&.Mui-disabled': {
                borderColor: alpha('#fff', 0.05),
                color: zinc[700]
              }
            }}
          >
            クリア
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={handleApply}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              bgcolor: '#3b82f6',
              '&:hover': {
                bgcolor: '#2563eb'
              }
            }}
          >
            適用
          </Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default MobileFilterPanel;