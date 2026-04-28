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
  Search, Visibility, Cancel,
  Restaurant, DeliveryDining, CheckCircle,
  Pending, Receipt,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useOutletContext } from 'react-router-dom';
import {
  orderApi,
  formatBackendDate,   
  type OrderResponse,
  type OrderStatus,
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

const PAYMENT_CONFIG: Record<string, { color: string; bg: string }> = {
  PAID:     { color: '#1565C0', bg: '#E3F2FD' },
  PENDING:  { color: '#78909C', bg: '#ECEFF1' },
  FAILED:   { color: '#C62828', bg: '#FFEBEE' },
  REFUNDED: { color: '#6A1B9A', bg: '#F3E5F5' },
};


const StatusChip = React.memo(({ status }: { status: OrderStatus }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <Chip
      icon={<Box sx={{ color: `${cfg.color} !important`, display: 'flex' }}>{cfg.icon}</Box>}
      label={cfg.label}
      size="small"
      sx={{
        bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: 11, px: 0.5,
        '& .MuiChip-label': { px: 0.75 },
      }}
    />
  );
});

const PaymentChip = React.memo(({ status }: { status: string }) => {
  const cfg = PAYMENT_CONFIG[status] ?? { color: '#757575', bg: '#F5F5F5' };
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        bgcolor: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: 10,
        '& .MuiChip-label': { px: 0.75 },
      }}
    />
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
            {/*  FIXED — array format handle hoga */}
            <Typography variant="caption" color="text.secondary" display="block">
              {formatBackendDate(order.createdAt)}
            </Typography>
          </Box>
          <StatusChip status={order.orderStatus} />
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Customer */}
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

        {/* Order Items */}
        <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.secondary">ORDER ITEMS</Typography>
        <Stack spacing={1} mb={2}>
          {order.items.map((item, i) => (
            <Box key={i} display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <Avatar variant="rounded"
                  sx={{ width: 36, height: 36, bgcolor: '#FFF3EC', fontSize: 18 }}>
                  🍽️
                </Avatar>
                <Box>
                  <Typography variant="body2" fontWeight={600}>{item.itemName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatCurrency(item.price)} × {item.quantity}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" fontWeight={700}>{formatCurrency(item.subtotal)}</Typography>
            </Box>
          ))}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* Bill Summary */}
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

        {/* Payment Info */}
        <Box display="flex" gap={2} mt={2} p={1.5} sx={{ bgcolor: '#F8F8F8', borderRadius: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Payment</Typography>
            <Box mt={0.5}><PaymentChip status={order.paymentStatus} /></Box>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Method</Typography>
            <Typography variant="body2" fontWeight={600}>
              {order.paymentMethod?.replace(/_/g, ' ')}
            </Typography>
          </Box>
          {/* ✅ FIXED — estimatedDeliveryTime array format */}
          {order.estimatedDeliveryTime && (
            <Box>
              <Typography variant="caption" color="text.secondary">ETA</Typography>
              <Typography variant="body2" fontWeight={600}>
                {formatBackendDate(order.estimatedDeliveryTime, { timeOnly: true })}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Delivery Partner */}
        {order.deliveryPartnerName && (
          <>
            <Divider sx={{ mb: 2, mt: 2 }} />
            <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.secondary">
              DELIVERY PARTNER
            </Typography>
            <Box p={2} sx={{ bgcolor: '#FFF8E1', borderRadius: 2, border: '1px solid #FFE082' }}>
              <Stack spacing={1}>
                <Box display="flex" alignItems="center" gap={1}>
                  <DeliveryDining sx={{ color: '#F57C00', fontSize: 20 }} />
                  <Typography variant="body2" fontWeight={700} color="#E65100">
                    {order.deliveryPartnerName}
                  </Typography>
                </Box>
                {order.deliveryPartnerPhone && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60 }}>Phone</Typography>
                    <Typography variant="body2" fontWeight={600}>{order.deliveryPartnerPhone}</Typography>
                  </Box>
                )}
                {order.deliveryPartnerVehicle && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60 }}>Vehicle</Typography>
                    <Typography variant="body2" fontWeight={600}>{order.deliveryPartnerVehicle}</Typography>
                  </Box>
                )}
              </Stack>
            </Box>
          </>
        )}
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
              {updating ? <CircularProgress size={16} color="inherit" /> : STATUS_CONFIG[s].label}
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

  const [orders, setOrders]               = useState<OrderResponse[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError]                 = useState('');
  const [search, setSearch]               = useState('');
  const [tabIndex, setTabIndex]           = useState(0);
  const [currentPage, setCurrentPage]     = useState(0);
  const [hasMore, setHasMore]             = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);

  const scrollBoxRef = useRef<HTMLDivElement>(null);
  const sentinelRef  = useRef<HTMLDivElement>(null);

  const restaurantId   = user?.restaurantId ?? 0;
  const debouncedSearch = useDebounce(search, 300);
  const activeFilter   = TAB_FILTERS[tabIndex];
  const isOnAllTab     = activeFilter === 'ALL';

  const fetchInitial = useCallback(async () => {
    if (!restaurantId) return;
    setIsLoading(true);
    setHasMore(false);
    setError('');
    try {
      const data = isOnAllTab
        ? await orderApi.getRestaurantOrders(restaurantId, 0, PAGE_SIZE)
        : await orderApi.getRestaurantOrdersByStatus(restaurantId, activeFilter as OrderStatus, 0, PAGE_SIZE);

      setOrders(data.content);
      setTotalElements(data.totalElements);
      setCurrentPage(0);
      setHasMore(!data.last);
    } catch {
      setError('Failed to load orders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId, activeFilter, isOnAllTab]);

  const fetchMore = useCallback(async () => {
    if (!restaurantId || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const data = isOnAllTab
        ? await orderApi.getRestaurantOrders(restaurantId, nextPage, PAGE_SIZE)
        : await orderApi.getRestaurantOrdersByStatus(restaurantId, activeFilter as OrderStatus, nextPage, PAGE_SIZE);

      setOrders(prev => [...prev, ...data.content]);
      setCurrentPage(nextPage);
      setHasMore(!data.last);
    } catch {
      toast.error('Failed to load more orders');
    } finally {
      setIsLoadingMore(false);
    }
  }, [restaurantId, currentPage, hasMore, isLoadingMore, isOnAllTab, activeFilter]);

  useEffect(() => { fetchInitial(); }, [fetchInitial]);
  useEffect(() => { registerRefresh(fetchInitial); }, [registerRefresh, fetchInitial]);

  useEffect(() => {
    if (!hasMore || isLoading) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting && !isLoadingMore) fetchMore(); },
      { root: scrollBoxRef.current, threshold: 0.1, rootMargin: '100px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [fetchMore, hasMore, isLoadingMore, isLoading]);

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
    const q = debouncedSearch.toLowerCase();
    return !q
      || String(o.id).includes(q)
      || o.customerName?.toLowerCase().includes(q)
      || o.customerPhone?.includes(q);
  }), [orders, debouncedSearch]);

  const tabCounts = useMemo(() =>
    TAB_FILTERS.reduce((acc, f) => {
      acc[f] = f === activeFilter ? totalElements : orders.filter(o => o.orderStatus === f).length;
      return acc;
    }, {} as Record<string, number>),
  [orders, activeFilter, totalElements]);

  const TABLE_HEADERS = ['Order ID', 'Customer', 'Items', 'Amount', 'Payment', 'Status', 'Driver', 'Time', 'Action'];

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header */}
      <Box sx={{ flexShrink: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}
          flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h5" fontWeight={800} color="text.primary">Orders</Typography>
            <Typography variant="body2" color="text.secondary">{totalElements} total orders</Typography>
          </Box>
          <Button variant="outlined" startIcon={<Receipt />} onClick={fetchInitial}
            sx={{
              borderRadius: 2, borderColor: '#FF6B35', color: '#FF6B35', fontWeight: 600,
              '&:hover': { borderColor: '#e55a28', bgcolor: '#FFF3EC' },
            }}>
            Refresh
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}
            action={<Button color="error" size="small" onClick={fetchInitial}>Retry</Button>}>
            {error}
          </Alert>
        )}

        {/* Tabs */}
        <Tabs
          value={tabIndex}
          onChange={(_, v) => { setTabIndex(v); setSearch(''); }}
          variant="scrollable" scrollButtons="auto"
          sx={{
            mb: 2, bgcolor: 'white', borderRadius: 2, px: 1,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            '& .MuiTab-root': {
              minHeight: 48, fontSize: 12, fontWeight: 600, color: '#78909C',
              borderRadius: 1.5, mx: 0.25, transition: 'all 0.2s',
              '&:hover': { bgcolor: '#FFF3EC', color: '#FF6B35' },
            },
            '& .Mui-selected': { color: '#FF6B35 !important', fontWeight: 700, bgcolor: '#FFF3EC' },
            '& .MuiTabs-indicator': { bgcolor: '#FF6B35', height: 3, borderRadius: 2 },
          }}>
          {TAB_FILTERS.map((f, i) => (
            <Tab key={f} label={
              <Box display="flex" alignItems="center" gap={0.75}>
                {f === 'ALL' ? 'All' : STATUS_CONFIG[f].label}
                {tabCounts[f] > 0 && (
                  <Chip label={tabCounts[f]} size="small"
                    sx={{
                      height: 18, fontSize: 10, fontWeight: 700,
                      bgcolor: tabIndex === i ? '#FF6B35' : '#EEEEEE',
                      color: tabIndex === i ? 'white' : '#757575',
                      '& .MuiChip-label': { px: 0.75 },
                    }}
                  />
                )}
              </Box>
            } />
          ))}
        </Tabs>

        {/* Search */}
        <Box mb={2}>
          <TextField
            size="small"
            placeholder="Search by order ID, customer name, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{
              width: { xs: '100%', sm: 440 }, bgcolor: 'white', borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': { borderColor: '#FF6B35' },
                '&.Mui-focused fieldset': { borderColor: '#FF6B35' },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" sx={{ color: '#9E9E9E' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Box>

      {/* Table */}
      <Box ref={scrollBoxRef} sx={{ flexGrow: 1, overflow: 'auto', minHeight: 0 }}>
        <TableContainer component={Paper}
          sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {TABLE_HEADERS.map(h => (
                  <TableCell key={h} sx={{
                    fontWeight: 700, fontSize: 11, color: '#78909C', bgcolor: '#FAFAFA',
                    letterSpacing: '0.05em', textTransform: 'uppercase', py: 1.5, whiteSpace: 'nowrap',
                  }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <TableCell key={j}><Skeleton height={24} sx={{ borderRadius: 1 }} /></TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} sx={{ border: 0 }}>
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
                      sx={{ '&:hover': { bgcolor: '#FFF9F6' }, cursor: 'pointer', transition: 'background 0.15s' }}
                      onClick={() => setSelectedOrder(order)}>

                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" fontWeight={700} color="#FF6B35">#{order.id}</Typography>
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>{order.customerName}</Typography>
                        <Typography variant="caption" color="text.secondary">{order.customerPhone}</Typography>
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2">
                          {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap
                          sx={{ maxWidth: 130, display: 'block' }}>
                          {order.items?.slice(0, 2).map(i => i.itemName).join(', ')}
                          {(order.items?.length ?? 0) > 2 ? '...' : ''}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="body2" fontWeight={700}>
                          {formatCurrency(order.totalAmount)}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        <PaymentChip status={order.paymentStatus} />
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        <StatusChip status={order.orderStatus} />
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        {order.deliveryPartnerName ? (
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <DeliveryDining sx={{ fontSize: 14, color: '#F57C00' }} />
                            <Typography variant="caption" fontWeight={600} color="#E65100" noWrap>
                              {order.deliveryPartnerName}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.disabled">—</Typography>
                        )}
                      </TableCell>

                
                      <TableCell sx={{ py: 1.5 }}>
                        <Typography variant="caption" fontWeight={700} color="text.primary" display="block">
                          {formatBackendDate(order.createdAt, { timeOnly: true })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatBackendDate(order.createdAt, { dateOnly: true })}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }} onClick={e => e.stopPropagation()}>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="View Order Details" arrow>
                            <IconButton size="small" onClick={() => setSelectedOrder(order)}
                              sx={{ bgcolor: '#F5F5F5', borderRadius: 1.5, '&:hover': { bgcolor: '#FFF3EC', color: '#FF6B35' } }}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {NEXT_STATUSES[order.orderStatus]?.includes('CANCELLED') && (
                            <Tooltip title="Cancel Order" arrow>
                              <IconButton size="small"
                                onClick={() => handleStatusUpdate(order.id, 'CANCELLED')}
                                sx={{ bgcolor: '#F5F5F5', borderRadius: 1.5, '&:hover': { bgcolor: '#FFEBEE' } }}>
                                <Cancel fontSize="small" color="error" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}

                  {hasMore && (
                    <TableRow>
                      <TableCell colSpan={9} sx={{ border: 0, p: 0 }}>
                        <div ref={sentinelRef} style={{ height: 20 }} />
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {isLoadingMore && (
          <Box display="flex" justifyContent="center" alignItems="center" py={2} gap={1}>
            <CircularProgress size={18} sx={{ color: '#FF6B35' }} />
            <Typography variant="caption" color="text.secondary">Loading more orders...</Typography>
          </Box>
        )}

        {!hasMore && orders.length > 0 && !isLoading && (
          <Box textAlign="center" py={2}>
            <Typography variant="caption" color="text.secondary">
              All {totalElements} orders loaded
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