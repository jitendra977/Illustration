import React from 'react';
import { Card, CardActionArea, useTheme, alpha } from '@mui/material';

const GlassCard = ({ children, onClick, sx = {}, variant = "default", ...props }) => {
    const theme = useTheme();

    return (
        <Card
            sx={{
                background: 'rgba(255, 255, 255, 0.03)', // Very subtle fill
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)', // Safari support
                borderRadius: 4,
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden', // changed from visible to hidden to clip internal content properly
                position: 'relative',
                color: 'white', // Default text color for dark theme
                '&:hover': {
                    transform: onClick ? 'translateY(-4px)' : 'none',
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    boxShadow: onClick ? '0 8px 40px rgba(0, 0, 0, 0.2)' : '0 4px 30px rgba(0, 0, 0, 0.1)',
                },
                ...sx
            }}
            {...props}
        >
            {onClick ? (
                <CardActionArea
                    onClick={onClick}
                    sx={{
                        height: '100%',
                        borderRadius: 4,
                        '& .MuiCardActionArea-focusHighlight': {
                            background: 'rgba(255, 255, 255, 0.1)'
                        }
                    }}
                >
                    {children}
                </CardActionArea>
            ) : (
                children
            )}
        </Card>
    );
};

export default GlassCard;
