import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import {
  ShoppingBag,
  RestaurantMenu,
  Inbox,
  SearchOff,
} from '@mui/icons-material';


type EmptyStateType = 'orders' | 'menu' | 'search' | 'generic';


interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}


const config = {
  orders: {
    icon: <ShoppingBag sx={{ fontSize: 64, color: 'text.disabled' }} />,
    title: 'No orders yet',
    description: 'New orders will appear here. Keep your restaurant open!',
  },
  menu: {
    icon: <RestaurantMenu sx={{ fontSize: 64, color: 'text.disabled' }} />,
    title: 'No menu items',
    description: 'Start by adding your first menu item.',
  },
  search: {
    icon: <SearchOff sx={{ fontSize: 64, color: 'text.disabled' }} />,
    title: 'No results found',
    description: 'Try searching with different keywords.',
  },
  generic: {
    icon: <Inbox sx={{ fontSize: 64, color: 'text.disabled' }} />,
    title: 'Nothing here yet',
    description: 'Data will appear here once available.',
  },
};


const EmptyState = ({
  type = 'generic',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  const preset = config[type];

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      py={8}
      px={3}
      textAlign="center"
    >
      {preset.icon}

      <Typography variant="h6" fontWeight={600} mt={2} mb={1}>
        {title || preset.title}
      </Typography>

      <Typography variant="body2" color="text.secondary" maxWidth={320} mb={3}>
        {description || preset.description}
      </Typography>

      {actionLabel && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          sx={{ borderRadius: 2, px: 3 }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
};


export default EmptyState;
