import React, { useState, useEffect } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useLocation, useNavigate } from 'react-router-dom';

// Sub-components
import Sidebar from './mobile/Sidebar';
import Topbar from './mobile/Topbar';
import BottomBar from './mobile/BottomBar';

const DRAWER_WIDTH = 280;

const MobileLayout = ({ children, showHeader = true, onRefresh, refreshing = false }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const theme = useTheme();
  const [bottomNavValue, setBottomNavValue] = useState(0);

  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setBottomNavValue(0);
    else if (path.startsWith('/illustrations')) setBottomNavValue(1);
    else if (path === '/favorites') setBottomNavValue(2);
    else if (path === '/profile') setBottomNavValue(3);
  }, [location.pathname]);

  return (
    <Box sx={{
      display: 'flex',
      minHeight: '100vh',
      bgcolor: theme.palette.background.default
    }}>
      {/* Header / Topbar */}
      <Topbar
        showHeader={showHeader}
        isDesktop={isDesktop}
        drawerWidth={DRAWER_WIDTH}
        setMenuOpen={setMenuOpen}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      {/* Side Menu / Sidebar */}
      <Sidebar
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        drawerWidth={DRAWER_WIDTH}
        isDesktop={isDesktop}
      />

      {/* Scrollable Content */}
      <Box component="main" sx={{
        flexGrow: 1,
        p: 0,
        width: isDesktop ? `calc(100% - ${DRAWER_WIDTH}px)` : '100%',
        maxWidth: '100vw',
        mt: showHeader ? '64px' : 0,
        mb: isDesktop ? 0 : '72px', // Bottom nav height
        overflowX: 'hidden',
        minHeight: isDesktop ? '100vh' : 'calc(100vh - 136px)', // Account for header + bottom nav on mobile
        position: 'relative',
      }}>
        {children}
      </Box>

      {/* Bottom Navigation */}
      <BottomBar
        isDesktop={isDesktop}
        bottomNavValue={bottomNavValue}
        setBottomNavValue={setBottomNavValue}
      />

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 0px; background: transparent; }
      `}</style>
    </Box>
  );
};

export default MobileLayout;