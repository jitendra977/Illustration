// src/components/mobile/MobileFilterPanel.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Stack,
  Typography,
  Chip,
  SwipeableDrawer,
  IconButton,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slide,
  Fade
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  RadioButtonUnchecked as UncheckedIcon
} from '@mui/icons-material';
import {
  useManufacturers,
  useCarModels,
  useEngineModels,
  usePartCategories,
} from '../../hooks/useIllustrations';

const MobileFilterPanel = ({ open, onClose, onFilterChange }) => {
  const [filters, setFilters] = useState({
    manufacturer: '',
    car_model: '',
    engine_model: '',
    part_category: '',
  });

  const [expanded, setExpanded] = useState('manufacturer');

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
      setExpanded('car_model');
    } else if (name === 'car_model') {
      newFilters.engine_model = '';
      newFilters.part_category = '';
      setExpanded('engine_model');
    } else if (name === 'engine_model') {
      newFilters.part_category = '';
      setExpanded('part_category');
    }

    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value) acc[key] = value;
      return acc;
    }, {});
    onFilterChange(activeFilters);
    onClose();
  };

  const handleClearFilters = () => {
    setFilters({
      manufacturer: '',
      car_model: '',
      engine_model: '',
      part_category: '',
    });
    onFilterChange({});
    setExpanded('manufacturer');
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

  const FilterOption = ({ value, label, isSelected, onClick }) => (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1.5,
        borderRadius: 2,
        cursor: 'pointer',
        bgcolor: isSelected ? 'primary.lighter' : 'transparent',
        border: 1,
        borderColor: isSelected ? 'primary.main' : 'divider',
        transition: 'all 0.2s',
        '&:active': {
          transform: 'scale(0.98)'
        }
      }}
    >
      {isSelected ? (
        <CheckIcon sx={{ color: 'primary.main', fontSize: 22 }} />
      ) : (
        <UncheckedIcon sx={{ color: 'text.secondary', fontSize: 22 }} />
      )}
      <Typography 
        variant="body2" 
        fontWeight={isSelected ? 600 : 400}
        sx={{ flex: 1 }}
      >
        {label}
      </Typography>
    </Box>
  );

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      PaperProps={{
        sx: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          maxHeight: '90vh'
        }
      }}
    >
      <Box>
        {/* Header */}
        <Box sx={{ 
          p: 2, 
          borderBottom: 1, 
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          bgcolor: 'background.paper',
          zIndex: 1,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24
        }}>
          {/* Drag Handle */}
          <Box sx={{ 
            width: 40, 
            height: 4, 
            bgcolor: 'grey.300', 
            borderRadius: 2, 
            mx: 'auto', 
            mb: 2 
          }} />
          
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <FilterIcon color="primary" />
              <Typography variant="h6" fontWeight="bold">
                フィルター
              </Typography>
              {hasActiveFilters && (
                <Chip 
                  label={Object.values(filters).filter(v => v).length} 
                  size="small" 
                  color="primary"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
            </Stack>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </Box>

        {/* Content */}
        <Box sx={{ 
          p: 2, 
          maxHeight: 'calc(90vh - 150px)', 
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          <Stack spacing={2}>
            {/* Manufacturer */}
            <Accordion 
              expanded={expanded === 'manufacturer'}
              onChange={() => setExpanded(expanded === 'manufacturer' ? '' : 'manufacturer')}
              sx={{ 
                borderRadius: 3,
                '&:before': { display: 'none' },
                boxShadow: 'none',
                border: 1,
                borderColor: 'divider'
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
                  <Typography fontWeight={600}>メーカー</Typography>
                  {filters.manufacturer && (
                    <Chip 
                      label={getFilterLabel('manufacturer', filters.manufacturer)}
                      size="small"
                      onDelete={(e) => {
                        e.stopPropagation();
                        handleFilterChange('manufacturer', '');
                      }}
                      sx={{ mr: 1, maxWidth: 150 }}
                    />
                  )}
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  <FilterOption
                    value=""
                    label="すべてのメーカー"
                    isSelected={!filters.manufacturer}
                    onClick={() => handleFilterChange('manufacturer', '')}
                  />
                  {manufacturers.map(m => (
                    <FilterOption
                      key={m.id}
                      value={m.id}
                      label={m.name}
                      isSelected={filters.manufacturer == m.id}
                      onClick={() => handleFilterChange('manufacturer', m.id)}
                    />
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Car Model */}
            <Accordion 
              expanded={expanded === 'car_model'}
              onChange={() => setExpanded(expanded === 'car_model' ? '' : 'car_model')}
              disabled={!filters.manufacturer}
              sx={{ 
                borderRadius: 3,
                '&:before': { display: 'none' },
                boxShadow: 'none',
                border: 1,
                borderColor: 'divider'
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
                  <Typography fontWeight={600}>車種</Typography>
                  {filters.car_model && (
                    <Chip 
                      label={getFilterLabel('car_model', filters.car_model)}
                      size="small"
                      onDelete={(e) => {
                        e.stopPropagation();
                        handleFilterChange('car_model', '');
                      }}
                      sx={{ mr: 1, maxWidth: 150 }}
                    />
                  )}
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  <FilterOption
                    value=""
                    label="すべての車種"
                    isSelected={!filters.car_model}
                    onClick={() => handleFilterChange('car_model', '')}
                  />
                  {carModels.map(c => (
                    <FilterOption
                      key={c.id}
                      value={c.id}
                      label={c.name}
                      isSelected={filters.car_model == c.id}
                      onClick={() => handleFilterChange('car_model', c.id)}
                    />
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Engine Model */}
            <Accordion 
              expanded={expanded === 'engine_model'}
              onChange={() => setExpanded(expanded === 'engine_model' ? '' : 'engine_model')}
              disabled={!filters.car_model}
              sx={{ 
                borderRadius: 3,
                '&:before': { display: 'none' },
                boxShadow: 'none',
                border: 1,
                borderColor: 'divider'
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
                  <Typography fontWeight={600}>エンジン</Typography>
                  {filters.engine_model && (
                    <Chip 
                      label={getFilterLabel('engine_model', filters.engine_model)}
                      size="small"
                      onDelete={(e) => {
                        e.stopPropagation();
                        handleFilterChange('engine_model', '');
                      }}
                      sx={{ mr: 1, maxWidth: 150 }}
                    />
                  )}
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  <FilterOption
                    value=""
                    label="すべてのエンジン"
                    isSelected={!filters.engine_model}
                    onClick={() => handleFilterChange('engine_model', '')}
                  />
                  {engineModels.map(e => (
                    <FilterOption
                      key={e.id}
                      value={e.id}
                      label={e.name}
                      isSelected={filters.engine_model == e.id}
                      onClick={() => handleFilterChange('engine_model', e.id)}
                    />
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Part Category */}
            <Accordion 
              expanded={expanded === 'part_category'}
              onChange={() => setExpanded(expanded === 'part_category' ? '' : 'part_category')}
              disabled={!filters.engine_model}
              sx={{ 
                borderRadius: 3,
                '&:before': { display: 'none' },
                boxShadow: 'none',
                border: 1,
                borderColor: 'divider'
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%">
                  <Typography fontWeight={600}>部品カテゴリー</Typography>
                  {filters.part_category && (
                    <Chip 
                      label={getFilterLabel('part_category', filters.part_category)}
                      size="small"
                      onDelete={(e) => {
                        e.stopPropagation();
                        handleFilterChange('part_category', '');
                      }}
                      sx={{ mr: 1, maxWidth: 150 }}
                    />
                  )}
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Stack spacing={1}>
                  <FilterOption
                    value=""
                    label="すべてのカテゴリー"
                    isSelected={!filters.part_category}
                    onClick={() => handleFilterChange('part_category', '')}
                  />
                  {categories.map(c => (
                    <FilterOption
                      key={c.id}
                      value={c.id}
                      label={c.name}
                      isSelected={filters.part_category == c.id}
                      onClick={() => handleFilterChange('part_category', c.id)}
                    />
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Box>

        {/* Footer Actions */}
        <Box sx={{ 
          p: 2, 
          borderTop: 1, 
          borderColor: 'divider',
          bgcolor: 'background.paper',
          position: 'sticky',
          bottom: 0
        }}>
          <Stack spacing={1.5}>
            {hasActiveFilters && (
              <Button
                fullWidth
                variant="outlined"
                onClick={handleClearFilters}
                sx={{ 
                  py: 1.5,
                  borderRadius: 3,
                  fontWeight: 600,
                  textTransform: 'none'
                }}
              >
                すべてクリア
              </Button>
            )}
            <Button
              fullWidth
              variant="contained"
              onClick={handleApplyFilters}
              disabled={!hasActiveFilters}
              sx={{ 
                py: 1.5,
                borderRadius: 3,
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)'
              }}
            >
              フィルターを適用 {hasActiveFilters && `(${Object.values(filters).filter(v => v).length})`}
            </Button>
          </Stack>
        </Box>
      </Box>
    </SwipeableDrawer>
  );
};

export default MobileFilterPanel;