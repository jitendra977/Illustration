// src/pages/mobile/MobileIllustrations.jsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  IconButton,
  TextField,
  Paper,
  Card,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Fab,
  MenuItem,
  Fade,
  useTheme,
  alpha,
  Button,
  Badge,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Add as PlusIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Image as ImageIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

import { useIllustrations, useManufacturers, useEngineModels, usePartCategories, usePartSubCategories, useCarModels } from '../../hooks/useIllustrations';
import { illustrationAPI } from '../../api/illustrations';
import IllustrationDetailModal from '../../components/common/IllustrationDetailModal';
import IllustrationListCard from '../../components/mobile/IllustrationListCard';
import MobileIllustrationFormModal from '../../components/forms/MobileIllustrationFormModal';
import MobileFilterPanel from '../../components/mobile/MobileFilterPanel';
import FloatingAddButton from '../../components/mobile/FloatingAddButton';

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

  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const handleCardClick = async (illustration) => {
    try {
      const detailData = await illustrationAPI.getById(illustration.id);
      setSelectedIllustrationDetail(detailData);
      setDetailModalOpen(true);
    } catch {
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
    } catch { }
  };

  const handleFormModalSuccess = async () => {
    await fetchIllustrations();
  };

  const handleDetailModalUpdate = () => {
    fetchIllustrations();
  };

  const handleDetailModalDelete = (deletedId) => {
    fetchIllustrations();
    if (selectedIllustrationDetail?.id === deletedId) setDetailModalOpen(false);
  };

  const filtered = illustrations.filter((ill) =>
    (
      ill.title +
      ill.description +
      ill.engine_model_name +
      ill.part_category_name
    )
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const sortedIllustrations = [...filtered].sort((a, b) => {
    if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
    if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const activeFilterCount = Object.keys(filters).length;

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
                {Object.entries(filters).map(([k, v]) => (
                  <Chip
                    key={k}
                    label={`${k}:${v}`}
                    size="small"
                    onDelete={() =>
                      handleFilterChange({ ...filters, [k]: undefined })
                    }
                    sx={{ borderRadius: 1.5 }}
                  />
                ))}
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
        {!loading && !error && sortedIllustrations.length === 0 && (
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
        {!loading && !error && sortedIllustrations.length > 0 && (
          <Stack spacing={2}>
            {sortedIllustrations.map((ill, i) => (
              <Fade key={ill.id} in timeout={200 + i * 30}>
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