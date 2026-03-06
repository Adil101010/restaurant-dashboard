export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8080';
export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Restaurant Dashboard';

export const TOKEN_KEYS = {
  ACCESS: 'accessToken',
  REFRESH: 'refreshToken',
  USER: 'authUser',
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  ACCEPTED: 'Accepted',
  PREPARING: 'Preparing',
  READY: 'Ready',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: '#FF9800',
  ACCEPTED: '#2196F3',
  PREPARING: '#9C27B0',
  READY: '#4CAF50',
  OUT_FOR_DELIVERY: '#00BCD4',
  DELIVERED: '#8BC34A',
  CANCELLED: '#F44336',
  REJECTED: '#F44336',
};
