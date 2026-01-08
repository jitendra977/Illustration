import React from 'react';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import { NavigateNext } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

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
                '&::-webkit-scrollbar': { display: 'none' }  // Chrome/Safari
            }}>
                <Breadcrumbs
                    separator={<NavigateNext fontSize="small" />}
                    aria-label="breadcrumb"
                    itemsAfterCollapse={2}
                    itemsBeforeCollapse={isMobile ? 1 : 2}
                    maxItems={isMobile ? 3 : 8}
                    sx={{
                        '& .MuiBreadcrumbs-li': {
                            display: 'inline-flex',
                        }
                    }}
                >
                    {items.map((item, index) => {
                        const isLast = index === items.length - 1;

                        if (isLast) {
                            return (
                                <Typography
                                    key={index}
                                    color="text.primary"
                                    variant={isMobile ? "caption" : "body2"}
                                    sx={{ fontWeight: 'bold' }}
                                >
                                    {item.label}
                                </Typography>
                            );
                        }

                        return (
                            <Link
                                key={index}
                                component={RouterLink}
                                to={item.path}
                                state={item.state}
                                underline="hover"
                                color="inherit"
                                variant={isMobile ? "caption" : "body2"}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    '&:hover': { color: 'primary.main' }
                                }}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
                </Breadcrumbs>
            </Box>
        </Box>
    );
};

export default Breadcrumb;
