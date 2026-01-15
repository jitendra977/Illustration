import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Badge,
  Avatar,
  Fab
} from '@mui/material';
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Store as StoreIcon,
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ currentLocation }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [bottomNavValue, setBottomNavValue] = React.useState(0);

  const navConfig = [
    { label: 'Home', icon: <HomeIcon />, path: '/' },
    { label: 'Illustrations', icon: <DashboardIcon />, path: '/illustrations' },
    { label: 'Add', icon: <AddIcon />, path: 'add' }, // Special case for FAB
    { label: 'Manufacturers', icon: <StoreIcon />, path: '/manufacturers' },
    { label: 'Profile', icon: <PersonIcon />, path: '/profile' },
  ];

  // Map all routes for navigation
  const allRoutes = [
    '/',
    '/illustrations',
    '/manufacturers',
    '/car-models',
    '/engine-models',
    '/part-categories',
    '/profile',
    '/analytics',
    '/settings'
  ];

  React.useEffect(() => {
    // Find current route in navConfig
    const currentIndex = navConfig.findIndex(item => {
      // Special handling for home route
      if (location.pathname === '/' && item.path === '/') return true;
      // Check if current path starts with nav item path (for nested routes)
      return location.pathname.startsWith(item.path) && item.path !== '/';
    });
    
    if (currentIndex !== -1) {
      setBottomNavValue(currentIndex);
    }
  }, [location.pathname]);

  const handleBottomNavChange = (event, newValue) => {
    if (newValue !== null) {
      setBottomNavValue(newValue);
      const item = navConfig[newValue];
      
      // Special handling for Add button
      if (item.path === 'add') {
        // Navigate to create illustration based on current context
        if (location.pathname === '/illustrations') {
          navigate('/illustrations/new');
        } else {
          navigate('/illustrations');
        }
      } else {
        navigate(item.path);
      }
    }
  };

  const getUserInitial = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`;
    }
    return user?.username?.[0]?.toUpperCase() || 'U';
  };

  // Determine which FAB icon to show based on current route
  const getFabIcon = () => {
    if (location.pathname === '/illustrations') return <AddIcon />;
    if (location.pathname === '/manufacturers') return <AddIcon />;
    if (location.pathname === '/car-models') return <AddIcon />;
    if (location.pathname === '/engine-models') return <AddIcon />;
    if (location.pathname === '/part-categories') return <AddIcon />;
    return <AddIcon />;
  };

  const handleFabClick = () => {
    // Navigate to appropriate add page based on current route
    if (location.pathname === '/illustrations') {
      navigate('/illustrations/new');
    } else if (location.pathname === '/manufacturers') {
      // Trigger manufacturer add modal
      const event = new CustomEvent('openManufacturerModal');
      window.dispatchEvent(event);
    } else if (location.pathname === '/car-models') {
      // Trigger car model add modal
      const event = new CustomEvent('openCarModelModal');
      window.dispatchEvent(event);
    } else if (location.pathname === '/engine-models') {
      // Trigger engine model add modal
      const event = new CustomEvent('openEngineModelModal');
      window.dispatchEvent(event);
    } else if (location.pathname === '/part-categories') {
      // Trigger part category add modal
      const event = new CustomEvent('openPartCategoryModal');
      window.dispatchEvent(event);
    } else {
      // Default to illustrations
      navigate('/illustrations');
    }
  };

  return (
    <>
      <Box sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: 1000,
        display: { xs: 'block', md: 'none' } // Show only on mobile
      }}>
        <BottomNavigation
          value={bottomNavValue}
          onChange={handleBottomNavChange}
          sx={{
            height: 56,
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              px: 1,
              '&.Mui-selected': {
                color: 'primary.main'
              }
            }
          }}
        >
          {/* Home */}
          <BottomNavigationAction
            label="Home"
            value={0}
            icon={<HomeIcon />}
          />

          {/* Illustrations */}
          <BottomNavigationAction
            label="Illustrations"
            value={1}
            icon={<DashboardIcon />}
          />

          {/* Add - Placeholder for FAB */}
          <BottomNavigationAction
            label="Add"
            value={2}
            icon={<Box sx={{ visibility: 'hidden' }} />} // Hidden icon
            sx={{ visibility: 'hidden' }}
          />

          {/* Manufacturers */}
          <BottomNavigationAction
            label="Brands"
            value={3}
            icon={<StoreIcon />}
          />

          {/* Profile with Avatar */}
          <BottomNavigationAction
            label="Profile"
            value={4}
            icon={
              <Avatar 
                src={user?.profile_image}
                sx={{ 
                  width: 24, 
                  height: 24, 
                  fontSize: '0.75rem',
                  bgcolor: user?.profile_image ? 'transparent' : 'primary.main'
                }}
              >
                {getUserInitial()}
              </Avatar>
            }
          />
        </BottomNavigation>
      </Box>

      {/* Floating Action Button for Add */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleFabClick}
        sx={{
          position: 'fixed',
          bottom: 72, // Above bottom nav
          right: 16,
          zIndex: 1100,
          width: 56,
          height: 56,
          display: { xs: 'flex', md: 'none' } // Show only on mobile
        }}
      >
        {getFabIcon()}
      </Fab>
    </>
  );
};

export default Navbar;