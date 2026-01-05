// src/pages/mobile/MobileEngineIllustrations.jsx - FIXED
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
  Collapse,
  Avatar,
  Snackbar,
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Category as CategoryIcon,
  ChevronRight as ChevronRightIcon,
  Image as ImageIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useIllustrations } from '../../hooks/useIllustrations';
import { manufacturerAPI, engineModelAPI } from '../../api/illustrations';
import IllustrationDetailModal from '../../components/common/IllustrationDetailModal';

const MobileEngineIllustrations = () => {
  const { id: manufacturerId, engineId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [manufacturer, setManufacturer] = useState(location.state?.manufacturer || null);
  const [engine, setEngine] = useState(location.state?.engine || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [manufacturerError, setManufacturerError] = useState(null);
  const [engineError, setEngineError] = useState(null);

  const [selectedIllustration, setSelectedIllustration] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  const {
    illustrations,
    loading,
    error,
    fetchIllustrations
  } = useIllustrations();

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Fetch manufacturer if not in state
  useEffect(() => {
    const loadManufacturer = async () => {
      if (!manufacturer && manufacturerId) {
        try {
          console.log('📦 Fetching manufacturer by ID:', manufacturerId);
          const data = await manufacturerAPI.getById(manufacturerId);
          console.log('✅ Manufacturer loaded:', data);
          setManufacturer(data);
        } catch (err) {
          console.error('❌ Failed to fetch manufacturer:', err);
          const errorMessage = err.response?.data?.detail || 'メーカー情報の取得に失敗しました';
          setManufacturerError(errorMessage);
          showSnackbar(errorMessage, 'error');
        }
      }
    };
    loadManufacturer();
  }, [manufacturer, manufacturerId]);

  // Fetch engine if not in state
  useEffect(() => {
    const loadEngine = async () => {
      if (!engine && engineId) {
        try {
          console.log('🔧 Fetching engine by ID:', engineId);
          const data = await engineModelAPI.getById(engineId);
          console.log('✅ Engine loaded:', data);
          setEngine(data);
        } catch (err) {
          console.error('❌ Failed to fetch engine:', err);
          const errorMessage = err.response?.data?.detail || 'エンジン情報の取得に失敗しました';
          setEngineError(errorMessage);
          showSnackbar(errorMessage, 'error');
        }
      }
    };
    loadEngine();
  }, [engine, engineId]);

  // Fetch illustrations filtered by engine
  const loadIllustrations = async () => {
    if (!engineId) {
      console.log('⚠️ No engine ID available');
      return;
    }

    try {
      console.log('🔍 Fetching illustrations for engine ID:', engineId);
      await fetchIllustrations({
        engine_model: engineId,  // ✅ Use engineId directly from params
        include_files: false
      });
      console.log('✅ Illustrations loaded');
    } catch (err) {
      console.error('❌ Failed to fetch illustrations:', err);
      showSnackbar(err.response?.data?.detail || 'イラスト一覧の取得に失敗しました', 'error');
    }
  };

  useEffect(() => {
    if (engineId) {
      loadIllustrations();
    }
  }, [engineId]);

  // Group illustrations by category and subcategory
  const groupedIllustrations = illustrations.reduce((acc, illustration) => {
    const categoryName = illustration.part_category_name || 'その他';
    const subcategoryName = illustration.part_subcategory_name || 'その他';

    if (!acc[categoryName]) {
      acc[categoryName] = {};
    }

    if (!acc[categoryName][subcategoryName]) {
      acc[categoryName][subcategoryName] = [];
    }

    acc[categoryName][subcategoryName].push(illustration);

    return acc;
  }, {});

  // Filter by search term
  const filteredGroups = Object.entries(groupedIllustrations).reduce((acc, [category, subcats]) => {
    const filteredSubcats = Object.entries(subcats).reduce((subAcc, [subcat, items]) => {
      const filtered = items.filter(ill =>
        ill.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ill.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subcat.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (filtered.length > 0) {
        subAcc[subcat] = filtered;
      }
      return subAcc;
    }, {});

    if (Object.keys(filteredSubcats).length > 0) {
      acc[category] = filteredSubcats;
    }
    return acc;
  }, {});

  // Toggle category expansion
  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Auto-expand categories when searching
  useEffect(() => {
    if (searchTerm) {
      const newExpanded = {};
      Object.keys(filteredGroups).forEach(cat => {
        newExpanded[cat] = true;
      });
      setExpandedCategories(newExpanded);
    }
  }, [searchTerm]);

  const handleViewIllustration = async (illustration) => {
    console.log('🖼️ Opening detail modal for:', illustration.title);
    setSelectedIllustration(illustration);
    setDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedIllustration(null);
  };

  const handleDetailModalUpdate = () => {
    loadIllustrations();
  };

  const handleDetailModalDelete = (deletedId) => {
    loadIllustrations();
    setDetailModalOpen(false);
    showSnackbar('イラストを削除しました', 'success');
  };

  const IllustrationCard = ({ illustration }) => (
    <Card
      onClick={() => handleViewIllustration(illustration)}
      sx={{
        borderRadius: 2,
        transition: 'all 0.2s',
        border: 1,
        borderColor: 'divider',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 2,
          borderColor: 'primary.main',
        },
        '&:active': {
          transform: 'scale(0.98)',
          boxShadow: 1
        }
      }}
    >
      <CardContent sx={{ p: 1.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar
            variant="rounded"
            sx={{
              width: 48,
              height: 48,
              bgcolor: alpha('#1976d2', 0.1),
              color: '#1976d2'
            }}
          >
            <ImageIcon fontSize="small" />
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={0.5} mb={0.3}>
              <Typography variant="body2" fontWeight="bold" noWrap>
                {illustration.title}
              </Typography>
              <ChevronRightIcon sx={{ color: 'text.secondary', fontSize: 16 }} />
            </Stack>

            {illustration.description && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {illustration.description}
              </Typography>
            )}

            {illustration.file_count > 0 && (
              <Chip
                label={`${illustration.file_count} ファイル`}
                size="small"
                sx={{
                  bgcolor: alpha('#ff9800', 0.1),
                  color: '#ff9800',
                  fontWeight: 600,
                  fontSize: '0.65rem',
                  height: 18,
                  mt: 0.5
                }}
              />
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  // Error states
  if (manufacturerError || engineError) {
    return (
      <Box>
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
          <Toolbar>
            <IconButton edge="start" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" fontWeight="bold">エラー</Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="sm" sx={{ px: 2, py: 4 }}>
          <Card sx={{ borderRadius: 3, p: 4, textAlign: 'center', border: 2, borderColor: 'error.main' }}>
            <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom color="error">
              データの取得に失敗しました
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {manufacturerError || engineError}
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ borderRadius: 2 }}
              >
                戻る
              </Button>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={() => window.location.reload()}
                sx={{ borderRadius: 2 }}
              >
                再読み込み
              </Button>
            </Stack>
          </Card>
        </Container>
      </Box>
    );
  }

  // Loading state
  if (!manufacturer || !engine) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={48} />
        <Typography variant="body2" color="text.secondary" mt={2}>
          読み込み中...
        </Typography>
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

      <Container maxWidth="sm" sx={{ px: 2, py: 2, pb: 10 }}>
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
            InputProps={{ disableUnderline: true }}
          />
          {searchTerm && (
            <IconButton size="small" onClick={() => setSearchTerm('')}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Paper>

        {/* Content */}
        {loading ? (
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" py={8}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" mt={2}>
              イラスト一覧を読み込んでいます...
            </Typography>
          </Box>
        ) : error ? (
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={loadIllustrations}>
                再試行
              </Button>
            }
          >
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

            {/* Grouped by Category → Subcategory */}
            <Stack spacing={2}>
              {Object.entries(filteredGroups).map(([category, subcategories]) => {
                const totalCount = Object.values(subcategories).reduce((sum, items) => sum + items.length, 0);
                const isExpanded = expandedCategories[category];

                return (
                  <Paper key={category} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    {/* Category Header */}
                    <Box
                      onClick={() => toggleCategory(category)}
                      sx={{
                        p: 2,
                        bgcolor: alpha('#1976d2', 0.05),
                        cursor: 'pointer',
                        '&:hover': { bgcolor: alpha('#1976d2', 0.1) },
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <CategoryIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                          <Typography variant="subtitle2" fontWeight="bold" color="primary">
                            {category}
                          </Typography>
                          <Chip
                            label={totalCount}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              bgcolor: 'primary.main',
                              color: 'white',
                              fontWeight: 600
                            }}
                          />
                        </Stack>
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </Stack>
                    </Box>

                    {/* Subcategories & Illustrations */}
                    <Collapse in={isExpanded}>
                      <Box sx={{ p: 2, pt: 0 }}>
                        <Stack spacing={2} mt={2}>
                          {Object.entries(subcategories).map(([subcategory, items]) => (
                            <Box key={subcategory}>
                              {/* Subcategory Header */}
                              <Stack direction="row" alignItems="center" spacing={1} mb={1} pl={1}>
                                <Box
                                  sx={{
                                    width: 3,
                                    height: 16,
                                    bgcolor: 'primary.main',
                                    borderRadius: 1
                                  }}
                                />
                                <Typography variant="caption" fontWeight="bold" color="text.secondary">
                                  {subcategory}
                                </Typography>
                                <Chip
                                  label={items.length}
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: '0.65rem',
                                    bgcolor: alpha('#1976d2', 0.1),
                                    color: '#1976d2',
                                    fontWeight: 600
                                  }}
                                />
                              </Stack>

                              {/* Illustrations */}
                              <Stack spacing={1}>
                                {items.map((illustration) => (
                                  <IllustrationCard key={illustration.id} illustration={illustration} />
                                ))}
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                      </Box>
                    </Collapse>
                  </Paper>
                );
              })}
            </Stack>
          </>
        )}
      </Container>

      {/* Detail Modal */}
      {selectedIllustration && (
        <IllustrationDetailModal
          open={detailModalOpen}
          illustration={selectedIllustration}
          onClose={handleCloseDetailModal}
          onUpdate={handleDetailModalUpdate}
          onDelete={handleDetailModalDelete}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: 100 }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MobileEngineIllustrations;