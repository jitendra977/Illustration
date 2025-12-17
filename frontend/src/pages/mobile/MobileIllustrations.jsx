// src/pages/mobile/MobileIllustrations.jsx - Fixed with Real Backend Data
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  IconButton,
  TextField,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Fab,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  Avatar,
  Zoom,
  Fade,
  useTheme,
  alpha,
  Button,
  Badge,
} from '@mui/material';

import {
  Add as PlusIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  GridView as GridIcon,
  ViewList as ListIcon,
  Image as ImageIcon,
  Close as CloseIcon,
  TrendingUp as TrendingIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Category as CategoryIcon,
  Engineering as EngineeringIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  LocalOffer as TagIcon,
} from '@mui/icons-material';

import { useIllustrations } from '../../hooks/useIllustrations';
import { useManufacturers } from '../../hooks/useIllustrations';
import { useEngineModels } from '../../hooks/useIllustrations';
import { usePartCategories } from '../../hooks/useIllustrations';
import { usePartSubCategories } from '../../hooks/useIllustrations';
import { useCarModels } from '../../hooks/useIllustrations';
import { illustrationAPI } from '../../api/illustrations';
import IllustrationDetailModal from '../../components/common/IllustrationDetailModal';
import MobileIllustrationFormModal from '../../components/forms/MobileIllustrationFormModal';
import MobileFilterPanel from '../../components/mobile/MobileFilterPanel';


const MobileIllustrations = () => {
  const theme = useTheme();
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedIllustration, setSelectedIllustration] = useState(null);
  const [selectedIllustrationDetail, setSelectedIllustrationDetail] = useState(null);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('newest');
  const [editMode, setEditMode] = useState('create');
  const [favorites, setFavorites] = useState([]);

  const { illustrations, loading, error, fetchIllustrations } = useIllustrations(filters);
  const { manufacturers } = useManufacturers();
  const { engineModels } = useEngineModels();
  const { categories } = usePartCategories();
  const { subCategories } = usePartSubCategories();
  const { carModels } = useCarModels();

  const handleSearch = (e) => {
    e.preventDefault();
    fetchIllustrations({ ...filters, search: searchTerm });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchIllustrations(newFilters);
    setShowFilters(false);
  };

  const handleCardClick = async (illustration) => {
    try {
      // Fetch detailed data
      const detailData = await illustrationAPI.getById(illustration.id);
      setSelectedIllustrationDetail(detailData);
      setDetailModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch illustration details:', err);
      // Fallback to basic data
      setSelectedIllustrationDetail(illustration);
      setDetailModalOpen(true);
    }
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedIllustrationDetail(null);
  };

  const handleFormModalClose = () => {
    setFormModalOpen(false);
    setSelectedIllustration(null);
    setEditMode('create');
  };

  const handleCreateClick = () => {
    setEditMode('create');
    setSelectedIllustration(null);
    setFormModalOpen(true);
  };

  const handleEditClick = async (illustration) => {
    try {
      // Fetch full details for editing
      const detailData = await illustrationAPI.getById(illustration.id);
      setEditMode('edit');
      setSelectedIllustration(detailData);
      setFormModalOpen(true);
      setDetailModalOpen(false);
    } catch (err) {
      console.error('Failed to fetch illustration for edit:', err);
    }
  };

  const handleFormModalSuccess = async () => {
    // Just refresh the list - the form handles the API calls
    await fetchIllustrations();
  };

  const handleDetailModalUpdate = () => {
    fetchIllustrations();
  };

  const handleDetailModalDelete = (deletedId) => {
    fetchIllustrations();
    if (selectedIllustrationDetail?.id === deletedId) {
      setDetailModalOpen(false);
    }
  };

  const toggleFavorite = (illustrationId, e) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(illustrationId) 
        ? prev.filter(id => id !== illustrationId)
        : [...prev, illustrationId]
    );
  };

  // Filter + Search
  const filteredIllustrations = illustrations.filter((ill) => {
    const term = searchTerm.toLowerCase();
    return (
      ill.title?.toLowerCase().includes(term) ||
      ill.description?.toLowerCase().includes(term) ||
      ill.engine_model_name?.toLowerCase().includes(term) ||
      ill.part_category_name?.toLowerCase().includes(term)
    );
  });

  // Sorting
  const sortedIllustrations = [...filteredIllustrations].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'title':
        return (a.title || '').localeCompare(b.title || '');
      case 'newest':
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  const activeFilterCount = Object.keys(filters).length;

  // ADVANCED GRID VIEW WITH ANIMATIONS
  const IllustrationGrid = ({ illustrations }) => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 2
      }}
    >
      {illustrations.map((illustration, index) => (
        <Zoom in timeout={300 + index * 50} key={illustration.id}>
          <Card
            sx={{
              borderRadius: 4,
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': { 
                transform: 'translateY(-8px)',
                boxShadow: theme.shadows[12],
              },
              '&:active': { 
                transform: 'scale(0.98)' 
              },
              background: theme.palette.background.paper,
            }}
            onClick={() => handleCardClick(illustration)}
          >
            {/* Image Container */}
            <Box 
              sx={{ 
                position: 'relative', 
                height: 160,
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
              }}
            >
              <CardMedia
                component="img"
                height="160"
                image={illustration.first_file?.file || '/placeholder.jpg'}
                alt={illustration.title}
                sx={{ 
                  objectFit: 'cover',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  }
                }}
              />

              {/* Gradient Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%)',
                  pointerEvents: 'none',
                }}
              />

              {/* File Count Badge */}
              {illustration.file_count > 1 && (
                <Chip
                  icon={<ImageIcon sx={{ fontSize: 14 }} />}
                  label={illustration.file_count}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backdropFilter: 'blur(10px)',
                    bgcolor: alpha(theme.palette.background.paper, 0.9),
                    fontWeight: 'bold',
                    height: 24,
                  }}
                />
              )}

              {/* Favorite Button */}
              <IconButton
                size="small"
                onClick={(e) => toggleFavorite(illustration.id, e)}
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  bgcolor: alpha(theme.palette.background.paper, 0.9),
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.background.paper, 1),
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                {favorites.includes(illustration.id) ? (
                  <FavoriteIcon sx={{ fontSize: 18, color: theme.palette.error.main }} />
                ) : (
                  <FavoriteBorderIcon sx={{ fontSize: 18 }} />
                )}
              </IconButton>

              {/* Title Overlay */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  p: 1.5,
                  color: 'white',
                }}
              >
                <Typography 
                  variant="body2" 
                  fontWeight="bold" 
                  noWrap
                  sx={{ 
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  {illustration.title}
                </Typography>
              </Box>
            </Box>

            {/* Content */}
            <CardContent sx={{ p: 1.5 }}>
              <Stack spacing={0.5}>
                {/* Engine Model */}
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <EngineeringIcon sx={{ fontSize: 14, color: theme.palette.primary.main }} />
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {illustration.engine_model_name || 'エンジン未設定'}
                  </Typography>
                </Stack>

                {/* Category */}
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <CategoryIcon sx={{ fontSize: 14, color: theme.palette.secondary.main }} />
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {illustration.part_category_name || 'カテゴリ未設定'}
                  </Typography>
                </Stack>

                {/* Date */}
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <TimeIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                    {new Date(illustration.created_at).toLocaleDateString('ja-JP')}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Zoom>
      ))}
    </Box>
  );

  // ADVANCED LIST VIEW
  const IllustrationList = ({ illustrations }) => (
    <Stack spacing={2}>
      {illustrations.map((illustration, index) => (
        <Fade in timeout={300 + index * 50} key={illustration.id}>
          <Card
            sx={{
              borderRadius: 4,
              cursor: 'pointer',
              transition: 'all 0.3s',
              '&:hover': { 
                boxShadow: theme.shadows[8],
                transform: 'translateX(4px)',
              },
              overflow: 'hidden',
            }}
            onClick={() => handleCardClick(illustration)}
          >
            <Box sx={{ p: 1.5 }}>
              <Stack direction="row" spacing={2}>
                {/* Thumbnail */}
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: 3,
                    overflow: 'hidden',
                    position: 'relative',
                    flexShrink: 0,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                  }}
                >
                  <img
                    src={illustration.first_file?.file || '/placeholder.jpg'}
                    alt={illustration.title}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }}
                  />

                  {illustration.file_count > 1 && (
                    <Chip
                      icon={<ImageIcon sx={{ fontSize: 12 }} />}
                      label={illustration.file_count}
                      size="small"
                      sx={{
                        position: 'absolute',
                        bottom: 4,
                        right: 4,
                        height: 20,
                        fontSize: '0.65rem',
                        backdropFilter: 'blur(10px)',
                        bgcolor: alpha(theme.palette.background.paper, 0.9),
                      }}
                    />
                  )}

                  {/* Favorite Overlay */}
                  <IconButton
                    size="small"
                    onClick={(e) => toggleFavorite(illustration.id, e)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      left: 4,
                      bgcolor: alpha(theme.palette.background.paper, 0.9),
                      backdropFilter: 'blur(10px)',
                      width: 28,
                      height: 28,
                    }}
                  >
                    {favorites.includes(illustration.id) ? (
                      <FavoriteIcon sx={{ fontSize: 16, color: theme.palette.error.main }} />
                    ) : (
                      <FavoriteBorderIcon sx={{ fontSize: 16 }} />
                    )}
                  </IconButton>
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    variant="body1" 
                    fontWeight="bold" 
                    noWrap
                    sx={{ mb: 0.5 }}
                  >
                    {illustration.title}
                  </Typography>

                  {illustration.description && (
                    <Typography 
                      variant="caption" 
                      color="text.secondary" 
                      sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 1,
                      }}
                    >
                      {illustration.description}
                    </Typography>
                  )}

                  <Stack spacing={0.5}>
                    {/* Tags */}
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                      {illustration.engine_model_name && (
                        <Chip
                          icon={<EngineeringIcon sx={{ fontSize: 12 }} />}
                          label={illustration.engine_model_name}
                          size="small"
                          variant="outlined"
                          sx={{ height: 22, fontSize: '0.7rem' }}
                        />
                      )}
                      {illustration.part_category_name && (
                        <Chip
                          icon={<CategoryIcon sx={{ fontSize: 12 }} />}
                          label={illustration.part_category_name}
                          size="small"
                          variant="outlined"
                          sx={{ height: 22, fontSize: '0.7rem' }}
                        />
                      )}
                    </Stack>

                    {/* Meta Info */}
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Stack direction="row" spacing={0.3} alignItems="center">
                        <PersonIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                          {illustration.user_name || '不明'}
                        </Typography>
                      </Stack>
                      <Typography variant="caption" color="text.disabled">•</Typography>
                      <Stack direction="row" spacing={0.3} alignItems="center">
                        <TimeIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                          {new Date(illustration.created_at).toLocaleDateString('ja-JP')}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          </Card>
        </Fade>
      ))}
    </Stack>
  );

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        pb: 12,
        background: `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.02)} 0%, ${theme.palette.background.default} 100%)`,
      }}
    >
      <Container maxWidth="sm" sx={{ px: 2, py: 3 }}>
        {/* HEADER */}
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h4" 
            fontWeight="bold" 
            gutterBottom
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 1,
            }}
          >
            イラストライブラリ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            エンジンパーツの図解・イラスト集
          </Typography>
        </Box>

        {/* SEARCH BAR - ENHANCED */}
        <Paper
          component="form"
          onSubmit={handleSearch}
          elevation={0}
          sx={{
            p: 1,
            display: 'flex',
            alignItems: 'center',
            borderRadius: 4,
            mb: 2,
            border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            transition: 'all 0.3s',
            '&:focus-within': {
              border: `2px solid ${theme.palette.primary.main}`,
              boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`,
            }
          }}
        >
          <SearchIcon sx={{ mx: 1, color: theme.palette.primary.main }} />
          <TextField
            fullWidth
            placeholder="タイトル、説明、エンジンで検索..."
            variant="standard"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ 
              disableUnderline: true,
              sx: { fontSize: '0.95rem' }
            }}
          />
          {searchTerm && (
            <IconButton 
              size="small" 
              onClick={() => setSearchTerm('')}
              sx={{ mr: 0.5 }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Paper>

        {/* TOOLBAR - ENHANCED */}
        <Stack direction="row" spacing={1} mb={3} alignItems="center">
          {/* Filter Button with Badge */}
          <Badge badgeContent={activeFilterCount} color="primary">
            <Button
              variant={activeFilterCount > 0 ? "contained" : "outlined"}
              onClick={() => setShowFilters(true)}
              startIcon={<FilterIcon />}
              sx={{ 
                borderRadius: 3,
                textTransform: 'none',
              }}
            >
              フィルター
            </Button>
          </Badge>

          {/* Sort Dropdown */}
          <TextField
            select
            size="small"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ 
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
              }
            }}
          >
            <MenuItem value="newest">新しい順</MenuItem>
            <MenuItem value="oldest">古い順</MenuItem>
            <MenuItem value="title">タイトル順</MenuItem>
          </TextField>

          {/* View Toggle */}
          <ToggleButtonGroup 
            value={viewMode} 
            exclusive 
            onChange={(e, mode) => mode && setViewMode(mode)}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                borderRadius: 2,
              }
            }}
          >
            <ToggleButton value="grid">
              <GridIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="list">
              <ListIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <Fade in>
            <Paper 
              elevation={0}
              sx={{ 
                p: 1.5, 
                mb: 2, 
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={1}>
                <Typography variant="caption" fontWeight="bold" color="primary">
                  適用中:
                </Typography>
                {Object.entries(filters).map(([key, value]) => (
                  <Chip
                    key={`filter-${key}`}
                    label={`${key}: ${value}`}
                    size="small"
                    onDelete={() => {
                      const newFilters = { ...filters };
                      delete newFilters[key];
                      handleFilterChange(newFilters);
                    }}
                    sx={{ borderRadius: 2 }}
                  />
                ))}
                <Button
                  size="small"
                  onClick={() => handleFilterChange({})}
                  sx={{ ml: 'auto', textTransform: 'none' }}
                >
                  すべてクリア
                </Button>
              </Stack>
            </Paper>
          </Fade>
        )}

        {/* FILTER PANEL */}
        <MobileFilterPanel
          open={showFilters}
          onClose={() => setShowFilters(false)}
          onFilterChange={handleFilterChange}
          currentFilters={filters}
        />

        {/* LOADING */}
        {loading && (
          <Box textAlign="center" py={10}>
            <CircularProgress size={50} thickness={4} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              読み込み中...
            </Typography>
          </Box>
        )}

        {/* ERROR */}
        {error && !loading && (
          <Alert 
            severity="error" 
            sx={{ mb: 2, borderRadius: 3 }}
            variant="filled"
          >
            {error}
          </Alert>
        )}

        {/* NO RESULT - ENHANCED */}
        {!loading && !error && sortedIllustrations.length === 0 && (
          <Fade in>
            <Card 
              sx={{ 
                borderRadius: 4, 
                p: 6, 
                textAlign: 'center',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  margin: '0 auto',
                  mb: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <ImageIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              </Avatar>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                イラストが見つかりません
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm || Object.keys(filters).length > 0
                  ? '検索条件を変更してお試しください'
                  : '最初のイラストを作成して始めましょう'}
              </Typography>
              {!searchTerm && Object.keys(filters).length === 0 && (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlusIcon />}
                  onClick={handleCreateClick}
                  sx={{ 
                    borderRadius: 3,
                    textTransform: 'none',
                    px: 4,
                  }}
                >
                  イラストを作成
                </Button>
              )}
            </Card>
          </Fade>
        )}

        {/* RESULTS COUNT */}
        {!loading && !error && sortedIllustrations.length > 0 && (
          <Stack 
            direction="row" 
            spacing={1} 
            alignItems="center" 
            mb={2}
            sx={{
              p: 1.5,
              bgcolor: alpha(theme.palette.info.main, 0.05),
              borderRadius: 2,
            }}
          >
            <TagIcon sx={{ fontSize: 18, color: theme.palette.info.main }} />
            <Typography variant="body2" fontWeight="medium" color="info.main">
              {sortedIllustrations.length} 件のイラスト
            </Typography>
          </Stack>
        )}

        {/* LIST OR GRID */}
        {!loading && !error && sortedIllustrations.length > 0 && (
          <>
            {viewMode === 'grid' ? (
              <IllustrationGrid illustrations={sortedIllustrations} />
            ) : (
              <IllustrationList illustrations={sortedIllustrations} />
            )}
          </>
        )}
      </Container>

      {/* FAB - ENHANCED WITH PULSE ANIMATION */}
      <Zoom in timeout={500}>
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 64,
            height: 64,
            boxShadow: theme.shadows[10],
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: theme.shadows[20],
            },
            transition: 'all 0.3s',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': {
                boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0.7)}`,
              },
              '70%': {
                boxShadow: `0 0 0 20px ${alpha(theme.palette.primary.main, 0)}`,
              },
              '100%': {
                boxShadow: `0 0 0 0 ${alpha(theme.palette.primary.main, 0)}`,
              },
            },
          }}
          onClick={handleCreateClick}
        >
          <PlusIcon sx={{ fontSize: 32 }} />
        </Fab>
      </Zoom>

      {/* FORM MODAL */}
      <MobileIllustrationFormModal
        open={formModalOpen}
        onClose={handleFormModalClose}
        onSuccess={handleFormModalSuccess}
        mode={editMode}
        illustration={selectedIllustration}
        manufacturers={manufacturers}
        engineModels={engineModels}
        categories={categories}
        subCategories={subCategories}
        carModels={carModels}
      />

      {/* DETAIL MODAL */}
      {selectedIllustrationDetail && (
        <IllustrationDetailModal
          open={detailModalOpen}
          illustration={selectedIllustrationDetail}
          onClose={handleCloseDetailModal}
          onUpdate={handleDetailModalUpdate}
          onDelete={handleDetailModalDelete}
          onEdit={() => handleEditClick(selectedIllustrationDetail)}
        />
      )}
    </Box>
  );
};

export default MobileIllustrations;