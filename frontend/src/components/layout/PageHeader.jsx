import React from 'react';
import { Box, Typography, Button, IconButton, useTheme, useMediaQuery, alpha } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Breadcrumb from '../navigation/Breadcrumb';
import { useNavigate } from 'react-router-dom';

const PageHeader = ({
    title,
    subtitle,
    breadcrumbs = [],
    onBack,
    action,
    icon: Icon
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            navigate(-1);
        }
    };

    return (
        <Box sx={{ mb: 4 }}>
            {/* Breadcrumbs Area */}
            {breadcrumbs.length > 0 && (
                <Box sx={{ mb: 2 }}>
                    <Breadcrumb items={breadcrumbs} isMobile={isMobile} />
                </Box>
            )}

            {/* Main Header Area */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 2
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        {(onBack || breadcrumbs.length > 0) && (
                            <IconButton
                                onClick={handleBack}
                                size="small"
                                sx={{
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.main',
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                                    }
                                }}
                            >
                                <ArrowBackIcon fontSize="small" />
                            </IconButton>
                        )}
                        {Icon && (
                            <Box sx={{
                                p: 1,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: 'primary.main',
                                display: 'flex'
                            }}>
                                <Icon fontSize="small" />
                            </Box>
                        )}
                    </Box>

                    <Typography
                        variant={isMobile ? "h5" : "h4"}
                        component="h1"
                        sx={{
                            fontWeight: 800,
                            letterSpacing: '-0.02em',
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0 2px 10px rgba(0,0,0,0.05)'
                        }}
                    >
                        {title}
                    </Typography>

                    {subtitle && (
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ mt: 1, maxWidth: 600, lineHeight: 1.6 }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                </Box>

                {action && (
                    <Box>
                        {action}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default PageHeader;
