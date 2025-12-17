// src/pages/mobile/MobileHome.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Skeleton,
  Fade,
  Slide,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Store as StoreIcon,
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  Image as ImageIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { illustrationAPI, manufacturerAPI, carModelAPI, engineModelAPI } from '../../api/illustrations';
import { useNavigate } from 'react-router-dom';
import MobileIllustrationFormModal from '../../components/forms/MobileIllustrationFormModal'; // Changed to correct component
import MobileLayout from '../../layouts/MobileLayout';
import { useManufacturers } from '../../hooks/useIllustrations';
import { useEngineModels } from '../../hooks/useIllustrations';
import { usePartCategories } from '../../hooks/useIllustrations';
import { usePartSubCategories } from '../../hooks/useIllustrations';
import { useCarModels } from '../../hooks/useIllustrations';

const MobileHome = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State for dashboard data
  const [stats, setStats] = useState({
    totalIllustrations: 0,
    totalManufacturers: 0,
    totalCarModels: 0,
    totalEngineModels: 0,
    recentIllustrations: [],
    loading: true,
    error: null,
    lastUpdated: null
  });
  
  const [refreshing, setRefreshing] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  // Data hooks for form modal
  const { manufacturers } = useManufacturers();
  const { engineModels } = useEngineModels();
  const { categories } = usePartCategories();
  const { subCategories } = usePartSubCategories();
  const { carModels } = useCarModels();
  
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  const fetchDashboardData = async (showRefresh = false) => {
    if (isFetchingRef.current) return;
    
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setStats(prev => ({ ...prev, loading: true, error: null }));
    }
    
    isFetchingRef.current = true;
    
    try {
      // Make all API calls in parallel
      const [illustrationsRes, manufacturersRes, carModelsRes, engineModelsRes] = await Promise.all([
        illustrationAPI.getAll({ limit: 5, ordering: '-created_at' }).catch(err => ({ results: [], count: 0 })),
        manufacturerAPI.getAll({ limit: 1 }).catch(err => ({ results: [], count: 0 })),
        carModelAPI.getAll({ limit: 1 }).catch(err => ({ results: [], count: 0 })),
        engineModelAPI.getAll({ limit: 1 }).catch(err => ({ results: [], count: 0 }))
      ]);

      // Safely extract data with fallbacks
      const getCount = (data, defaultVal = 0) => {
        if (!data) return defaultVal;
        return data.count || (Array.isArray(data) ? data.length : 0);
      };

      const getResults = (data, defaultVal = []) => {
        if (!data) return defaultVal;
        return data.results || data || defaultVal;
      };

      setStats({
        totalIllustrations: getCount(illustrationsRes),
        totalManufacturers: getCount(manufacturersRes),
        totalCarModels: getCount(carModelsRes),
        totalEngineModels: getCount(engineModelsRes),
        recentIllustrations: getResults(illustrationsRes),
        loading: false,
        error: null,
        lastUpdated: new Date()
      });
      
      hasFetchedRef.current = true;
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error.response?.data?.message || 'データの読み込みに失敗しました'
      }));
    } finally {
      isFetchingRef.current = false;
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!hasFetchedRef.current) {
      fetchDashboardData();
    }
  }, []);

  const getTimeAgo = (date) => {
    if (!date) return '日時不明';
    
    try {
      const seconds = Math.floor((new Date() - new Date(date)) / 1000);
      if (seconds < 60) return '数秒前';
      if (seconds < 3600) return Math.floor(seconds / 60) + '分前';
      if (seconds < 86400) return Math.floor(seconds / 3600) + '時間前';
      return Math.floor(seconds / 86400) + '日前';
    } catch (error) {
      return '日時不明';
    }
  };

  const StatCard = ({ title, value, icon, gradient, onClick, loading }) => (
    <Card 
      sx={{ 
        background: gradient,
        color: 'white',
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'all 0.3s',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        },
        '&:active': {
          transform: 'scale(0.97)',
        }
      }}
      onClick={onClick}
      elevation={0}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ 
            bgcolor: 'rgba(255,255,255,0.25)',
            borderRadius: 2.5,
            p: 1,
            display: 'flex',
            backdropFilter: 'blur(10px)',
          }}>
            {React.cloneElement(icon, { sx: { fontSize: 28 } })}
          </Box>
          
          <Stack spacing={0.5} flex={1}>
            {loading ? (
              <Skeleton 
                variant="text" 
                width="60px"
                height={32} 
                sx={{ bgcolor: 'rgba(255,255,255,0.3)', borderRadius: 1 }} 
              />
            ) : (
              <Typography variant="h4" fontWeight="bold" sx={{ lineHeight: 1, textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                {value.toLocaleString()}
              </Typography>
            )}
            <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600, fontSize: '0.8rem', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
              {title}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  const IllustrationCard = ({ illustration, index }) => {
    const firstFile = illustration.first_file?.file || illustration.files?.[0]?.file;
    const timeAgo = getTimeAgo(illustration.created_at);
    const fileCount = illustration.file_count || (illustration.files?.length || 0);
    const title = illustration.title || 'タイトルなし';
    const categoryName = illustration.part_category_name || illustration.part_category?.name;
    const engineName = illustration.engine_model_name || illustration.engine_model?.name;
    
    return (
      <Slide direction="up" in timeout={300 + (index * 100)}>
        <Card 
          sx={{ 
            borderRadius: 3,
            boxShadow: theme.shadows[2],
            transition: 'all 0.3s',
            border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows[8],
              borderColor: theme.palette.primary.main,
            },
            '&:active': {
              transform: 'scale(0.98)',
            }
          }}
          onClick={() => navigate(`/illustrations/${illustration.id}`)}
        >
          <CardContent sx={{ p: 1.5 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              {/* Thumbnail */}
              <Box sx={{ 
                width: 64,
                height: 64,
                borderRadius: 2.5,
                backgroundColor: firstFile ? 'transparent' : alpha(theme.palette.primary.main, 0.08),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
                border: !firstFile ? `2px dashed ${alpha(theme.palette.primary.main, 0.3)}` : 'none',
                position: 'relative'
              }}>
                {firstFile ? (
                  <img 
                    src={firstFile} 
                    alt={title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentNode.style.backgroundColor = alpha(theme.palette.primary.main, 0.08);
                    }}
                  />
                ) : (
                  <ImageIcon sx={{ color: theme.palette.primary.main, fontSize: 28, opacity: 0.6 }} />
                )}
                
                {/* File count badge */}
                {fileCount > 1 && (
                  <Chip
                    label={`+${fileCount - 1}`}
                    size="small"
                    sx={{
                      position: 'absolute',
                      bottom: 4,
                      right: 4,
                      bgcolor: alpha('#000', 0.7),
                      color: 'white',
                      fontSize: '0.6rem',
                      height: 18,
                      minWidth: 20,
                      '& .MuiChip-label': { px: 0.5 }
                    }}
                  />
                )}
              </Box>
              
              {/* Content */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="body1" 
                  fontWeight={600}
                  noWrap
                  sx={{ mb: 0.5, lineHeight: 1.2 }}
                >
                  {title}
                </Typography>
                
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ gap: 0.5 }}>
                  {categoryName && (
                    <Chip 
                      label={categoryName}
                      size="small"
                      sx={{ 
                        height: 22,
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        borderRadius: 1.5,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                      }}
                    />
                  )}
                  
                  {engineName && (
                    <Chip 
                      label={engineName}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        height: 22,
                        fontSize: '0.7rem',
                        borderRadius: 1.5,
                      }}
                    />
                  )}
                </Stack>
                
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.5 }}>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ fontSize: '0.7rem', fontWeight: 500 }}
                  >
                    {timeAgo}
                  </Typography>
                  
                  {illustration.user_name && (
                    <Typography 
                      variant="caption" 
                      color="text.secondary"
                      sx={{ fontSize: '0.7rem', fontWeight: 500 }}
                    >
                      {illustration.user_name}
                    </Typography>
                  )}
                </Stack>
              </Box>
              
              <ChevronRightIcon sx={{ color: 'text.secondary', fontSize: 20, flexShrink: 0 }} />
            </Stack>
          </CardContent>
        </Card>
      </Slide>
    );
  };

  const handleFormSuccess = () => {
    setCreateModalOpen(false);
    fetchDashboardData(true);
  };

  // Loading Screen
  if (stats.loading && !refreshing) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
      }}>
        {/* Loading Header */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          pt: 2,
          pb: 3,
          px: 2
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Skeleton variant="text" width={120} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
            <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
          </Stack>
        </Box>
        
        {/* Loading Content */}
        <Container maxWidth="sm" sx={{ px: 2, mt: -2, flex: 1 }}>
          {/* Stats Loading */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1.5,
            mb: 3
          }}>
            {[1, 2, 3, 4].map(i => (
              <Skeleton 
                key={i}
                variant="rectangular" 
                height={80}
                sx={{ borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)' }}
              />
            ))}
          </Box>
          
          {/* Buttons Loading */}
          <Stack spacing={1.5} mb={3}>
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)' }} />
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)' }} />
          </Stack>
          
          {/* Recent Items Loading */}
          <Box>
            <Skeleton variant="text" width={120} height={32} sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.1)' }} />
            <Stack spacing={1.5}>
              {[1, 2, 3].map(i => (
                <Skeleton 
                  key={i}
                  variant="rectangular" 
                  height={80} 
                  sx={{ borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)' }} 
                />
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <MobileLayout showHeader={false}>
      <Box sx={{ 
        minHeight: '100vh',
        background: theme.palette.background.default,
        pb: 4
      }}>
        {/* Custom Header with Stats */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          pt: 2,
          pb: 4,
          px: 2,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Pattern */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '50%',
            height: '100%',
            background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.1) 0%, transparent 70%)',
          }} />
          
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                borderRadius: 3,
                p: 0.75,
                backdropFilter: 'blur(10px)'
              }}>
                <DashboardIcon />
              </Box>
              <Stack spacing={0}>
                <Typography variant="h5" fontWeight="bold">
                  ダッシュボード
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem' }}>
                  {stats.lastUpdated ? `更新: ${getTimeAgo(stats.lastUpdated)}` : '読み込み中...'}
                </Typography>
              </Stack>
            </Stack>
            
            <IconButton 
              onClick={() => fetchDashboardData(true)} 
              disabled={refreshing}
              sx={{ 
                color: 'white', 
                bgcolor: 'rgba(255,255,255,0.2)',
                backdropFilter: 'blur(10px)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                transition: 'all 0.3s',
                '&:active': {
                  transform: 'scale(0.9)',
                }
              }}
            >
              <RefreshIcon 
                sx={{ 
                  animation: refreshing ? 'spin 1s linear infinite' : 'none',
                  fontSize: 20
                }} 
              />
            </IconButton>
          </Stack>
        </Box>

        <Container maxWidth="sm" sx={{ px: 2, mt: -3 }}>
          {/* Error Alert */}
          {stats.error && (
            <Fade in>
              <Alert 
                severity="error"
                sx={{ 
                  mb: 2, 
                  borderRadius: 3,
                  boxShadow: theme.shadows[2],
                  '& .MuiAlert-icon': { alignItems: 'center' }
                }}
                action={
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={() => fetchDashboardData(true)}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  >
                    再試行
                  </Button>
                }
              >
                {stats.error}
              </Alert>
            </Fade>
          )}

          {/* Quick Stats Grid */}
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1.5,
            mb: 3
          }}>
            <StatCard
              title="イラスト"
              value={stats.totalIllustrations}
              icon={<ImageIcon />}
              gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              onClick={() => navigate('/illustrations')}
              loading={refreshing}
            />
            <StatCard
              title="メーカー"
              value={stats.totalManufacturers}
              icon={<StoreIcon />}
              gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              onClick={() => navigate('/manufacturers')}
              loading={refreshing}
            />
            <StatCard
              title="車種"
              value={stats.totalCarModels}
              icon={<CarIcon />}
              gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              onClick={() => navigate('/car-models')}
              loading={refreshing}
            />
            <StatCard
              title="エンジン"
              value={stats.totalEngineModels}
              icon={<BuildIcon />}
              gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
              onClick={() => navigate('/engine-models')}
              loading={refreshing}
            />
          </Box>

          {/* Quick Actions */}
          <Stack spacing={1.5} mb={3}>
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => setCreateModalOpen(true)}
              sx={{ 
                py: 1.75,
                background: 'linear-gradient(135deg, #1976d2, #1565c0)',
                fontSize: '0.95rem',
                fontWeight: 600,
                borderRadius: 3,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #1565c0, #0d47a1)',
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.6)',
                },
                '&:active': {
                  transform: 'scale(0.98)',
                }
              }}
            >
              新規イラスト作成
            </Button>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<ImageIcon />}
              onClick={() => navigate('/illustrations')}
              sx={{ 
                py: 1.75,
                fontSize: '0.95rem',
                fontWeight: 600,
                borderRadius: 3,
                borderWidth: 2,
                textTransform: 'none',
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                '&:hover': {
                  borderWidth: 2,
                  borderColor: theme.palette.primary.dark,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                }
              }}
            >
              すべて表示
            </Button>
          </Stack>

          {/* Recent Illustrations */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold" color="text.primary">
                最近のイラスト
              </Typography>
              <Button 
                size="small"
                endIcon={<ChevronRightIcon />}
                onClick={() => navigate('/illustrations')}
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  color: theme.palette.primary.main,
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  }
                }}
              >
                すべて
              </Button>
            </Stack>

            <Stack spacing={1.5}>
              {refreshing ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton 
                    key={i} 
                    variant="rectangular" 
                    height={80} 
                    sx={{ borderRadius: 3 }} 
                  />
                ))
              ) : stats.recentIllustrations.length > 0 ? (
                stats.recentIllustrations.map((illustration, index) => (
                  <IllustrationCard 
                    key={illustration.id || index} 
                    illustration={illustration}
                    index={index}
                  />
                ))
              ) : (
                <Fade in>
                  <Card sx={{ 
                    borderRadius: 3, 
                    textAlign: 'center', 
                    py: 6,
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                    border: `2px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
                    boxShadow: 'none'
                  }}>
                    <Box sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2
                    }}>
                      <ImageIcon sx={{ fontSize: 32, color: theme.palette.primary.main, opacity: 0.6 }} />
                    </Box>
                    <Typography variant="body1" color="text.secondary" fontWeight={500} mb={1}>
                      まだイラストがありません
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
                      最初のイラストを作成して始めましょう
                    </Typography>
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => setCreateModalOpen(true)}
                      sx={{ mt: 2, textTransform: 'none', fontWeight: 600 }}
                    >
                      作成する
                    </Button>
                  </Card>
                </Fade>
              )}
            </Stack>
          </Box>

          {/* Weekly Insight Card */}
          {!refreshing && (
            <Fade in>
              <Card sx={{ 
                mt: 3,
                mb: 2,
                p: 2.5,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Background Pattern */}
                <Box sx={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 150,
                  height: 150,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%)',
                }} />
                
                <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2.5} position="relative">
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      週間インサイト
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem', fontWeight: 500 }}>
                      生産性のサマリー
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: 28, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }} />
                </Stack>
                
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: 1.5,
                  position: 'relative'
                }}>
                  {[
                    { value: stats.totalIllustrations > 0 ? '+24' : '0', label: '新規' },
                    { value: '89%', label: '完了率' },
                    { value: '5.2h', label: '平均' }
                  ].map((item, index) => (
                    <Box 
                      key={index}
                      sx={{ 
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        textAlign: 'center',
                        transition: 'all 0.3s',
                        '&:hover': {
                          bgcolor: 'rgba(255,255,255,0.25)',
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      <Typography variant="h5" fontWeight="bold" sx={{ textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                        {item.value}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem', fontWeight: 500 }}>
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Fade>
          )}
        </Container>
      </Box>

      {/* Create Modal - Using MobileIllustrationFormModal */}
      <MobileIllustrationFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleFormSuccess}
        mode="create"
        manufacturers={manufacturers}
        engineModels={engineModels}
        categories={categories}
        subCategories={subCategories}
        carModels={carModels}
      />

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </MobileLayout>
  );
};

export default MobileHome;