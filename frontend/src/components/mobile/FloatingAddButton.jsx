import React from 'react';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const FloatingAddButton = ({ onClick }) => {
  return (
    <Fab
      color="primary"
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
      }}
      aria-label="add"
    >
      <AddIcon />
    </Fab>
  );
};

export default FloatingAddButton;