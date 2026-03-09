import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Skeleton,
  Avatar,
} from '@mui/material';
import { TrendingUp } from '@mui/icons-material';
import type { TopItem } from '../../api/analyticsApi';
import { formatCurrency } from '../../utils/formatters';


interface TopItemsTableProps {
  items: TopItem[];
  isLoading?: boolean;
}


const TopItemsTable = ({ items, isLoading = false }: TopItemsTableProps) => {
  return (
    <Card sx={{ borderRadius: 3, height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <TrendingUp sx={{ color: 'primary.main' }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Top Selling Items
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Best performers today
            </Typography>
          </Box>
        </Box>


        {isLoading ? (
          [...Array(5)].map((_, i) => (
            <Box key={i} display="flex" alignItems="center" gap={2} mb={2}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box flex={1}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </Box>
              <Skeleton variant="text" width={60} />
            </Box>
          ))
        ) : !items || items.length === 0 ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            height={200}
          >
            <Typography color="text.secondary">No data available</Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', border: 0 }}>
                    #
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: 'text.secondary', border: 0 }}>
                    Item
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600, color: 'text.secondary', border: 0 }}>
                    Qty Sold
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', border: 0 }}>
                    Revenue
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => {
                  //  Safe name — fallback to 'Unknown' if null/undefined
                  const itemName = item?.menuItemName ?? 'Unknown Item';
                  const itemInitial = itemName.charAt(0).toUpperCase();

                  return (
                    <TableRow
                      key={item.menuItemId ?? index}
                      sx={{
                        '&:last-child td': { border: 0 },
                        '&:hover': { bgcolor: 'rgba(255,107,53,0.04)' },
                      }}
                    >
                      <TableCell sx={{ border: 0 }}>
                        <Chip
                          label={index + 1}
                          size="small"
                          sx={{
                            bgcolor: index === 0
                              ? 'rgba(255,193,7,0.15)'
                              : index === 1
                              ? 'rgba(158,158,158,0.15)'
                              : index === 2
                              ? 'rgba(255,152,0,0.15)'
                              : 'rgba(0,0,0,0.06)',
                            color: index === 0
                              ? '#F9A825'
                              : index === 1
                              ? '#757575'
                              : index === 2
                              ? '#E65100'
                              : 'text.secondary',
                            fontWeight: 700,
                            minWidth: 28,
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ border: 0 }}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar
                            src={item?.imageUrl}
                            sx={{ width: 36, height: 36, bgcolor: 'primary.light' }}
                          >
                            {itemInitial}
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>
                            {itemName}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center" sx={{ border: 0 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {item?.totalQuantity ?? 0}
                        </Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ border: 0 }}>
                        <Typography variant="body2" fontWeight={600} color="primary.main">
                          {formatCurrency(item?.totalRevenue ?? 0)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};


export default TopItemsTable;
