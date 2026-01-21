import React, { useState, useEffect, useRef } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Skeleton from '@mui/material/Skeleton';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Fab from '@mui/material/Fab';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid2';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Store as StoreIcon,
  Image as ImageIcon,
  Add as AddIcon,
  ChevronRight as ChevronRightIcon,
  PictureAsPdf as PdfIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Category as CategoryIcon,
  AccessTime as AccessTimeIcon,
  Description as DescriptionIcon,
  DirectionsCar as CarIcon,
  Settings as SettingsIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { illustrationAPI, manufacturerAPI, clearCache } from '../../../api/illustrations';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import MobileIllustrationFormModal from '../../../components/illustrations/forms/MobileIllustrationFormModal';
import IllustrationDetailModal from '../../../components/illustrations/modals/IllustrationDetailModal';
import MobileLayout from '../../../layouts/MobileLayout';
import { useManufacturers, useEngineModels, usePartCategories, usePartSubCategories, useCarModels } from '../../../hooks/useIllustrations';

const MobileHome = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

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
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedIllustration, setSelectedIllustration] = useState(null);

  const { manufacturers } = useManufacturers(1000);
  const { engineModels } = useEngineModels(null, 1000);
  const { categories } = usePartCategories(1000);
  const { subCategories } = usePartSubCategories(null, 1000);
  const { carModels } = useCarModels(null, 1000);

  const hasFetchedRef = useRef(false);

  const fetchDashboardData = async (showRefresh = false, forceRefresh = false) => {
    if (forceRefresh) {
      clearCache();
    }

    if (showRefresh) setRefreshing(true);
    else setStats(prev => ({ ...prev, loading: true }));

    try {
      const [illustrationsRes, topManufacturersRes, allIllustrationsRes] = await Promise.all([
        illustrationAPI.getAll({ limit: 5, ordering: '-created_at', include_files: true }),
        manufacturerAPI.getAll({ limit: 8, ordering: '-illustration_count' }),
        illustrationAPI.getAll({ limit: 20, include_files: false })
      ]);

      const categoryCount = {};
      (allIllustrationsRes.results || []).forEach(ill => {
        if (ill.part_category_name) {
          categoryCount[ill.part_category_name] = (categoryCount[ill.part_category_name] || 0) + 1;
        }
      });

      const topCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, count]) => ({ name, count }));

      setStats({
        totalIllustrations: allIllustrationsRes.count || 0,
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
      // Navigate to illustrations page with search query
      navigate(`/illustrations`, { state: { searchQuery: searchQuery.trim() } });
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return '数秒前';
    if (seconds < 3600) return Math.floor(seconds / 60) + '分前';
    if (seconds < 86400) return Math.floor(seconds / 3600) + '時間前';
    return Math.floor(seconds / 86400) + '日前';
  };

  const SectionHeader = ({ title, actionLabel, onAction }) => (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, px: 0.5 }}>
      <Typography variant="subtitle2" fontWeight="800" sx={{ color: 'text.primary', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {title}
      </Typography>
      {actionLabel && (
        <Typography
          variant="caption"
          fontWeight="bold"
          onClick={onAction}
          sx={{ color: 'primary.main', cursor: 'pointer', '&:active': { opacity: 0.7 } }}
        >
          {actionLabel}
        </Typography>
      )}
    </Stack>
  );

  const QuickActionChip = ({ icon, label, onClick, color = 'primary' }) => (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0.75,
        cursor: 'pointer',
        '&:active': { transform: 'scale(0.95)' },
        transition: 'transform 0.1s'
      }}
    >
      <Box sx={{
        width: 48,
        height: 48,
        borderRadius: '16px',
        bgcolor: alpha(theme.palette[color].main, 0.1),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: `1px solid ${alpha(theme.palette[color].main, 0.1)}`
      }}>
        {React.cloneElement(icon, { sx: { color: theme.palette[color].main, fontSize: 24 } })}
      </Box>
      <Typography variant="caption" fontWeight="bold" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
        {label}
      </Typography>
    </Box>
  );

  const GlassCard = ({ children, onClick, sx = {} }) => (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: '20px',
        bgcolor: 'background.paper',
        backgroundImage: 'none',
        boxShadow: theme.shadows[1],
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.2s',
        '&:active': { transform: 'scale(0.98)', bgcolor: 'action.hover' },
        ...sx
      }}
    >
      <CardContent sx={{ p: '16px !important' }}>
        {children}
      </CardContent>
    </Card>
  );

  if (stats.loading && !refreshing) {
    return (
      <MobileLayout showHeader={false}>
        <Container maxWidth="sm" sx={{ px: 2, pt: 3 }}>
          <Skeleton variant="rectangular" height={180} sx={{ borderRadius: '24px', mb: 3 }} />
          <Skeleton variant="rectangular" height={50} sx={{ borderRadius: '12px', mb: 3 }} />
          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            {[1, 2, 3, 4].map(i => <Skeleton key={i} variant="circular" width={48} height={48} />)}
          </Stack>
          <Skeleton variant="text" width="40%" sx={{ mb: 2 }} />
          {[1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: '16px', mb: 1.5 }} />)}
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
      <Container maxWidth={isDesktop ? false : "sm"} sx={{ px: isDesktop ? 6 : 2, pb: isDesktop ? 6 : 12, maxWidth: isDesktop ? '100%' : undefined }}>
        {isDesktop ? (
          // ========== DESKTOP DASHBOARD ==========
          <>
            {/* Welcome Header */}
            <Box sx={{ mb: 4, mt: 3 }}>
              <Typography variant="h4" fontWeight="800" gutterBottom sx={{ color: 'text.primary' }}>
                ようこそ、{user?.first_name || user?.username}さん
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                イラスト管理システムへ。本日の状況を確認しましょう。
              </Typography>
            </Box>

            {/* Statistics Cards Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Total Illustrations */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{
                  background: theme.palette.mode === 'dark'
                    ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`
                    : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                  color: 'white',
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.25)}`,
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600, mb: 1 }}>
                          総イラスト数
                        </Typography>
                        <Typography variant="h3" fontWeight="900">
                          {stats.totalIllustrations.toLocaleString()}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        <ImageIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Total Manufacturers */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{
                  background: theme.palette.mode === 'dark'
                    ? `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`
                    : `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 100%)`,
                  color: 'white',
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.25)}`,
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600, mb: 1 }}>
                          メーカー数
                        </Typography>
                        <Typography variant="h3" fontWeight="900">
                          {stats.totalManufacturers}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        <StoreIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Categories */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{
                  background: theme.palette.mode === 'dark'
                    ? `linear-gradient(135deg, ${theme.palette.warning.dark} 0%, ${theme.palette.warning.main} 100%)`
                    : `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.light} 100%)`,
                  color: 'white',
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: `0 8px 24px ${alpha(theme.palette.warning.main, 0.25)}`,
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600, mb: 1 }}>
                          カテゴリ数
                        </Typography>
                        <Typography variant="h3" fontWeight="900">
                          {stats.topCategories.length}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        <CategoryIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Recent Activity */}
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Card sx={{
                  background: theme.palette.mode === 'dark'
                    ? `linear-gradient(135deg, ${theme.palette.info.dark} 0%, ${theme.palette.info.main} 100%)`
                    : `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.light} 100%)`,
                  color: 'white',
                  borderRadius: 3,
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: `0 8px 24px ${alpha(theme.palette.info.main, 0.25)}`,
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 600, mb: 1 }}>
                          最近の追加
                        </Typography>
                        <Typography variant="h3" fontWeight="900">
                          {stats.recentIllustrations.length}
                        </Typography>
                      </Box>
                      <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                        <TrendingUpIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Main Content Grid */}
            <Grid container spacing={3}>
              {/* Left Column - Recent Illustrations */}
              <Grid size={{ xs: 12, md: 8 }}>
                <Card sx={{
                  borderRadius: 3,
                  boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
                  border: `1px solid ${theme.palette.divider}`,
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                      <Typography variant="h6" fontWeight="700">
                        最近のイラスト
                      </Typography>
                      <IconButton onClick={() => navigate('/illustrations')} size="small">
                        <ChevronRightIcon />
                      </IconButton>
                    </Stack>

                    {/* Search Bar */}
                    <TextField
                      fullWidth
                      placeholder="イラスト、メーカーを検索..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ color: 'text.secondary' }} />
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
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          bgcolor: 'background.default',
                        }
                      }}
                    />

                    {/* Recent Illustrations List */}
                    <Stack spacing={2}>
                      {stats.recentIllustrations.slice(0, 5).map((ill) => (
                        <Card
                          key={ill.id}
                          onClick={() => handleIllustrationClick(ill)}
                          sx={{
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 4px 12px rgba(0,0,0,0.1)',
                            },
                            border: `1px solid ${theme.palette.divider}`,
                          }}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar
                                variant="rounded"
                                sx={{
                                  width: 60,
                                  height: 60,
                                  bgcolor: 'action.hover',
                                }}
                              >
                                {ill.file_count > 0 ? (
                                  <PdfIcon sx={{ fontSize: 32, color: 'error.main' }} />
                                ) : (
                                  <DescriptionIcon sx={{ fontSize: 32 }} />
                                )}
                              </Avatar>
                              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                <Typography variant="subtitle1" fontWeight="600" noWrap>
                                  {ill.title}
                                </Typography>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Chip
                                    label={ill.manufacturer_name}
                                    size="small"
                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                  />
                                  {ill.file_count > 0 && (
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                      {ill.file_count} ファイル
                                    </Typography>
                                  )}
                                </Stack>
                              </Box>
                              <ChevronRightIcon sx={{ color: 'text.secondary' }} />
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Right Column - Manufacturers & Categories */}
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={3}>
                  {/* Top Manufacturers */}
                  <Card sx={{
                    borderRadius: 3,
                    boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
                    border: `1px solid ${theme.palette.divider}`,
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                        人気メーカー
                      </Typography>
                      <Stack spacing={1.5}>
                        {stats.topManufacturers.slice(0, 6).map((mfr) => (
                          <Box
                            key={mfr.id}
                            onClick={() => navigate(`/manufacturers/${mfr.slug}`)}
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                            }}
                          >
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Stack direction="row" spacing={1.5} alignItems="center">
                                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                  <StoreIcon sx={{ fontSize: 18 }} />
                                </Avatar>
                                <Typography variant="body2" fontWeight="600">
                                  {mfr.name}
                                </Typography>
                              </Stack>
                              <Chip
                                label={mfr.illustration_count}
                                size="small"
                                sx={{ height: 22, minWidth: 32 }}
                              />
                            </Stack>
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>

                  {/* Popular Categories */}
                  <Card sx={{
                    borderRadius: 3,
                    boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
                    border: `1px solid ${theme.palette.divider}`,
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                        人気カテゴリ
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        {stats.topCategories.slice(0, 8).map((cat, idx) => (
                          <Chip
                            key={idx}
                            label={`${cat.name} (${cat.count})`}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              '&:hover': {
                                bgcolor: 'primary.main',
                                color: 'white',
                              },
                            }}
                          />
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card sx={{
                    borderRadius: 3,
                    boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 8px rgba(0,0,0,0.08)',
                    border: `1px solid ${theme.palette.divider}`,
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight="700" sx={{ mb: 2 }}>
                        クイックアクション
                      </Typography>
                      <Stack spacing={1}>
                        <Box
                          onClick={() => setCreateModalOpen(true)}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'primary.main',
                            color: 'white',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: 'primary.dark',
                              transform: 'translateY(-2px)',
                            },
                          }}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <AddIcon />
                            <Typography fontWeight="600">新規イラスト作成</Typography>
                          </Stack>
                        </Box>
                        <Box
                          onClick={() => navigate('/manufacturers')}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            border: `1px solid ${theme.palette.divider}`,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <StoreIcon />
                            <Typography fontWeight="600">メーカー管理</Typography>
                          </Stack>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>
            </Grid>
          </>
        ) : (
          // ========== MOBILE VIEW (EXISTING DESIGN) ==========
          <>
            {/* HERO SECTION */}
            <Box sx={{ mt: 2, mb: 3 }}>
              <Box sx={{
                background: theme.palette.mode === 'dark'
                  ? `linear-gradient(135deg, ${theme.palette.zinc[900]} 0%, ${theme.palette.zinc[950]} 100%)`
                  : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                borderRadius: '24px',
                p: 3,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: theme.palette.mode === 'dark'
                  ? `0 10px 30px ${alpha(theme.palette.common.black, 0.4)}`
                  : `0 10px 30px ${alpha(theme.palette.primary.main, 0.2)}`,
                border: `1px solid ${theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : alpha(theme.palette.common.white, 0.2)}`
              }}>
                {/* Background pattern */}
                <Box sx={{
                  position: 'absolute',
                  top: -10,
                  right: -10,
                  width: 120,
                  height: 120,
                  background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
                  zIndex: 0
                }} />

                <Stack spacing={2.5} sx={{ position: 'relative', zIndex: 1 }}>
                  <Stack spacing={0.5}>
                    <Typography variant="h5" fontWeight="900" sx={{ letterSpacing: '-0.02em' }}>
                      ようこそ、{user?.first_name || user?.username}さん
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.7, fontWeight: 500 }}>
                      イラスト管理システムへ。本日の状況を確認しましょう。
                    </Typography>
                  </Stack>

                  <Stack direction="row" spacing={3}>
                    <Box>
                      <Typography variant="h4" fontWeight="900" sx={{ color: 'primary.light' }}>
                        {stats.totalIllustrations.toLocaleString()}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.6, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                        Illustrations
                      </Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
                    <Box>
                      <Typography variant="h4" fontWeight="900" sx={{ color: 'secondary.light' }}>
                        {stats.totalManufacturers}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.6, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
                        Manufacturers
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Box>
            </Box>

            {/* SEARCH BAR */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                placeholder="イラスト、メーカーを検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary', fontSize: 22 }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery('')} sx={{ color: 'text.secondary' }}>
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    height: 54,
                    borderRadius: '16px',
                    bgcolor: 'background.paper',
                    border: `1px solid ${theme.palette.divider}`,
                    boxShadow: theme.palette.mode === 'dark' ? 'none' : '0 2px 4px rgba(0,0,0,0.02)',
                    '&.Mui-focused': {
                      borderColor: 'primary.main',
                      boxShadow: theme.palette.mode === 'dark' ? 'none' : `0 0 0 4px ${alpha(theme.palette.primary.main, 0.1)}`
                    }
                  },
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' }
                }}
              />
            </Box>

            {/* QUICK ACTIONS */}
            <Stack direction="row" justifyContent="space-around" sx={{ mb: 4, px: 1 }}>
              <QuickActionChip
                icon={<AddIcon />}
                label="新規作成"
                onClick={() => setCreateModalOpen(true)}
                color="primary"
              />
              <QuickActionChip
                icon={<StoreIcon />}
                label="メーカー"
                onClick={() => navigate('/manufacturers')}
                color="success"
              />
              <QuickActionChip
                icon={<CarIcon />}
                label="車種"
                onClick={() => navigate('/cars')}
                color="secondary"
              />
              <QuickActionChip
                icon={<SettingsIcon />}
                label="エンジン"
                onClick={() => navigate('/engines')}
                color="info"
              />
            </Stack>

            {/* RECENT ILLUSTRATIONS */}
            <Box sx={{ mb: 4 }}>
              <SectionHeader title="最近のイラスト" actionLabel="すべて表示" onAction={() => navigate('/illustrations')} />
              <Stack spacing={2}>
                {stats.recentIllustrations.length > 0 ? (
                  stats.recentIllustrations.slice(0, 5).map((ill) => (
                    <GlassCard
                      key={ill.id}
                      onClick={() => {
                        setSelectedIllustration(ill);
                        setDetailModalOpen(true);
                      }}
                      sx={{
                        '&:active': {
                          transform: 'translateY(2px)',
                        }
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <Box sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '16px',
                            background: ill.file_count > 0
                              ? `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.2)} 0%, ${alpha(theme.palette.error.main, 0.1)} 100%)`
                              : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            flexShrink: 0,
                          }}>
                            {ill.file_count > 0 ? (
                              <PdfIcon sx={{ color: 'error.main', fontSize: 30 }} />
                            ) : (
                              <DescriptionIcon sx={{ color: 'primary.main', fontSize: 30 }} />
                            )}
                            {ill.file_count > 0 && (
                              <Box sx={{
                                position: 'absolute',
                                top: -8,
                                right: -8,
                                minWidth: 24,
                                height: 24,
                                borderRadius: '12px',
                                bgcolor: 'error.main',
                                color: 'white',
                                fontSize: '0.7rem',
                                fontWeight: 900,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                px: 0.75,
                                boxShadow: `0 4px 8px ${alpha(theme.palette.error.main, 0.3)}`,
                                border: `2px solid ${theme.palette.background.paper}`
                              }}>
                                {ill.file_count}
                              </Box>
                            )}
                          </Box>

                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="body1"
                              fontWeight="800"
                              sx={{
                                color: 'text.primary',
                                mb: 0.5,
                                lineHeight: 1.3,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}
                            >
                              {ill.title}
                            </Typography>

                            {ill.engine_model_name && (
                              <Chip
                                label={ill.engine_model_name}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.main,
                                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                  '& .MuiChip-label': { px: 1.5 }
                                }}
                              />
                            )}
                            {(ill.part_category_name || ill.part_category?.name) && (
                              <Chip
                                label={ill.part_category_name || ill.part_category?.name}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  bgcolor: alpha(theme.palette.info.main, 0.1),
                                  color: theme.palette.info.main,
                                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                                  '& .MuiChip-label': { px: 1.5 }
                                }}
                              />
                            )}
                            {(ill.part_subcategory_name || ill.part_subcategory?.name) && (
                              <Chip
                                label={ill.part_subcategory_name || ill.part_subcategory?.name}
                                size="small"
                                sx={{
                                  height: 22,
                                  fontSize: '0.7rem',
                                  fontWeight: 700,
                                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                  color: theme.palette.secondary.main,
                                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                                  '& .MuiChip-label': { px: 1.5 }
                                }}
                              />
                            )}
                          </Box>
                        </Stack>

                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          sx={{
                            pt: 1,
                            borderTop: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                              {getTimeAgo(ill.created_at)}
                            </Typography>
                          </Stack>

                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                              詳細を見る
                            </Typography>
                            <ChevronRightIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
                          </Stack>
                        </Stack>
                      </Stack>
                    </GlassCard>
                  ))
                ) : (
                  <GlassCard sx={{
                    py: 4,
                    textAlign: 'center',
                    bgcolor: alpha(theme.palette.background.paper, 0.4)
                  }}>
                    <DescriptionIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary" fontWeight="600">
                      データがありません
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      最初のイラストを作成しましょう
                    </Typography>
                  </GlassCard>
                )}
              </Stack>
            </Box>

            {/* FREQUENT MANUFACTURERS */}
            <Box sx={{ mb: 4 }}>
              <SectionHeader title="よく使うメーカー" />
              <Box sx={{
                display: 'flex',
                gap: 1.5,
                overflowX: 'auto',
                pb: 2,
                px: 0.5,
                '&::-webkit-scrollbar': { display: 'none' }
              }}>
                {stats.topManufacturers.map((mfr) => (
                  <Box
                    key={mfr.id}
                    onClick={() => navigate(`/manufacturers/${mfr.id}/engines`)}
                    sx={{
                      minWidth: 100,
                      p: 2,
                      borderRadius: '20px',
                      bgcolor: 'background.paper',
                      border: `1px solid ${theme.palette.divider}`,
                      textAlign: 'center',
                      cursor: 'pointer',
                      '&:active': { transform: 'scale(0.95)', bgcolor: 'action.hover' }
                    }}
                  >
                    <Avatar sx={{
                      mx: 'auto',
                      mb: 1,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      width: 40,
                      height: 40,
                      fontWeight: 700
                    }}>
                      {mfr.name[0]}
                    </Avatar>
                    <Typography variant="caption" fontWeight="bold" noWrap sx={{ display: 'block', color: 'text.primary' }}>
                      {mfr.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem' }}>
                      {mfr.illustration_count || 0}件
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* POPULAR CATEGORIES */}
            <Box sx={{ mb: 4 }}>
              <SectionHeader title="人気のカテゴリ" />
              <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                px: 0.5
              }}>
                {stats.topCategories.map((cat, idx) => (
                  <Chip
                    key={idx}
                    label={`${cat.name} (${cat.count})`}
                    onClick={() => navigate(`/illustrations?category=${encodeURIComponent(cat.name)}`)}
                    sx={{
                      borderRadius: '12px',
                      bgcolor: 'background.paper',
                      border: `1px solid ${theme.palette.divider}`,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      color: 'text.secondary',
                      '&:active': { bgcolor: 'action.hover' }
                    }}
                  />
                ))}
              </Box>
            </Box>
          </>
        )}
      </Container>

      {/* FLOATING ACTION BUTTON (Mobile Only) */}
      {!isDesktop && (
        <Fab
          onClick={() => setCreateModalOpen(true)}
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 90,
            right: 20,
            boxShadow: theme.palette.mode === 'dark'
              ? `0 8px 16px ${alpha(theme.palette.common.black, 0.4)}`
              : `0 8px 16px ${alpha(theme.palette.primary.main, 0.3)}`,
            '&:hover': {
              transform: 'scale(1.05)',
              boxShadow: theme.palette.mode === 'dark'
                ? `0 12px 20px ${alpha(theme.palette.common.black, 0.5)}`
                : `0 12px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
            },
            transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}
        >
          <AddIcon />
        </Fab>
      )}

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

      {selectedIllustration && (
        <IllustrationDetailModal
          open={detailModalOpen}
          illustration={selectedIllustration}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedIllustration(null);
          }}
          onUpdate={() => {
            fetchDashboardData(true, true);
          }}
          onDelete={() => {
            setDetailModalOpen(false);
            setSelectedIllustration(null);
            fetchDashboardData(true, true);
          }}
          onEdit={() => {
            setDetailModalOpen(false);
          }}
        />
      )}
    </MobileLayout>
  );
};

export default MobileHome;