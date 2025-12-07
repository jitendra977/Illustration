// src/layouts/MobileLayout.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Badge,
  Avatar,
  Stack,
  Typography,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Image as ImageIcon,
  Store as StoreIcon,
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileLayout = ({ children, showHeader = true }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Determine active bottom nav based on current path
  const getBottomNavValue = () => {
    const path = location.pathname;
    if (path.startsWith('/illustrations')) return 1;
    if (path === '/search') return 2;
    if (path === '/profile') return 3;
    return 0;
  };

  const [bottomNavValue, setBottomNavValue] = useState(getBottomNavValue());

  useEffect(() => {
    setBottomNavValue(getBottomNavValue());
  }, [location.pathname]);

  const getUserInitial = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`;
    }
    return user?.username?.[0]?.toUpperCase() || 'U';
  };

  const handleBottomNavChange = (event, newValue) => {
    setBottomNavValue(newValue);
    const routes = ['/', '/illustrations', '/search', '/profile'];
    navigate(routes[newValue]);
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      maxHeight: '100vh',
      overflow: 'hidden',
      bgcolor: '#f5f7fa',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100vw'
    }}>
      {/* Header */}
      {showHeader && (
        <Box sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          pt: { xs: 1.5, sm: 2 },
          pb: { xs: 2, sm: 2.5 },
          px: { xs: 2, sm: 3 },
          flexShrink: 0
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={{ xs: 1.5, sm: 2 }}>
            <IconButton
              onClick={() => setMenuOpen(true)}
              sx={{
                color: 'white',
                bgcolor: 'rgba(255,255,255,0.2)',
                p: { xs: 1, sm: 1.25 }
              }}
            >
              <MenuIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
              
            </IconButton>
<Typography variant="srOnly">YAW イラストシステム</Typography>
            <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }}>

              <Box>
               
                <Typography
                  variant={isMobile ? 'caption' : 'body2'}
                  sx={{ opacity: 0.95, fontWeight: 800 }}
                >
                  {user?.first_name || user?.username || 'ゲスト'}
                </Typography>
              </Box>
              <Avatar
                src={user?.profile_image}
                sx={{
                  width: { xs: 48, sm: 56 },
                  height: { xs: 48, sm: 56 },
                  border: '3px solid rgba(255,255,255,0.3)',
                  fontSize: { xs: '1rem', sm: '1.2rem' }
                }}
              >
                {getUserInitial()}
              </Avatar>
            </Stack>
          </Stack>



        </Box>
      )}

      {/* Main Content - Scrollable */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        pb: { xs: 9, sm: 10 }
      }}>
        {children}
      </Box>

      {/* Side Menu Drawer */}
      <SwipeableDrawer
        anchor="left"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpen={() => setMenuOpen(true)}
        disableSwipeToOpen={false}
        PaperProps={{
          sx: {
            width: { xs: '85%', sm: '320px' },
            maxWidth: '400px'
          }
        }}
      >
        <Box sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          p: { xs: 2.5, sm: 3 }
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">メニュー</Typography>
            <IconButton
              onClick={() => setMenuOpen(false)}
              sx={{ color: 'white', p: 0.5 }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar
              src={user?.profile_image}
              sx={{
                width: { xs: 44, sm: 48 },
                height: { xs: 44, sm: 48 },
                border: '2px solid rgba(255,255,255,0.3)'
              }}
            >
              {getUserInitial()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body1"
                fontWeight={600}
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {user?.first_name || user?.username || 'ゲスト'}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.9,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'block'
                }}
              >
                {user?.email || ''}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => { setMenuOpen(false); navigate('/'); }}
                selected={location.pathname === '/'}
              >
                <ListItemIcon><HomeIcon /></ListItemIcon>
                <ListItemText primary="ホーム" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => { setMenuOpen(false); navigate('/dashboard'); }}
                selected={location.pathname === '/dashboard'}
              >
                <ListItemIcon><DashboardIcon /></ListItemIcon>
                <ListItemText primary="ダッシュボード" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => { setMenuOpen(false); navigate('/illustrations'); }}
                selected={location.pathname.startsWith('/illustrations')}
              >
                <ListItemIcon><ImageIcon /></ListItemIcon>
                <ListItemText primary="イラスト" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => { setMenuOpen(false); navigate('/manufacturers'); }}
                selected={location.pathname.startsWith('/manufacturers')}
              >
                <ListItemIcon><StoreIcon /></ListItemIcon>
                <ListItemText primary="メーカー" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => { setMenuOpen(false); navigate('/car-models'); }}
                selected={location.pathname.startsWith('/car-models')}
              >
                <ListItemIcon><CarIcon /></ListItemIcon>
                <ListItemText primary="車種" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => { setMenuOpen(false); navigate('/engine-models'); }}
                selected={location.pathname.startsWith('/engine-models')}
              >
                <ListItemIcon><BuildIcon /></ListItemIcon>
                <ListItemText primary="エンジン" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => { setMenuOpen(false); navigate('/part-categories'); }}
                selected={location.pathname.startsWith('/part-categories')}
              >
                <ListItemIcon><CategoryIcon /></ListItemIcon>
                <ListItemText primary="部品カテゴリー" />
              </ListItemButton>
            </ListItem>
            <Divider sx={{ my: 1 }} />
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                selected={location.pathname === '/profile'}
              >
                <ListItemIcon><SettingsIcon /></ListItemIcon>
                <ListItemText primary="設定" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => { setMenuOpen(false); logout(); }}>
                <ListItemIcon><LogoutIcon color="error" /></ListItemIcon>
                <ListItemText primary="ログアウト" primaryTypographyProps={{ color: 'error' }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </SwipeableDrawer>

      {/* Bottom Navigation */}
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          borderTop: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
        }}
        elevation={0}
      >
        <BottomNavigation
          value={bottomNavValue}
          onChange={handleBottomNavChange}
          showLabels
          sx={{
            height: { xs: 64, sm: 70 },
            '& .MuiBottomNavigationAction-root': {
              minWidth: { xs: 60, sm: 80 },
              padding: { xs: '6px 0', sm: '8px 12px' },
              '& .MuiBottomNavigationAction-label': {
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                fontWeight: 600
              }
            },
            '& .Mui-selected': {
              '& .MuiBottomNavigationAction-label': {
                fontSize: { xs: '0.75rem', sm: '0.8rem' }
              }
            }
          }}
        >
          <BottomNavigationAction
            label="ホーム"
            icon={<HomeIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />}
          />
          <BottomNavigationAction
            label="イラスト"
            icon={<ImageIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />}
          />
          <BottomNavigationAction
            label="検索"
            icon={<SearchIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />}
          />
          <BottomNavigationAction
            label="プロフィール"
            icon={<PersonIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default MobileLayout;