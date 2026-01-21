import React from 'react';
import { Box, Container, IconButton, Typography, useTheme, alpha, Fade } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

const PageLayout = ({
    children,
    title,
    subtitle,
    showBack = true,
    onBack,
    action,
    maxWidth = "lg",
    disablePadding = false
}) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: theme.palette.mode === 'dark' ? `
                    radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
                    radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), 
                    radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%)
                ` : theme.palette.background.default,
                backgroundColor: theme.palette.background.default,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden' // key for background
            }}
        >
            {/* Mesh Gradient Overlay for more depth - Optional, but adds the "wow" factor */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.4,
                    background: theme.palette.mode === 'dark' ? `
                        radial-gradient(circle at 15% 50%, ${alpha(theme.palette.primary.main, 0.15)}, transparent 25%),
                        radial-gradient(circle at 85% 30%, ${alpha(theme.palette.secondary.main, 0.15)}, transparent 25%)
                    ` : 'none',
                    zIndex: 0,
                    pointerEvents: 'none'
                }}
            />

            {/* Glass Header */}
            <Box
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1100,
                    backdropFilter: 'blur(12px)',
                    backgroundColor: theme.palette.mode === 'dark' ? alpha('#1a1a1a', 0.6) : alpha(theme.palette.background.paper, 0.8),
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    px: 2,
                    py: 1.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2
                }}
            >
                {showBack && (
                    <IconButton
                        onClick={handleBack}
                        size="small"
                        sx={{
                            color: 'text.primary',
                            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : alpha(theme.palette.action.active, 0.05),
                            '&:hover': { bgcolor: theme.palette.mode === 'dark' ? alpha('#fff', 0.1) : alpha(theme.palette.action.active, 0.1) },
                            border: `1px solid ${theme.palette.divider}`
                        }}
                    >
                        <ArrowBackIcon fontSize="small" />
                    </IconButton>
                )}

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Fade in timeout={500}>
                        <Box>
                            <Typography
                                variant="h6"
                                component="h1"
                                noWrap
                                sx={{
                                    fontWeight: 700,
                                    color: 'text.primary',
                                    fontSize: '1.1rem',
                                    letterSpacing: '0.02em'
                                }}
                            >
                                {title}
                            </Typography>
                            {subtitle && (
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: 'text.secondary',
                                        display: 'block',
                                        lineHeight: 1
                                    }}
                                    noWrap
                                >
                                    {subtitle}
                                </Typography>
                            )}
                        </Box>
                    </Fade>
                </Box>

                {action && (
                    <Box sx={{ flexShrink: 0 }}>
                        {action}
                    </Box>
                )}
            </Box>

            {/* Content Area */}
            <Container
                maxWidth={maxWidth}
                sx={{
                    flex: 1,
                    position: 'relative',
                    zIndex: 1,
                    py: disablePadding ? 0 : 3,
                    px: disablePadding ? 0 : 2
                }}
            >
                <Fade in timeout={700}>
                    <Box sx={{ height: '100%' }}>
                        {children}
                    </Box>
                </Fade>
            </Container>
        </Box>
    );
};

export default PageLayout;
