import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import { useTheme } from '@mui/material/styles';
import Chip from '@mui/material/Chip';
import { alpha } from '@mui/material/styles';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Favorite as FavoriteIcon,
  Image as ImageIcon,
  Store as StoreIcon,
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  ManageAccounts as ManageAccountsIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useColorMode } from '../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileLayout = ({ children, showHeader = true, onRefresh, refreshing = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { mode, toggleColorMode } = useColorMode();
  const [bottomNavValue, setBottomNavValue] = useState(0);

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setBottomNavValue(0);
    else if (path.startsWith('/illustrations')) setBottomNavValue(1);
    else if (path === '/favorites') setBottomNavValue(2);
    else if (path === '/profile') setBottomNavValue(3);
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
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${theme.palette.zinc[900]} 0%, ${theme.palette.zinc[950]} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          pt: 1.5,
          pb: 3.5,
          px: 2,
          flexShrink: 0,
          borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
          boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.15)}`
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1.5} alignItems="center">
              <IconButton
                onClick={() => setMenuOpen(true)}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(8px)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
                }}
              >
                <MenuIcon sx={{ fontSize: 20 }} />
              </IconButton>

              <Stack spacing={0}>
                <Typography
                  variant="subtitle1"
                  fontWeight="800"
                  lineHeight={1.1}
                  sx={{
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    background: 'linear-gradient(to right, #fff, #94a3b8)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  YAW 楽天検索丸
                </Typography>

                {user?.factory_memberships?.length > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255,255,255,0.5)',
                      fontWeight: 500,
                      fontSize: '0.65rem'
                    }}
                  >
                    {user.factory_memberships.map(m => m.factory.name).join(' • ')}
                  </Typography>
                )}
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1}>
              {onRefresh && (
                <IconButton
                  onClick={onRefresh}
                  disabled={refreshing}
                  sx={{
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(8px)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
                  }}
                >
                  <RefreshIcon
                    sx={{
                      fontSize: 20,
                      animation: refreshing ? 'spin 1s linear infinite' : 'none'
                    }}
                  />
                </IconButton>
              )}

              <IconButton
                onClick={toggleColorMode}
                sx={{
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(8px)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
                }}
              >
                {theme.palette.mode === 'dark' ? <LightModeIcon sx={{ fontSize: 20 }} /> : <DarkModeIcon sx={{ fontSize: 20 }} />}
              </IconButton>
            </Stack>
          </Stack>
        </Box>
      )}

      {/* Scrollable Content */}
      <Box sx={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        WebkitOverflowScrolling: 'touch',
        bgcolor: 'background.default'
      }}>
        {children}
      </Box>

      {/* Side Menu */}
      <SwipeableDrawer
        anchor="left"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpen={() => setMenuOpen(true)}
        PaperProps={{
          sx: {
            width: '80%',
            maxWidth: 320,
            bgcolor: 'background.paper',
            backgroundImage: 'none'
          }
        }}
      >
        <Box sx={{
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${theme.palette.zinc[900]} 0%, ${theme.palette.zinc[950]} 100%)`
            : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          p: 3,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative background element */}
          <Box sx={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            zIndex: 0
          }} />

          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} sx={{ position: 'relative', zIndex: 1 }}>
            <Typography variant="h6" fontWeight="800">NAVIGATE</Typography>
            <IconButton onClick={() => setMenuOpen(false)} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', p: 0.5 }}><CloseIcon fontSize="small" /></IconButton>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Avatar
              src={user?.profile_image}
              sx={{
                width: 56,
                height: 56,
                border: '2px solid rgba(255,255,255,0.2)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              {getUserInitial()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body1" fontWeight={700} noWrap sx={{ letterSpacing: '-0.01em' }}>{user?.first_name || user?.username}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.6, display: 'block', mb: 0.5 }} noWrap>{user?.email}</Typography>
              <Chip
                label={getUserRole()}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.2)',
                  color: theme.palette.mode === 'dark' ? '#7dd3fc' : '#ffffff',
                  border: theme.palette.mode === 'dark' ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid rgba(255, 255, 255, 0.4)'
                }}
              />
            </Box>
          </Stack>
        </Box>
        <List sx={{ flex: 1, py: 2 }}>
          {/* How to Use - Always at top */}
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => { setMenuOpen(false); navigate('/how-to-use'); }}
              sx={{
                mx: 1.5,
                my: 0.25,
                borderRadius: 2,
                '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
              }}
              selected={location.pathname === '/how-to-use'}
            >
              <ListItemIcon sx={{ minWidth: 40, color: location.pathname === '/how-to-use' ? theme.palette.primary.main : 'text.secondary' }}>
                <HelpIcon />
              </ListItemIcon>
              <ListItemText
                primary="使い方"
                primaryTypographyProps={{
                  fontWeight: location.pathname === '/how-to-use' ? 700 : 500,
                  fontSize: '0.9rem'
                }}
              />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton
              onClick={() => { setMenuOpen(false); navigate('/'); }}
              sx={{
                mx: 1.5,
                my: 0.25,
                borderRadius: 2,
                '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
              }}
              selected={location.pathname === '/'}
            >
              <ListItemIcon sx={{ minWidth: 40, color: location.pathname === '/' ? theme.palette.primary.main : 'text.secondary' }}>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText
                primary="ホーム"
                primaryTypographyProps={{
                  fontWeight: location.pathname === '/' ? 700 : 500,
                  fontSize: '0.9rem'
                }}
              />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ my: 1.5, mx: 3 }} />

          {/* Browse By Section */}
          <Typography variant="caption" sx={{ px: 3, mb: 1, display: 'block', color: 'text.secondary', fontWeight: 700 }}>検索方法</Typography>
          {[
            { label: 'メーカーから', icon: <StoreIcon />, path: '/manufacturers' },
            { label: 'エンジンから', icon: <BuildIcon />, path: '/engines' },
            { label: '車種から', icon: <CarIcon />, path: '/cars' },
            { label: 'カテゴリーから', icon: <SettingsIcon />, path: '/categories' },
          ].map((item, idx) => (
            <ListItem key={idx} disablePadding>
              <ListItemButton
                onClick={() => { setMenuOpen(false); navigate(item.path); }}
                sx={{
                  mx: 1.5,
                  my: 0.25,
                  borderRadius: 2,
                  '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                }}
                selected={location.pathname === item.path}
              >
                <ListItemIcon sx={{ minWidth: 40, color: location.pathname === item.path ? theme.palette.primary.main : 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 700 : 500,
                    fontSize: '0.9rem'
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}

          <Divider sx={{ my: 1.5, mx: 3 }} />

          {/* Management Section */}
          <Typography variant="caption" sx={{ px: 3, mb: 1, display: 'block', color: 'text.secondary', fontWeight: 700 }}>管理</Typography>
          {[
            { label: 'イラスト', icon: <ImageIcon />, path: '/illustrations' },
            { label: '車種管理', icon: <CarIcon />, path: '/car-models' },
            { label: 'エンジン管理', icon: <BuildIcon />, path: '/engine-models' },
            { label: 'カテゴリー管理', icon: <SettingsIcon />, path: '/part-categories' },
            { label: 'サブカテゴリー管理', icon: <SettingsIcon />, path: '/part-subcategories' },
          ].map((item, idx) => {
            const isSuperuser = user?.is_superuser;
            const isDisabled = !isSuperuser;

            return (
              <ListItem key={idx} disablePadding>
                <ListItemButton
                  onClick={() => {
                    if (isSuperuser) {
                      setMenuOpen(false);
                      navigate(item.path);
                    }
                  }}
                  disabled={isDisabled}
                  sx={{
                    mx: 1.5,
                    my: 0.25,
                    borderRadius: 2,
                    opacity: isDisabled ? 0.5 : 1,
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.1) },
                    '&.Mui-disabled': {
                      opacity: 0.5,
                      pointerEvents: 'none'
                    }
                  }}
                  selected={location.pathname === item.path && isSuperuser}
                >
                  <ListItemIcon sx={{
                    minWidth: 40,
                    color: location.pathname === item.path && isSuperuser ? theme.palette.primary.main : 'text.secondary',
                    opacity: isDisabled ? 0.5 : 1
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: location.pathname === item.path && isSuperuser ? 700 : 500,
                      fontSize: '0.9rem'
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}


          <Divider sx={{ my: 1.5, mx: 3 }} />

          {(user?.is_staff || user?.is_superuser) && (
            <>
              <Typography variant="caption" sx={{ px: 3, mb: 1, display: 'block', color: 'text.secondary', fontWeight: 700 }}>管理設定</Typography>
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => { setMenuOpen(false); navigate('/mobile/admin/users'); }}
                  sx={{ mx: 1.5, borderRadius: 2 }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}><ManageAccountsIcon /></ListItemIcon>
                  <ListItemText primary="システム管理" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
                </ListItemButton>
              </ListItem>
              <Divider sx={{ my: 1.5, mx: 3 }} />
            </>
          )}

          <ListItem disablePadding>
            <ListItemButton
              onClick={() => { setMenuOpen(false); navigate('/profile'); }}
              sx={{ mx: 1.5, borderRadius: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}><PersonIcon /></ListItemIcon>
              <ListItemText primary="プロフィール" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => { setMenuOpen(false); logout(); }}
              sx={{ mx: 1.5, borderRadius: 2 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}><LogoutIcon color="error" /></ListItemIcon>
              <ListItemText
                primary="ログアウト"
                primaryTypographyProps={{ color: 'error', fontSize: '0.9rem', fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </SwipeableDrawer>

      {/* Bottom Navigation */}
      <Paper
        sx={{
          position: 'relative',
          zIndex: 1100,
          boxShadow: theme.palette.mode === 'dark'
            ? `0 -10px 30px ${alpha(theme.palette.common.black, 0.4)}`
            : `0 -10px 30px ${alpha(theme.palette.common.black, 0.05)}`,
          background: theme.palette.mode === 'dark'
            ? alpha(theme.palette.zinc[950], 0.9)
            : alpha(theme.palette.background.paper, 0.9),
          backdropFilter: 'blur(20px)',
          borderTop: `1px solid ${theme.palette.divider}`,
          pb: 'env(safe-area-inset-bottom)',
        }}
        elevation={0}
      >
        <BottomNavigation
          value={bottomNavValue}
          onChange={(e, val) => {
            setBottomNavValue(val);
            navigate(['/', '/illustrations', '/favorites', '/profile'][val]);
          }}
          showLabels
          sx={{
            height: 72,
            bgcolor: 'transparent',
            '& .MuiBottomNavigationAction-root': {
              color: theme.palette.text.secondary,
              minWidth: 0,
              padding: '12px 0',
              '&.Mui-selected': {
                color: theme.palette.primary.main,
                '& .MuiBottomNavigationAction-label': {
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  mt: 0.5
                },
                '& .MuiSvgIcon-root': {
                  transform: 'scale(1.1) translateY(-2px)',
                  transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                }
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.7rem',
                fontWeight: 600,
                transition: 'all 0.2s'
              }
            }
          }}
        >
          <BottomNavigationAction label="ホーム" icon={<HomeIcon sx={{ transition: 'all 0.2s' }} />} />
          <BottomNavigationAction label="イラスト" icon={<ImageIcon sx={{ transition: 'all 0.2s' }} />} />
          <BottomNavigationAction label="お気に入り" icon={<FavoriteIcon sx={{ transition: 'all 0.2s' }} />} />
          <BottomNavigationAction label="会員情報" icon={<PersonIcon sx={{ transition: 'all 0.2s' }} />} />
        </BottomNavigation>
      </Paper>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 0px; background: transparent; }
      `}</style>
    </Box>

  );
};

export default MobileLayout;