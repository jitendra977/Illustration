import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  BottomNavigation,
  BottomNavigationAction,
  Badge,
  Avatar
} from '@mui/material';
import {
  Home,
  Receipt,
  Add,
  Analytics,
  Person
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ currentLocation }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications] = useState(3);
  const [bottomNavValue, setBottomNavValue] = useState(0);

  const navConfig = [
    { label: 'Home', icon: <Home />, path: '/' },
    { label: 'Illustrations', icon: <Receipt />, path: '/illustrations' },
    { label: 'Add', icon: <Add />, path: '/add' },
    { label: 'Analytics', icon: <Analytics />, path: '/analytics' },
    { label: 'Profile', icon: <Person />, path: '/profile' },
  ];

  React.useEffect(() => {
    const currentIndex = navConfig.findIndex(item => item.path === currentLocation.pathname);
    if (currentIndex !== -1) setBottomNavValue(currentIndex);
  }, [currentLocation.pathname]);

  const handleBottomNavChange = (event, newValue) => {
    setBottomNavValue(newValue);
    const item = navConfig[newValue];
    
    if (item.path === '/add') {
      navigate('/illustrations/new');
    } else {
      navigate(item.path);
    }
  };

  const getUserInitial = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`;
    }
    return user?.username?.[0]?.toUpperCase() || 'U';
  };

  console.log('Navbar user data:', user);

  return (
    <Box sx={{ 
      position: 'fixed', 
      bottom: 0, 
      left: 0, 
      right: 0, 
      zIndex: 1000 
    }}>
      <BottomNavigation
        value={bottomNavValue}
        onChange={handleBottomNavChange}
        sx={{
          height: 64,
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper'
        }}
      >
        {/* Home */}
        <BottomNavigationAction
          label="Home"
          icon={<Home />}
          sx={{
            minWidth: 'auto',
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem'
            }
          }}
        />

        {/* Illustrations with Badge */}
        <BottomNavigationAction
          label="Illustrations"
          icon={
            <Badge 
              color="error" 
              variant="dot" 
              invisible={notifications === 0}
            >
              <Receipt />
            </Badge>
          }
          sx={{
            minWidth: 'auto',
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem'
            }
          }}
        />

        {/* Add Button - Special Styling */}
        <BottomNavigationAction
          label="Add"
          icon={
            <Box sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <Add />
            </Box>
          }
          sx={{
            minWidth: 'auto',
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem'
            }
          }}
        />

        {/* Analytics */}
        <BottomNavigationAction
          label="Analytics"
          icon={<Analytics />}
          sx={{
            minWidth: 'auto',
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem'
            }
          }}
        />

        {/* Profile with Avatar */}
        <BottomNavigationAction
          label="Profile"
          icon={
            <Avatar 
              src={user?.profile_image}
              sx={{ 
                width: 28, 
                height: 28, 
                fontSize: '0.75rem',
                bgcolor: user?.profile_image ? 'transparent' : 'primary.main'
              }}
            >
              {getUserInitial()}
            </Avatar>
          }
          sx={{
            minWidth: 'auto',
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem'
            }
          }}
        />
      </BottomNavigation>
    </Box>
  );
};

export default Navbar;