import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import {
  Box,
  Container,
  Fab,
  Zoom,
  Paper,
  IconButton,
  Tooltip,
  Alert,
  alpha,
  useTheme,
  useMediaQuery,
  Slide,
} from '@mui/material';
import {
  KeyboardArrowUp,
  Brightness4,
  Brightness7,
  Fullscreen,
  FullscreenExit,
  Close,
} from '@mui/icons-material';

const DashboardLayout = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const [mainContentRef, setMainContentRef] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      if (mainContentRef) {
        setShowScrollTop(mainContentRef.scrollTop > 300);
      }
    };

    if (mainContentRef) {
      mainContentRef.addEventListener('scroll', handleScroll);
      return () => mainContentRef.removeEventListener('scroll', handleScroll);
    }
  }, [mainContentRef]);

  const handleScrollTop = () => {
    if (mainContentRef) {
      mainContentRef.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    console.log('Theme toggled:', !isDarkMode);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', bgcolor: isDarkMode ? '#0a0e27' : '#f5f7fa' }}>
      {!isMobile && <Sidebar />}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        {/* Pass location to Navbar for breadcrumbs */}
        <Navbar currentLocation={location} />

        <Box ref={setMainContentRef} component="main" sx={{ flex: 1, overflowY: 'auto', bgcolor: isDarkMode ? '#0a0e27' : '#f5f7fa', pb: { xs: 8, md: 0 }, pt: 0, mt: 0 }}>
          <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 }, px: { xs: 2, md: 2 }, ml: 0, mt: 0, pt: 0 }}>
            {children}
          </Container>
        </Box>

        <Zoom in={showScrollTop}>
          <Fab size="small" color="primary" onClick={handleScrollTop} sx={{ position: 'fixed', bottom: { xs: 80, md: 16 }, right: 16 }}>
            <KeyboardArrowUp />
          </Fab>
        </Zoom>
      </Box>
    </Box>
  );
};

export default DashboardLayout;