import React, { useState } from 'react';
import {
    Box,
    IconButton,
    Avatar,
    Stack,
    Typography,
    SwipeableDrawer,
    Drawer,
    Collapse,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Chip
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
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
    ManageAccounts as ManageAccountsIcon,
    Help as HelpIcon,
    ExpandLess,
    ExpandMore,
    AdminPanelSettings as AdminIcon,
    Comment as CommentIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ menuOpen, setMenuOpen, drawerWidth, isDesktop }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const [openManagement, setOpenManagement] = useState(false);
    const [openSettings, setOpenSettings] = useState(false);

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

    const drawerContent = (
        <>
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
                    {!isDesktop && (
                        <IconButton onClick={() => setMenuOpen(false)} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)', p: 0.5 }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    )}
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
                        <Typography variant="body1" fontWeight={700} noWrap sx={{ letterSpacing: '-0.01em', color: 'white' }}>
                            {user?.last_name && user?.first_name ? `${user.last_name} ${user.first_name}` : (user?.username || 'Guest')}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 0.5, color: 'rgba(255,255,255,0.8)' }} noWrap>
                            {user?.email || ''}
                        </Typography>
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
                        onClick={() => { if (!isDesktop) setMenuOpen(false); navigate('/how-to-use'); }}
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
                        onClick={() => { if (!isDesktop) setMenuOpen(false); navigate('/'); }}
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

                {/* Desktop Specific Navigation Items (Only when isDesktop) */}
                {isDesktop && (
                    <>
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={() => navigate('/illustrations')}
                                sx={{
                                    mx: 1.5,
                                    my: 0.25,
                                    borderRadius: 2,
                                    '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                }}
                                selected={location.pathname.startsWith('/illustrations')}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: location.pathname.startsWith('/illustrations') ? theme.palette.primary.main : 'text.secondary' }}>
                                    <ImageIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary="イラスト一覧"
                                    primaryTypographyProps={{
                                        fontWeight: location.pathname.startsWith('/illustrations') ? 700 : 500,
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={() => navigate('/favorites')}
                                sx={{
                                    mx: 1.5,
                                    my: 0.25,
                                    borderRadius: 2,
                                    '&.Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.1) }
                                }}
                                selected={location.pathname === '/favorites'}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: location.pathname === '/favorites' ? theme.palette.primary.main : 'text.secondary' }}>
                                    <FavoriteIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary="お気に入り"
                                    primaryTypographyProps={{
                                        fontWeight: location.pathname === '/favorites' ? 700 : 500,
                                        fontSize: '0.9rem'
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    </>
                )}

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
                            onClick={() => { if (!isDesktop) setMenuOpen(false); navigate(item.path); }}
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
                <ListItem disablePadding>
                    <ListItemButton onClick={() => setOpenManagement(!openManagement)} sx={{ mx: 1.5, borderRadius: 2 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}><AdminIcon /></ListItemIcon>
                        <ListItemText primary="管理" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 700 }} />
                        {openManagement ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                </ListItem>
                <Collapse in={openManagement} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
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
                                                if (!isDesktop) setMenuOpen(false);
                                                navigate(item.path);
                                            }
                                        }}
                                        disabled={isDisabled}
                                        sx={{
                                            pl: 4,
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
                                                fontSize: '0.85rem'
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                </Collapse>


                <Divider sx={{ my: 1.5, mx: 3 }} />

                {/* Management Settings Section */}
                <ListItem disablePadding>
                    <ListItemButton onClick={() => setOpenSettings(!openSettings)} sx={{ mx: 1.5, borderRadius: 2 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}><SettingsIcon /></ListItemIcon>
                        <ListItemText primary="管理設定" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 700 }} />
                        {openSettings ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                </ListItem>
                <Collapse in={openSettings} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={() => {
                                    if (user?.is_staff || user?.is_superuser) {
                                        if (!isDesktop) setMenuOpen(false);
                                        navigate('/mobile/admin/users');
                                    }
                                }}
                                disabled={!user?.is_staff && !user?.is_superuser}
                                sx={{
                                    pl: 4,
                                    mx: 1.5,
                                    borderRadius: 2,
                                    opacity: (!user?.is_staff && !user?.is_superuser) ? 0.5 : 1,
                                    cursor: (!user?.is_staff && !user?.is_superuser) ? 'not-allowed' : 'pointer',
                                    '&.Mui-disabled': {
                                        opacity: 0.5,
                                        pointerEvents: 'none'
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, opacity: (!user?.is_staff && !user?.is_superuser) ? 0.5 : 1 }}>
                                    <ManageAccountsIcon />
                                </ListItemIcon>
                                <ListItemText primary="システム管理" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }} />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton
                                onClick={() => {
                                    if (user?.is_staff || user?.is_superuser) {
                                        if (!isDesktop) setMenuOpen(false);
                                        navigate('/mobile/admin/comments');
                                    }
                                }}
                                disabled={!user?.is_staff && !user?.is_superuser}
                                sx={{
                                    pl: 4,
                                    mx: 1.5,
                                    my: 0.25,
                                    borderRadius: 2,
                                    opacity: (!user?.is_staff && !user?.is_superuser) ? 0.5 : 1,
                                    cursor: (!user?.is_staff && !user?.is_superuser) ? 'not-allowed' : 'pointer',
                                    '&.Mui-disabled': {
                                        opacity: 0.5,
                                        pointerEvents: 'none'
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, opacity: (!user?.is_staff && !user?.is_superuser) ? 0.5 : 1 }}>
                                    <CommentIcon />
                                </ListItemIcon>
                                <ListItemText primary="フィードバック管理" primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 500 }} />
                            </ListItemButton>
                        </ListItem>

                    </List>
                </Collapse>
                <Divider sx={{ my: 1.5, mx: 3 }} />

                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => { if (!isDesktop) setMenuOpen(false); navigate('/profile'); }}
                        sx={{ mx: 1.5, borderRadius: 2 }}
                    >
                        <ListItemIcon sx={{ minWidth: 40 }}><PersonIcon /></ListItemIcon>
                        <ListItemText primary="プロフィール" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton
                        onClick={() => { if (!isDesktop) setMenuOpen(false); logout(); }}
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
        </>
    );

    return (
        <>
            {isDesktop ? (
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            borderRight: `1px solid ${theme.palette.divider}`,
                            bgcolor: 'background.paper',
                        },
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>
            ) : (
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
                    {drawerContent}
                </SwipeableDrawer>
            )}
        </>
    );
};

export default Sidebar;
