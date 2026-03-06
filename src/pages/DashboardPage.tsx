import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Grid,
  Typography,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  CurrencyRupee,
  ShoppingBag,
  PendingActions,
  CheckCircle,
  Refresh,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { analyticsApi } from '../api/analyticsApi';
import type { RevenueData, OrderStatsData, TopItem, DailyRevenue } from '../api/analyticsApi';
import StatCard from '../components/analytics/StatCard';
import RevenueChart from '../components/analytics/RevenueChart';
import TopItemsTable from '../components/analytics/TopItemsTable';
import { formatCurrency } from '../utils/formatters';

const DashboardPage = () => {
  const { user } = useAuth();
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [orderStats, setOrderStats] = useState<OrderStatsData | null>(null);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [weeklyRevenue, setWeeklyRevenue] = useState<DailyRevenue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchDashboardData = useCallback(async () => {
    if (!user?.restaurantId) return;

    setIsLoading(true);
    setError('');

    try {
      const [revenue, orders, items, weekly] = await Promise.all([
        analyticsApi.getRevenue(user.restaurantId),
        analyticsApi.getOrderStats(user.restaurantId),
        analyticsApi.getTopItems(user.restaurantId, 5),
        analyticsApi.getWeeklyRevenue(user.restaurantId),
      ]);

      setRevenueData(revenue);
      setOrderStats(orders);
      setTopItems(items);
      setWeeklyRevenue(weekly);
      setLastRefresh(new Date());
    } catch {
      const msg = 'Failed to load dashboard data. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [user?.restaurantId]);

  // Initial fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleManualRefresh = () => {
    fetchDashboardData();
    toast.success('Dashboard refreshed!');
  };

  return (
    <Box>
      {/* Page Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back, {user?.restaurantName}! Here's what's happening today.
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="caption" color="text.secondary">
            Last updated: {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </Typography>
          <Tooltip title="Refresh">
            <IconButton
              onClick={handleManualRefresh}
              size="small"
              sx={{ color: 'primary.main' }}
            >
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Stat Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Today's Revenue"
            value={revenueData ? formatCurrency(revenueData.todayRevenue) : '₹0'}
            icon={<CurrencyRupee sx={{ color: 'white', fontSize: 26 }} />}
            iconBgColor="#FF6B35"
            isLoading={isLoading}
            subtitle="Total earnings today"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Today's Orders"
            value={orderStats?.todayOrders ?? 0}
            icon={<ShoppingBag sx={{ color: 'white', fontSize: 26 }} />}
            iconBgColor="#2196F3"
            isLoading={isLoading}
            subtitle="Orders received today"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Pending Orders"
            value={orderStats?.pendingOrders ?? 0}
            icon={<PendingActions sx={{ color: 'white', fontSize: 26 }} />}
            iconBgColor="#FF9800"
            isLoading={isLoading}
            subtitle="Awaiting acceptance"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Completed Orders"
            value={orderStats?.completedOrders ?? 0}
            icon={<CheckCircle sx={{ color: 'white', fontSize: 26 }} />}
            iconBgColor="#4CAF50"
            isLoading={isLoading}
            subtitle="Successfully delivered"
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} lg={8}>
          <RevenueChart data={weeklyRevenue} isLoading={isLoading} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <TopItemsTable items={topItems} isLoading={isLoading} />
        </Grid>
      </Grid>

      {/* Monthly Stats Row */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Weekly Revenue"
            value={revenueData ? formatCurrency(revenueData.weeklyRevenue) : '₹0'}
            icon={<CurrencyRupee sx={{ color: 'white', fontSize: 26 }} />}
            iconBgColor="#9C27B0"
            isLoading={isLoading}
            subtitle="This week's total"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <StatCard
            title="Monthly Revenue"
            value={revenueData ? formatCurrency(revenueData.monthlyRevenue) : '₹0'}
            icon={<CurrencyRupee sx={{ color: 'white', fontSize: 26 }} />}
            iconBgColor="#00BCD4"
            isLoading={isLoading}
            subtitle="This month's total"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
