// src/pages/mobile/illustrations/MobileSearch.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Stack,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Chip,
  IconButton,
  useTheme,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Badge
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Image as ImageIcon,
  DirectionsCar as CarIcon,
  Store as StoreIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import { illustrationAPI, manufacturerAPI, carModelAPI, engineModelAPI } from '../../../api/illustrations';
import IllustrationDetailModal from '../../../components/illustrations/modals/IllustrationDetailModal';

const MobileSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [illustrations, setIllustrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIllustration, setSelectedIllustration] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const theme = useTheme();

  // Filter states
  const [filterExpanded, setFilterExpanded] = useState(false);
  const [manufacturers, setManufacturers] = useState([]);
  const [carModels, setCarModels] = useState([]);
  const [engineModels, setEngineModels] = useState([]);

  const [selectedManufacturer, setSelectedManufacturer] = useState('');
  const [selectedCarModel, setSelectedCarModel] = useState('');
  const [selectedEngineModel, setSelectedEngineModel] = useState('');

  const [loadingManufacturers, setLoadingManufacturers] = useState(false);
  const [loadingCarModels, setLoadingCarModels] = useState(false);
  const [loadingEngineModels, setLoadingEngineModels] = useState(false);

  // Calculate active filter count
  const activeFilterCount = [selectedManufacturer, selectedCarModel, selectedEngineModel].filter(Boolean).length;

  // Load manufacturers on mount
  useEffect(() => {
    loadManufacturers();
  }, []);

  // Load car models when manufacturer changes
  useEffect(() => {
    if (selectedManufacturer) {
      loadCarModels(selectedManufacturer);
      setSelectedCarModel('');
      setSelectedEngineModel('');
      setCarModels([]);
      setEngineModels([]);
    } else {
      setCarModels([]);
      setEngineModels([]);
      setSelectedCarModel('');
      setSelectedEngineModel('');
    }
  }, [selectedManufacturer]);

  // Load engine models when car model changes
  useEffect(() => {
    if (selectedCarModel) {
      loadEngineModels(selectedCarModel);
      setSelectedEngineModel('');
      setEngineModels([]);
    } else {
      setEngineModels([]);
      setSelectedEngineModel('');
    }
  }, [selectedCarModel]);

  const loadManufacturers = async () => {
    setLoadingManufacturers(true);
    try {
      const response = await manufacturerAPI.getAll({ page_size: 1000 });
      setManufacturers(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error loading manufacturers:', error);
    } finally {
      setLoadingManufacturers(false);
    }
  };

  const loadCarModels = async (manufacturerId) => {
    setLoadingCarModels(true);
    try {
      const response = await carModelAPI.getAll({
        manufacturer: manufacturerId,
        page_size: 1000
      });
      setCarModels(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error loading car models:', error);
      setCarModels([]);
    } finally {
      setLoadingCarModels(false);
    }
  };

  const loadEngineModels = async (carModelId) => {
    setLoadingEngineModels(true);
    try {
      const response = await engineModelAPI.getAll({
        car_model: carModelId,
        page_size: 1000
      });
      setEngineModels(response.data.results || response.data || []);
    } catch (error) {
      console.error('Error loading engine models:', error);
      setEngineModels([]);
    } finally {
      setLoadingEngineModels(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearch();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedManufacturer, selectedCarModel, selectedEngineModel]);

  const handleSearch = async () => {
    // Only search if there's a query or filters
    if (!searchQuery.trim() && !selectedManufacturer && !selectedCarModel && !selectedEngineModel) {
      setIllustrations([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    try {
      const params = {
        ordering: '-created_at'
      };

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      // Add filter parameters
      if (selectedEngineModel) {
        params.engine_model = selectedEngineModel;
      } else if (selectedCarModel) {
        params.car_model = selectedCarModel;
      } else if (selectedManufacturer) {
        // Filter by manufacturer through car_model relationship
        params.car_model__manufacturer = selectedManufacturer;
      }

      const response = await illustrationAPI.getAll(params);
      setIllustrations(response.data.results || response.data || []);
    } catch (error) {
      console.error('Search error:', error);
      setIllustrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleClearFilters = () => {
    setSelectedManufacturer('');
    setSelectedCarModel('');
    setSelectedEngineModel('');
    setCarModels([]);
    setEngineModels([]);
  };

  const handleClearAll = () => {
    setSearchQuery('');
    setSelectedManufacturer('');
    setSelectedCarModel('');
    setSelectedEngineModel('');
    setCarModels([]);
    setEngineModels([]);
    setIllustrations([]);
    setHasSearched(false);
  };

  const handleIllustrationClick = (illustration) => {
    setSelectedIllustration(illustration);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedIllustration(null);
  };

  const handleUpdate = () => {
    // Refresh search results after update
    handleSearch();
  };

  const handleDelete = (deletedId) => {
    // Remove deleted illustration from results
    setIllustrations(prev => prev.filter(ill => ill.id !== deletedId));
  };

  return (
    <>
      <Container maxWidth="sm" sx={{ px: 2, py: 3, minHeight: '100vh' }}>
        <Stack spacing={2}>
          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="イラスト、メーカー、車種を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    edge="end"
                  >
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[1]
              }
            }}
          />

          {/* Filters Accordion */}
          <Accordion
            expanded={filterExpanded}
            onChange={() => setFilterExpanded(!filterExpanded)}
            sx={{
              borderRadius: 2,
              '&:before': { display: 'none' },
              boxShadow: theme.shadows[1]
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              sx={{
                borderRadius: 2,
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  gap: 1
                }
              }}
            >
              <Badge badgeContent={activeFilterCount} color="primary">
                <FilterIcon />
              </Badge>
              <Typography variant="body2" fontWeight="medium">
                フィルター
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {/* Manufacturer Filter */}
                <FormControl fullWidth size="small">
                  <InputLabel>メーカー</InputLabel>
                  <Select
                    value={selectedManufacturer}
                    label="メーカー"
                    onChange={(e) => setSelectedManufacturer(e.target.value)}
                    disabled={loadingManufacturers}
                    startAdornment={
                      <InputAdornment position="start">
                        <StoreIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">
                      <em>すべて</em>
                    </MenuItem>
                    {manufacturers.map((manufacturer) => (
                      <MenuItem key={manufacturer.id} value={manufacturer.id}>
                        {manufacturer.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Car Model Filter */}
                <FormControl fullWidth size="small" disabled={!selectedManufacturer}>
                  <InputLabel>車種</InputLabel>
                  <Select
                    value={selectedCarModel}
                    label="車種"
                    onChange={(e) => setSelectedCarModel(e.target.value)}
                    disabled={!selectedManufacturer || loadingCarModels}
                    startAdornment={
                      <InputAdornment position="start">
                        <CarIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">
                      <em>すべて</em>
                    </MenuItem>
                    {carModels.map((carModel) => (
                      <MenuItem key={carModel.id} value={carModel.id}>
                        {carModel.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {!selectedManufacturer && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                      まずメーカーを選択してください
                    </Typography>
                  )}
                </FormControl>

                {/* Engine Model Filter */}
                <FormControl fullWidth size="small" disabled={!selectedCarModel}>
                  <InputLabel>エンジン型式</InputLabel>
                  <Select
                    value={selectedEngineModel}
                    label="エンジン型式"
                    onChange={(e) => setSelectedEngineModel(e.target.value)}
                    disabled={!selectedCarModel || loadingEngineModels}
                    startAdornment={
                      <InputAdornment position="start">
                        <BuildIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="">
                      <em>すべて</em>
                    </MenuItem>
                    {engineModels.map((engineModel) => (
                      <MenuItem key={engineModel.id} value={engineModel.id}>
                        {engineModel.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {!selectedCarModel && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1 }}>
                      まず車種を選択してください
                    </Typography>
                  )}
                </FormControl>

                {/* Clear Filters Button */}
                {activeFilterCount > 0 && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleClearFilters}
                    startIcon={<ClearIcon />}
                    fullWidth
                  >
                    フィルターをクリア
                  </Button>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Active Filters Display */}
          {activeFilterCount > 0 && (
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
              {selectedManufacturer && (
                <Chip
                  icon={<StoreIcon sx={{ fontSize: 16 }} />}
                  label={manufacturers.find(m => m.id === selectedManufacturer)?.name || selectedManufacturer}
                  onDelete={() => setSelectedManufacturer('')}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {selectedCarModel && (
                <Chip
                  icon={<CarIcon sx={{ fontSize: 16 }} />}
                  label={carModels.find(c => c.id === selectedCarModel)?.name || selectedCarModel}
                  onDelete={() => setSelectedCarModel('')}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {selectedEngineModel && (
                <Chip
                  icon={<BuildIcon sx={{ fontSize: 16 }} />}
                  label={engineModels.find(e => e.id === selectedEngineModel)?.name || selectedEngineModel}
                  onDelete={() => setSelectedEngineModel('')}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Stack>
          )}

          {/* Loading State */}
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {/* Empty State - No Search */}
          {!loading && !hasSearched && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                検索
              </Typography>
              <Typography variant="body2" color="text.secondary">
                キーワードを入力するか、フィルターを選択してください
              </Typography>
            </Box>
          )}

          {/* Empty State - No Results */}
          {!loading && hasSearched && illustrations.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <SearchIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.3 }} />
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                結果が見つかりませんでした
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                別のキーワードやフィルターで試してください
              </Typography>
              {(searchQuery || activeFilterCount > 0) && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleClearAll}
                  startIcon={<ClearIcon />}
                >
                  すべてクリア
                </Button>
              )}
            </Box>
          )}

          {/* Results Count */}
          {!loading && illustrations.length > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
              {illustrations.length}件の結果が見つかりました
            </Typography>
          )}

          {/* Search Results */}
          {!loading && illustrations.length > 0 && (
            <Stack spacing={2}>
              {illustrations.map((illustration) => (
                <Card
                  key={illustration.id}
                  onClick={() => handleIllustrationClick(illustration)}
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:active': {
                      transform: 'scale(0.98)',
                      boxShadow: theme.shadows[1]
                    },
                    borderRadius: 2,
                    overflow: 'hidden'
                  }}
                >
                  <Box sx={{ display: 'flex', gap: 2, p: 1.5 }}>
                    {/* Thumbnail */}
                    <Box
                      sx={{
                        width: 100,
                        height: 100,
                        flexShrink: 0,
                        borderRadius: 1.5,
                        overflow: 'hidden',
                        bgcolor: 'grey.100',
                        position: 'relative'
                      }}
                    >
                      {illustration.files && illustration.files.length > 0 ? (
                        <>
                          <CardMedia
                            component="img"
                            image={illustration.files[0].file}
                            alt={illustration.title}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                          {illustration.files.length > 1 && (
                            <Chip
                              icon={<ImageIcon sx={{ fontSize: 12 }} />}
                              label={illustration.files.length}
                              size="small"
                              sx={{
                                position: 'absolute',
                                bottom: 4,
                                right: 4,
                                height: 20,
                                fontSize: '0.7rem',
                                bgcolor: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                '& .MuiChip-icon': {
                                  color: 'white'
                                }
                              }}
                            />
                          )}
                        </>
                      ) : (
                        <Box
                          sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <ImageIcon sx={{ fontSize: 40, color: 'text.secondary', opacity: 0.3 }} />
                        </Box>
                      )}
                    </Box>

                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        gutterBottom
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.3,
                          mb: 1
                        }}
                      >
                        {illustration.title}
                      </Typography>

                      {/* Metadata */}
                      <Stack spacing={0.5}>
                        {(illustration.car_model?.manufacturer?.name ||
                          illustration.manufacturer_name ||
                          illustration.engine_model?.car_model?.manufacturer?.name) && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <StoreIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {illustration.car_model?.manufacturer?.name ||
                                  illustration.manufacturer_name ||
                                  illustration.engine_model?.car_model?.manufacturer?.name}
                              </Typography>
                            </Box>
                          )}

                        {(illustration.car_model?.name ||
                          illustration.car_model_name ||
                          illustration.engine_model?.car_model?.name) && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <CarIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {illustration.car_model?.name ||
                                  illustration.car_model_name ||
                                  illustration.engine_model?.car_model?.name}
                              </Typography>
                            </Box>
                          )}

                        {illustration.part_category?.name && (
                          <Chip
                            label={illustration.part_category.name}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: 'primary.main',
                              alignSelf: 'flex-start',
                              mt: 0.5
                            }}
                          />
                        )}
                      </Stack>
                    </Box>
                  </Box>

                  {/* Description Preview */}
                  {illustration.description && (
                    <CardContent sx={{ pt: 0, pb: 1.5 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          lineHeight: 1.4
                        }}
                      >
                        {illustration.description}
                      </Typography>
                    </CardContent>
                  )}
                </Card>
              ))}
            </Stack>
          )}
        </Stack>
      </Container>

      {/* Illustration Detail Modal */}
      <IllustrationDetailModal
        open={modalOpen}
        onClose={handleCloseModal}
        illustration={selectedIllustration}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
      />
    </>
  );
};

export default MobileSearch;