import React from 'react';
import { Breadcrumbs as MuiBreadcrumbs, Typography, Box, alpha } from '@mui/material';
import { ChevronRight } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

// Zinc color palette
const zinc = {
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
};

/**
 * Reusable Breadcrumb component
 * @param {Array} items - Array of objects { label: string, path: string (optional) }
 * @param {boolean} isMobile - Whether to use mobile styling
 */
const Breadcrumb = ({ items, isMobile = false }) => {
    if (!items || items.length === 0) return null;

    return (
        <Box sx={{ mb: 2, px: isMobile ? 1 : 0 }}>
            {/* Scrollable container for mobile */}
            <Box sx={{
                overflowX: 'auto',
                whiteSpace: 'nowrap',
                pb: isMobile ? 1 : 0,
                scrollbarWidth: 'none',  // Firefox
                '&::-webkit-scrollbar': { display: 'none' }, // Chrome/Safari
                maskImage: 'linear-gradient(to right, black 90%, transparent 100%)' // Fade out effect
            }}>
                <MuiBreadcrumbs
                    separator={<ChevronRight size={14} color={zinc[600]} />}
                    aria-label="breadcrumb"
                    itemsAfterCollapse={2}
                    itemsBeforeCollapse={isMobile ? 1 : 2}
                    maxItems={isMobile ? 10 : 8} // Show more on mobile since we scroll
                    sx={{
                        '& .MuiBreadcrumbs-li': {
                            display: 'inline-flex',
                        },
                        '& .MuiBreadcrumbs-ol': {
                            flexWrap: isMobile ? 'nowrap' : 'wrap',
                        }
                    }}
                >
                    {items.map((item, index) => {
                        const isLast = index === items.length - 1;

                        if (isLast) {
                            return (
                                <Typography
                                    key={index}
                                    sx={{
                                        color: '#fff',
                                        fontSize: isMobile ? '12px' : '13px',
                                        fontWeight: 600
                                    }}
                                >
                                    {item.label}
                                </Typography>
                            );
                        }

                        return (
                            <Typography
                                key={index}
                                component={RouterLink}
                                to={item.path}
                                state={item.state}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: zinc[400],
                                    textDecoration: 'none',
                                    fontSize: isMobile ? '12px' : '13px',
                                    fontWeight: 500,
                                    transition: 'color 0.2s',
                                    '&:hover': {
                                        color: '#fff',
                                        bgcolor: alpha('#fff', 0.05),
                                        borderRadius: 0.5
                                    }
                                }}
                            >
                                {item.label}
                            </Typography>
                        );
                    })}
                </MuiBreadcrumbs>
            </Box>
        </Box>
    );
};

export default Breadcrumb;
