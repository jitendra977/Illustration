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
  alpha,
  useTheme
} from '@mui/material';
import {
  X,
  Filter,
} from 'lucide-react';
import { useManufacturers, useEngineModels, usePartCategories, usePartSubCategories, useCarModels } from '../../hooks/useIllustrations';

// No local zinc palette needed

const MobileFilterPanel = ({
  open,
  onClose,
  onFilterChange,
  currentFilters = {},
}) => {
  const theme = useTheme();
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
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          color: 'text.primary'
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
            <Filter size={20} color={theme.palette.text.secondary} />
            <Typography variant="h6" sx={{ color: 'text.primary' }}>フィルターf</Typography>
            {activeFilterCount > 0 && (
              <Chip
                label={activeFilterCount}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                  color: 'primary.main',
                  fontWeight: 700,
                  height: 20,
                  fontSize: '11px'
                }}
              />
            )}
          </Box>
          <IconButton onClick={onClose} sx={{ color: 'text.secondary', '&:hover': { bgcolor: 'action.hover' } }}>
            <X size={20} />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2, borderColor: 'divider' }} />

        {/* Filter Controls */}
        <Stack spacing={2}>
          {/* Manufacturer */}
          <FormControl fullWidth>
            <InputLabel sx={{ color: 'text.secondary', '&.Mui-focused': { color: 'primary.main' } }}>メーカー</InputLabel>
            <Select
              value={filters.manufacturer}
              onChange={(e) => handleChange('manufacturer', e.target.value)}
              label="メーカー"
              sx={{
                bgcolor: alpha(theme.palette.zinc[900], 0.5),
                color: 'text.primary',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.divider
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(theme.palette.common.white, 0.2)
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main'
                },
                '& .MuiSvgIcon-root': { color: 'text.secondary' }
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
            <InputLabel sx={{ color: 'text.secondary', '&.Mui-focused': { color: 'primary.main' } }}>エンジンモデル</InputLabel>
            <Select
              value={filters.engine_model}
              onChange={(e) => handleChange('engine_model', e.target.value)}
              label="エンジンモデル"
              sx={{
                bgcolor: alpha(theme.palette.zinc[900], 0.5),
                color: 'text.primary',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.divider
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(theme.palette.common.white, 0.2)
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main'
                },
                '& .MuiSvgIcon-root': { color: 'text.secondary' }
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
            <InputLabel sx={{ color: 'text.secondary', '&.Mui-focused': { color: 'primary.main' } }}>パーツカテゴリ</InputLabel>
            <Select
              value={filters.part_category}
              onChange={(e) => handleChange('part_category', e.target.value)}
              label="パーツカテゴリ"
              sx={{
                bgcolor: alpha(theme.palette.zinc[900], 0.5),
                color: 'text.primary',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.divider
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(theme.palette.common.white, 0.2)
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main'
                },
                '& .MuiSvgIcon-root': { color: 'text.secondary' }
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
            <InputLabel sx={{ color: 'text.secondary', '&.Mui-focused': { color: 'primary.main' } }}>パーツサブカテゴリ</InputLabel>
            <Select
              value={filters.part_subcategory}
              onChange={(e) => handleChange('part_subcategory', e.target.value)}
              label="パーツサブカテゴリ"
              sx={{
                bgcolor: alpha(theme.palette.zinc[900], 0.5),
                color: 'text.primary',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.divider
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(theme.palette.common.white, 0.2)
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main'
                },
                '& .MuiSvgIcon-root': { color: 'text.secondary' }
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
            <InputLabel sx={{ color: 'text.secondary', '&.Mui-focused': { color: 'primary.main' } }}>車種</InputLabel>
            <Select
              value={filters.car_model}
              onChange={(e) => handleChange('car_model', e.target.value)}
              label="車種"
              sx={{
                bgcolor: alpha(theme.palette.zinc[900], 0.5),
                color: 'text.primary',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme.palette.divider
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: alpha(theme.palette.common.white, 0.2)
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main'
                },
                '& .MuiSvgIcon-root': { color: 'text.secondary' }
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
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'text.primary',
                bgcolor: 'action.hover'
              },
              '&.Mui-disabled': {
                borderColor: 'divider',
                color: 'text.disabled'
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
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark'
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