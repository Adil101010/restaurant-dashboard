import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
} from '@mui/material';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { DailyRevenue } from '../../api/analyticsApi';
import { formatCurrency } from '../../utils/formatters';

interface RevenueChartProps {
  data: DailyRevenue[];
  isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <Box
        sx={{
          bgcolor: 'white',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          p: 1.5,
          boxShadow: 2,
        }}
      >
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography variant="subtitle2" fontWeight={700} color="primary.main">
          {formatCurrency(payload[0].value)}
        </Typography>
      </Box>
    );
  }
  return null;
};

const RevenueChart = ({ data, isLoading = false }: RevenueChartProps) => {
  const chartData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
    }),
    revenue: item.revenue,
    orders: item.orders,
  }));

  return (
    <Card sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Revenue Trend
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Last 7 days
            </Typography>
          </Box>
        </Box>

        {isLoading ? (
          <Skeleton variant="rectangular" height={250} sx={{ borderRadius: 2 }} />
        ) : data.length === 0 ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height={250}
          >
            <Typography color="text.secondary">No revenue data available</Typography>
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: '#888' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#888' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#FF6B35"
                strokeWidth={2.5}
                fill="url(#revenueGradient)"
                dot={{ fill: '#FF6B35', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#FF6B35' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
