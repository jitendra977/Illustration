import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Breadcrumbs as MuiBreadcrumbs,
    Link,
    Typography,
    Box,
    useTheme,
    useMediaQuery,
    alpha
} from '@mui/material';
import {
    Home as HomeIcon,
    NavigateNext as NavigateNextIcon,
    ChevronRight as ChevronRightIcon
} from '@mui/icons-material';

/**
 * Breadcrumb Component
 * 
 * @param {Array} items - Array of breadcrumb items
 *   Each item: { label: string, path?: string, icon?: ReactElement }
 * @param {string} separator - Separator between items (default: '/')
 * @param {boolean} showHome - Show home icon (default: true)
 * @param {string} homePath - Path for home link (default: '/')
 */
const Breadcrumbs = ({
    items = [],
    separator = 'chevron',
    showHome = true,
    homePath = '/'
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    const separatorIcon = separator === 'chevron'
        ? <ChevronRightIcon fontSize="small" />
        : <NavigateNextIcon fontSize="small" />;

    // On mobile, show only last 2 items
    const displayItems = isMobile && items.length > 2
        ? items.slice(-2)
        : items;

    const handleClick = (event, path) => {
        if (path) {
            event.preventDefault();
            navigate(path);
        }
    };

    return (
        <Box
            sx={{
                py: isMobile ? 1 : 1.5,
                px: isMobile ? 2 : 0,
                bgcolor: isMobile ? alpha(theme.palette.primary.main, 0.02) : 'transparent',
                borderBottom: isMobile ? `1px solid ${theme.palette.divider}` : 'none',
                mb: isMobile ? 0 : 2
            }}
        >
            <MuiBreadcrumbs
                separator={separatorIcon}
                aria-label="breadcrumb"
                sx={{
                    '& .MuiBreadcrumbs-separator': {
                        mx: isMobile ? 0.5 : 1,
                        color: 'text.secondary'
                    }
                }}
            >
                {/* Home Link */}
                {showHome && (
                    <Link
                        component={RouterLink}
                        to={homePath}
                        onClick={(e) => handleClick(e, homePath)}
                        underline="hover"
                        color="inherit"
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            fontSize: isMobile ? '0.875rem' : '0.9rem',
                            fontWeight: 500,
                            color: 'text.secondary',
                            transition: 'color 0.2s',
                            '&:hover': {
                                color: 'primary.main'
                            }
                        }}
                    >
                        <HomeIcon fontSize="small" />
                        {!isMobile && 'ホーム'}
                    </Link>
                )}

                {/* Breadcrumb Items */}
                {displayItems.map((item, index) => {
                    const isLast = index === displayItems.length - 1;

                    if (isLast) {
                        // Last item - not clickable
                        return (
                            <Typography
                                key={index}
                                color="text.primary"
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    fontSize: isMobile ? '0.875rem' : '0.9rem',
                                    fontWeight: 600
                                }}
                            >
                                {item.icon}
                                {item.label}
                            </Typography>
                        );
                    }

                    // Intermediate items - clickable
                    return (
                        <Link
                            key={index}
                            component={item.path ? RouterLink : 'span'}
                            to={item.path || ''}
                            onClick={(e) => handleClick(e, item.path)}
                            underline="hover"
                            color="inherit"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                fontSize: isMobile ? '0.875rem' : '0.9rem',
                                fontWeight: 500,
                                color: 'text.secondary',
                                cursor: item.path ? 'pointer' : 'default',
                                transition: 'color 0.2s',
                                '&:hover': item.path ? {
                                    color: 'primary.main'
                                } : {}
                            }}
                        >
                            {item.icon}
                            {item.label}
                        </Link>
                    );
                })}
            </MuiBreadcrumbs>

            {/* Mobile: Show ellipsis if items were truncated */}
            {isMobile && items.length > 2 && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 0.5, fontSize: '0.7rem' }}
                >
                    ... {items.length - 2} 階層省略
                </Typography>
            )}
        </Box>
    );
};

export default Breadcrumbs;
