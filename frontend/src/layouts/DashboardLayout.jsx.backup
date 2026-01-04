import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import { Box, Container, Fab, Zoom, IconButton, Typography, Avatar, useMediaQuery, useTheme } from '@mui/material';
import { KeyboardArrowUp, Menu, Store } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
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

  const getUserInitial = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`;
    }
    return user?.username?.[0]?.toUpperCase() || 'U';
  };

  const getUserName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user?.username || 'User';
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar with Menu Button and User Info */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          px: { xs: 1, sm: 2 },
          py: { xs: 1, sm: 2 },
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
          minHeight: { xs: 56, sm: 64 }
        }}>
          {/* Menu Button */}
          <IconButton 
            onClick={() => setSidebarOpen(true)}
            sx={{ mr: { xs: 0.5, sm: 1 } }}
          >
            <Menu />
          </IconButton>
          
          {/* App Title */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 0.5, sm: 1 }, 
            flex: 1, 
            ml: { xs: 0.5, sm: 1 },
            overflow: 'hidden'
          }}>
            <Store 
              color="primary" 
              sx={{ fontSize: { xs: 20, sm: 24 } }}
            />
            <Typography 
              variant={isMobile ? 'subtitle1' : 'h6'} 
              fontWeight="bold"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {isMobile ? 'YAWシステム' : 'YAWイラストシステム'}
            </Typography>
          </Box>

          {/* User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
            <Avatar 
              src={user?.profile_image} 
              sx={{ 
                width: { xs: 32, sm: 40 }, 
                height: { xs: 32, sm: 40 },
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              {getUserInitial()}
            </Avatar>
          </Box>
        </Box>
        
        {/* Sidebar */}
        <Sidebar 
          open={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Main Content */}
        <Box 
          ref={setMainContentRef}
          component="main" 
          sx={{ 
            flex: 1, 
            overflowY: 'auto', 
            overflowX: 'hidden',
            pb: { xs: 7, sm: 8 }, // Space for bottom navigation
            WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
          }}
        >
          <Container 
            maxWidth="xl" 
            sx={{ 
              py: { xs: 2, sm: 3 },
              px: { xs: 2, sm: 3 }
            }}
          >
            {children}
          </Container>

          {/* Scroll to Top Button */}
          <Zoom in={showScrollTop}>
            <Fab 
              size={isMobile ? 'small' : 'medium'}
              onClick={handleScrollTop}
              sx={{ 
                position: 'fixed', 
                bottom: { xs: 70, sm: 80 }, // Above bottom navigation
                right: { xs: 12, sm: 16 }
              }}
            >
              <KeyboardArrowUp />
            </Fab>
          </Zoom>
        </Box>

        {/* Bottom Navigation */}
        <Navbar currentLocation={location} />
      </Box>
    </Box>
  );
};

export default DashboardLayout;