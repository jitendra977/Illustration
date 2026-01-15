import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    useTheme,
    useMediaQuery,
    alpha,
    styled
} from '@mui/material';
import { Home } from 'lucide-react';

// 1. A sophisticated container track
const BreadcrumbTrack = styled(Box)(({ theme }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px',
    backgroundColor: theme.palette.mode === 'dark'
        ? alpha(theme.palette.common.white, 0.05)
        : alpha(theme.palette.common.black, 0.03),
    borderRadius: '12px',
    border: `1px solid ${theme.palette.divider}`,
    gap: '2px',
    backdropFilter: 'blur(8px)',
    transition: 'background-color 0.3s',
}));

// 2. Enhanced Segment with Theme-Based Logic
const BreadcrumbSegment = styled(Box, {
    shouldForwardProp: (prop) => !['active', 'isFirst', 'isLast'].includes(prop),
})(({ theme, active, isFirst, isLast }) => {
    // Theme-based Palette
    const inactiveBg = theme.palette.mode === 'dark'
        ? alpha(theme.palette.background.paper, 0.4)
        : alpha(theme.palette.background.paper, 0.8);

    const activeBg = theme.palette.primary.main;
    const activeText = theme.palette.primary.contrastText;
    const hoverBg = alpha(theme.palette.primary.main, 0.08);
    const hoverText = theme.palette.primary.main;

    return {
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        height: 34,
        paddingLeft: isFirst ? theme.spacing(2) : theme.spacing(3),
        paddingRight: isLast ? theme.spacing(2.5) : theme.spacing(2),
        backgroundColor: active ? activeBg : inactiveBg,
        color: active ? activeText : theme.palette.text.secondary,
        textDecoration: 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: active ? 'default' : 'pointer',
        fontWeight: active ? 600 : 500,
        zIndex: active ? 2 : 1,

        // The Sharp Arrow Geometry
        clipPath: isLast
            ? `polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%, 12px 50%)`
            : isFirst
                ? `polygon(0% 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 0% 100%)`
                : `polygon(0% 0%, calc(100% - 12px) 0%, 100% 50%, calc(100% - 12px) 100%, 0% 100%, 12px 50%)`,

        marginLeft: isFirst ? 0 : -10,

        // Modern "Soft Border" effect
        boxShadow: active
            ? `0 4px 12px ${alpha(activeBg, 0.3)}`
            : `inset 0 0 0 1px ${alpha(theme.palette.divider, 0.1)}`,

        '&:hover': {
            backgroundColor: active ? activeBg : hoverBg,
            color: active ? activeText : hoverText,
            zIndex: 3,
            transform: active ? 'none' : 'translateY(-1px)',
        },
        '&:active': {
            transform: 'scale(0.98)',
        }
    };
});

const Breadcrumbs = ({
    items = [],
    showHome = true,
    homePath = '/',
    scrollable = true
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    const handleNavigate = (path, state) => {
        if (path) navigate(path, { state });
    };

    return (
        <Box sx={{ py: 2, display: 'flex' }}>
            <BreadcrumbTrack
                sx={{
                    overflowX: scrollable ? 'auto' : 'hidden',
                    scrollbarWidth: 'none',
                    '&::-webkit-scrollbar': { display: 'none' },
                    ...(isMobile && scrollable && {
                        maxWidth: '100%',
                        maskImage: 'linear-gradient(to right, black 90%, transparent 100%)',
                    })
                }}
            >
                {/* Home Segment */}
                {showHome && (
                    <BreadcrumbSegment
                        isFirst
                        onClick={() => handleNavigate(homePath)}
                        sx={{ minWidth: 44, justifyContent: 'center', pr: 2 }}
                    >
                        <Home size={16} strokeWidth={2.5} />
                    </BreadcrumbSegment>
                )}

                {/* Path Segments */}
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <BreadcrumbSegment
                            key={index}
                            isFirst={!showHome && index === 0}
                            isLast={isLast}
                            active={isLast}
                            onClick={() => !isLast && handleNavigate(item.path, item.state)}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 'inherit',
                                    fontSize: isMobile ? '0.7rem' : '0.8rem',
                                    whiteSpace: 'nowrap',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    letterSpacing: '0.02em',
                                    color: 'inherit'
                                }}
                            >
                                {item.icon && React.cloneElement(item.icon, { size: 14, strokeWidth: 2.5 })}
                                {item.label}
                            </Typography>
                        </BreadcrumbSegment>
                    );
                })}
            </BreadcrumbTrack>
        </Box>
    );
};

export default Breadcrumbs;