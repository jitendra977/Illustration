import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
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
  Divider,
  CircularProgress,
  Alert,
  alpha,
  useTheme,
  useMediaQuery,
  Fab,
  Badge,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  Add as PlusIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  GridView as GridIcon,
  ViewList as ListIcon,
  Image as ImageIcon,
  TrendingUp as TrendingIcon,
  Star as StarIcon,
  Download as DownloadIcon,
  FavoriteBorder as FavoriteIcon,
  Close as CloseIcon,
  Sort as SortIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { useIllustrations } from '../../hooks/useIllustrations';
import CreateIllustrationModal from '../../components/forms/CreateIllustrationModal';
import IllustrationDetailModal from '../../components/common/IllustrationDetailModal'; // Import the detail modal
import FilterPanel from '../../components/common/FilterPanel';

const IllustrationDashboard = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedIllustration, setSelectedIllustration] = useState(null);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('newest');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const { illustrations, loading, error, fetchIllustrations } = useIllustrations(filters);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchIllustrations({ search: searchTerm });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchIllustrations(newFilters);
  };

  const handleCardClick = (illustration) => {
    setSelectedIllustration(illustration);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedIllustration(null);
  };

  const handleDownload = (e, illustration) => {
    e.stopPropagation();
    const imageUrl = illustration.files?.[0]?.file;
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${illustration.title}_1`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
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
    <Grid container spacing={2}>
      {illustrations.map((illustration) => (
        <Grid item xs={12} sm={6} md={4} key={illustration.id}>
          <Card 
            sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: theme.shadows[8]
              }
            }}
            onClick={() => handleCardClick(illustration)}
          >
            <Box sx={{ position: 'relative' }}>
              <CardMedia
                component="img"
                height="160"
                image={illustration.files?.[0]?.file || '/placeholder.jpg'}
                alt={illustration.title}
                sx={{ bgcolor: 'grey.100' }}
              />
              {illustration.files && illustration.files.length > 1 && (
                <Chip
                  size="small"
                  label={`${illustration.files.length} files`}
                  sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8, 
                    bgcolor: 'rgba(0,0,0,0.7)', 
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                />
              )}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  '&:hover': {
                    opacity: 1
                  }
                }}
              >
                <Typography variant="caption" color="white" fontWeight="bold">
                  Click to view details
                </Typography>
              </Box>
            </Box>
            <CardContent sx={{ flexGrow: 1, p: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom noWrap>
                {illustration.title}
              </Typography>
              
              {illustration.description && (
                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  {illustration.description}
                </Typography>
              )}

              <Stack spacing={0.5} mb={2}>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Typography variant="caption" fontWeight="medium">Engine:</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {illustration.engine_model?.name || illustration.engine_model_name}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={0.5}>
                  <Typography variant="caption" fontWeight="medium">Category:</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {illustration.part_category?.name || illustration.part_category_name}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 1 }} />

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">
                  {illustration.user_name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(illustration.created_at).toLocaleDateString()}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const IllustrationList = ({ illustrations }) => (
    <Stack spacing={1}>
      {illustrations.map((illustration) => (
        <Paper 
          key={illustration.id} 
          sx={{ 
            p: 2, 
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              backgroundColor: 'action.hover',
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[4]
            }
          }}
          onClick={() => handleCardClick(illustration)}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={4} sm={2}>
              <Box
                sx={{
                  width: '100%',
                  height: 80,
                  borderRadius: 1,
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
                      height: 18
                    }}
                  />
                )}
              </Box>
            </Grid>
            <Grid item xs={8} sm={10}>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {illustration.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {illustration.engine_model?.name || illustration.engine_model_name} • {illustration.part_category?.name || illustration.part_category_name}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    By {illustration.user_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(illustration.created_at).toLocaleDateString()}
                  </Typography>
                  {illustration.files && (
                    <Chip
                      label={`${illustration.files.length} files`}
                      size="small"
                    />
                  )}
                </Stack>
              </Stack>
            </Grid>
          </Grid>
        </Paper>
      ))}
    </Stack>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: 'background.paper'
        }}
      >
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Illustrations
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage automotive parts illustrations
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<PlusIcon />}
                onClick={() => setShowCreateModal(true)}
                size="small"
              >
                New Illustration
              </Button>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="center">
              <Paper
                component="form"
                onSubmit={handleSearch}
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  px: 1,
                  py: 0.5,
                  borderRadius: 1
                }}
              >
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
                <TextField
                  fullWidth
                  placeholder="Search illustrations..."
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
                    sx={{ ml: 1 }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                )}
              </Paper>

              <Stack direction="row" spacing={1}>
                <Button
                  variant={showFilters ? 'contained' : 'outlined'}
                  startIcon={<FilterIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                  size="small"
                >
                  Filters
                </Button>

                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, newMode) => newMode && setViewMode(newMode)}
                  size="small"
                >
                  <ToggleButton value="grid">
                    <GridIcon fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="list">
                    <ListIcon fontSize="small" />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Stack>
          </Stack>
        </Container>
      </Paper>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Grid container spacing={3}>
          {/* Filters Sidebar */}
          {showFilters && (
            <Grid item xs={12} md={3}>
              <FilterPanel onFilterChange={handleFilterChange} />
            </Grid>
          )}

          {/* Illustrations Content */}
          <Grid item xs={12} md={showFilters ? 9 : 12}>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" py={8}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : sortedIllustrations.length === 0 ? (
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <ImageIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No illustrations found
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {searchTerm ? 'Try adjusting your search' : 'Create your first illustration'}
                </Typography>
                {!searchTerm && (
                  <Button
                    variant="outlined"
                    startIcon={<PlusIcon />}
                    onClick={() => setShowCreateModal(true)}
                  >
                    Create Illustration
                  </Button>
                )}
              </Paper>
            ) : (
              <>
                {/* Results Header */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    {sortedIllustrations.length} {sortedIllustrations.length === 1 ? 'result' : 'results'}
                  </Typography>
                  <TextField
                    select
                    size="small"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    SelectProps={{
                      native: true,
                    }}
                    sx={{ minWidth: 120 }}
                  >
                    <option value="newest">Newest</option>
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                  </TextField>
                </Stack>

                {/* Content Display */}
                {viewMode === 'grid' ? (
                  <IllustrationGrid illustrations={sortedIllustrations} />
                ) : (
                  <IllustrationList illustrations={sortedIllustrations} />
                )}
              </>
            )}
          </Grid>
        </Grid>
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

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => setShowCreateModal(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
        >
          <PlusIcon />
        </Fab>
      )}
    </Box>
  );
};

export default IllustrationDashboard;