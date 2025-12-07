// src/pages/mobile/MobileIllustrations.jsx
import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Paper,
  Grid,
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
  Close as CloseIcon,
  KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import { useIllustrations } from '../../hooks/useIllustrations';
import CreateIllustrationModal from '../../components/forms/CreateIllustrationModal';
import IllustrationDetailModal from '../../components/common/IllustrationDetailModal';
import MobileFilterPanel from '../../components/mobile/MobileFilterPanel';

const MobileIllustrations = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedIllustration, setSelectedIllustration] = useState(null);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('newest');

  const { illustrations, loading, error, fetchIllustrations } = useIllustrations(filters);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchIllustrations({ search: searchTerm });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchIllustrations(newFilters);
    setShowFilters(false);
  };

  const handleCardClick = (illustration) => {
    setSelectedIllustration(illustration);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedIllustration(null);
  };

  const filteredIllustrations = illustrations.filter(ill =>
    ill.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ill.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedIllustrations = [...filteredIllustrations].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return (b.downloads || 0) - (a.downloads || 0);
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'newest':
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  const IllustrationGrid = ({ illustrations }) => (
    <Box sx={{ 
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 1.5
    }}>
      {illustrations.map((illustration) => (
        <Card 
          key={illustration.id}
          sx={{ 
            borderRadius: 3,
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:active': {
              transform: 'scale(0.97)'
            }
          }}
          onClick={() => handleCardClick(illustration)}
        >
          <Box sx={{ position: 'relative' }}>
            <CardMedia
              component="img"
              height="140"
              image={illustration.files?.[0]?.file || '/placeholder.jpg'}
              alt={illustration.title}
              sx={{ bgcolor: 'grey.100' }}
            />
            {illustration.files && illustration.files.length > 1 && (
              <Chip
                size="small"
                label={illustration.files.length}
                sx={{ 
                  position: 'absolute', 
                  top: 6, 
                  right: 6, 
                  bgcolor: 'rgba(0,0,0,0.7)', 
                  color: 'white',
                  fontWeight: 'bold',
                  height: 20,
                  fontSize: '0.7rem'
                }}
              />
            )}
          </Box>
          <CardContent sx={{ p: 1.5 }}>
            <Typography variant="caption" fontWeight="bold" noWrap display="block" mb={0.5}>
              {illustration.title}
            </Typography>
            
            <Stack spacing={0.25}>
              <Typography variant="caption" color="text.secondary" fontSize="0.65rem" noWrap>
                {illustration.engine_model?.name || illustration.engine_model_name}
              </Typography>
              <Typography variant="caption" color="text.secondary" fontSize="0.65rem" noWrap>
                {illustration.part_category?.name || illustration.part_category_name}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  const IllustrationList = ({ illustrations }) => (
    <Stack spacing={1.5}>
      {illustrations.map((illustration) => (
        <Card 
          key={illustration.id}
          sx={{ 
            borderRadius: 3,
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:active': {
              transform: 'scale(0.98)',
              boxShadow: 1
            }
          }}
          onClick={() => handleCardClick(illustration)}
        >
          <Box sx={{ p: 1.5 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'grey.100',
                  position: 'relative',
                  flexShrink: 0
                }}
              >
                <img
                  src={illustration.files?.[0]?.file || '/placeholder.jpg'}
                  alt={illustration.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {illustration.files && illustration.files.length > 1 && (
                  <Chip
                    size="small"
                    label={`+${illustration.files.length - 1}`}
                    sx={{ 
                      position: 'absolute', 
                      bottom: 4, 
                      right: 4, 
                      bgcolor: 'rgba(0,0,0,0.7)', 
                      color: 'white',
                      fontSize: '0.6rem',
                      height: 16
                    }}
                  />
                )}
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight="bold" noWrap mb={0.5}>
                  {illustration.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" noWrap mb={0.5}>
                  {illustration.engine_model?.name || illustration.engine_model_name}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" noWrap>
                  {illustration.part_category?.name || illustration.part_category_name}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontSize: '0.65rem' }}>
                  {new Date(illustration.created_at).toLocaleDateString()}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Card>
      ))}
    </Stack>
  );

  return (
    <Box>
      <Container maxWidth="sm" sx={{ px: 2, py: 2 }}>
        {/* Search Bar */}
        <Paper
          component="form"
          onSubmit={handleSearch}
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 1,
            borderRadius: 3,
            mb: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <SearchIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
          <TextField
            fullWidth
            placeholder="イラストを検索..."
            variant="standard"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              disableUnderline: true
            }}
          />
          {searchTerm && (
            <IconButton
              size="small"
              onClick={() => setSearchTerm('')}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Paper>

        {/* Toolbar */}
        <Stack direction="row" spacing={1} mb={2} alignItems="center">
          <IconButton
            size="small"
            onClick={() => setShowFilters(!showFilters)}
            sx={{
              bgcolor: showFilters ? 'primary.main' : 'background.paper',
              color: showFilters ? 'white' : 'text.primary',
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              '&:hover': {
                bgcolor: showFilters ? 'primary.dark' : 'action.hover'
              }
            }}
          >
            <FilterIcon fontSize="small" />
          </IconButton>

          <TextField
            select
            size="small"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            sx={{ 
              flex: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '0.85rem'
              }
            }}
          >
            <MenuItem value="newest">新しい順</MenuItem>
            <MenuItem value="popular">人気順</MenuItem>
            <MenuItem value="rating">評価順</MenuItem>
          </TextField>

          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                borderRadius: 2,
                border: 1,
                borderColor: 'divider'
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

        {/* Mobile Filter Panel */}
        <MobileFilterPanel
          open={showFilters}
          onClose={() => setShowFilters(false)}
          onFilterChange={handleFilterChange}
        />

        {/* Content */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={8}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        ) : sortedIllustrations.length === 0 ? (
          <Card sx={{ borderRadius: 3, p: 4, textAlign: 'center' }}>
            <ImageIcon sx={{ fontSize: 56, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              イラストが見つかりません
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? '検索条件を変更してください' : '最初のイラストを作成しましょう'}
            </Typography>
          </Card>
        ) : (
          <>
            {/* Results Count */}
            <Typography variant="caption" color="text.secondary" display="block" mb={1.5} fontWeight={600}>
              {sortedIllustrations.length} 件の結果
            </Typography>

            {/* Content Display */}
            {viewMode === 'grid' ? (
              <IllustrationGrid illustrations={sortedIllustrations} />
            ) : (
              <IllustrationList illustrations={sortedIllustrations} />
            )}
          </>
        )}
      </Container>

      {/* Create Modal */}
      <CreateIllustrationModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          fetchIllustrations();
        }}
      />

      {/* Detail Modal */}
      <IllustrationDetailModal
        open={showDetailModal}
        onClose={handleCloseDetailModal}
        illustration={selectedIllustration}
      />

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => setShowCreateModal(true)}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)'
        }}
      >
        <PlusIcon />
      </Fab>
    </Box>
  );
};

export default MobileIllustrations;