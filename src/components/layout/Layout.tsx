import React, { useState } from 'react';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header.tsx';
import Sidebar from './Sidebar.tsx';


import { Outlet } from 'react-router-dom';

const DRAWER_WIDTH = 260;

const Layout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Header
        drawerWidth={DRAWER_WIDTH}
        onMenuClick={handleDrawerToggle}
      />

      {/* Sidebar */}
      <Sidebar
        drawerWidth={DRAWER_WIDTH}
        mobileOpen={mobileOpen}
        onClose={handleDrawerToggle}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar /> {/* Header height ke barabar space */}
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout;
