import { useState } from 'react';
import {
  IconButton, Badge, Popover, Box, Typography,
  List, ListItem, ListItemText, Divider, Button,
} from '@mui/material';
import { Notifications, NotificationsNone } from '@mui/icons-material';

export interface NotificationItem {
  id: number;
  type: string;
  orderId?: number;                         
  subject: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface NotificationBellProps {
  notifications: NotificationItem[];
  onClearAll: () => void;
  onMarkRead: (id: number) => void;
  onNotificationClick?: (notification: NotificationItem) => void; 
}

const NotificationBell = ({
  notifications,
  onClearAll,
  onMarkRead,
  onNotificationClick,                       
}: NotificationBellProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  
  const handleNotificationClick = (notif: NotificationItem) => {
    onMarkRead(notif.id);
    setAnchorEl(null);                       
    onNotificationClick?.(notif);            
  };

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} color="inherit">
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? (
            <Notifications sx={{ color: '#FF6B35' }} />
          ) : (
            <NotificationsNone />
          )}
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Box sx={{ width: 360, maxHeight: 480 }}>
          {/* Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            px={2} py={1.5}
            borderBottom="1px solid #eee"
          >
            <Typography fontWeight={700}>
              Notifications {unreadCount > 0 && `(${unreadCount})`}
            </Typography>
            {notifications.length > 0 && (
              <Button size="small" onClick={onClearAll} sx={{ color: '#FF6B35' }}>
                Clear All
              </Button>
            )}
          </Box>

        
          {notifications.length === 0 ? (
            <Box p={3} textAlign="center">
              <NotificationsNone sx={{ fontSize: 40, color: '#ccc', mb: 1 }} />
              <Typography color="text.secondary" variant="body2">
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: 380, overflow: 'auto', p: 0 }}>
              {notifications.map((notif, index) => (
                <Box key={notif.id}>
                  <ListItem
                    alignItems="flex-start"
                    onClick={() => handleNotificationClick(notif)} 
                    sx={{
                      cursor: 'pointer',
                      bgcolor: notif.isRead ? 'transparent' : '#FFF5F2',
                      '&:hover': { bgcolor: '#FFF5F2' },
                      px: 2, py: 1.5,
                    }}
                  >
                   
                    <Box
                      sx={{
                        width: 8, height: 8, borderRadius: '50%',
                        mt: 0.7, mr: 1.5, flexShrink: 0,
                        bgcolor:
                          notif.type === 'NEW_ORDER' ? '#4CAF50' :
                          notif.type === 'ORDER_CANCELLED' ? '#f44336' : '#FF6B35',
                      }}
                    />
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={notif.isRead ? 400 : 700}>
                          {notif.subject}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          {notif.message && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {notif.message}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary">
                            {new Date(notif.timestamp).toLocaleTimeString('en-IN', {
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
};

export default NotificationBell;
