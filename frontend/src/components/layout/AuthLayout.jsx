import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import {
  Box,
  Container,
  Fab,
  Zoom,
  Breadcrumbs,
  Link,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Collapse,
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
  NavigateNext,
  Close,
  Home,
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

  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Home', path: '/' }];
    
    let currentPath = '';
    paths.forEach((path) => {
      currentPath += `/${path}`;
      breadcrumbs.push({
        label: path.charAt(0).toUpperCase() + path.slice(1),
        path: currentPath,
      });
    });
    
    return breadcrumbs;
  };

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

  const breadcrumbs = generateBreadcrumbs();

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', bgcolor: isDarkMode ? '#0a0e27' : '#f5f7fa' }}>
      {!isMobile && <Sidebar />}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <Navbar />

        <Paper elevation={0} sx={{ px: 0, py: 0, m: 0, borderRadius: 0, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`, display: { xs: 'flex', md: 'none' }, alignItems: 'center', justifyContent: 'space-between' }}>
          <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ pl: 2, py: 1 }}>
            {breadcrumbs.map((crumb, index) => (
              <Link key={crumb.path} underline="hover" color={index === breadcrumbs.length - 1 ? 'primary' : 'inherit'} href={crumb.path} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: 12, fontWeight: index === breadcrumbs.length - 1 ? 600 : 400 }}>
                {index === 0 && <Home sx={{ fontSize: 13 }} />}
                {crumb.label}
              </Link>
            ))}
          </Breadcrumbs>

          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 0.5, pr: 2 }}>
            <IconButton size="small" onClick={toggleTheme}>
              {isDarkMode ? <Brightness7 fontSize="small" /> : <Brightness4 fontSize="small" />}
            </IconButton>
          </Box>
        </Paper>

        <Box ref={setMainContentRef} component="main" sx={{ flex: 1, overflowY: 'auto', bgcolor: isDarkMode ? '#0a0e27' : '#f5f7fa', pb: { xs: 8, md: 0 } }}>
          <Box sx={{ p: 0, m: 0 }}>
            {children}
          </Box>
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