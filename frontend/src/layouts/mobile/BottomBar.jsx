import React from 'react';
import {
    Paper,
    BottomNavigation,
    BottomNavigationAction
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
    Home as HomeIcon,
    Favorite as FavoriteIcon,
    Image as ImageIcon,
    Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const BottomBar = ({ isDesktop, bottomNavValue, setBottomNavValue }) => {
    const theme = useTheme();
    const navigate = useNavigate();

    if (isDesktop) return null;

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
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
    );
};

export default BottomBar;
