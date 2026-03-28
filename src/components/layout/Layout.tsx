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

  const handleNewOrder = useCallback((data: any) => {
    toast.success(`🛒 New Order #${data?.orderId ?? ''} Received!`, {
      duration: 5000,
      style: { fontWeight: 700 },
    });
    // ✅ Har page pe refresh karo — sirf /orders nahi
    ordersRefreshRef.current?.();
  }, []);

  const handleOrderUpdate = useCallback((data: any) => {
    const type = data?.type as string ?? '';
    const orderId = data?.orderId ?? '';

    // ✅ Status ke hisaab se toast dikhao
    const toastMessages: Record<string, string> = {
      PREPARING:        `🍳 Order #${orderId} — Preparing`,
      OUT_FOR_DELIVERY: `🚴 Order #${orderId} — Out for Delivery`,
      DELIVERED:        `✅ Order #${orderId} — Delivered`,
      CONFIRMED:        `✅ Order #${orderId} — Confirmed`,
      ORDER_CANCELLED:  `❌ Order #${orderId} — Cancelled`,
    };

    if (toastMessages[type]) {
      toast(toastMessages[type], { duration: 4000 });
    }

    // ✅ Hamesha refresh karo — location check hataya
    ordersRefreshRef.current?.();
  }, []);

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
