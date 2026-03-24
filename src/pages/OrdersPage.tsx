import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  Box, Typography, Chip, Avatar,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Tooltip,
  TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Divider, Skeleton, Alert, Tabs, Tab,
  Stack, CircularProgress,
} from '@mui/material';
import {
  Search, Visibility, Cancel, AccessTime,
  Restaurant, DeliveryDining, CheckCircle,
  Pending, Receipt,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useOutletContext } from 'react-router-dom';
import {
  orderApi, type OrderResponse, type OrderStatus,
} from '../api/orderApi';
import { formatCurrency } from '../utils/formatters';
import EmptyState from '../components/common/EmptyState';
import useDebounce from '../hooks/useDebounce';

const PAGE_SIZE = 20;

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  PENDING_PAYMENT: { label: 'Pending Payment', color: '#9C27B0', bg: '#F3E5F5', icon: <Pending sx={{ fontSize: 14 }} /> },
  PENDING:         { label: 'Pending',         color: '#FF9800', bg: '#FFF3E0', icon: <Pending sx={{ fontSize: 14 }} /> },
  CONFIRMED:       { label: 'Confirmed',        color: '#2196F3', bg: '#E3F2FD', icon: <CheckCircle sx={{ fontSize: 14 }} /> },
  PREPARING:       { label: 'Preparing',        color: '#FF6B35', bg: '#FFF3EC', icon: <Restaurant sx={{ fontSize: 14 }} /> },
  OUT_FOR_DELIVERY:{ label: 'Out for Delivery', color: '#00BCD4', bg: '#E0F7FA', icon: <DeliveryDining sx={{ fontSize: 14 }} /> },
  DELIVERED:       { label: 'Delivered',        color: '#4CAF50', bg: '#E8F5E9', icon: <CheckCircle sx={{ fontSize: 14 }} /> },
  CANCELLED:       { label: 'Cancelled',        color: '#f44336', bg: '#FFEBEE', icon: <Cancel sx={{ fontSize: 14 }} /> },
};

const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
  PENDING:          ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:        ['PREPARING', 'CANCELLED'],
  PREPARING:        ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
};

const StatusChip = React.memo(({ status }: { status: OrderStatus }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <Chip
      icon={<Box sx={{ color: `${cfg.color} !important`, display: 'flex' }}>{cfg.icon}</Box>}
      label={cfg.label} size="small"
      sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: 11 }}
    />
  );
});

const PaymentChip = React.memo(({ status }: { status: string }) => {
  const map: Record<string, { color: string; bg: string }> = {
    PAID:     { color: '#4CAF50', bg: '#E8F5E9' },
    PENDING:  { color: '#FF9800', bg: '#FFF3E0' },
    FAILED:   { color: '#f44336', bg: '#FFEBEE' },
    REFUNDED: { color: '#9C27B0', bg: '#F3E5F5' },
  };
  const cfg = map[status] ?? { color: '#757575', bg: '#F5F5F5' };
  return (
    <Chip label={status} size="small"
      sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: 10 }} />
  );
});

const OrderDetailDialog = ({
  order, onClose, onStatusUpdate,
}: {
  order: OrderResponse | null;
  onClose: () => void;
  onStatusUpdate: (orderId: number, status: OrderStatus) => Promise<void>;
}) => {
  const [updating, setUpdating] = useState(false);
  if (!order) return null;

  const next = NEXT_STATUSES[order.orderStatus] ?? [];

  const handleStatus = async (status: OrderStatus) => {
    setUpdating(true);
    await onStatusUpdate(order.id, status);
    setUpdating(false);
    onClose();
  };

  return (
    <Dialog open={!!order} onClose={onClose} maxWidth="sm" fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            Order #{order.id}
            <Typography variant="caption" color="text.secondary" display="block">
              {new Date(order.createdAt).toLocaleString('en-IN')}
            </Typography>
          </Box>
          <StatusChip status={order.orderStatus} />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Box mb={2}>
          <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.secondary">CUSTOMER</Typography>
          <Typography variant="body2" fontWeight={600}>{order.customerName}</Typography>
          <Typography variant="body2" color="text.secondary">{order.customerPhone}</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>📍 {order.deliveryAddress}</Typography>
          {order.deliveryInstructions && (
            <Typography variant="caption" color="text.secondary">📝 {order.deliveryInstructions}</Typography>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.secondary">ORDER ITEMS</Typography>
        <Stack spacing={1} mb={2}>
          {order.items.map((item, i) => (
            <Box key={i} display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar src={item.imageUrl} variant="rounded"
                  sx={{ width: 36, height: 36, bgcolor: '#FFF3EC' }}>🍽️</Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{item.menuItemName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatCurrency(item.price)} × {item.quantity}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" fontWeight={700}>{formatCurrency(item.totalPrice)}</Typography>
            </Box>
          ))}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.secondary">BILL SUMMARY</Typography>
        {[
          ['Subtotal', order.subtotal],
          ['Delivery Fee', order.deliveryFee],
          ['Tax', order.tax],
          ...(order.discount > 0 ? [['Discount', -order.discount]] : []),
        ].map(([label, val]) => (
          <Box key={label as string} display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="body2" color="text.secondary">{label as string}</Typography>
            <Typography variant="body2" color={(val as number) < 0 ? 'success.main' : 'text.primary'}>
              {(val as number) < 0 ? '-' : ''}{formatCurrency(Math.abs(val as number))}
            </Typography>
          </Box>
        ))}
        <Box display="flex" justifyContent="space-between" mt={1} pt={1}
          sx={{ borderTop: '2px solid #f0f0f0' }}>
          <Typography variant="subtitle2" fontWeight={700}>Total</Typography>
          <Typography variant="subtitle2" fontWeight={700} color="primary.main">
            {formatCurrency(order.totalAmount)}
          </Typography>
        </Box>

        <Box display="flex" gap={2} mt={2} p={1.5} sx={{ bgcolor: '#F8F8F8', borderRadius: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Payment</Typography>
            <Box><PaymentChip status={order.paymentStatus} /></Box>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Method</Typography>
            <Typography variant="body2" fontWeight={600}>{order.paymentMethod?.replace('_', ' ')}</Typography>
          </Box>
          {order.estimatedDeliveryTime && (
            <Box>
              <Typography variant="caption" color="text.secondary">ETA</Typography>
              <Typography variant="body2" fontWeight={600}>
                {new Date(order.estimatedDeliveryTime).toLocaleTimeString('en-IN', {
                  hour: '2-digit', minute: '2-digit',
                })}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      {next.length > 0 ? (
        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>Close</Button>
          {next.map(s => (
            <Button key={s} variant="contained" disabled={updating}
              onClick={() => handleStatus(s)}
              sx={{
                borderRadius: 2,
                bgcolor: s === 'CANCELLED' ? '#f44336' : '#FF6B35',
                '&:hover': { bgcolor: s === 'CANCELLED' ? '#d32f2f' : '#e55a28' },
              }}>
              {STATUS_CONFIG[s].label}
            </Button>
          ))}
        </DialogActions>
      ) : (
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>Close</Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

const TAB_FILTERS: (OrderStatus | 'ALL')[] = [
  'ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED',
];


interface LayoutOutletContext {
  registerRefresh: (cb: () => void) => void;
}

const OrdersPage = () => {
  const { user } = useAuth();

 
  const { registerRefresh } = useOutletContext<LayoutOutletContext>();

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [tabIndex, setTabIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

  const scrollBoxRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const restaurantId = user?.restaurantId ?? 0;
  const debouncedSearch = useDebounce(search, 300);
  const activeFilter = TAB_FILTERS[tabIndex];
  const isOnAllTab = activeFilter === 'ALL';

  const fetchInitial = useCallback(async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    setHasMore(false);
    setError('');
    try {
      const data = await orderApi.getRestaurantOrders(restaurantId, 0, PAGE_SIZE);
      setOrders(data.content);
      setTotalElements(data.totalElements);
      setCurrentPage(0);
      setHasMore(!data.last);
    } catch {
      setError('Failed to load orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  const fetchMore = useCallback(async () => {
    if (!restaurantId || isLoadingMore || !hasMore || !isOnAllTab) return;
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const data = await orderApi.getRestaurantOrders(restaurantId, nextPage, PAGE_SIZE);
      setOrders(prev => [...prev, ...data.content]);
      setCurrentPage(nextPage);
      setHasMore(!data.last);
    } catch {
      toast.error('Failed to load more orders');
    } finally {
      setIsLoadingMore(false);
    }
  }, [restaurantId, currentPage, hasMore, isLoadingMore, isOnAllTab]);

 
  useEffect(() => { fetchInitial(); }, [fetchInitial]);

 
  useEffect(() => {
    registerRefresh(fetchInitial);
  }, [registerRefresh, fetchInitial]);

 
  useEffect(() => {
    if (!hasMore || isLoading || !isOnAllTab) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) fetchMore();
      },
      { root: scrollBoxRef.current, threshold: 0.1, rootMargin: '100px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchMore, hasMore, isLoadingMore, isLoading, isOnAllTab]);

  const handleStatusUpdate = useCallback(async (orderId: number, status: OrderStatus) => {
    try {
      const updated = await orderApi.updateStatus(orderId, status);
      setOrders(prev => prev.map(o => o.id === orderId ? updated : o));
      toast.success(`Order #${orderId} → ${STATUS_CONFIG[status].label}`);
    } catch {
      toast.error('Failed to update order status');
    }
  }, []);

  const filtered = useMemo(() => orders.filter(o => {
    const matchTab = activeFilter === 'ALL' || o.orderStatus === activeFilter;
    const matchSearch = !debouncedSearch ||
      String(o.id).includes(debouncedSearch) ||
      o.customerName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      o.customerPhone?.includes(debouncedSearch);
    return matchTab && matchSearch;
  }), [orders, activeFilter, debouncedSearch]);

  const tabCounts = useMemo(() =>
    TAB_FILTERS.reduce((acc, f) => {
      acc[f] = f === 'ALL' ? orders.length : orders.filter(o => o.orderStatus === f).length;
      return acc;
    }, {} as Record<string, number>),
  [orders]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ flexShrink: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}
          flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h5" fontWeight={700}>Orders</Typography>
            <Typography variant="body2" color="text.secondary">{totalElements} total orders</Typography>
          </Box>
          <Button variant="outlined" startIcon={<Receipt />} onClick={fetchInitial}
            sx={{ borderRadius: 2 }}>
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}
            action={<Button color="error" size="small" onClick={fetchInitial}>Retry</Button>}>
            {error}
          </Alert>
        )}

        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)}
          variant="scrollable" scrollButtons="auto"
          sx={{
            mb: 2, bgcolor: 'white', borderRadius: 2, px: 1,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            '& .MuiTab-root': { minHeight: 48, fontSize: 12, fontWeight: 600 },
            '& .Mui-selected': { color: '#FF6B35 !important' },
            '& .MuiTabs-indicator': { bgcolor: '#FF6B35' },
          }}>
          {TAB_FILTERS.map((f, i) => (
            <Tab key={f} label={
              <Box display="flex" alignItems="center" gap={0.5}>
                {f === 'ALL' ? 'All' : STATUS_CONFIG[f].label}
                {tabCounts[f] > 0 && (
                  <Chip label={tabCounts[f]} size="small"
                    sx={{
                      height: 18, fontSize: 10,
                      bgcolor: tabIndex === i ? '#FF6B35' : '#f0f0f0',
                      color: tabIndex === i ? 'white' : 'text.secondary',
                    }} />
                )}
              </Box>
            } />
          ))}
        </Tabs>

        <Box mb={2}>
          <TextField size="small"
            placeholder="Search by order ID, customer name, phone..."
            value={search} onChange={e => setSearch(e.target.value)}
            sx={{ width: { xs: '100%', sm: 360 }, bgcolor: 'white', borderRadius: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start"><Search fontSize="small" /></InputAdornment>
              ),
            }} />
        </Box>
      </Box>

      <Box ref={scrollBoxRef} sx={{ flexGrow: 1, overflow: 'auto', minHeight: 0 }}>
        <TableContainer component={Paper}
          sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {['Order ID', 'Customer', 'Items', 'Amount', 'Payment', 'Status', 'Time', 'Action']
                  .map(h => (
                    <TableCell key={h}
                      sx={{ fontWeight: 700, fontSize: 12, color: 'text.secondary', bgcolor: '#FAFAFA' }}>
                      {h}
                    </TableCell>
                  ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}><Skeleton height={24} /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ border: 0 }}>
                    <EmptyState
                      type={debouncedSearch ? 'search' : 'orders'}
                      description={
                        debouncedSearch
                          ? `No orders found for "${debouncedSearch}"`
                          : activeFilter !== 'ALL'
                          ? `No ${STATUS_CONFIG[activeFilter as OrderStatus]?.label} orders`
                          : undefined
                      }
                    />
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {filtered.map(order => (
                    <TableRow key={order.id} hover
                      sx={{ '&:hover': { bgcolor: '#FFF9F6' }, cursor: 'pointer' }}
                      onClick={() => setSelectedOrder(order)}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color="primary.main">
                          #{order.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{order.customerName}</Typography>
                        <Typography variant="caption" color="text.secondary">{order.customerPhone}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap
                          sx={{ maxWidth: 140, display: 'block' }}>
                          {order.items?.slice(0, 2).map(i => i.menuItemName).join(', ')}
                          {(order.items?.length ?? 0) > 2 ? '...' : ''}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700}>
                          {formatCurrency(order.totalAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell><PaymentChip status={order.paymentStatus} /></TableCell>
                      <TableCell><StatusChip status={order.orderStatus} /></TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <AccessTime sx={{ fontSize: 13, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(order.createdAt).toLocaleTimeString('en-IN', {
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {new Date(order.createdAt).toLocaleDateString('en-IN')}
                        </Typography>
                      </TableCell>
                      <TableCell onClick={e => e.stopPropagation()}>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => setSelectedOrder(order)}
                              sx={{ bgcolor: '#F5F5F5', '&:hover': { bgcolor: '#E3F2FD' } }}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {NEXT_STATUSES[order.orderStatus]?.includes('CANCELLED') && (
                            <Tooltip title="Cancel Order">
                              <IconButton size="small"
                                onClick={async () => handleStatusUpdate(order.id, 'CANCELLED')}
                                sx={{ bgcolor: '#F5F5F5', '&:hover': { bgcolor: '#FFEBEE' } }}>
                                <Cancel fontSize="small" color="error" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}

                  {hasMore && isOnAllTab && (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ border: 0, p: 0 }}>
                        <div ref={sentinelRef} style={{ height: 20 }} />
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {isLoadingMore && isOnAllTab && (
          <Box display="flex" justifyContent="center" alignItems="center" py={2} gap={1}>
            <CircularProgress size={18} sx={{ color: '#FF6B35' }} />
            <Typography variant="caption" color="text.secondary">Loading more orders...</Typography>
          </Box>
        )}

        {!hasMore && orders.length > 0 && !isLoading && isOnAllTab && (
          <Box textAlign="center" py={2}>
            <Typography variant="caption" color="text.secondary">
              {totalElements} orders loaded
            </Typography>
          </Box>
        )}
      </Box>

      <OrderDetailDialog
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusUpdate={handleStatusUpdate}
      />
    </Box>
  );
};

export default OrdersPage;
