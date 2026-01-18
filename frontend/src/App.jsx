// src/App.jsx
import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import { ThemeContextProvider } from './context/ThemeContext';
import MobileRoutes from './routes/MobileRoutes';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ThemeContextProvider>
      <CssBaseline />
      <Toaster position="bottom-center" />
      <AuthProvider>
        <MobileRoutes />
      </AuthProvider>
    </ThemeContextProvider>
  );
}

export default App;