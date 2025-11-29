import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Box, IconButton, Avatar, Badge, Drawer, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Divider, Typography,
  BottomNavigation, BottomNavigationAction, useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon, Notifications, Store, Home, Receipt, Add,
  Analytics, Settings, Logout, ChevronLeft,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/users';

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [bottomNavValue, setBottomNavValue] = useState(0);
  const [notifications] = useState(3);
  
  const { logout, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  const bottomNavItems = [
    { label: 'Home', icon: <Home />, path: '/' },
    { label: 'Transactions', icon: <Receipt />, path: '/transactions' },
    { label: 'Add', icon: <Add />, path: '/add' },
    { label: 'Analytics', icon: <Analytics />, path: '/analytics' },
    { label: 'Menu', icon: <MenuIcon />, path: '/menu' },
  ];

  const menuItems = [
    { label: 'Home', icon: <Home />, path: '/' },
    { label: 'Transactions', icon: <Receipt />, path: '/transactions' },
    { label: 'Analytics', icon: <Analytics />, path: '/analytics' },
    { label: 'Settings', icon: <Settings />, path: '/settings' },
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated) return;
      try {
        const data = await usersAPI.getProfile();
        setProfile(data);
      } catch (error) {
        setProfile(user);
      }
    };
    fetchProfile();
  }, [isAuthenticated, user]);

  useEffect(() => {
    const currentIndex = bottomNavItems.findIndex(item => item.path === location.pathname);
    if (currentIndex !== -1) setBottomNavValue(currentIndex);
  }, [location.pathname]);

  const getUserInitial = () => {
    const p = profile || user;
    if (p?.first_name && p?.last_name) return `${p.first_name[0]}${p.last_name[0]}`;
    return p?.username?.[0]?.toUpperCase() || 'U';
  };

  const getUserName = () => {
    const p = profile || user;
    if (p?.first_name && p?.last_name) return `${p.first_name} ${p.last_name}`;
    return p?.username || 'User';
  };

  const handleBottomNavChange = (event, newValue) => {
    setBottomNavValue(newValue);
    const item = bottomNavItems[newValue];
    if (item.path === '/add') {
      navigate('/transactions/new');
    } else if (item.path === '/menu') {
      setDrawerOpen(true);
    } else {
      navigate(item.path);
    }
  };

  return (
    <>
      {/* Top App Bar */}
      <AppBar position="fixed" elevation={1} sx={{ bgcolor: 'background.paper', color: 'text.primary', mb: 0 }}>
        <Toolbar sx={{ minHeight: 56, px: 2, mb: 0 }}>
          <IconButton edge="start" onClick={() => setDrawerOpen(true)}>
            <MenuIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, ml: 1 }}>
            <Store color="primary" />
            <Typography variant="h6" fontWeight="bold">CashBook</Typography>
          </Box>

          <IconButton>
            <Badge badgeContent={notifications} color="error" variant="dot">
              <Notifications />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Toolbar sx={{ minHeight: 56, mb: 0 }} />

      {/* Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 280 }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Store color="primary" />
              <Typography variant="h6" fontWeight="bold">CashBook</Typography>
            </Box>
            <IconButton onClick={() => setDrawerOpen(false)}>
              <ChevronLeft />
            </IconButton>
          </Box>
          <Divider />
          
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 48, height: 48 }}>{getUserInitial()}</Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">{getUserName()}</Typography>
              <Typography variant="caption" color="text.secondary">
                {(profile || user)?.email}
              </Typography>
            </Box>
          </Box>
          <Divider />

          <List sx={{ px: 1, py: 2 }}>
            {menuItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  onClick={() => { navigate(item.path); setDrawerOpen(false); }}
                  selected={location.pathname === item.path}
                  sx={{ borderRadius: 1, mb: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          
          <List sx={{ px: 1 }}>
            <ListItem disablePadding>
              <ListItemButton 
                onClick={() => { logout(); navigate('/login'); }} 
                sx={{ color: 'error.main', borderRadius: 1 }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}><Logout color="error" /></ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Bottom Navigation */}
      <BottomNavigation
        value={bottomNavValue}
        onChange={handleBottomNavChange}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: 64,
          borderTop: `1px solid ${theme.palette.divider}`,
          zIndex: 1000,
        }}
      >
        {bottomNavItems.map((item) => (
          <BottomNavigationAction
            key={item.path}
            label={item.label}
            icon={
              item.path === '/add' ? (
                <Box sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>
                  <Add />
                </Box>
              ) : (
                <Badge 
                  color="error" 
                  variant="dot" 
                  invisible={item.path !== '/transactions' || notifications === 0}
                >
                  {item.icon}
                </Badge>
              )
            }
          />
        ))}
      </BottomNavigation>
    </>
  );
};

export default Navbar;