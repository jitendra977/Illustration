// Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/users';
import {
  Box, Drawer, Typography, Divider, Button, List, ListItemButton,
  ListItemIcon, ListItemText, Avatar, IconButton, Tooltip, useTheme,
  alpha, Paper, Chip, Badge, LinearProgress,
  useMediaQuery, SwipeableDrawer, AppBar, Toolbar
} from '@mui/material';
import {
  Dashboard, People, Logout, Settings, Analytics,
  Notifications, Menu, ChevronLeft, Store, ExpandLess, ExpandMore
} from '@mui/icons-material';

const DRAWER_WIDTH = 280;
const DRAWER_WIDTH_COLLAPSED = 70;

const Sidebar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState({});

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/',
    },
    {
      text: 'Stores',
      icon: <Store />,
      path: '/stores',
      subItems: [
        { text: 'All Stores', path: '/stores' },
        { text: 'Add Store', path: '/stores/add' }
      ]
    },
    {
      text: 'Analytics',
      icon: <Analytics />,
      path: '/analytics',
      subItems: [
        { text: 'Overview', path: '/analytics' },
        { text: 'Reports', path: '/analytics/reports' }
      ]
    },
    {
      text: 'Users',
      icon: <People />,
      path: '/users',
      requiresAdmin: true
    },
    {
      text: 'Settings',
      icon: <Settings />,
      path: '/settings',
    }
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) return setLoading(false);
      try {
        const data = await usersAPI.getProfile();
        setProfile(data);
      } catch (error) {
        setProfile(user);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isAuthenticated, user]);

  const userProfile = profile || user;
  const filteredMenuItems = menuItems.filter(item => 
    !item.requiresAdmin || userProfile?.is_staff || userProfile?.is_superuser
  );

  const isActive = (path) => location.pathname === path;

  const toggleSubmenu = (text) => {
    setExpandedMenus(prev => ({ ...prev, [text]: !prev[text] }));
  };

  const handleNavigation = (item) => {
    navigate(item.path);
    if (isMobile) setMobileOpen(false);
    if (collapsed) setCollapsed(false);
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

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      {/* Header */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          {!collapsed && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                🚗
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">CashBook</Typography>
                <Typography variant="caption" color="text.secondary">Car Manager</Typography>
              </Box>
            </Box>
          )}
          
          {!isMobile && (
            <IconButton onClick={() => setCollapsed(!collapsed)} size="small">
              {collapsed ? <Menu /> : <ChevronLeft />}
            </IconButton>
          )}
        </Box>

        {/* User Profile */}
        <Paper elevation={1} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar src={userProfile?.profile_image} sx={{ width: 48, height: 48 }}>
              {getUserInitial()}
            </Avatar>
            {!collapsed && (
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">{userProfile?.username}</Typography>
                <Typography variant="caption" color="text.secondary">{userProfile?.email}</Typography>
                <Chip label={getUserRole()} size="small" sx={{ mt: 0.5 }} />
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      <Divider />

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading && <LinearProgress />}
        <List sx={{ p: 1 }}>
          {filteredMenuItems.map((item) => (
            <Box key={item.text}>
              <ListItemButton
                onClick={() => item.subItems ? toggleSubmenu(item.text) : handleNavigation(item)}
                selected={isActive(item.path)}
                sx={{ borderRadius: 1, mb: 0.5 }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                {!collapsed && (
                  <>
                    <ListItemText primary={item.text} />
                    {item.subItems && (expandedMenus[item.text] ? <ExpandLess /> : <ExpandMore />)}
                  </>
                )}
              </ListItemButton>
            </Box>
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 2 }} />
        <Button
          fullWidth
          startIcon={<Logout />}
          onClick={() => { logout(); navigate('/login'); }}
          variant="outlined"
          color="error"
        >
          {!collapsed && 'Logout'}
        </Button>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <>
        <AppBar position="fixed">
          <Toolbar>
            <IconButton edge="start" onClick={() => setMobileOpen(true)}>
              <Menu />
            </IconButton>
            <Typography variant="h6" sx={{ flex: 1 }}>CashBook</Typography>
          </Toolbar>
        </AppBar>
        <SwipeableDrawer
          anchor="left"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onOpen={() => setMobileOpen(true)}
        >
          {drawerContent}
        </SwipeableDrawer>
      </>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
        '& .MuiDrawer-paper': {
          width: collapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
          transition: 'width 0.3s',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;