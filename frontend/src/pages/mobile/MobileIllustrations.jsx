// src/pages/mobile/MobileIllustrations.jsx - Optimized
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  IconButton,
  TextField,
  Paper,
  Card,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  MenuItem,
  Fade,
  useTheme,
  alpha,
  Button,
  Badge,
  Avatar,
} from '@mui/material';
import {
  Add as PlusIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Image as ImageIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

import { illustrationAPI, clearCache } from '../../api/illustrations';
import { useManufacturers, useEngineModels, usePartCategories, usePartSubCategories, useCarModels } from '../../hooks/useIllustrations';
import IllustrationDetailModal from '../../components/common/IllustrationDetailModal';
import IllustrationListCard from '../../components/mobile/IllustrationListCard';
import MobileIllustrationFormModal from '../../components/forms/MobileIllustrationFormModal';
import MobileFilterPanel from '../../components/mobile/MobileFilterPanel';
import FloatingAddButton from '../../components/mobile/FloatingAddButton';
import Breadcrumbs from '../../components/common/Breadcrumbs';

const MobileIllustrations = () => {
  const theme = useTheme();
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

  // State for illustrations
  const [illustrations, setIllustrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { manufacturers } = useManufacturers();
  const { engineModels } = useEngineModels();
  const { categories } = usePartCategories();
  const { subCategories } = usePartSubCategories();
  const { carModels } = useCarModels();

  // Fetch illustrations - OPTIMIZED (no files by default)
  const fetchIllustrations = useCallback(async (customFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        ...filters,
        ...customFilters,
        include_files: false, // IMPORTANT: Don't load files for list view
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      // Apply sorting
      if (sortBy === 'oldest') {
        params.ordering = 'created_at';
      } else if (sortBy === 'title') {
        params.ordering = 'title';
      } else {
        params.ordering = '-created_at';
      }

      const data = await illustrationAPI.getAll(params);
      setIllustrations(data.results || data);
    } catch (err) {
      console.error('Failed to fetch illustrations:', err);
      setError('イラストの読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm, sortBy]);

  // Initial fetch
  useEffect(() => {
    fetchIllustrations();
  }, [fetchIllustrations]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchIllustrations();
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setShowFilters(false);
  };

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleCardClick = async (illustration) => {
    try {
      // Now fetch with full details including files
      const detailData = await illustrationAPI.getById(illustration.id);
      setSelectedIllustrationDetail(detailData);
      setDetailModalOpen(true);
    } catch (err) {
      console.error('Failed to fetch illustration details:', err);
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
      const detailData = await illustrationAPI.getById(illustration.id);
      setEditMode('edit');
      setSelectedIllustration(detailData);
      setFormModalOpen(true);
      setDetailModalOpen(false);
    } catch (err) {
      console.error('Failed to fetch illustration for editing:', err);
    }
  };

  const handleFormModalSuccess = async () => {
    clearCache(); // Clear cache to get fresh data
    await fetchIllustrations();
  };

  const handleDetailModalUpdate = () => {
    clearCache();
    fetchIllustrations();
  };

  const handleDetailModalDelete = (deletedId) => {
    clearCache();
    fetchIllustrations();
    if (selectedIllustrationDetail?.id === deletedId) setDetailModalOpen(false);
  };

  const activeFilterCount = Object.keys(filters).filter(k => filters[k]).length;

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pb: 10,
        bgcolor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="sm" sx={{ px: 2, py: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            イラストライブラリ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            エンジンパーツの図解・イラスト集
          </Typography>
        </Box>

        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'イラスト' }
          ]}
        />

        {/* Search Bar */}
        <Paper
          component="form"
          onSubmit={handleSearch}
          elevation={0}
          sx={{
            p: 1,
            display: 'flex',
            alignItems: 'center',
            borderRadius: 3,
            mb: 2,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <SearchIcon sx={{ mx: 1, color: 'text.secondary' }} />
          <TextField
            fullWidth
            placeholder="タイトル、説明で検索..."
            variant="standard"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              disableUnderline: true,
            }}
          />
          {searchTerm && (
            <IconButton size="small" onClick={() => setSearchTerm('')}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Paper>

        {/* Toolbar */}
        <Stack direction="row" spacing={1} mb={2} alignItems="center">
          <Badge badgeContent={activeFilterCount} color="primary">
            <Button
              variant={activeFilterCount > 0 ? 'contained' : 'outlined'}
              onClick={() => setShowFilters(true)}
              startIcon={<FilterIcon />}
              sx={{ borderRadius: 2, textTransform: 'none' }}
            >
              フィルター
            </Button>
          </Badge>
          <TextField
            select
            size="small"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ flex: 1 }}
          >
            <MenuItem value="newest">新しい順</MenuItem>
            <MenuItem value="oldest">古い順</MenuItem>
            <MenuItem value="title">タイトル順</MenuItem>
          </TextField>
        </Stack>

        {/* Active Filters */}
        {activeFilterCount > 0 && (
          <Fade in>
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                mb: 2,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                gap={1}
              >
                <Typography variant="caption" fontWeight="bold" color="primary">
                  適用中:
                </Typography>
                {Object.entries(filters).map(([k, v]) =>
                  v ? (
                    <Chip
                      key={k}
                      label={`${k}:${v}`}
                      size="small"
                      onDelete={() =>
                        handleFilterChange({ ...filters, [k]: undefined })
                      }
                      sx={{ borderRadius: 1.5 }}
                    />
                  ) : null
                )}
                <Button
                  size="small"
                  onClick={() => handleFilterChange({})}
                  sx={{ ml: 'auto', textTransform: 'none' }}
                >
                  クリア
                </Button>
              </Stack>
            </Paper>
          </Fade>
        )}

        <MobileFilterPanel
          open={showFilters}
          onClose={() => setShowFilters(false)}
          onFilterChange={handleFilterChange}
          currentFilters={filters}
        />

        {/* Loading */}
        {loading && (
          <Box textAlign="center" py={8}>
            <CircularProgress size={40} />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              読み込み中...
            </Typography>
          </Box>
        )}

        {/* Error */}
        {error && !loading && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* No Results */}
        {!loading && !error && illustrations.length === 0 && (
          <Fade in>
            <Card
              sx={{
                borderRadius: 3,
                p: 4,
                textAlign: 'center',
                border: `2px dashed ${theme.palette.divider}`,
              }}
            >
              <Avatar
                sx={{
                  width: 64,
                  height: 64,
                  margin: '0 auto',
                  mb: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <ImageIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
              </Avatar>
              <Typography variant="h6" gutterBottom fontWeight="bold">
                イラストが見つかりません
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {searchTerm || activeFilterCount > 0
                  ? '検索条件を変更してください'
                  : '最初のイラストを作成しましょう'}
              </Typography>
              {!searchTerm && activeFilterCount === 0 && (
                <Button
                  variant="contained"
                  startIcon={<PlusIcon />}
                  onClick={handleCreateClick}
                  sx={{ borderRadius: 2, textTransform: 'none' }}
                >
                  イラストを作成
                </Button>
              )}
            </Card>
          </Fade>
        )}

        {/* Results - List View */}
        {!loading && !error && illustrations.length > 0 && (
          <Stack spacing={2}>
            {illustrations.map((ill, i) => (
              <Fade key={ill.id} in timeout={150 + i * 25}>
                <Box>
                  <IllustrationListCard
                    illustration={ill}
                    toggleFavorite={toggleFavorite}
                    favorites={favorites}
                    onClick={() => handleCardClick(ill)}
                    theme={theme}
                  />
                </Box>
              </Fade>
            ))}
          </Stack>
        )}
      </Container>

      {/* create illustration button */}
      <FloatingAddButton onClick={handleCreateClick} />

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