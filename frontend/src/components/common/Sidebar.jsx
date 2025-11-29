import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, Divider, Avatar, IconButton
} from '@mui/material';
import {
  Home, Receipt, Analytics, Person, Logout, ChevronLeft, Store,
  Settings, Notifications, Add
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'ホーム', icon: <Home />, path: '/' },
    { label: 'イラスト', icon: <Receipt />, path: '/illustrations' },
    { label: '追加', icon: <Add />, path: '/illustrations/new' },
    { label: '分析', icon: <Analytics />, path: '/analytics' },
    { label: '通知', icon: <Notifications />, path: '/notifications' },
    { label: '設定', icon: <Settings />, path: '/settings' },
    { label: 'プロフィール', icon: <Person />, path: '/profile' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose();
  };

  const getUserName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user?.username || 'User';
  };

  const getUserInitial = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`;
    }
    return user?.username?.[0]?.toUpperCase() || 'U';
  };

  const getUserRole = () => {
    if (user?.is_superuser) return 'Super Admin';
    if (user?.is_staff) return 'Admin';
    return 'User';
  };

  console.log('Sidebar user data:', user); // Debug log

  return (
    <Drawer 
      anchor="left" 
      open={open} 
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Store color="primary" />
            <Typography variant="h6" fontWeight="bold">メニュー</Typography>
          </Box>
          <IconButton onClick={onClose}>
            <ChevronLeft />
          </IconButton>
        </Box>
        
        <Divider />

        {/* User Info with Profile Photo */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar 
              src={user?.profile_image}
              sx={{ 
                width: 60, 
                height: 60,
                bgcolor: user?.profile_image ? 'transparent' : 'primary.main'
              }}
            >
              {getUserInitial()}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {getUserName()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
              <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: 'block' }}>
                {getUserRole()}
              </Typography>
            </Box>
          </Box>
          
          {/* User Stats */}
          <Box sx={{ display: 'flex', gap: 2, textAlign: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="primary">
                {user?.illustrations_count || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                イラスト
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="primary">
                {user?.followers_count || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                フォロワー
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="primary">
                {user?.following_count || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                フォロー中
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Menu Items */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <List sx={{ px: 1, py: 2 }}>
            {menuItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={location.pathname === item.path}
                  sx={{ borderRadius: 1, mb: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider />

        {/* Logout */}
        <Box sx={{ p: 2 }}>
          <ListItemButton 
            onClick={handleLogout} 
            sx={{ 
              color: 'error.main', 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'error.main'
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <Logout color="error" />
            </ListItemIcon>
            <ListItemText primary="ログアウト" />
          </ListItemButton>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;