import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Box, Typography, Divider, Avatar, IconButton
} from '@mui/material';
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  Store as StoreIcon,
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Add as AddIcon,
  ManageAccounts as ManageAccountsIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ open, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'ダッシュボード', icon: <HomeIcon />, path: '/' },
    { label: '図面', icon: <DashboardIcon />, path: '/illustrations' },
    { label: 'メーカー', icon: <StoreIcon />, path: '/manufacturers' },
    { label: '車種', icon: <CarIcon />, path: '/car-models' },
    { label: 'エンジン型式', icon: <BuildIcon />, path: '/engine-models' },
    { label: '部品カテゴリー', icon: <CategoryIcon />, path: '/part-categories' },
  ];

  // Add Admin Management link if user is staff or superuser
  if (user?.is_staff || user?.is_superuser) {
    menuItems.push({
      label: 'ユーザー管理',
      icon: <ManageAccountsIcon />,
      path: '/admin/users'
    });
  }

  const secondaryMenuItems = [
    { label: '設定', icon: <SettingsIcon />, path: '/settings' },
    { label: '分析', icon: <AnalyticsIcon />, path: '/analytics' },
    { label: 'プロフィール', icon: <PersonIcon />, path: '/profile' },
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
    return user?.username || 'ユーザー';
  };

  const getUserInitial = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`;
    }
    return user?.username?.[0]?.toUpperCase() || 'U';
  };

  const getUserRole = () => {
    if (user?.is_superuser) return 'スーパー管理者';
    if (user?.is_staff) return '管理者';
    return 'ユーザー';
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          backgroundColor: 'background.paper',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header - ヘッダー */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StoreIcon color="primary" />
            <Typography variant="h6" fontWeight="bold">メニュー</Typography>
          </Box>
          <IconButton onClick={onClose}>
            <ChevronLeftIcon />
          </IconButton>
        </Box>

        <Divider />

        {/* User Info - ユーザー情報 */}
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
              <Typography variant="subtitle1" fontWeight="bold">
                {getUserName()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
        
            </Box>
          </Box>

          {/* Quick Stats - クイック統計 */}
          <Box sx={{ display: 'flex', gap: 2, textAlign: 'center' }}>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="primary">
                {user?.illustrations_count || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                図面数
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold" color="primary">
                {user?.uploads_count || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                アップロード数
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Main Menu Items - メインメニュー */}
        <Box sx={{ flex: 1, overflow: 'auto', py: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ px: 3, mb: 1, display: 'block' }}>
            管理
          </Typography>
          <List sx={{ px: 1 }}>
            {menuItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={location.pathname === item.path}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    backgroundColor: location.pathname === item.path ? 'action.selected' : 'transparent'
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: location.pathname === item.path ? 'bold' : 'normal'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>

          <Typography variant="caption" color="text.secondary" sx={{ px: 3, mt: 3, mb: 1, display: 'block' }}>
            アカウント
          </Typography>
          <List sx={{ px: 1 }}>
            {secondaryMenuItems.map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  selected={location.pathname === item.path}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    backgroundColor: location.pathname === item.path ? 'action.selected' : 'transparent'
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: location.pathname === item.path ? 'bold' : 'normal'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider />

        {/* Logout - ログアウト */}
        <Box sx={{ p: 2 }}>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              color: 'error.main',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'error.main',
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'white'
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutIcon color="error" />
            </ListItemIcon>
            <ListItemText primary="ログアウト" />
          </ListItemButton>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;