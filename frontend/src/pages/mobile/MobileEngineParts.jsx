// src/pages/mobile/MobileEngineParts.jsx - NEW FILE
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  IconButton,
  TextField,
  Paper,
  Alert,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  Chip,
  alpha,
  AppBar,
  Toolbar,
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Category as CategoryIcon,
  ChevronRight as ChevronRightIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import { useIllustrations } from '../../hooks/useIllustrations';
import { manufacturerAPI, engineModelAPI } from '../../api/illustrations';

const MobileEngineParts = () => {
  const { id: manufacturerId, engineId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [manufacturer, setManufacturer] = useState(location.state?.manufacturer || null);
  const [engine, setEngine] = useState(location.state?.engine || null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    illustrations,
    loading,
    error,
    fetchIllustrations
  } = useIllustrations();

  // Fetch manufacturer if not passed via state
  useEffect(() => {
    if (!manufacturer && manufacturerId) {
      console.log('📦 Fetching manufacturer by ID:', manufacturerId);
      manufacturerAPI.getById(manufacturerId).then(data => {
        console.log('✅ Manufacturer loaded:', data);
        setManufacturer(data);
      }).catch(err => {
        console.error('❌ Failed to fetch manufacturer:', err);
      });
    }
  }, [manufacturer, manufacturerId]);

  // Fetch engine if not passed via state
  useEffect(() => {
    if (!engine && engineId) {
      console.log('🔧 Fetching engine by slug:', engineId);
      engineModelAPI.getBySlug(engineId).then(data => {
        console.log('✅ Engine loaded:', data);
        setEngine(data);
      }).catch(err => {
        console.error('❌ Failed to fetch engine:', err);
      });
    }
  }, [engine, engineId]);

  // ✅ Fetch illustrations filtered by engine_model
  useEffect(() => {
    if (engine?.id) {
      console.log('🔍 Fetching illustrations for engine ID:', engine.id);
      fetchIllustrations({ 
        engine_model: engine.id,
        include_files: false  // Don't load files for speed
      });
    }
  }, [engine, fetchIllustrations]);

  // Debug log when illustrations load
  useEffect(() => {
    console.log('📊 Illustrations loaded:', illustrations.length);
    console.log('Illustrations data:', illustrations);
  }, [illustrations]);

  // Group illustrations by part category
  const groupedByCategory = illustrations.reduce((acc, ill) => {
    const categoryName = ill.part_category_name || 'その他';
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(ill);
    return acc;
  }, {});

  // Filter by search term
  const filteredGroups = Object.entries(groupedByCategory).reduce((acc, [category, items]) => {
    const filtered = items.filter(ill =>
      ill.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ill.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ill.part_subcategory_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (filtered.length > 0) {
      acc[category] = filtered;
    }
    return acc;
  }, {});

  const handleViewIllustration = (illustration) => {
    console.log('🖼️ Viewing illustration:', illustration.title);
    navigate(`/illustrations/${illustration.id}`, {
      state: { manufacturer, engine, illustration }
    });
  };

  const IllustrationCard = ({ illustration }) => (
    <Card 
      onClick={() => handleViewIllustration(illustration)}
      sx={{ 
        borderRadius: 3,
        transition: 'all 0.2s',
        border: 1,
        borderColor: 'divider',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 3,
          borderColor: 'primary.main',
        },
        '&:active': {
          transform: 'scale(0.98)',
          boxShadow: 1
        }
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Thumbnail placeholder */}
          <Avatar
            variant="rounded"
            sx={{
              width: 60,
              height: 60,
              bgcolor: alpha('#1976d2', 0.1),
              color: '#1976d2'
            }}
          >
            <ImageIcon />
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.5}>
              <Typography variant="body1" fontWeight="bold" noWrap>
                {illustration.title}
              </Typography>
              <ChevronRightIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
            </Stack>

            {illustration.description && (
              <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ 
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {illustration.description}
              </Typography>
            )}

            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
              {illustration.part_subcategory_name && (
                <Chip
                  label={illustration.part_subcategory_name}
                  size="small"
                  sx={{
                    bgcolor: alpha('#9c27b0', 0.1),
                    color: '#9c27b0',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 22
                  }}
                />
              )}
              
              {illustration.file_count > 0 && (
                <Chip
                  label={`${illustration.file_count} ファイル`}
                  size="small"
                  sx={{
                    bgcolor: alpha('#ff9800', 0.1),
                    color: '#ff9800',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 22
                  }}
                />
              )}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  if (!manufacturer || !engine) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="bold">
              {engine.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {manufacturer.name} • パーツイラスト
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ px: 2, py: 2 }}>
        {/* Search Bar */}
        <Paper
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
            slotProps={{ input: { disableUnderline: true } }}
          />
          {searchTerm && (
            <IconButton size="small" onClick={() => setSearchTerm('')}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Paper>

        {/* Content */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        ) : Object.keys(filteredGroups).length === 0 ? (
          <Card sx={{ borderRadius: 3, p: 4, textAlign: 'center' }}>
            <CategoryIcon sx={{ fontSize: 56, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              イラストが見つかりません
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? '検索条件を変更してください' : 'このエンジンにはまだイラストがありません'}
            </Typography>
          </Card>
        ) : (
          <>
            <Typography variant="caption" color="text.secondary" display="block" mb={2} fontWeight={600}>
              {illustrations.length} 件のイラスト • {Object.keys(filteredGroups).length} カテゴリー
            </Typography>

            {/* Grouped by Category */}
            <Stack spacing={3}>
              {Object.entries(filteredGroups).map(([category, items]) => (
                <Box key={category}>
                  {/* Category Header */}
                  <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                    <CategoryIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                    <Typography variant="subtitle2" fontWeight="bold" color="primary">
                      {category}
                    </Typography>
                    <Chip 
                      label={items.length} 
                      size="small" 
                      sx={{ 
                        height: 20, 
                        fontSize: '0.7rem',
                        bgcolor: alpha('#1976d2', 0.1),
                        color: '#1976d2',
                        fontWeight: 600
                      }} 
                    />
                  </Stack>

                  {/* Illustrations in this category */}
                  <Stack spacing={1.5}>
                    {items.map((illustration) => (
                      <IllustrationCard key={illustration.id} illustration={illustration} />
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </>
        )}
      </Container>
    </Box>
  );
};

export default MobileEngineParts;