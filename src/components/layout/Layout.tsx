import React, { useState, useCallback, useRef } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header.tsx';
import Sidebar from './Sidebar.tsx';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import toast from 'react-hot-toast';

const DRAWER_WIDTH = 260;

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();


  const ordersRefreshRef = useRef<(() => void) | null>(null);

  const registerRefresh = useCallback((cb: () => void) => {
    ordersRefreshRef.current = cb;
  }, []);


  const handleNewOrder = useCallback(() => {
    toast.success('🛒 New Order Received!', {
      duration: 5000,
      style: { fontWeight: 700 },
    });
    // Orders page open hai toh refresh karo
    if (location.pathname === '/orders' && ordersRefreshRef.current) {
      ordersRefreshRef.current();
    }
  }, [location.pathname]);

  const handleOrderUpdate = useCallback(() => {
    if (location.pathname === '/orders' && ordersRefreshRef.current) {
      ordersRefreshRef.current();
    }
  }, [location.pathname]);

  useWebSocket({
    restaurantId: user?.restaurantId ?? null,
    onNewOrder: handleNewOrder,
    onOrderUpdate: handleOrderUpdate,
  });

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Header drawerWidth={DRAWER_WIDTH} onMenuClick={handleDrawerToggle} />
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        onClose={handleDrawerToggle}
        isMobile={isMobile}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 3 },
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
          overflow: 'hidden',
        }}
      >
        <Toolbar />
      
        <Outlet context={{ registerRefresh }} />
      </Box>
    </Box>
  );
};

export default Layout;
