import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Breadcrumbs as MuiBreadcrumbs,
    Typography,
    Box,
    useTheme,
    useMediaQuery,
    alpha
} from '@mui/material';
import {
    Home,
    ChevronRight,
    ArrowRight
} from 'lucide-react';

// Zinc palette from theme

/**
 * Breadcrumb Component
 * 
 * @param {Array} items - Array of breadcrumb items
 *   Each item: { label: string, path?: string, icon?: ReactElement, state?: object }
 * @param {string} separator - Separator between items (default: 'chevron')
 * @param {boolean} showHome - Show home icon (default: true)
 * @param {string} homePath - Path for home link (default: '/')
 * @param {boolean} scrollable - Whether to scroll on mobile instead of truncate (default: false)
 */
const Breadcrumbs = ({
    items = [],
    separator = 'chevron',
    showHome = true,
    homePath = '/',
    scrollable = false
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    const separatorIcon = separator === 'chevron'
        ? <ChevronRight size={14} color={theme.palette.text.disabled} />
        : <ArrowRight size={14} color={theme.palette.text.disabled} />;

    // On mobile, show only last 2 items UNLESS scrollable is true
    const displayItems = (isMobile && !scrollable && items.length > 2)
        ? items.slice(-2)
        : items;

    const handleClick = (event, path, state) => {
        if (path) {
            event.preventDefault();
            // navigate(path, { state }); // correctly pass state if provided
            // Actually RouterLink handles this, but since we have an onClick handler preventing default...
            // We should let RouterLink handle it OR use navigate.
            // Using navigate is safer with preventDefault.
            navigate(path, { state });
        }
    };

    return (
        <Box
            sx={{
                py: isMobile ? 1 : 1.5,
                px: isMobile ? 2 : 0,
                mb: isMobile ? 0 : 2,
                ...(scrollable && isMobile && {
                    overflowX: 'auto',
                    whiteSpace: 'nowrap',
                    px: 1, // smaller padding for scroll view
                    maskImage: 'linear-gradient(to right, black 90%, transparent 100%)',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' }
                })
            }}
        >
            <MuiBreadcrumbs
                separator={separatorIcon}
                aria-label="breadcrumb"
                itemsAfterCollapse={scrollable ? 10 : 2} // if scrollable, show many
                maxItems={scrollable ? 20 : 8}
                sx={{
                    '& .MuiBreadcrumbs-separator': {
                        mx: 0.5,
                        color: theme.palette.text.disabled
                    },
                    '& .MuiBreadcrumbs-ol': {
                        alignItems: 'center',
                        flexWrap: (scrollable && isMobile) ? 'nowrap' : 'wrap'
                    },
                    '& .MuiBreadcrumbs-li': {
                        display: 'inline-flex'
                    }
                }}
            >
                {/* Home Link */}
                {showHome && (
                    <Box
                        component={RouterLink}
                        to={homePath}
                        onClick={(e) => handleClick(e, homePath)}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[800], 0.4) : alpha(theme.palette.zinc[100], 0.8),
                            border: `1px solid ${theme.palette.divider}`,
                            color: theme.palette.text.secondary,
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                            flexShrink: 0,
                            '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 1),
                                borderColor: theme.palette.primary.main,
                                color: theme.palette.primary.contrastText,
                                transform: 'scale(1.1)'
                            },
                        }}
                    >
                        <Home size={isMobile ? 14 : 16} />
                    </Box>
                )}

                {/* Breadcrumb Items */}
                {displayItems.map((item, index) => {
                    const isLast = index === displayItems.length - 1;

                    if (isLast) {
                        // Last item - not clickable
                        return (
                            <Box
                                key={index}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: 28,
                                    px: 1.5,
                                    flexShrink: 0
                                }}
                            >
                                <Typography
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        fontSize: isMobile ? '12px' : '13px',
                                        fontWeight: 700,
                                        color: theme.palette.text.primary,
                                        lineHeight: 1
                                    }}
                                >
                                    {item.icon}
                                    {item.label}
                                </Typography>
                            </Box>
                        );
                    }

                    // Intermediate items - clickable
                    return (
                        <Box
                            key={index}
                            component={item.path ? RouterLink : 'span'}
                            to={item.path || ''}
                            state={item.state} // Pass state to RouterLink
                            onClick={(e) => handleClick(e, item.path, item.state)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                height: 28,
                                px: 1.5,
                                borderRadius: '9999px',
                                bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[800], 0.4) : alpha(theme.palette.zinc[100], 0.8),
                                border: `1px solid ${theme.palette.divider}`,
                                textDecoration: 'none',
                                cursor: item.path ? 'pointer' : 'default',
                                transition: 'all 0.2s',
                                flexShrink: 0,
                                ...(item.path && {
                                    '&:hover': {
                                        bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[700], 0.6) : alpha(theme.palette.zinc[200], 0.8),
                                        borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[600], 0.5) : alpha(theme.palette.zinc[300], 0.5),
                                        transform: 'translateY(-1px)'
                                    },
                                    '&:active': {
                                        transform: 'translateY(0)'
                                    }
                                })
                            }}
                        >
                            <Typography
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    fontSize: isMobile ? '11px' : '12px',
                                    fontWeight: 600,
                                    color: theme.palette.text.secondary,
                                    lineHeight: 1,
                                    transition: 'color 0.2s',
                                    '.MuiBox-root:hover &': item.path ? {
                                        color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.text.primary
                                    } : {}
                                }}
                            >
                                {item.icon}
                                {item.label}
                            </Typography>
                        </Box>
                    );
                })}
            </MuiBreadcrumbs>

            {/* Mobile: Show ellipsis if items were truncated */}
            {isMobile && !scrollable && items.length > 2 && (
                <Typography
                    variant="caption"
                    sx={{
                        display: 'block',
                        mt: 0.5,
                        fontSize: '0.7rem',
                        color: theme.palette.text.disabled,
                        textAlign: 'center'
                    }}
                >
                    + {items.length - 2} ...
                </Typography>
            )}
        </Box>
    );
};

export default Breadcrumbs;
