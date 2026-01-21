import React from 'react';
import {
    Box,
    IconButton,
    Stack,
    Typography
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
    Menu as MenuIcon,
    Refresh as RefreshIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { useColorMode } from '../../context/ThemeContext';
import CommentButton from '../../components/comments/CommentButton';

const Topbar = ({ showHeader, isDesktop, drawerWidth, setMenuOpen, onRefresh, refreshing }) => {
    const { user } = useAuth();
    const theme = useTheme();
    const { toggleColorMode } = useColorMode();

    if (!showHeader) return null;

    return (
        <Box sx={{
            position: 'fixed',
            top: 0,
            left: isDesktop ? drawerWidth : 0,
            right: 0,
            zIndex: theme.zIndex.appBar,
            background: theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${theme.palette.zinc[900]} 0%, ${theme.palette.zinc[950]} 100%)`
                : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            pt: 1.5,
            pb: 1.5,
            px: 2,
            borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.1)}`,
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.15)}`,
            transition: theme.transitions.create(['left'], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Stack direction="row" spacing={1.5} alignItems="center">
                    {!isDesktop && (
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
                    )}

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

                    <CommentButton />

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
    );
};

export default Topbar;
