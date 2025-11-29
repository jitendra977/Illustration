// Layout.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import { Box, Container, Fab, Zoom } from '@mui/material';
import { KeyboardArrowUp } from '@mui/icons-material';
import { useTheme, useMediaQuery } from '@mui/material';

const DashboardLayout = ({ children }) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mainContentRef, setMainContentRef] = React.useState(null);
  const [showScrollTop, setShowScrollTop] = React.useState(false);

  React.useEffect(() => {
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

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {!isMobile && <Sidebar />}

      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar currentLocation={location} />
        
        <Box 
          ref={setMainContentRef}
          component="main" 
          sx={{ 
            flex: 1, 
            overflowY: 'auto', 
            pb: { xs: 8, md: 0 } 
          }}
        >
          <Container maxWidth="xl" sx={{ py: 3 }}>
            {children}
          </Container>

          <Zoom in={showScrollTop}>
            <Fab 
              size="small" 
              onClick={handleScrollTop}
              sx={{ position: 'fixed', bottom: 16, right: 16 }}
            >
              <KeyboardArrowUp />
            </Fab>
          </Zoom>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;