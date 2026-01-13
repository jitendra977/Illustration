// src/App.jsx
import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import MobileRoutes from './routes/MobileRoutes';
import { getTheme } from './theme';

function App() {
  const theme = getTheme('dark');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <MobileRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;