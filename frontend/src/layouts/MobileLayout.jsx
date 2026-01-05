import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Image as ImageIcon,
  Store as StoreIcon,
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  ManageAccounts as ManageAccountsIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileLayout = ({ children, showHeader = true, onRefresh, refreshing = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [bottomNavValue, setBottomNavValue] = useState(0);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setBottomNavValue(0);
    else if (path.startsWith('/illustrations')) setBottomNavValue(1);
    else if (path === '/profile') setBottomNavValue(2);
  }, [location.pathname]);

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
    <Box sx={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      bgcolor: theme.palette.background.default
    }}>
      {/* Header */}
      {showHeader && (
        <Box sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          pt: 2,
          pb: 4,
          px: 2,
          flexShrink: 0
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <IconButton
                onClick={() => setMenuOpen(true)}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.2)'
                }}
              >
                <MenuIcon />
              </IconButton>

              {/* TITLE + FACTORY */}
              <Stack spacing={0}>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  lineHeight={1.2}
                >
                  YAW 楽天検索丸
                </Typography>

                {user?.factory_memberships?.length > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255,255,255,0.75)',
                      letterSpacing: '0.08em'
                    }}
                  >
                    {user.factory_memberships.map(m => m.factory.name).join(', ')}
                  </Typography>
                )}
              </Stack>
            </Stack>

            {onRefresh && (
              <IconButton
                onClick={onRefresh}
                disabled={refreshing}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.2)'
                }}
              >
                <RefreshIcon
                  sx={{
                    animation: refreshing ? 'spin 1s linear infinite' : 'none'
                  }}
                />
              </IconButton>
            )}
          </Stack>
        </Box>
      )}

      {/* Scrollable Content */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch'
      }}>
        {children}
      </Box>

      {/* Side Menu */}
      <SwipeableDrawer
        anchor="left"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpen={() => setMenuOpen(true)}
        PaperProps={{ sx: { width: '85%', maxWidth: 320 } }}
      >
        <Box sx={{ background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white', p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">メニュー</Typography>
            <IconButton onClick={() => setMenuOpen(false)} sx={{ color: 'white', p: 0.5 }}><CloseIcon /></IconButton>
          </Stack>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={user?.profile_image} sx={{ width: 48, height: 48, border: '2px solid rgba(255,255,255,0.3)' }}>
              {getUserInitial()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body1" fontWeight={600} noWrap>{user?.first_name || user?.username}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.9, display: 'block' }} noWrap>{user?.email}</Typography>
              <Typography variant="caption" sx={{ color: '#90caf9', fontWeight: 'bold' }}>{getUserRole()}</Typography>
            </Box>
          </Stack>
        </Box>
        <List sx={{ flex: 1, overflowY: 'auto' }}>
          <ListItem disablePadding><ListItemButton onClick={() => { setMenuOpen(false); navigate('/'); }}><ListItemIcon><HomeIcon /></ListItemIcon><ListItemText primary="ホーム" /></ListItemButton></ListItem>
          <ListItem disablePadding><ListItemButton onClick={() => { setMenuOpen(false); navigate('/illustrations'); }}><ListItemIcon><ImageIcon /></ListItemIcon><ListItemText primary="イラスト" /></ListItemButton></ListItem>
          <ListItem disablePadding><ListItemButton onClick={() => { setMenuOpen(false); navigate('/manufacturers'); }}><ListItemIcon><StoreIcon /></ListItemIcon><ListItemText primary="メーカー" /></ListItemButton></ListItem>
          <ListItem disablePadding><ListItemButton onClick={() => { setMenuOpen(false); navigate('/car-models'); }}><ListItemIcon><CarIcon /></ListItemIcon><ListItemText primary="車種" /></ListItemButton></ListItem>
          <ListItem disablePadding><ListItemButton onClick={() => { setMenuOpen(false); navigate('/engine-models'); }}><ListItemIcon><BuildIcon /></ListItemIcon><ListItemText primary="エンジン" /></ListItemButton></ListItem>
          <ListItem disablePadding><ListItemButton onClick={() => { setMenuOpen(false); navigate('/part-categories'); }}><ListItemIcon><SettingsIcon /></ListItemIcon><ListItemText primary="部品カテゴリー" /></ListItemButton></ListItem>
          <ListItem disablePadding><ListItemButton onClick={() => { setMenuOpen(false); navigate('/part-subcategories'); }}><ListItemIcon><SettingsIcon /></ListItemIcon><ListItemText primary="サブカテゴリー" /></ListItemButton></ListItem>

          {/* Admin Section */}
          {(user?.is_staff || user?.is_superuser) && (
            <>
              <Divider sx={{ my: 1 }} />
              <ListItem disablePadding>
                <ListItemButton onClick={() => { setMenuOpen(false); navigate('/mobile/admin/users'); }}>
                  <ListItemIcon><ManageAccountsIcon /></ListItemIcon>
                  <ListItemText primary="ユーザー管理" />
                </ListItemButton>
              </ListItem>
            </>
          )}

          <Divider sx={{ my: 1 }} />
          <ListItem disablePadding><ListItemButton onClick={() => { setMenuOpen(false); navigate('/profile'); }}><ListItemIcon><PersonIcon /></ListItemIcon><ListItemText primary="プロフィール" /></ListItemButton></ListItem>
          <ListItem disablePadding><ListItemButton onClick={() => { setMenuOpen(false); logout(); }}><ListItemIcon><LogoutIcon color="error" /></ListItemIcon><ListItemText primary="ログアウト" primaryTypographyProps={{ color: 'error' }} /></ListItemButton></ListItem>
        </List>
      </SwipeableDrawer>

      {/* Bottom Navigation */}
      <Paper sx={{ position: 'relative', zIndex: 1100, boxShadow: '0 -2px 10px rgba(0,0,0,0.1)' }} elevation={0}>
        <BottomNavigation
          value={bottomNavValue}
          onChange={(e, val) => {
            setBottomNavValue(val);
            navigate(['/', '/illustrations', '/profile'][val]);
          }}
          showLabels
          sx={{ height: 64 }}
        >
          <BottomNavigationAction label="ホーム" icon={<HomeIcon />} />
          <BottomNavigationAction label="イラスト" icon={<ImageIcon />} />
          <BottomNavigationAction label="プロフィール" icon={<PersonIcon />} />
        </BottomNavigation>
      </Paper>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </Box>
  );
};

export default MobileLayout;