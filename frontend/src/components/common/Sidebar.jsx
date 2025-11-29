import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/users';
import {
  Box, Drawer, Typography, Divider, Button, List, ListItemButton,
  ListItemIcon, ListItemText, Avatar, IconButton, Tooltip, useTheme,
  alpha, Paper, Chip, Badge, Fade, Zoom, Collapse, LinearProgress,
  useMediaQuery, SwipeableDrawer, AppBar, Toolbar, BottomNavigation,
  BottomNavigationAction, Fab, Slide
} from '@mui/material';
import {
  Dashboard, People, Info, Logout, Settings, Analytics,
  Notifications, Menu, ChevronLeft, Business, VerifiedUser,
  AccountBalance, Api, Store, TrendingUp, ExpandLess, ExpandMore,
  FiberManualRecord, DirectionsCar, LocalShipping, ElectricCar,
  CarRental, LocalParking, Add, Home, Search, AccountCircle
} from '@mui/icons-material';

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 70;

// Car illustrations data
const carIllustrations = [
  { icon: <DirectionsCar />, color: '#667eea', label: 'Sedan' },
  { icon: <LocalShipping />, color: '#764ba2', label: 'Truck' },
  { icon: <ElectricCar />, color: '#23ab55', label: 'Electric' },
  { icon: <CarRental />, color: '#fd7e14', label: 'Rental' },
  { icon: <LocalParking />, color: '#28a745', label: 'Parking' }
];

const Sidebar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  // Mobile detection
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [notifications, setNotifications] = useState(3);
  const [selectedCar, setSelectedCar] = useState(0);
  const [bottomNavValue, setBottomNavValue] = useState(0);

  // Bottom navigation items
  const bottomNavItems = [
    { label: 'Home', icon: <Home />, path: '/' },
    { label: 'Stores', icon: <Store />, path: '/stores' },
    { label: 'Add', icon: <Add />, path: '/add' },
    { label: 'Analytics', icon: <Analytics />, path: '/analytics' },
    { label: 'Menu', icon: <Menu />, path: '/menu' },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) return setLoading(false);
      try {
        const data = await usersAPI.getProfile();
        setProfile(data);
      } catch (error) {
        console.error('Profile fetch failed:', error);
        setProfile(user);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isAuthenticated, user]);

  // Auto-rotate car illustrations
  useEffect(() => {
    const interval = setInterval(() => {
      setSelectedCar((prev) => (prev + 1) % carIllustrations.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Update bottom nav based on current route
  useEffect(() => {
    const currentIndex = bottomNavItems.findIndex(item => item.path === location.pathname);
    if (currentIndex !== -1) {
      setBottomNavValue(currentIndex);
    }
  }, [location.pathname]);

  const userProfile = profile || user;

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/',
      color: '#667eea',
      badge: null
    },
    {
      text: 'Stores',
      icon: <Store />,
      path: '/stores',
      color: '#23ab55',
      badge: 5,
      subItems: [
        { text: 'All Stores', path: '/stores' },
        { text: 'Add Store', path: '/stores/add' }
      ]
    },
    {
      text: 'Analytics',
      icon: <Analytics />,
      path: '/analytics',
      color: '#fd7e14',
      badge: null,
      subItems: [
        { text: 'Overview', path: '/analytics' },
        { text: 'Reports', path: '/analytics/reports' }
      ]
    },
    {
      text: 'Users',
      icon: <People />,
      path: '/users',
      color: '#28a745',
      requiresAdmin: true
    },
    {
      text: 'Projects',
      icon: <Business />,
      path: '/projects',
      color: '#6f42c1'
    },
    {
      text: 'Settings',
      icon: <Settings />,
      path: '/settings',
      color: '#6c757d'
    },
    {
      text: 'API Docs',
      icon: <Api />,
      external: 'http://127.0.0.1:8000/swagger/',
      color: '#ff6b35'
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.requiresAdmin || userProfile?.is_staff || userProfile?.is_superuser
  );

  const isActive = (path) => location.pathname === path;

  const toggleSubmenu = (text) => {
    setExpandedMenus(prev => ({ ...prev, [text]: !prev[text] }));
  };

  const handleNavigation = (item) => {
    if (item.external) {
      window.open(item.external, '_blank', 'noopener,noreferrer');
    } else {
      navigate(item.path);
      if (isMobile) setMobileOpen(false);
      if (collapsed) setCollapsed(false);
    }
  };

  const handleBottomNavChange = (event, newValue) => {
    setBottomNavValue(newValue);
    const item = bottomNavItems[newValue];
    if (item.path === '/add') {
      // Handle add action
      navigate('/transactions/new');
    } else if (item.path === '/menu') {
      setMobileOpen(true);
    } else {
      navigate(item.path);
    }
  };

  const getUserInitial = () => {
    if (userProfile?.first_name && userProfile?.last_name) 
      return `${userProfile.first_name[0]}${userProfile.last_name[0]}`;
    return userProfile?.username?.[0]?.toUpperCase() || 'U';
  };

  const getUserRole = () => {
    if (userProfile?.is_superuser) return 'Super Admin';
    if (userProfile?.is_staff) return 'Admin';
    return 'User';
  };

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  // Drawer content
  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: isMobile 
          ? theme.palette.background.paper
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        color: isMobile ? theme.palette.text.primary : 'white'
      }}
    >
      {/* Animated Car Illustration Background */}
      {!isMobile && (
        <Box
          sx={{
            position: 'absolute',
            top: 80,
            right: -30,
            width: 120,
            height: 120,
            opacity: 0.1,
            transition: 'all 0.5s ease',
            transform: `rotate(${selectedCar * 15}deg)`,
            color: 'white',
            '& svg': { fontSize: 120 }
          }}
        >
          {carIllustrations[selectedCar].icon}
        </Box>
      )}

      {/* Decorative Background */}
      {!isMobile && (
        <>
          <Box sx={{ position: 'absolute', top: -50, right: -50, width: 120, height: 120, borderRadius: '50%', background: alpha('#fff', 0.08) }} />
          <Box sx={{ position: 'absolute', bottom: -30, left: -30, width: 80, height: 80, borderRadius: '50%', background: alpha('#fff', 0.05) }} />
        </>
      )}

      {/* Header */}
      <Box sx={{ p: isMobile ? 2 : 2, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: isMobile ? 2 : 2 }}>
          {!collapsed && (
            <Fade in timeout={300}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box
                  sx={{
                    width: isMobile ? 42 : 36,
                    height: isMobile ? 42 : 36,
                    borderRadius: 2,
                    background: isMobile ? theme.palette.primary.main : 'rgba(255,255,255,0.95)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                  }}
                >
                  <Typography sx={{ 
                    fontSize: isMobile ? 22 : 18, 
                    fontWeight: 700,
                    color: isMobile ? 'white' : 'inherit'
                  }}>
                    🚗
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ 
                    color: isMobile ? theme.palette.text.primary : 'white', 
                    fontWeight: 800, 
                    fontSize: isMobile ? 18 : 16, 
                    lineHeight: 1.2 
                  }}>
                    CashBook
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: isMobile ? theme.palette.text.secondary : alpha('#fff', 0.8), 
                    fontSize: isMobile ? 10 : 9, 
                    letterSpacing: 1, 
                    textTransform: 'uppercase' 
                  }}>
                    Car Manager
                  </Typography>
                </Box>
              </Box>
            </Fade>
          )}
          
          {!isMobile && (
            <Tooltip title={collapsed ? 'Expand' : 'Collapse'} arrow>
              <IconButton
                onClick={() => setCollapsed(!collapsed)}
                sx={{
                  color: isMobile ? theme.palette.text.primary : 'white',
                  bgcolor: isMobile ? alpha(theme.palette.primary.main, 0.1) : alpha('#fff', 0.15),
                  width: 40,
                  height: 40,
                  '&:hover': { 
                    bgcolor: isMobile ? alpha(theme.palette.primary.main, 0.2) : alpha('#fff', 0.25), 
                    transform: 'scale(1.05)' 
                  },
                  transition: 'all 0.2s'
                }}
              >
                {collapsed ? <Menu fontSize="small" /> : <ChevronLeft fontSize="small" />}
              </IconButton>
            </Tooltip>
          )}
        </Box>

        {/* User Profile Card */}
        <Paper
          elevation={isMobile ? 1 : 0}
          sx={{
            p: collapsed ? 1.5 : isMobile ? 2.5 : 2,
            bgcolor: isMobile ? theme.palette.background.default : alpha('#fff', 0.12),
            backdropFilter: isMobile ? 'none' : 'blur(20px)',
            borderRadius: isMobile ? 3 : 2,
            border: isMobile ? 'none' : `1px solid ${alpha('#fff', 0.2)}`,
            transition: 'all 0.3s',
            '&:hover': { 
              bgcolor: isMobile ? alpha(theme.palette.primary.main, 0.05) : alpha('#fff', 0.18), 
              transform: 'translateY(-2px)' 
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: collapsed ? 0 : isMobile ? 2 : 1.5, justifyContent: collapsed ? 'center' : 'flex-start' }}>
            <Zoom in timeout={400}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  <Box sx={{ 
                    width: isMobile ? 14 : 12, 
                    height: isMobile ? 14 : 12, 
                    borderRadius: '50%', 
                    bgcolor: '#4ade80', 
                    border: '2px solid white' 
                  }} />
                }
              >
                <Avatar
                  src={userProfile?.profile_image}
                  sx={{
                    width: collapsed ? 40 : isMobile ? 56 : 48,
                    height: collapsed ? 40 : isMobile ? 56 : 48,
                    fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    border: isMobile ? '2px solid rgba(0,0,0,0.1)' : '2px solid rgba(255,255,255,0.3)',
                    fontSize: isMobile ? 22 : 18
                  }}
                >
                  {getUserInitial()}
                </Avatar>
              </Badge>
            </Zoom>

            {!collapsed && (
              <Fade in timeout={500}>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ 
                      color: isMobile ? theme.palette.text.primary : 'white', 
                      fontWeight: 700, 
                      fontSize: isMobile ? 16 : 14 
                    }} noWrap>
                      {userProfile?.username || 'User'}
                    </Typography>
                    {userProfile?.is_verified && (
                      <VerifiedUser sx={{ 
                        fontSize: isMobile ? 16 : 14, 
                        color: isMobile ? theme.palette.primary.main : '#60a5fa' 
                      }} />
                    )}
                  </Box>
                  <Typography variant="caption" sx={{ 
                    color: isMobile ? theme.palette.text.secondary : alpha('#fff', 0.8), 
                    fontSize: isMobile ? 12 : 11, 
                    display: 'block', 
                    mb: 1 
                  }} noWrap>
                    {userProfile?.email}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    <Chip
                      label={getUserRole()}
                      size="small"
                      sx={{
                        height: isMobile ? 22 : 18,
                        fontSize: isMobile ? 11 : 9,
                        fontWeight: 600,
                        bgcolor: (userProfile?.is_staff || userProfile?.is_superuser) 
                          ? (isMobile ? alpha(theme.palette.primary.main, 0.2) : 'rgba(34,197,94,0.9)')
                          : (isMobile ? alpha(theme.palette.text.secondary, 0.2) : 'rgba(156,163,175,0.9)'),
                        color: isMobile ? theme.palette.text.primary : 'white',
                        '& .MuiChip-label': { px: 1 }
                      }}
                    />
                    <Chip
                      label="Online"
                      size="small"
                      sx={{
                        height: isMobile ? 22 : 18,
                        fontSize: isMobile ? 11 : 9,
                        fontWeight: 600,
                        bgcolor: isMobile ? alpha('#4ade80', 0.2) : 'rgba(34,197,94,0.9)',
                        color: isMobile ? theme.palette.text.primary : 'white',
                        '& .MuiChip-label': { px: 1 }
                      }}
                    />
                  </Box>
                </Box>
              </Fade>
            )}
          </Box>
        </Paper>

        {/* Car Type Selector - Mobile Only */}
        {isMobile && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" sx={{ 
              color: theme.palette.text.secondary, 
              fontSize: 10, 
              mb: 1, 
              display: 'block' 
            }}>
              Quick Access
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 1 }}>
              {carIllustrations.map((car, index) => (
                <Paper
                  key={index}
                  onClick={() => setSelectedCar(index)}
                  sx={{
                    minWidth: 60,
                    height: 60,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: selectedCar === index ? alpha(theme.palette.primary.main, 0.1) : theme.palette.background.default,
                    border: `2px solid ${selectedCar === index ? theme.palette.primary.main : 'transparent'}`,
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  <Box sx={{ 
                    color: selectedCar === index ? theme.palette.primary.main : theme.palette.text.secondary, 
                    '& svg': { fontSize: 24 } 
                  }}>
                    {car.icon}
                  </Box>
                  <Typography variant="caption" sx={{ 
                    color: selectedCar === index ? theme.palette.primary.main : theme.palette.text.secondary, 
                    fontSize: 9, 
                    mt: 0.5 
                  }}>
                    {car.label}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      <Divider sx={{ bgcolor: isMobile ? theme.palette.divider : alpha('#fff', 0.2), mx: 2 }} />

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, position: 'relative', zIndex: 1, overflowY: 'auto', mt: 1 }}>
        {loading && <LinearProgress sx={{ 
          bgcolor: isMobile ? alpha(theme.palette.primary.main, 0.1) : alpha('#fff', 0.1), 
          '& .MuiLinearProgress-bar': { 
            bgcolor: isMobile ? theme.palette.primary.main : '#fff' 
          } 
        }} />}
        
        <List sx={{ px: isMobile ? 2 : 2 }}>
          {filteredMenuItems.map((item) => (
            <Box key={item.text}>
              <Tooltip title={collapsed ? item.text : ''} placement="right" arrow>
                <ListItemButton
                  onClick={() => item.subItems && !collapsed ? toggleSubmenu(item.text) : handleNavigation(item)}
                  sx={{
                    borderRadius: isMobile ? 3 : 2,
                    mb: isMobile ? 1 : 0.5,
                    minHeight: isMobile ? 52 : 44,
                    px: collapsed ? 1 : isMobile ? 2.5 : 2,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    bgcolor: isActive(item.path) 
                      ? (isMobile ? alpha(theme.palette.primary.main, 0.1) : alpha('#fff', 0.15))
                      : 'transparent',
                    border: isActive(item.path) 
                      ? `1px solid ${isMobile ? theme.palette.primary.main : alpha('#fff', 0.3)}`
                      : '1px solid transparent',
                    '&:hover': {
                      bgcolor: isMobile ? alpha(theme.palette.primary.main, 0.05) : alpha('#fff', 0.12),
                      transform: 'translateX(4px)'
                    },
                    transition: 'all 0.2s'
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: collapsed ? 'auto' : isMobile ? 40 : 36,
                      color: isActive(item.path) 
                        ? (isMobile ? theme.palette.primary.main : '#fff')
                        : (isMobile ? theme.palette.text.secondary : alpha('#fff', 0.85)),
                      '& svg': { fontSize: isMobile ? 24 : 20 }
                    }}
                  >
                    <Badge badgeContent={item.badge} color="error" variant="dot" invisible={!item.badge}>
                      {item.icon}
                    </Badge>
                  </ListItemIcon>

                  {!collapsed && (
                    <>
                      <ListItemText
                        primary={item.text}
                        sx={{
                          '& .MuiListItemText-primary': {
                            color: isActive(item.path) 
                              ? (isMobile ? theme.palette.primary.main : '#fff')
                              : (isMobile ? theme.palette.text.primary : alpha('#fff', 0.9)),
                            fontSize: isMobile ? 15 : 13,
                            fontWeight: isActive(item.path) ? 600 : 500
                          }
                        }}
                      />
                      {item.badge && (
                        <Chip label={item.badge} size="small" sx={{ 
                          height: isMobile ? 22 : 20, 
                          fontSize: isMobile ? 11 : 10, 
                          bgcolor: isMobile ? theme.palette.error.main : alpha('#dc3545', 0.9), 
                          color: 'white' 
                        }} />
                      )}
                      {item.subItems && (expandedMenus[item.text] ? <ExpandLess sx={{ fontSize: isMobile ? 22 : 18 }} /> : <ExpandMore sx={{ fontSize: isMobile ? 22 : 18 }} />)}
                    </>
                  )}
                </ListItemButton>
              </Tooltip>

              {/* Submenu */}
              {item.subItems && !collapsed && (
                <Collapse in={expandedMenus[item.text]} timeout="auto">
                  <List sx={{ pl: isMobile ? 3 : 2 }}>
                    {item.subItems.map((subItem) => (
                      <ListItemButton
                        key={subItem.path}
                        onClick={() => navigate(subItem.path)}
                        sx={{
                          borderRadius: isMobile ? 3 : 2,
                          mb: 0.5,
                          py: isMobile ? 1 : 0.75,
                          pl: isMobile ? 4 : 3,
                          bgcolor: isActive(subItem.path) 
                            ? (isMobile ? alpha(theme.palette.primary.main, 0.05) : alpha('#fff', 0.1))
                            : 'transparent',
                          '&:hover': { 
                            bgcolor: isMobile ? alpha(theme.palette.primary.main, 0.02) : alpha('#fff', 0.08) 
                          }
                        }}
                      >
                        <FiberManualRecord sx={{ 
                          fontSize: isMobile ? 10 : 8, 
                          mr: isMobile ? 2 : 1.5, 
                          color: isMobile ? theme.palette.text.secondary : alpha('#fff', 0.6) 
                        }} />
                        <ListItemText
                          primary={subItem.text}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: isMobile ? 14 : 12,
                              color: isMobile ? theme.palette.text.primary : alpha('#fff', 0.85),
                              fontWeight: isActive(subItem.path) ? 600 : 400
                            }
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              )}
            </Box>
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ position: 'relative', zIndex: 1, p: isMobile ? 2 : 2 }}>
        <Divider sx={{ bgcolor: isMobile ? theme.palette.divider : alpha('#fff', 0.2), mb: 2 }} />

        <Tooltip title={collapsed ? 'Notifications' : ''} placement="right">
          <IconButton
            sx={{
              color: isMobile ? theme.palette.text.secondary : alpha('#fff', 0.8),
              bgcolor: isMobile ? alpha(theme.palette.primary.main, 0.05) : alpha('#fff', 0.1),
              mb: 1,
              width: collapsed ? 40 : isMobile ? '100%' : '100%',
              height: isMobile ? 48 : 40,
              borderRadius: collapsed ? '50%' : isMobile ? 3 : 2,
              justifyContent: collapsed ? 'center' : 'flex-start',
              px: collapsed ? 0 : isMobile ? 2.5 : 2,
              '&:hover': { 
                bgcolor: isMobile ? alpha(theme.palette.primary.main, 0.1) : alpha('#fff', 0.2) 
              }
            }}
          >
            <Badge badgeContent={notifications} color="error">
              <Notifications sx={{ fontSize: isMobile ? 22 : 18 }} />
            </Badge>
            {!collapsed && (
              <Typography variant="body2" sx={{ 
                ml: isMobile ? 2 : 1.5, 
                fontSize: isMobile ? 14 : 13, 
                fontWeight: 500,
                color: isMobile ? theme.palette.text.primary : 'inherit'
              }}>
                Notifications
              </Typography>
            )}
          </IconButton>
        </Tooltip>

        <Tooltip title={collapsed ? 'Logout' : ''} placement="right">
          <Button
            fullWidth={!collapsed}
            onClick={() => { logout(); navigate('/login'); }}
            startIcon={collapsed ? null : <Logout />}
            sx={{
              bgcolor: isMobile ? alpha(theme.palette.error.main, 0.1) : alpha('#dc3545', 0.9),
              color: isMobile ? theme.palette.error.main : '#fff',
              py: isMobile ? 1.5 : 1,
              minWidth: collapsed ? 40 : 'auto',
              borderRadius: collapsed ? '50%' : isMobile ? 3 : 2,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: isMobile ? 15 : 13,
              '&:hover': { 
                bgcolor: isMobile ? alpha(theme.palette.error.main, 0.2) : '#c82333', 
                transform: 'translateY(-1px)' 
              },
              transition: 'all 0.2s'
            }}
          >
            {collapsed ? <Logout sx={{ fontSize: 18 }} /> : 'Logout'}
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );

  // Mobile Bottom Navigation
  const mobileBottomNav = isMobile && (
    <BottomNavigation
      value={bottomNavValue}
      onChange={handleBottomNavChange}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: theme.zIndex.appBar,
        height: 64,
        borderTop: `1px solid ${theme.palette.divider}`,
        background: theme.palette.background.paper,
        '& .MuiBottomNavigationAction-root': {
          minWidth: 'auto',
          padding: '8px 12px',
          '&.Mui-selected': {
            color: theme.palette.primary.main,
          },
        },
      }}
    >
      {bottomNavItems.map((item, index) => (
        <BottomNavigationAction
          key={item.path}
          label={item.label}
          icon={item.path === '/add' ? (
            <Fab
              color="primary"
              size="small"
              sx={{
                width: 40,
                height: 40,
                minHeight: 40,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              <Add />
            </Fab>
          ) : (
            <Badge 
              color="error" 
              variant="dot" 
              invisible={item.path !== '/stores' || notifications === 0}
            >
              {item.icon}
            </Badge>
          )}
          sx={{
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              opacity: bottomNavValue === index ? 1 : 0.8,
              fontWeight: bottomNavValue === index ? 600 : 400,
            },
          }}
        />
      ))}
    </BottomNavigation>
  );

  // Mobile App Bar
  const mobileAppBar = isMobile && (
    <AppBar
      position="fixed"
      sx={{
        background: theme.palette.background.paper,
        color: theme.palette.text.primary,
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        borderBottom: `1px solid ${theme.palette.divider}`
      }}
    >
      <Toolbar sx={{ minHeight: 56, gap: 1 }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={() => setMobileOpen(true)}
        >
          <Menu />
        </IconButton>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              background: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography sx={{ fontSize: 18, fontWeight: 700, color: 'white' }}>
              🚗
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: 16, lineHeight: 1.2 }}>
              CashBook
            </Typography>
            <Typography variant="caption" sx={{ fontSize: 9, color: theme.palette.text.secondary }}>
              Car Manager
            </Typography>
          </Box>
        </Box>
        
        <Badge badgeContent={notifications} color="error">
          <IconButton color="inherit">
            <Notifications />
          </IconButton>
        </Badge>
      </Toolbar>
    </AppBar>
  );

  return (
    <>
      {mobileAppBar}
      
      {/* Spacer for mobile app bar */}
      {isMobile && <Toolbar />}
      
      {isMobile ? (
        <SwipeableDrawer
          anchor="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onOpen={() => setMobileOpen(true)}
          sx={{
            '& .MuiDrawer-paper': {
              width: 300,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </SwipeableDrawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
              boxSizing: 'border-box',
              border: 'none',
              boxShadow: '4px 0 20px rgba(0,0,0,0.08)',
              transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              overflow: 'hidden'
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {mobileBottomNav}
      
      {/* Spacer for bottom navigation */}
      {isMobile && <Box sx={{ height: 64 }} />}
    </>
  );
};

export default Sidebar;