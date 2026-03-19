import React, { useState, useCallback } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Box,
  Avatar, Menu, MenuItem, ListItemIcon, Divider, Chip,
} from '@mui/material';
import { Menu as MenuIcon, Logout, Person, Circle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from '../../hooks/useWebSocket';
import NotificationBell, { type NotificationItem } from '../notifications/NotificationBell';
import type { WebSocketMessage } from '../../hooks/useWebSocket'; 
interface HeaderProps {
  drawerWidth: number;
  onMenuClick: () => void;
}

const playNotificationSound = () => {
  const audio = new Audio('/sounds/new-order.mp3');
  audio.volume = 0.5;
  audio.play().catch(() => {});
};

const Header = ({ drawerWidth, onMenuClick }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);


const handleNewOrder = useCallback((data: WebSocketMessage) => {
    console.log(' NEW_ORDER received:', data);
    
    
    const exists = notifications.some(n => 
      n.orderId === data.orderId && n.type === 'NEW_ORDER'
    );
    
    if (exists) {
      console.log(' Duplicate NEW_ORDER skipped:', data.orderId);
      return;
    }

    playNotificationSound();

    toast.success(` New Order! #${data.orderId} — Tap to view`, {
      duration: 6000,
      position: 'top-right',
      style: { cursor: 'pointer' },
    });

    const newNotif: NotificationItem = {
      id: Date.now(),
      type: 'NEW_ORDER',
      orderId: data.orderId,
      subject: `New Order #${data.orderId}`,
      message: data.message || data.subject || 'New order received',
      timestamp: data.timestamp || new Date().toISOString(),
      isRead: false,
    };

    console.log(' NEW_ORDER added:', newNotif);
    setNotifications(prev => [newNotif, ...prev.slice(0, 19)]);
  }, [notifications]);

 
  const handleOrderUpdate = useCallback((data: WebSocketMessage) => {
    console.log(' ORDER_UPDATE received:', data);
    
   
    const exists = notifications.some(n => 
      n.orderId === data.orderId && n.type === data.type
    );
    
    if (exists) {
      console.log('Duplicate ORDER_UPDATE skipped:', data.orderId);
      return;
    }

    const newNotif: NotificationItem = {
      id: Date.now(),
      type: data.type || 'ORDER_UPDATE',
      orderId: data.orderId,
      subject: data.subject || `Order #${data.orderId} Updated`,
      message: data.message || 'Order status updated',
      timestamp: data.timestamp || new Date().toISOString(),
      isRead: false,
    };

    console.log(' ORDER_UPDATE added:', newNotif);
    setNotifications(prev => [newNotif, ...prev.slice(0, 19)]);
  }, [notifications]);

  
  useWebSocket({
    restaurantId: user?.restaurantId ?? null,
    onNewOrder: handleNewOrder,
    onOrderUpdate: handleOrderUpdate,
  });

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = async () => {
    handleMenuClose();
    try {
      await logout();
      toast.success('Logged out successfully!');
      navigate('/login');
    } catch {
      toast.error('Logout failed. Please try again.');
    }
  };

  
  const handleNotificationClick = useCallback((notification: NotificationItem) => {
    setNotifications(prev =>
      prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
    );
    navigate('/orders');
  }, [navigate]);

  const handleClearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const handleMarkRead = useCallback((id: number) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  }, []);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` },
        bgcolor: 'white',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={onMenuClick}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            {user?.restaurantName || 'Restaurant Dashboard'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            icon={<Circle sx={{ fontSize: '10px !important', color: '#4CAF50 !important' }} />}
            label="Online"
            size="small"
            sx={{
              bgcolor: 'rgba(76,175,80,0.1)',
              color: '#4CAF50',
              fontWeight: 600,
              fontSize: '0.75rem',
              display: { xs: 'none', sm: 'flex' },
            }}
          />

          
          <NotificationBell
            notifications={notifications}
            onClearAll={handleClearAll}
            onMarkRead={handleMarkRead}
            onNotificationClick={handleNotificationClick}
          />

          <IconButton onClick={handleMenuOpen} sx={{ p: 0.5 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 36,
                height: 36,
                fontSize: '0.9rem',
                fontWeight: 700,
              }}
            >
              {user?.restaurantName?.charAt(0).toUpperCase() || 'R'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              elevation: 3,
              sx: { mt: 1, minWidth: 200, borderRadius: 2 },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                {user?.restaurantName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { handleMenuClose(); navigate('/profile'); }} sx={{ py: 1.2 }}>
              <ListItemIcon><Person fontSize="small" /></ListItemIcon>
              Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ py: 1.2, color: 'error.main' }}>
              <ListItemIcon><Logout fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
