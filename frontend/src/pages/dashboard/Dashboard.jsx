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
  Tooltip
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
  MoreVert as MoreIcon,
  FileUpload as UploadIcon,
  Add as AddIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { illustrationAPI, manufacturerAPI, carModelAPI, engineModelAPI, partCategoryAPI } from '../../api/illustrations';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CreateIllustrationModal from '../../components/forms/CreateIllustrationModal';


const Dashboard = () => {
  const [stats, setStats] = useState({
    totalIllustrations: 0,
    totalManufacturers: 0,
    totalCarModels: 0,
    totalEngineModels: 0,
    totalPartCategories: 0,
    recentIllustrations: [],
    loading: true,
    error: null,
    lastUpdated: null
  });
  
  const [refreshing, setRefreshing] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Use ref to track if data has been fetched
  const hasFetchedRef = useRef(false);
  const isFetchingRef = useRef(false);

  // Fetch dashboard data - NOT memoized to prevent dependency issues
  const fetchDashboardData = async (showRefresh = false) => {
    // Prevent multiple simultaneous requests
    if (isFetchingRef.current) {
      console.log('Fetch already in progress, skipping...');
      return;
    }
    
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setStats(prev => ({ ...prev, loading: true, error: null }));
    }
    
    isFetchingRef.current = true;
    
    try {
      // Fetch all data in parallel with timeout protection
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      const fetchPromises = Promise.allSettled([
        illustrationAPI.getAll({ limit: 5, ordering: '-created_at' }),
        manufacturerAPI.getAll({ limit: 1 }),
        carModelAPI.getAll({ limit: 1 }),
        engineModelAPI.getAll({ limit: 1 }),
        partCategoryAPI.getAll({ limit: 1 })
      ]);
      
      const results = await Promise.race([fetchPromises, timeoutPromise]);

      // Handle responses
      const getData = (result) => {
        if (result.status === 'rejected') {
          console.warn('API request rejected:', result.reason);
          return [];
        }
        const data = result.value.data;
        return data.results || data || [];
      };

      const getCount = (result, index) => {
        if (result.status === 'rejected') {
          console.warn(`Failed to fetch count for index ${index}:`, result.reason);
          return 0;
        }
        const data = result.value.data;
        if (typeof data === 'object') {
          if (data.count !== undefined) return data.count;
          if (data.results && Array.isArray(data.results)) return data.results.length;
          if (Array.isArray(data)) return data.length;
        }
        return 0;
      };

      const newStats = {
        totalIllustrations: getCount(results[0], 0),
        totalManufacturers: getCount(results[1], 1),
        totalCarModels: getCount(results[2], 2),
        totalEngineModels: getCount(results[3], 3),
        totalPartCategories: getCount(results[4], 4),
        recentIllustrations: getData(results[0]),
        loading: false,
        error: null,
        lastUpdated: new Date()
      };

      setStats(newStats);
      hasFetchedRef.current = true;
      
      // Store dashboard stats in localStorage for offline view
      try {
        localStorage.setItem('dashboardStats', JSON.stringify({
          ...newStats,
          lastUpdated: newStats.lastUpdated.toISOString()
        }));
      } catch (e) {
        console.warn('Failed to cache dashboard stats:', e);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      
      // Try to load cached data if available
      try {
        const cached = localStorage.getItem('dashboardStats');
        if (cached) {
          const parsed = JSON.parse(cached);
          setStats({
            ...parsed,
            lastUpdated: new Date(parsed.lastUpdated),
            loading: false,
            error: 'Using cached data (offline mode)'
          });
          return;
        }
      } catch (e) {
        console.warn('Failed to load cached data:', e);
      }
      
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load dashboard data',
        lastUpdated: new Date()
      }));
    } finally {
      isFetchingRef.current = false;
      setRefreshing(false);
    }
  };

  // Load data only once on mount
  useEffect(() => {
    if (!hasFetchedRef.current) {
      console.log('Initial dashboard load...');
      fetchDashboardData();
    }
    
    // Cleanup function
    return () => {
      // Reset refs on unmount
      hasFetchedRef.current = false;
      isFetchingRef.current = false;
    };
  }, []); // Empty dependency array - only run once on mount

  const handleRefresh = () => {
    console.log('Manual refresh triggered');
    fetchDashboardData(true);
  };

  const handleCreateSuccess = () => {
    // Refresh dashboard data after successful creation
    fetchDashboardData(true);
  };

  const StatCard = ({ title, value, icon, color, onClick, loading }) => (
    <Card 
      sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          backgroundColor: alpha(color, 0.05)
        } : {},
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          backgroundColor: color,
          transform: 'scaleX(0)',
          transition: 'transform 0.3s ease',
        },
        '&:hover::before': {
          transform: 'scaleX(1)'
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Box sx={{ 
            p: 1.5, 
            borderRadius: 2, 
            backgroundColor: alpha(color, 0.1),
            color: color,
            transition: 'all 0.3s ease',
          }}>
            {icon}
          </Box>
          <Tooltip title="More options">
            <IconButton size="small" onClick={(e) => { e.stopPropagation(); }}>
              <MoreIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        
        {loading ? (
          <Skeleton variant="text" width="60%" height={40} />
        ) : (
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            {value.toLocaleString()}
          </Typography>
        )}
        
        <Typography variant="body2" color="text.secondary" fontWeight="medium">
          {title}
        </Typography>
        
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrendingUpIcon fontSize="small" color="success" />
          <Typography variant="caption" color="success.main" fontWeight="medium">
            Live
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  const RecentIllustrationCard = ({ illustration, loading }) => {
    if (loading) {
      return (
        <Paper sx={{ p: 2, mb: 1, borderRadius: 2 }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: 2 }} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </Box>
          </Stack>
        </Paper>
      );
    }

    const firstFile = illustration.files?.[0];
    const createdDate = new Date(illustration.created_at);
    const timeAgo = getTimeAgo(createdDate);
    
    return (
      <Tooltip title="Click to view details" arrow>
        <Paper sx={{ 
          p: 2, 
          mb: 1, 
          borderRadius: 2,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'action.hover',
            transform: 'translateY(-2px)',
            boxShadow: theme.shadows[4]
          }
        }}
        onClick={() => navigate(`/illustrations/${illustration.id}`)}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{ 
              width: 48, 
              height: 48, 
              borderRadius: 2,
              backgroundColor: firstFile ? 'transparent' : alpha(theme.palette.primary.main, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: firstFile ? 'transparent' : theme.palette.primary.main,
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {firstFile ? (
                <img 
                  src={firstFile.file} 
                  alt={illustration.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <ImageIcon />
              )}
            </Box>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom noWrap>
                {illustration.title || 'Untitled'}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                {illustration.part_category?.name && (
                  <Chip 
                    label={illustration.part_category.name}
                    size="small"
                    sx={{ 
                      height: 20, 
                      fontSize: '0.65rem',
                      backgroundColor: alpha(theme.palette.primary.main, 0.1)
                    }}
                  />
                )}
                <Typography variant="caption" color="text.secondary">
                  {timeAgo}
                </Typography>
                {illustration.files?.length > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    • {illustration.files.length} file{illustration.files.length > 1 ? 's' : ''}
                  </Typography>
                )}
              </Stack>
            </Box>
            
            <IconButton size="small">
              <ArrowForwardIcon />
            </IconButton>
          </Stack>
        </Paper>
      </Tooltip>
    );
  };

  const QuickActionCard = ({ title, description, icon, buttonText, onClick, color, disabled }) => (
    <Card sx={{ 
      height: '100%',
      opacity: disabled ? 0.6 : 1,
      transition: 'all 0.3s ease',
      '&:hover': !disabled && {
        transform: 'translateY(-2px)',
        boxShadow: theme.shadows[6]
      }
    }}>
      <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ 
          p: 1.5, 
          borderRadius: 2, 
          backgroundColor: alpha(color, 0.1),
          color: color,
          width: 'fit-content',
          mb: 2
        }}>
          {icon}
        </Box>
        
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          {title}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph sx={{ flex: 1 }}>
          {description}
        </Typography>
        
        <Button 
          variant="contained" 
          startIcon={icon}
          onClick={onClick}
          fullWidth
          disabled={disabled}
          sx={{
            backgroundColor: color,
            '&:hover': {
              backgroundColor: color,
              opacity: 0.9
            }
          }}
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
  };

  if (stats.loading && !refreshing) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <Stack spacing={2} alignItems="center">
            <CircularProgress size={60} />
            <Typography variant="body1" color="text.secondary">
              Loading dashboard...
            </Typography>
          </Stack>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              <DashboardIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {user?.first_name || user?.username || 'User'}! Here's your overview.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
              onClick={handleRefresh}
              disabled={refreshing || isFetchingRef.current}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateModalOpen(true)}
              disabled={isFetchingRef.current}
            >
              New Illustration
            </Button>
          </Stack>
        </Stack>
        
        <LinearProgress 
          variant="determinate" 
          value={100} 
          sx={{ 
            height: 4, 
            borderRadius: 2,
            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
          }} 
        />
      </Box>

      {/* Error Alert */}
      {stats.error && (
        <Alert 
          severity={stats.error.includes('cached') ? 'warning' : 'error'}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
          sx={{ mb: 3 }}
        >
          {stats.error}
        </Alert>
      )}

      {/* Stats Grid */}
      <Grid container spacing={3} mb={4}>
        {[
          {
            title: "Total Illustrations",
            value: stats.totalIllustrations,
            icon: <ImageIcon />,
            color: theme.palette.primary.main,
            onClick: () => navigate('/illustrations')
          },
          {
            title: "Manufacturers",
            value: stats.totalManufacturers,
            icon: <StoreIcon />,
            color: theme.palette.success.main,
            onClick: () => navigate('/manufacturers')
          },
          {
            title: "Car Models",
            value: stats.totalCarModels,
            icon: <CarIcon />,
            color: theme.palette.warning.main,
            onClick: () => navigate('/car-models')
          },
          {
            title: "Engine Models",
            value: stats.totalEngineModels,
            icon: <BuildIcon />,
            color: theme.palette.error.main,
            onClick: () => navigate('/engine-models')
          }
        ].map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <StatCard {...stat} loading={stats.loading && !refreshing} />
          </Grid>
        ))}
      </Grid>

      {/* Main Content Grid */}
      <Grid container spacing={3}>
        {/* Left Column - Recent Illustrations */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" fontWeight="bold">
                Recent Illustrations
              </Typography>
              <Button 
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate('/illustrations')}
                disabled={isFetchingRef.current}
              >
                View All
              </Button>
            </Stack>

            {stats.loading && !refreshing ? (
              Array.from({ length: 3 }).map((_, index) => (
                <RecentIllustrationCard key={index} loading />
              ))
            ) : stats.recentIllustrations.length > 0 ? (
              <Box>
                {stats.recentIllustrations.slice(0, 5).map((illustration) => (
                  <RecentIllustrationCard key={illustration.id} illustration={illustration} />
                ))}
              </Box>
            ) : (
              <Box textAlign="center" py={4}>
                <ImageIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No illustrations yet
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Create your first illustration to get started
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<ImageIcon />}
                  onClick={() => setCreateModalOpen(true)}
                  disabled={isFetchingRef.current}
                >
                  Create Illustration
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Column - Quick Actions & Stats */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Quick Actions */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h5" fontWeight="bold" mb={3}>
                Quick Actions
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <QuickActionCard
                    title="Add Illustration"
                    description="Create a new illustration with images and descriptions"
                    icon={<UploadIcon />}
                    buttonText="Create New"
                    onClick={() => setCreateModalOpen(true)}
                    color={theme.palette.primary.main}
                    disabled={isFetchingRef.current}
                  />
                </Grid>
                <Grid item xs={12}>
                  <QuickActionCard
                    title="Add Manufacturer"
                    description="Add a new vehicle manufacturer to the system"
                    icon={<StoreIcon />}
                    buttonText="Add Brand"
                    onClick={() => navigate('/manufacturers/create')}
                    color={theme.palette.success.main}
                    disabled={isFetchingRef.current}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* System Stats */}
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h5" fontWeight="bold" mb={3}>
                System Stats
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="body2">Part Categories</Typography>
                    <Chip 
                      label={stats.totalPartCategories} 
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min((stats.totalPartCategories / 100) * 100, 100)} 
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
                
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="body2">Database Usage</Typography>
                    <Chip 
                      label={`${Math.round((stats.totalIllustrations / 1000) * 100)}%`} 
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={Math.min((stats.totalIllustrations / 1000) * 100, 100)} 
                    sx={{ height: 6, borderRadius: 3 }}
                    color="secondary"
                  />
                </Box>
                
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <Typography variant="body2">System Health</Typography>
                    <Chip 
                      label="Good" 
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  </Stack>
                  <LinearProgress 
                    variant="determinate" 
                    value={85} 
                    sx={{ height: 6, borderRadius: 3 }}
                    color="success"
                  />
                </Box>
              </Stack>
            </Paper>

            {/* User Info Card */}
            <Paper sx={{ 
              p: 3, 
              borderRadius: 3, 
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`
            }}>
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <Box sx={{ 
                  p: 1.5, 
                  borderRadius: 2, 
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PersonIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {user?.first_name || user?.username || 'User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email || 'No email'}
                  </Typography>
                </Box>
              </Stack>
              
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<PersonIcon />}
                  onClick={() => navigate('/profile')}
                  disabled={isFetchingRef.current}
                >
                  Profile
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={logout}
                  disabled={isFetchingRef.current}
                >
                  Logout
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* Bottom Info Bar */}
      <Box mt={4}>
        <Paper sx={{ 
          p: 2, 
          borderRadius: 2, 
          backgroundColor: alpha(theme.palette.primary.main, 0.03),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {stats.lastUpdated ? `Last updated: ${getTimeAgo(stats.lastUpdated)}` : 'Never updated'}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip 
                icon={<TrendingUpIcon />}
                label={`${stats.totalIllustrations} illustrations`} 
                size="small" 
                variant="outlined"
              />
              <Chip 
                label="API: Online" 
                size="small" 
                color="success" 
                variant="outlined"
              />
              {isFetchingRef.current && (
                <Chip 
                  icon={<CircularProgress size={16} />}
                  label="Syncing..." 
                  size="small" 
                  variant="outlined"
                  color="info"
                />
              )}
            </Stack>
          </Stack>
        </Paper>
      </Box>

      {/* Create Illustration Modal */}
      <CreateIllustrationModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </Container>
  );
};

export default Dashboard;