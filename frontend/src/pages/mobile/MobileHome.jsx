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
  Slide
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Store as StoreIcon,
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  Image as ImageIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { illustrationAPI, manufacturerAPI, carModelAPI, engineModelAPI } from '../../api/illustrations';
import { useNavigate } from 'react-router-dom';
import CreateIllustrationModal from '../../components/forms/CreateIllustrationModal';
import MobileLayout from '../../layouts/MobileLayout';

const MobileHome = () => {
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
  const navigate = useNavigate();
  
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
      const results = await Promise.allSettled([
        illustrationAPI.getAll({ limit: 5, ordering: '-created_at' }),
        manufacturerAPI.getAll({ limit: 1 }),
        carModelAPI.getAll({ limit: 1 }),
        engineModelAPI.getAll({ limit: 1 })
      ]);

      const getData = (result) => {
        if (result.status === 'rejected') return [];
        const data = result.value.data;
        return data.results || data || [];
      };

      const getCount = (result) => {
        if (result.status === 'rejected') return 0;
        const data = result.value.data;
        return data.count || (Array.isArray(data) ? data.length : 0);
      };

      setStats({
        totalIllustrations: getCount(results[0]),
        totalManufacturers: getCount(results[1]),
        totalCarModels: getCount(results[2]),
        totalEngineModels: getCount(results[3]),
        recentIllustrations: getData(results[0]),
        loading: false,
        error: null,
        lastUpdated: new Date()
      });
      
      hasFetchedRef.current = true;
    } catch (error) {
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'データの読み込みに失敗しました'
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
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return '数秒前';
    if (seconds < 3600) return Math.floor(seconds / 60) + '分前';
    if (seconds < 86400) return Math.floor(seconds / 3600) + '時間前';
    return Math.floor(seconds / 86400) + '日前';
  };

  const StatCard = ({ title, value, icon, gradient, onClick, loading }) => (
    <Card 
      sx={{ 
        background: gradient,
        color: 'white',
        borderRadius: 3,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        transition: 'transform 0.2s',
        '&:active': {
          transform: 'scale(0.97)',
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ 
            bgcolor: 'rgba(255,255,255,0.25)',
            borderRadius: 2,
            p: 1,
            display: 'flex'
          }}>
            {React.cloneElement(icon, { sx: { fontSize: 28 } })}
          </Box>
          
          <Stack spacing={0} flex={1}>
            {loading ? (
              <Skeleton 
                variant="text" 
                width="60px"
                height={32} 
                sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} 
              />
            ) : (
              <Typography variant="h4" fontWeight="bold" sx={{ lineHeight: 1 }}>
                {value.toLocaleString()}
              </Typography>
            )}
            <Typography variant="caption" sx={{ opacity: 0.95, fontWeight: 600, fontSize: '0.8rem' }}>
              {title}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  const IllustrationCard = ({ illustration }) => {
    const firstFile = illustration.files?.[0];
    const timeAgo = getTimeAgo(new Date(illustration.created_at));
    
    return (
      <Card 
        sx={{ 
          borderRadius: 3,
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          transition: 'all 0.2s',
          border: '1px solid rgba(0,0,0,0.06)',
          '&:active': {
            transform: 'scale(0.98)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
          }
        }}
        onClick={() => navigate(`/illustrations/${illustration.id}`)}
      >
        <CardContent sx={{ p: 1.5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box sx={{ 
              width: 64,
              height: 64,
              borderRadius: 2.5,
              backgroundColor: firstFile ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
              border: !firstFile ? '2px dashed rgba(25, 118, 210, 0.3)' : 'none'
            }}>
              {firstFile ? (
                <img 
                  src={firstFile.file} 
                  alt={illustration.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <ImageIcon sx={{ color: '#1976d2', fontSize: 28 }} />
              )}
            </Box>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="body1" 
                fontWeight={600}
                noWrap
                sx={{ mb: 0.5 }}
              >
                {illustration.title || 'タイトルなし'}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ gap: 0.5 }}>
                {illustration.part_category?.name && (
                  <Chip 
                    label={illustration.part_category.name}
                    size="small"
                    sx={{ 
                      height: 22,
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      borderRadius: 1.5
                    }}
                  />
                )}
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ fontSize: '0.7rem', fontWeight: 500 }}
                >
                  {timeAgo}
                </Typography>
              </Stack>
            </Box>
            
            <ChevronRightIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
          </Stack>
        </CardContent>
      </Card>
    );
  };

  // Loading Screen
  if (stats.loading && !refreshing) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)'
      }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={60} sx={{ color: 'white' }} />
          <Typography variant="body1" color="white" fontWeight={500}>
            読み込み中...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <MobileLayout showHeader={false}>
      <Box sx={{ bgcolor: '#f5f7fa' }}>
        {/* Custom Header */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          pt: 2,
          pb: 3,
          px: 2
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h5" fontWeight="bold">
              ダッシュボード
            </Typography>
            <IconButton 
              onClick={() => fetchDashboardData(true)} 
              disabled={refreshing}
              sx={{ 
                color: 'white', 
                bgcolor: 'rgba(255,255,255,0.2)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
              }}
            >
              <RefreshIcon 
                sx={{ 
                  animation: refreshing ? 'spin 1s linear infinite' : 'none'
                }} 
              />
            </IconButton>
          </Stack>
        </Box>

        <Container maxWidth="sm" sx={{ px: 2, mt: -2 }}>
          {/* Error Alert */}
          {stats.error && (
            <Fade in>
              <Alert 
                severity="error"
                sx={{ mb: 2, borderRadius: 2 }}
                action={
                  <Button color="inherit" size="small" onClick={() => fetchDashboardData(true)}>
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
              loading={stats.loading}
            />
            <StatCard
              title="メーカー"
              value={stats.totalManufacturers}
              icon={<StoreIcon />}
              gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              onClick={() => navigate('/manufacturers')}
              loading={stats.loading}
            />
            <StatCard
              title="車種"
              value={stats.totalCarModels}
              icon={<CarIcon />}
              gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              onClick={() => navigate('/car-models')}
              loading={stats.loading}
            />
            <StatCard
              title="エンジン"
              value={stats.totalEngineModels}
              icon={<BuildIcon />}
              gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
              onClick={() => navigate('/engine-models')}
              loading={stats.loading}
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
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)'
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
                textTransform: 'none'
              }}
            >
              すべて表示
            </Button>
          </Stack>

          {/* Recent Illustrations */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6" fontWeight="bold">
                最近のイラスト
              </Typography>
              <Button 
                size="small"
                endIcon={<ChevronRightIcon />}
                onClick={() => navigate('/illustrations')}
                sx={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  textTransform: 'none'
                }}
              >
                すべて
              </Button>
            </Stack>

            <Stack spacing={1.5}>
              {stats.loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton 
                    key={i} 
                    variant="rectangular" 
                    height={80} 
                    sx={{ borderRadius: 3 }} 
                  />
                ))
              ) : stats.recentIllustrations.length > 0 ? (
                stats.recentIllustrations.map((illustration) => (
                  <Slide key={illustration.id} direction="up" in mountOnEnter>
                    <div>
                      <IllustrationCard illustration={illustration} />
                    </div>
                  </Slide>
                ))
              ) : (
                <Card sx={{ borderRadius: 3, textAlign: 'center', py: 6 }}>
                  <ImageIcon sx={{ fontSize: 56, color: 'grey.300', mb: 1.5 }} />
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>
                    イラストがまだありません
                  </Typography>
                </Card>
              )}
            </Stack>
          </Box>

          {/* Weekly Insight Card */}
          <Card sx={{ 
            mt: 3,
            mb: 2,
            p: 2.5,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)'
          }}>
            <Stack direction="row" justifyContent="space-between" alignItems="start" mb={2.5}>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  週間インサイト
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.75rem', fontWeight: 500 }}>
                  生産性のサマリー
                </Typography>
              </Box>
              <TrendingUpIcon sx={{ fontSize: 28 }} />
            </Stack>
            
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1.5
            }}>
              <Box sx={{ 
                p: 2,
                borderRadius: 2.5,
                bgcolor: 'rgba(255,255,255,0.2)',
                textAlign: 'center'
              }}>
                <Typography variant="h5" fontWeight="bold">+24</Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem', fontWeight: 500 }}>
                  新規
                </Typography>
              </Box>
              <Box sx={{ 
                p: 2,
                borderRadius: 2.5,
                bgcolor: 'rgba(255,255,255,0.2)',
                textAlign: 'center'
              }}>
                <Typography variant="h5" fontWeight="bold">89%</Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem', fontWeight: 500 }}>
                  完了率
                </Typography>
              </Box>
              <Box sx={{ 
                p: 2,
                borderRadius: 2.5,
                bgcolor: 'rgba(255,255,255,0.2)',
                textAlign: 'center'
              }}>
                <Typography variant="h5" fontWeight="bold">5.2h</Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem', fontWeight: 500 }}>
                  平均
                </Typography>
              </Box>
            </Box>
          </Card>
        </Container>
      </Box>

      {/* Create Modal */}
      <CreateIllustrationModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          setCreateModalOpen(false);
          fetchDashboardData(true);
        }}
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