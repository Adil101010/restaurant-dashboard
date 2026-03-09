import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { WifiOff } from '@mui/icons-material';


const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);


  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);

    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);


  if (!isOffline) return null;


  return (
    <Box
      sx={{
        position: 'fixed',
          top: { xs: '56px', md: '64px' },
        
        left: 0,
        right: 0,
        zIndex: 1099, 
        bgcolor: '#323232',
        color: 'white',
        py: 1,
        px: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
      }}
    >
      <WifiOff fontSize="small" />
      <Typography variant="body2" fontWeight={500}>
        No internet connection — Please check your network
      </Typography>
    </Box>
  );
};


export default OfflineBanner;
