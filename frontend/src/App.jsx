// src/App.jsx
import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { ThemeContextProvider } from './context/ThemeContext';
import MobileRoutes from './routes/MobileRoutes';

function App() {
  return (
    <ThemeContextProvider>
      <CssBaseline />
      <AuthProvider>
        <MobileRoutes />
      </AuthProvider>
    </ThemeContextProvider>
  );
}

export default App;