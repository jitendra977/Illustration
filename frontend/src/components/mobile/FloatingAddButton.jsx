import React from 'react';
import { Fab, alpha } from '@mui/material';
import { Plus } from 'lucide-react';

const FloatingAddButton = ({ onClick }) => {
  return (
    <Fab
      onClick={onClick}
      sx={{
        position: 'fixed',
        bottom: {
          xs: `calc(env(safe-area-inset-bottom) + 48px)`,
          md: 24,
        },
        right: 24,
        width: 56,
        height: 56,
        zIndex: 1300,
        bgcolor: '#3b82f6',
        color: '#fff',
        boxShadow: `0 10px 25px ${alpha('#3b82f6', 0.4)}`,
        '&:hover': {
          bgcolor: '#2563eb',
          boxShadow: `0 15px 30px ${alpha('#3b82f6', 0.5)}`,
        },
        '&:active': {
          transform: 'scale(0.95)',
        }
      }}
      aria-label="add"
    >
      <Plus size={24} />
    </Fab>
  );
};

export default FloatingAddButton;