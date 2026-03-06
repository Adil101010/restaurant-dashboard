import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton,
} from '@mui/material';
import type { SxProps } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor: string;
  isLoading?: boolean;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor,
  isLoading = false,
  trend,
}: StatCardProps) => {
  return (
    <Card sx={{ height: '100%', borderRadius: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          <Box flex={1}>
            <Typography variant="body2" color="text.secondary" fontWeight={500} mb={1}>
              {title}
            </Typography>

            {isLoading ? (
              <>
                <Skeleton variant="text" width={120} height={40} />
                <Skeleton variant="text" width={80} height={20} />
              </>
            ) : (
              <>
                <Typography variant="h4" fontWeight={700} color="text.primary" mb={0.5}>
                  {value}
                </Typography>

                {trend && (
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      color={trend.isPositive ? 'success.main' : 'error.main'}
                    >
                      {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      vs yesterday
                    </Typography>
                  </Box>
                )}

                {subtitle && !trend && (
                  <Typography variant="caption" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </>
            )}
          </Box>

          {/* Icon */}
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 2,
              bgcolor: iconBgColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ml: 2,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
