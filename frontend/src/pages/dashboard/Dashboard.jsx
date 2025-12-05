import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  IconButton,
  LinearProgress,
  Alert,
  alpha,
  useTheme,
  CircularProgress,
  Skeleton,
  Avatar,
  useMediaQuery
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Store as StoreIcon,
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  Image as ImageIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  ArrowForward as ArrowForwardIcon,
  Add as AddIcon,
  Storage as StorageIcon
} from '@mui/icons-material';
import { illustrationAPI, manufacturerAPI, carModelAPI, engineModelAPI } from '../../api/illustrations';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CreateIllustrationModal from '../../components/forms/CreateIllustrationModal';

const Dashboard = () => {
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
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

  const StatCard = ({ title, value, icon, color, onClick, loading }) => (
    <Card 
      sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        background: isMobile 
          ? `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.9)} 100%)`
          : `linear-gradient(135deg, ${color} 0%, ${alpha(color, 0.85)} 100%)`,
        color: 'white',
        transition: 'all 0.2s ease',
        borderRadius: isMobile ? 3 : 2,
        boxShadow: isMobile ? 2 : 1,
        '&:active': onClick ? {
          transform: 'scale(0.97)',
        } : {},
        '&:hover': !isMobile && onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 6
        } : {}
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: isMobile ? 2 : 3 }}>
        <Stack direction={isMobile ? 'row' : 'column'} spacing={isMobile ? 1.5 : 2} alignItems={isMobile ? 'center' : 'flex-start'}>
          <Box sx={{ 
            opacity: 0.95,
            bgcolor: 'rgba(255,255,255,0.2)',
            borderRadius: isMobile ? 2 : 1,
            p: isMobile ? 1 : 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {React.cloneElement(icon, { 
              sx: { fontSize: isMobile ? 28 : 40 } 
            })}
          </Box>
          
          <Stack spacing={0.5} flex={1}>
            {loading ? (
              <Skeleton 
                variant="text" 
                width={isMobile ? '80px' : '60%'}
                height={isMobile ? 32 : 40} 
                sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} 
              />
            ) : (
              <Typography 
                variant={isMobile ? 'h5' : 'h3'} 
                fontWeight="bold"
                sx={{ lineHeight: 1 }}
              >
                {value.toLocaleString()}
              </Typography>
            )}
            
            <Typography 
              variant={isMobile ? 'caption' : 'body1'} 
              sx={{ opacity: 0.9, fontWeight: isMobile ? 600 : 500 }}
            >
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
      <Paper 
        sx={{ 
          p: isMobile ? 1.5 : 2.5,
          borderRadius: isMobile ? 3 : 2,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          border: isMobile ? `1px solid ${theme.palette.divider}` : 'none',
          boxShadow: isMobile ? 0 : 1,
          '&:active': isMobile ? {
            bgcolor: alpha(theme.palette.primary.main, 0.04),
            transform: 'scale(0.98)'
          } : {},
          '&:hover': !isMobile ? {
            boxShadow: 4,
            transform: 'translateY(-2px)'
          } : {}
        }}
        onClick={() => navigate(`/illustrations/${illustration.id}`)}
      >
        <Stack direction="row" spacing={isMobile ? 1.5 : 2} alignItems="center">
          <Box sx={{ 
            width: isMobile ? 60 : 64,
            height: isMobile ? 60 : 64,
            borderRadius: isMobile ? 2.5 : 2,
            backgroundColor: firstFile ? 'transparent' : alpha(theme.palette.primary.main, 0.08),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            flexShrink: 0,
            border: isMobile && !firstFile ? `2px dashed ${alpha(theme.palette.primary.main, 0.3)}` : 'none'
          }}>
            {firstFile ? (
              <img 
                src={firstFile.file} 
                alt={illustration.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <ImageIcon color="primary" sx={{ fontSize: isMobile ? 26 : 32 }} />
            )}
          </Box>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant={isMobile ? 'body1' : 'h6'} 
              fontWeight={isMobile ? 600 : 'bold'}
              gutterBottom 
              noWrap
              sx={{ mb: isMobile ? 0.5 : 1 }}
            >
              {illustration.title || 'タイトルなし'}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ gap: 0.5 }}>
              {illustration.part_category?.name && (
                <Chip 
                  label={illustration.part_category.name}
                  size="small"
                  sx={{ 
                    height: isMobile ? 22 : 24,
                    fontSize: isMobile ? '0.7rem' : '0.75rem',
                    fontWeight: 600,
                    borderRadius: isMobile ? 1.5 : 1
                  }}
                />
              )}
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  fontSize: isMobile ? '0.7rem' : '0.75rem',
                  fontWeight: 500 
                }}
              >
                {timeAgo}
              </Typography>
            </Stack>
          </Box>
          
          {!isMobile && (
            <ArrowForwardIcon 
              color="action" 
              sx={{ fontSize: 24 }} 
            />
          )}
        </Stack>
      </Paper>
    );
  };

  if (stats.loading && !refreshing) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
      }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={60} sx={{ color: 'white' }} />
          <Typography variant="body1" color="white">
            読み込み中...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default',
      pb: { xs: 2, sm: 4 }
    }}>
      {/* ヘッダー */}
      <Paper 
        elevation={0}
        sx={{ 
          borderRadius: 0,
          borderBottom: `1px solid ${theme.palette.divider}`,
          mb: isMobile ? 2 : 3,
          background: isMobile 
            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)` 
            : 'transparent',
          color: isMobile ? 'white' : 'inherit'
        }}
      >
        <Container maxWidth="xl">
          <Stack 
            direction="row" 
            justifyContent="space-between" 
            alignItems="center"
            py={isMobile ? 2.5 : 3}
          >
            <Box>
              <Typography 
                variant={isMobile ? 'h5' : 'h5'} 
                fontWeight="bold"
                sx={{ mb: isMobile ? 0.5 : 0 }}
              >
                ダッシュボード
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: isMobile ? '0.8rem' : '0.875rem',
                  opacity: isMobile ? 0.95 : 0.7,
                  color: isMobile ? 'inherit' : 'text.secondary',
                  fontWeight: isMobile ? 500 : 400
                }}
              >
                {user?.first_name || user?.username || 'ゲスト'}さん、ようこそ！
              </Typography>
            </Box>
            
            <IconButton 
              onClick={() => fetchDashboardData(true)} 
              disabled={refreshing}
              size="medium"
              sx={{
                bgcolor: isMobile ? 'rgba(255,255,255,0.2)' : 'transparent',
                color: isMobile ? 'white' : 'inherit',
                '&:hover': {
                  bgcolor: isMobile ? 'rgba(255,255,255,0.3)' : 'action.hover'
                }
              }}
            >
              <RefreshIcon 
                sx={{ 
                  animation: refreshing ? 'spin 1s linear infinite' : 'none',
                  fontSize: 24
                }} 
              />
            </IconButton>
          </Stack>
        </Container>
      </Paper>

      <Container maxWidth="xl">
        {/* エラーアラート */}
        {stats.error && (
          <Alert 
            severity="error"
            sx={{ mb: { xs: 2, sm: 3 } }}
            action={
              <Button color="inherit" size="small" onClick={() => fetchDashboardData(true)}>
                再試行
              </Button>
            }
          >
            {stats.error}
          </Alert>
        )}

        {/* 統計カード */}
        <Grid container spacing={isMobile ? 1.5 : 3} mb={isMobile ? 2.5 : 4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="イラスト"
              value={stats.totalIllustrations}
              icon={<ImageIcon />}
              color={theme.palette.primary.main}
              onClick={() => navigate('/illustrations')}
              loading={stats.loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="メーカー"
              value={stats.totalManufacturers}
              icon={<StoreIcon />}
              color={theme.palette.success.main}
              onClick={() => navigate('/manufacturers')}
              loading={stats.loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="車種"
              value={stats.totalCarModels}
              icon={<CarIcon />}
              color={theme.palette.warning.main}
              onClick={() => navigate('/car-models')}
              loading={stats.loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="エンジン"
              value={stats.totalEngineModels}
              icon={<BuildIcon />}
              color={theme.palette.error.main}
              onClick={() => navigate('/engine-models')}
              loading={stats.loading}
            />
          </Grid>
        </Grid>

        {/* クイックアクション */}
        <Box mb={isMobile ? 2.5 : 4}>
          <Typography 
            variant={isMobile ? 'body1' : 'h6'} 
            fontWeight="bold" 
            mb={isMobile ? 1.5 : 2}
          >
            クイックアクション
          </Typography>
          <Grid container spacing={isMobile ? 1.5 : 2}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<AddIcon />}
                onClick={() => setCreateModalOpen(true)}
                sx={{ 
                  py: isMobile ? 1.75 : 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                  fontSize: isMobile ? '0.95rem' : '1rem',
                  fontWeight: 600,
                  borderRadius: isMobile ? 3 : 1,
                  textTransform: 'none',
                  boxShadow: isMobile ? 3 : 2
                }}
              >
                新規イラスト作成
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<ImageIcon />}
                onClick={() => navigate('/illustrations')}
                sx={{ 
                  py: isMobile ? 1.75 : 2,
                  fontSize: isMobile ? '0.95rem' : '1rem',
                  fontWeight: 600,
                  borderRadius: isMobile ? 3 : 1,
                  borderWidth: isMobile ? 2 : 1,
                  textTransform: 'none'
                }}
              >
                すべて表示
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Grid container spacing={isMobile ? 2 : 3}>
          {/* 最近のイラスト */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ 
              p: isMobile ? 2 : 3,
              borderRadius: isMobile ? 3 : 2,
              boxShadow: isMobile ? 1 : 'inherit'
            }}>
              <Stack 
                direction="row" 
                justifyContent="space-between" 
                alignItems="center" 
                mb={isMobile ? 2 : 3}
              >
                <Typography 
                  variant={isMobile ? 'body1' : 'h6'} 
                  fontWeight="bold"
                >
                  最近のイラスト
                </Typography>
                <Button 
                  size="small"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate('/illustrations')}
                  sx={{
                    fontSize: isMobile ? '0.8rem' : '0.875rem',
                    fontWeight: 600,
                    textTransform: 'none'
                  }}
                >
                  すべて
                </Button>
              </Stack>

              <Stack spacing={isMobile ? 1.5 : 2}>
                {stats.loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton 
                      key={i} 
                      variant="rectangular" 
                      height={isMobile ? 76 : 96} 
                      sx={{ borderRadius: isMobile ? 3 : 2 }} 
                    />
                  ))
                ) : stats.recentIllustrations.length > 0 ? (
                  stats.recentIllustrations.map((illustration) => (
                    <IllustrationCard key={illustration.id} illustration={illustration} />
                  ))
                ) : (
                  <Box sx={{ textAlign: 'center', py: isMobile ? 6 : 6 }}>
                    <ImageIcon sx={{ 
                      fontSize: isMobile ? 56 : 64,
                      color: 'grey.300',
                      mb: 1.5 
                    }} />
                    <Typography 
                      variant={isMobile ? 'body2' : 'subtitle2'} 
                      color="text.secondary"
                      fontWeight={500}
                    >
                      イラストがまだありません
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Grid>

          {/* システム状態 & インサイト */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={isMobile ? 2 : 3}>
              {/* システム状態 */}
              <Paper sx={{ 
                p: isMobile ? 2 : 3,
                borderRadius: isMobile ? 3 : 2,
                boxShadow: isMobile ? 1 : 'inherit'
              }}>
                <Stack 
                  direction="row" 
                  justifyContent="space-between" 
                  alignItems="center" 
                  mb={2}
                >
                  <Typography 
                    variant={isMobile ? 'body1' : 'h6'} 
                    fontWeight="bold"
                  >
                    システム状態
                  </Typography>
                  <Chip 
                    label="良好" 
                    size="small" 
                    color="success"
                    icon={<StorageIcon sx={{ fontSize: 14 }} />}
                    sx={{
                      fontWeight: 600,
                      fontSize: isMobile ? '0.7rem' : '0.75rem'
                    }}
                  />
                </Stack>
                
                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                      <Typography 
                        variant="caption" 
                        fontWeight={600}
                        sx={{ fontSize: isMobile ? '0.75rem' : '0.8rem' }}
                      >
                        API
                      </Typography>
                      <Typography 
                        variant="caption" 
                        fontWeight="bold"
                        sx={{ fontSize: isMobile ? '0.75rem' : '0.8rem' }}
                      >
                        98%
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={98} 
                      sx={{ 
                        height: isMobile ? 8 : 8,
                        borderRadius: 4 
                      }} 
                      color="success" 
                    />
                  </Box>
                  
                  <Box>
                    <Stack direction="row" justifyContent="space-between" mb={0.5}>
                      <Typography 
                        variant="caption"
                        fontWeight={600}
                        sx={{ fontSize: isMobile ? '0.75rem' : '0.8rem' }}
                      >
                        データベース
                      </Typography>
                      <Typography 
                        variant="caption" 
                        fontWeight="bold"
                        sx={{ fontSize: isMobile ? '0.75rem' : '0.8rem' }}
                      >
                        85%
                      </Typography>
                    </Stack>
                    <LinearProgress 
                      variant="determinate" 
                      value={85} 
                      sx={{ 
                        height: isMobile ? 8 : 8,
                        borderRadius: 4 
                      }} 
                    />
                  </Box>
                </Stack>
              </Paper>

              {/* 週間インサイト */}
              <Paper sx={{ 
                p: isMobile ? 2.5 : 3,
                borderRadius: isMobile ? 3 : 2,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: 'white',
                boxShadow: isMobile ? 3 : 2
              }}>
                <Stack 
                  direction="row" 
                  justifyContent="space-between" 
                  alignItems="start" 
                  mb={isMobile ? 2.5 : 3}
                >
                  <Box>
                    <Typography 
                      variant={isMobile ? 'body1' : 'h6'} 
                      fontWeight="bold"
                    >
                      週間インサイト
                    </Typography>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        opacity: 0.9,
                        fontSize: isMobile ? '0.75rem' : '0.8rem',
                        fontWeight: 500
                      }}
                    >
                      生産性のサマリー
                    </Typography>
                  </Box>
                  <TrendingUpIcon sx={{ fontSize: isMobile ? 28 : 28 }} />
                </Stack>
                
                <Grid container spacing={isMobile ? 1.5 : 1.5}>
                  <Grid item xs={4}>
                    <Box sx={{ 
                      p: isMobile ? 2 : 2,
                      borderRadius: isMobile ? 2.5 : 2,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      textAlign: 'center'
                    }}>
                      <Typography 
                        variant={isMobile ? 'h5' : 'h5'} 
                        fontWeight="bold"
                      >
                        +24
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          opacity: 0.9,
                          fontSize: isMobile ? '0.7rem' : '0.75rem',
                          fontWeight: 500
                        }}
                      >
                        新規
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ 
                      p: isMobile ? 2 : 2,
                      borderRadius: isMobile ? 2.5 : 2,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      textAlign: 'center'
                    }}>
                      <Typography 
                        variant={isMobile ? 'h5' : 'h5'} 
                        fontWeight="bold"
                      >
                        89%
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          opacity: 0.9,
                          fontSize: isMobile ? '0.7rem' : '0.75rem',
                          fontWeight: 500
                        }}
                      >
                        完了率
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={4}>
                    <Box sx={{ 
                      p: isMobile ? 2 : 2,
                      borderRadius: isMobile ? 2.5 : 2,
                      bgcolor: 'rgba(255,255,255,0.2)',
                      textAlign: 'center'
                    }}>
                      <Typography 
                        variant={isMobile ? 'h5' : 'h5'} 
                        fontWeight="bold"
                      >
                        5.2h
                      </Typography>
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          opacity: 0.9,
                          fontSize: isMobile ? '0.7rem' : '0.75rem',
                          fontWeight: 500
                        }}
                      >
                        平均
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* 作成モーダル */}
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
    </Box>
  );
};

export default Dashboard;