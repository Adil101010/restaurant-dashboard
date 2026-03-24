import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LocalOffer } from '@mui/icons-material';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Dashboard,
  RestaurantMenu,
  ShoppingBag,
  Store,
  Settings,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';


interface SidebarProps {
  drawerWidth: number;
  mobileOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}


const navItems = [
  { label: 'Dashboard', path: '/', icon: <Dashboard /> },
  { label: 'Menu', path: '/menu', icon: <RestaurantMenu /> },
  { label: 'Orders', path: '/orders', icon: <ShoppingBag /> },
   { path: '/promotions', label: 'Promo', icon: <LocalOffer /> },
  { label: 'Profile', path: '/profile', icon: <Store /> },
   
  { label: 'Settings', path: '/settings', icon: <Settings /> },

];



const DrawerContent = ({ onClose, isMobile }: { onClose?: () => void; isMobile?: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();


  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

    
      <Box
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Avatar
          sx={{
            bgcolor: 'white',
            color: 'primary.main',
            fontWeight: 700,
            width: 44,
            height: 44,
          }}
        >
          {user?.restaurantName?.charAt(0).toUpperCase() || 'R'}
        </Avatar>
        <Box>
          <Typography
            variant="subtitle1"
            fontWeight={700}
            color="white"
            noWrap
            sx={{ maxWidth: 160 }}
          >
            {user?.restaurantName || 'Restaurant'}
          </Typography>
          <Typography variant="caption" color="rgba(255,255,255,0.8)" noWrap>
            {user?.email || ''}
          </Typography>
        </Box>
      </Box>

      <Divider />

     
      <List sx={{ px: 1.5, py: 2, flexGrow: 1 }}>
        {navItems.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path);

          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile && onClose) onClose(); 
                }}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  py: 1.2,
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'text.primary',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.dark' : 'rgba(255,107,53,0.08)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'white' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                    fontSize: '0.95rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.disabled">
          Restaurant Dashboard 
        </Typography>
      </Box>
    </Box>
  );
};


const Sidebar = ({ drawerWidth, mobileOpen, onClose, isMobile }: SidebarProps) => {
  return (
    <Box
      component="nav"
      sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
    >
     
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
        >
          <DrawerContent onClose={onClose} isMobile={isMobile} /> 
        </Drawer>
      ) : (
        
        <Drawer
          variant="permanent"
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          <DrawerContent /> 
        </Drawer>
      )}
    </Box>
  );
};


export default Sidebar;
