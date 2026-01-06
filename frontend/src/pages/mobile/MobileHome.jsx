import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Alert,
  Skeleton,
  Slide,
  useTheme,
  alpha,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Fab,
} from '@mui/material';
import {
  Store as StoreIcon,
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  Image as ImageIcon,
  Add as AddIcon,
  ChevronRight as ChevronRightIcon,
  PictureAsPdf as PdfIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { illustrationAPI, manufacturerAPI, clearCache } from '../../api/illustrations';
import { useNavigate } from 'react-router-dom';
import MobileIllustrationFormModal from '../../components/forms/MobileIllustrationFormModal';
import MobileLayout from '../../layouts/MobileLayout';
import { useManufacturers, useEngineModels, usePartCategories, usePartSubCategories, useCarModels } from '../../hooks/useIllustrations';

const MobileHome = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalIllustrations: 0,
    totalManufacturers: 0,
    recentIllustrations: [],
    topManufacturers: [],
    topCategories: [],
    loading: true,
    error: null,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const { manufacturers } = useManufacturers();
  const { engineModels } = useEngineModels();
  const { categories } = usePartCategories();
  const { subCategories } = usePartSubCategories();
  const { carModels } = useCarModels();

  const hasFetchedRef = useRef(false);

  const fetchDashboardData = async (showRefresh = false, forceRefresh = false) => {
    if (forceRefresh) {
      clearCache();
    }

    if (showRefresh) setRefreshing(true);
    else setStats(prev => ({ ...prev, loading: true }));

    try {
      // Fetch minimal data for speed
      const [illustrationsRes, topManufacturersRes, topCategoriesRes] = await Promise.all([
        illustrationAPI.getAll({ limit: 8, ordering: '-created_at', include_files: false }),
        manufacturerAPI.getAll({ limit: 6, ordering: '-illustration_count' }),
        illustrationAPI.getAll({ limit: 10, include_files: false })  // CRITICAL FIX: Reduced from 100 to 10
      ]);

      // Calculate top categories from illustrations
      const categoryCount = {};
      (topCategoriesRes.results || []).forEach(ill => {
        if (ill.part_category_name) {
          categoryCount[ill.part_category_name] = (categoryCount[ill.part_category_name] || 0) + 1;
        }
      });

      const topCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, count]) => ({ name, count }));

      setStats({
        totalIllustrations: illustrationsRes.count || 0,
        totalManufacturers: topManufacturersRes.count || 0,
        recentIllustrations: illustrationsRes.results || [],
        topManufacturers: topManufacturersRes.results || [],
        topCategories,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'データの読み込みに失敗しました'
      }));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!hasFetchedRef.current) {
      fetchDashboardData();
      hasFetchedRef.current = true;
    }
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/illustrations?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return '数秒前';
    if (seconds < 3600) return Math.floor(seconds / 60) + '分前';
    if (seconds < 86400) return Math.floor(seconds / 3600) + '時間前';
    return Math.floor(seconds / 86400) + '日前';
  };

  const QuickAccessCard = ({ title, subtitle, onClick, icon, color }) => (
    <Card
      sx={{
        minWidth: 140,
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.2s',
        bgcolor: alpha(theme.palette.background.paper, 0.6),
        backdropFilter: 'blur(10px)',
        border: `1px solid ${alpha(color || theme.palette.primary.main, 0.2)}`,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
          borderColor: color || theme.palette.primary.main,
        },
        '&:active': { transform: 'scale(0.98)' }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 1.5 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Box sx={{
            width: 32,
            height: 32,
            borderRadius: 1.5,
            bgcolor: alpha(color || theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </Box>
          <Stack spacing={0} flex={1} minWidth={0}>
            <Typography variant="body2" fontWeight="bold" noWrap>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" noWrap>
                {subtitle}
              </Typography>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  const IllustrationCard = ({ illustration, index }) => {
    const fileCount = illustration.file_count || 0;
    const hasPdf = fileCount > 0;

    return (
      <Slide direction="up" in timeout={100 + (index * 30)}>
        <Card
          sx={{
            borderRadius: 2.5,
            cursor: 'pointer',
            transition: 'all 0.15s',
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: 'blur(10px)',
            '&:active': { transform: 'scale(0.98)' },
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[3]
            }
          }}
          onClick={() => navigate(`/illustrations/${illustration.id}`)}
        >
          <CardContent sx={{ p: 1.5 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 1.5,
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  flexShrink: 0
                }}
              >
                {hasPdf ? (
                  <PdfIcon sx={{ color: theme.palette.error.main, fontSize: 24 }} />
                ) : (
                  <ImageIcon sx={{ color: theme.palette.primary.main, fontSize: 24 }} />
                )}
                {fileCount > 0 && (
                  <Chip
                    label={fileCount}
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 2,
                      right: 2,
                      bgcolor: theme.palette.primary.main,
                      color: 'white',
                      fontSize: '0.6rem',
                      height: 16,
                      fontWeight: 'bold',
                      minWidth: 16,
                      '& .MuiChip-label': { px: 0.5 }
                    }}
                  />
                )}
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  noWrap
                  sx={{ mb: 0.5 }}
                >
                  {illustration.title.split('#')[0].trim()}
                </Typography>

                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                  {illustration.engine_model_name && (
                    <Chip
                      label={illustration.engine_model_name}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.6rem',
                        bgcolor: alpha(theme.palette.secondary.main, 0.1),
                        color: theme.palette.secondary.main,
                        '& .MuiChip-label': { px: 0.75 }
                      }}
                    />
                  )}
                  {illustration.part_category_name && (
                    <Chip
                      label={illustration.part_category_name}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: '0.6rem',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        '& .MuiChip-label': { px: 0.75 }
                      }}
                    />
                  )}
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: '0.65rem', ml: 0.5 }}
                  >
                    {getTimeAgo(illustration.created_at)}
                  </Typography>
                </Stack>
              </Box>

              <ChevronRightIcon
                sx={{
                  color: 'text.secondary',
                  fontSize: 18,
                  flexShrink: 0
                }}
              />
            </Stack>
          </CardContent>
        </Card>
      </Slide>
    );
  };

  if (stats.loading && !refreshing) {
    return (
      <MobileLayout showHeader={false}>
        <Container maxWidth="sm" sx={{ px: 2, pt: 3 }}>
          <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 2.5, mb: 2 }} />
          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 2 }} />
          {[1, 2, 3].map(i => (
            <Skeleton
              key={i}
              variant="rectangular"
              height={70}
              sx={{ borderRadius: 2.5, mb: 1.5 }}
            />
          ))}
        </Container>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout
      showHeader
      onRefresh={() => fetchDashboardData(true, true)}
      refreshing={refreshing}
    >
      <Container maxWidth="sm" sx={{ px: 2, mt: -2, pb: 10 }}>
        {stats.error && (
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: 2.5 }}
            action={
              <IconButton
                color="inherit"
                size="small"
                onClick={() => fetchDashboardData(true, true)}
              >
                再試行
              </IconButton>
            }
          >
            {stats.error}
          </Alert>
        )}

        {/* Compact Stats Bar */}
        <Box sx={{ mt: 4, mb: 2 }}>
          <Stack direction="row" spacing={1} sx={{
            overflowX: 'auto',
            pb: 1,
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: alpha(theme.palette.primary.main, 0.3),
              borderRadius: 2
            }
          }}>
            <Chip
              icon={<ImageIcon sx={{ fontSize: 16 }} />}
              label={`${stats.totalIllustrations.toLocaleString()}件`}
              onClick={() => navigate('/illustrations')}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontWeight: 600,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
              }}
            />
            <Chip
              icon={<StoreIcon sx={{ fontSize: 16 }} />}
              label={`${stats.totalManufacturers}メーカー`}
              onClick={() => navigate('/manufacturers')}
              sx={{
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                color: theme.palette.secondary.main,
                fontWeight: 600,
                '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.2) }
              }}
            />
          </Stack>
        </Box>

        {/* Global Search Bar */}
        <Box sx={{ mb: 2.5 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="イラストを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2.5,
                bgcolor: alpha(theme.palette.background.paper, 0.6),
                backdropFilter: 'blur(10px)',
              }
            }}
          />
        </Box>

        {/* Quick Access - Manufacturers */}
        {stats.topManufacturers.length > 0 && (
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, px: 0.5, fontSize: '0.85rem' }}>
              よく使うメーカー
            </Typography>
            <Box sx={{
              display: 'flex',
              gap: 1,
              overflowX: 'auto',
              pb: 1,
              '&::-webkit-scrollbar': { height: 4 },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: alpha(theme.palette.primary.main, 0.3),
                borderRadius: 2
              }
            }}>
              {stats.topManufacturers.map((mfr) => (
                <QuickAccessCard
                  key={mfr.id}
                  title={mfr.name}
                  subtitle={`${mfr.illustration_count || 0}件`}
                  icon={<StoreIcon sx={{ color: theme.palette.primary.main, fontSize: 18 }} />}
                  color={theme.palette.primary.main}
                  onClick={() => navigate(`/manufacturers/${mfr.id}/engines`)}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Quick Access - Categories */}
        {stats.topCategories.length > 0 && (
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, px: 0.5, fontSize: '0.85rem' }}>
              人気のカテゴリ
            </Typography>
            <Box sx={{
              display: 'flex',
              gap: 1,
              overflowX: 'auto',
              pb: 1,
              '&::-webkit-scrollbar': { height: 4 },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: alpha(theme.palette.secondary.main, 0.3),
                borderRadius: 2
              }
            }}>
              {stats.topCategories.map((cat, idx) => (
                <QuickAccessCard
                  key={idx}
                  title={cat.name}
                  subtitle={`${cat.count}件`}
                  icon={<CategoryIcon sx={{ color: theme.palette.secondary.main, fontSize: 18 }} />}
                  color={theme.palette.secondary.main}
                  onClick={() => navigate(`/illustrations?category=${encodeURIComponent(cat.name)}`)}
                />
              ))}
            </Box>
          </Box>
        )}


      </Container>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => setCreateModalOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 1000,
        }}
      >
        <AddIcon />
      </Fab>

      {/* Create Modal */}
      <MobileIllustrationFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false);
          fetchDashboardData(true, true);
        }}
        mode="create"
        manufacturers={manufacturers}
        engineModels={engineModels}
        categories={categories}
        subCategories={subCategories}
        carModels={carModels}
      />
    </MobileLayout>
  );
};

export default MobileHome;