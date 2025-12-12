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
  CardMedia,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Fab,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem
} from '@mui/material';

import {
  Add as PlusIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  GridView as GridIcon,
  ViewList as ListIcon,
  Image as ImageIcon,
  Close as CloseIcon
} from '@mui/icons-material';

import { useIllustrations } from '../../hooks/useIllustrations';
import IllustrationDetailModal from '../../components/common/IllustrationDetailModal';
import IllustrationFormModal from '../../components/forms/CreateIllustrationModal';
import MobileFilterPanel from '../../components/mobile/MobileFilterPanel';


const MobileIllustrations = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedIllustration, setSelectedIllustration] = useState(null);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('newest');

  const { illustrations, loading, error, fetchIllustrations } = useIllustrations(filters);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchIllustrations({ ...filters, search: searchTerm });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchIllustrations(newFilters);
    setShowFilters(false);
  };

  const handleCardClick = (illustration) => {
    setSelectedIllustration(illustration);
    setDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedIllustration(null);
  };

  const handleFormModalClose = () => {
    setFormModalOpen(false);
  };

  const handleFormModalSuccess = () => {
    setFormModalOpen(false);
    fetchIllustrations();
  };

  const handleDetailModalUpdate = () => {
    fetchIllustrations();
  };

  const handleDetailModalDelete = (deletedId) => {
    fetchIllustrations();
    if (selectedIllustration?.id === deletedId) {
      setDetailModalOpen(false);
    }
  };

  // Filter + Search
  const filteredIllustrations = illustrations.filter((ill) => {
    const term = searchTerm.toLowerCase();
    return (
      ill.title?.toLowerCase().includes(term) ||
      ill.description?.toLowerCase().includes(term) ||
      ill.engine_model?.name?.toLowerCase().includes(term) ||
      ill.part_category?.name?.toLowerCase().includes(term)
    );
  });

  // Sorting
  const sortedIllustrations = [...filteredIllustrations].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.downloads || 0) - (a.downloads || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'newest':
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  // GRID VIEW
  const IllustrationGrid = ({ illustrations }) => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 1.5
      }}
    >
      {illustrations.map((illustration) => (
        <Card
          key={illustration.id}
          sx={{
            borderRadius: 3,
            cursor: 'pointer',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
            '&:active': { transform: 'scale(0.97)' }
          }}
          onClick={() => handleCardClick(illustration)}
        >
          <Box sx={{ position: 'relative', height: 140 }}>
            <CardMedia
              component="img"
              height="140"
              image={illustration.files?.[0]?.file || '/placeholder.jpg'}
              alt={illustration.title}
              sx={{ objectFit: 'cover', height: '100%' }}
            />

            {illustration.files?.length > 1 && (
              <Chip
                size="small"
                label={`+${illustration.files.length - 1}`}
                sx={{
                  position: 'absolute',
                  top: 6,
                  right: 6,
                  bgcolor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            )}

            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                width: '100%',
                height: '30%',
                background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                display: 'flex',
                alignItems: 'flex-end',
                p: 1
              }}
            >
              <Typography variant="caption" sx={{ color: 'white' }} noWrap>
                {illustration.title}
              </Typography>
            </Box>
          </Box>

          <CardContent sx={{ p: 1.5 }}>
            <Typography variant="caption" color="text.secondary" noWrap>
              {illustration.engine_model?.name || 'エンジンモデルなし'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {illustration.part_category?.name || 'カテゴリなし'}
            </Typography>
            <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
              {new Date(illustration.created_at).toLocaleDateString('ja-JP')}
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  // LIST VIEW
  const IllustrationList = ({ illustrations }) => (
    <Stack spacing={1.5}>
      {illustrations.map((illustration) => (
        <Card
          key={illustration.id}
          sx={{
            borderRadius: 3,
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }
          }}
          onClick={() => handleCardClick(illustration)}
        >
          <Box sx={{ p: 1.5 }}>
            <Stack direction="row" spacing={1.5}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'grey.100',
                  position: 'relative'
                }}
              >
                <img
                  src={illustration.files?.[0]?.file || '/placeholder.jpg'}
                  alt={illustration.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />

                {illustration.files?.length > 1 && (
                  <Chip
                    size="small"
                    label={`+${illustration.files.length - 1}`}
                    sx={{
                      position: 'absolute',
                      bottom: 4,
                      right: 4,
                      bgcolor: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      fontSize: '0.6rem'
                    }}
                  />
                )}
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight="bold" noWrap>
                  {illustration.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {illustration.engine_model?.name || 'エンジンモデルなし'}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {illustration.part_category?.name || 'カテゴリなし'}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: '0.65rem' }}>
                  {new Date(illustration.created_at).toLocaleDateString('ja-JP')}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Card>
      ))}
    </Stack>
  );

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <Container maxWidth="sm" sx={{ px: 2, py: 2 }}>

        {/* SEARCH BAR */}
        <Paper
          component="form"
          onSubmit={handleSearch}
          sx={{
            px: 2,
            py: 1,
            display: 'flex',
            borderRadius: 3,
            mb: 2
          }}
        >
          <SearchIcon sx={{ mr: 1 }} />
          <TextField
            fullWidth
            placeholder="イラストを検索..."
            variant="standard"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ disableUnderline: true }}
          />

          {searchTerm && (
            <IconButton onClick={() => setSearchTerm('')}>
              <CloseIcon />
            </IconButton>
          )}
        </Paper>

        {/* TOOLBAR */}
        <Stack direction="row" spacing={1} mb={2}>
          <IconButton
            onClick={() => setShowFilters(true)}
            sx={{ border: 1, borderRadius: 2 }}
          >
            <FilterIcon />
          </IconButton>

          <TextField
            select
            size="small"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ flex: 1 }}
          >
            <MenuItem value="newest">新しい順</MenuItem>
            <MenuItem value="oldest">古い順</MenuItem>
            <MenuItem value="popular">人気順</MenuItem>
            <MenuItem value="rating">評価順</MenuItem>
          </TextField>

          <ToggleButtonGroup value={viewMode} exclusive onChange={(e, mode) => mode && setViewMode(mode)}>
            <ToggleButton value="grid">
              <GridIcon />
            </ToggleButton>
            <ToggleButton value="list">
              <ListIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>

        {/* FILTER PANEL */}
        <MobileFilterPanel
          open={showFilters}
          onClose={() => setShowFilters(false)}
          onFilterChange={handleFilterChange}
          currentFilters={filters}
        />

        {/* LOADING */}
        {loading && (
          <Box textAlign="center" py={8}>
            <CircularProgress />
          </Box>
        )}

        {/* ERROR */}
        {error && !loading && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* NO RESULT */}
        {!loading && !error && sortedIllustrations.length === 0 && (
          <Card sx={{ borderRadius: 3, p: 4, textAlign: 'center' }}>
            <ImageIcon sx={{ fontSize: 56, color: 'grey.400', mb: 1 }} />
            <Typography variant="h6">イラストが見つかりません</Typography>

            {!searchTerm && Object.keys(filters).length === 0 && (
              <Fab color="primary" size="small" onClick={() => setFormModalOpen(true)}>
                <PlusIcon />
              </Fab>
            )}
          </Card>
        )}

        {/* LIST OR GRID */}
        {!loading && !error && sortedIllustrations.length > 0 && (
          <>
            <Typography variant="caption" color="text.secondary" mb={1}>
              {sortedIllustrations.length} 件のイラスト
            </Typography>

            {viewMode === 'grid' ? (
              <IllustrationGrid illustrations={sortedIllustrations} />
            ) : (
              <IllustrationList illustrations={sortedIllustrations} />
            )}
          </>
        )}
      </Container>

      {/* FORM MODAL */}
      <IllustrationFormModal
        open={formModalOpen}
        onClose={handleFormModalClose}
        onSuccess={handleFormModalSuccess}
        mode="create"
      />

      {/* DETAIL MODAL */}
      {selectedIllustration && (
        <IllustrationDetailModal
          open={detailModalOpen}
          illustration={selectedIllustration}
          onClose={handleCloseDetailModal}
          onUpdate={handleDetailModalUpdate}
          onDelete={handleDetailModalDelete}
        />
      )}
    </Box>
  );
};

export default MobileIllustrations;