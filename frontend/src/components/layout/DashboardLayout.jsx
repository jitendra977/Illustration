import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';
import { Box, Container, Fab, Zoom, IconButton, Typography, Avatar } from '@mui/material';
import { KeyboardArrowUp, Menu, Store } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
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
          p: 2, 
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper'
        }}>
          {/* Menu Button */}
          <IconButton onClick={() => setSidebarOpen(true)}>
            <Menu />
          </IconButton>
          
          {/* App Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, ml: 1 }}>
            <Store color="primary" />
            <Typography variant="h6" fontWeight="bold">YAWイラストシステム</Typography>
          </Box>

          {/* User Profile */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar 
              src={user?.profile_image} 
              sx={{ width: 40, height: 40 }}
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
            pb: 8 // Space for bottom navigation
          }}
        >
          <Container maxWidth="xl" sx={{ py: 3 }}>
            {children}
          </Container>

          {/* Scroll to Top Button */}
          <Zoom in={showScrollTop}>
            <Fab 
              size="small" 
              onClick={handleScrollTop}
              sx={{ 
                position: 'fixed', 
                bottom: 80, // Above bottom navigation
                right: 16 
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