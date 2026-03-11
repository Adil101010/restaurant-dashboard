import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Grid,
  Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Skeleton, Tooltip,
  Alert,
} from '@mui/material';
import {
  Add, LocalOffer, Block, ContentCopy, CheckCircle, Edit,
} from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import {
  promotionsApi,
  type Coupon,
  type CreateCouponRequest,
  type UpdateCouponRequest,
} from '../api/promotionsApi';
import { formatCurrency } from '../utils/formatters';


const PromotionsPage = () => {
  const { user } = useAuth();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<CreateCouponRequest>({
    defaultValues: {
      applicableFor: 'ALL',
      discountType: 'PERCENTAGE',
      minOrderAmount: 0,
      maxUsageCount: 100,
      maxUsagePerUser: 1,
    },
  });

  const {
    control: editControl,
    handleSubmit: handleEditSubmit,
    reset: editReset,
    setValue,
  } = useForm<UpdateCouponRequest>();

  const fetchCoupons = useCallback(async () => {
    if (!user?.restaurantId) return;
    setIsLoading(true);
    try {
      const data = await promotionsApi.getRestaurantCoupons(user.restaurantId);
      setCoupons(data);
    } catch {
      toast.error('Failed to load promotions');
    } finally {
      setIsLoading(false);
    }
  }, [user?.restaurantId]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleCreate = async (data: CreateCouponRequest) => {
    setIsSubmitting(true);
    try {
      await promotionsApi.createCoupon({
        ...data,
        restaurantId: user?.restaurantId,
        code: data.code.toUpperCase(),
      });
      toast.success('Coupon created successfully!');
      setDialogOpen(false);
      reset();
      fetchCoupons();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to create coupon';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditOpen = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setValue('description', coupon.description);
    setValue('validUntil', coupon.validUntil.slice(0, 16));
    setValue('maxUsageCount', coupon.maxUsageCount);
    setValue('minOrderAmount', coupon.minOrderAmount);
    setEditDialogOpen(true);
  };

  const handleEditSave = async (data: UpdateCouponRequest) => {
    if (!selectedCoupon) return;
    setIsSubmitting(true);
    try {
      await promotionsApi.updateCoupon(selectedCoupon.id, data);
      toast.success(`Coupon ${selectedCoupon.code} updated!`);
      setEditDialogOpen(false);
      editReset();
      fetchCoupons();
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to update coupon';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (couponId: number, code: string) => {
    try {
      await promotionsApi.deactivateCoupon(couponId);
      toast.success(`Coupon ${code} deactivated!`);
      fetchCoupons();
    } catch {
      toast.error('Failed to deactivate coupon');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Copied: ${code}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'success';
      case 'INACTIVE': return 'error';
      case 'EXPIRED': return 'warning';
      default: return 'default';
    }
  };

  const getDiscountLabel = (coupon: Coupon) => {
    switch (coupon.discountType) {
      case 'PERCENTAGE': return `${coupon.discountValue}% OFF`;
      case 'FLAT_DISCOUNT': return `${coupon.discountValue} OFF`;
      case 'FREE_DELIVERY': return 'FREE DELIVERY';
      default: return '';
    }
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Promotions</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your restaurant coupons and offers
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
          sx={{ bgcolor: 'primary.main', borderRadius: 2, px: 3 }}
        >
          Create Coupon
        </Button>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: 'Total Coupons', value: coupons.length, color: '#FF6B35' },
          { label: 'Active', value: coupons.filter(c => c.status === 'ACTIVE').length, color: '#4CAF50' },
          { label: 'Inactive', value: coupons.filter(c => c.status === 'INACTIVE').length, color: '#f44336' },
          { label: 'Total Used', value: coupons.reduce((sum, c) => sum + c.currentUsageCount, 0), color: '#2196F3' },
        ].map((stat) => (
          <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
            <Card sx={{ borderRadius: 2, borderLeft: `4px solid ${stat.color}` }}>
              <CardContent sx={{ py: 2 }}>
                <Typography variant="h5" fontWeight={700} color={stat.color}>
                  {isLoading ? <Skeleton width={40} /> : stat.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Coupons List */}
      {isLoading ? (
        [...Array(3)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={120} sx={{ mb: 2, borderRadius: 2 }} />
        ))
      ) : coupons.length === 0 ? (
        <Card sx={{ borderRadius: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <LocalOffer sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">No coupons yet</Typography>
            <Typography variant="body2" color="text.disabled" mb={2}>
              Create your first coupon to attract more customers
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
              Create Coupon
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {coupons.map((coupon) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={coupon.id}>
              <Card
                sx={{
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: coupon.status === 'ACTIVE' ? 'rgba(76,175,80,0.3)' : 'divider',
                  opacity: coupon.status === 'INACTIVE' ? 0.7 : 1,
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  {/* Top Row */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        sx={{ fontFamily: 'monospace', color: 'primary.main', letterSpacing: 1 }}
                      >
                        {coupon.code}
                      </Typography>
                      <Tooltip title="Copy code">
                        <IconButton size="small" onClick={() => handleCopyCode(coupon.code)}>
                          <ContentCopy sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Tooltip>
                      {coupon.status === 'ACTIVE' && (
                        <Tooltip title="Edit coupon">
                          <IconButton
                            size="small"
                            onClick={() => handleEditOpen(coupon)}
                            sx={{ color: 'primary.main' }}
                          >
                            <Edit sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                    <Chip
                      label={coupon.status}
                      size="small"
                      color={getStatusColor(coupon.status) as 'success' | 'error' | 'warning' | 'default'}
                      icon={coupon.status === 'ACTIVE' ? <CheckCircle sx={{ fontSize: '14px !important' }} /> : undefined}
                    />
                  </Box>

                  {/* Discount Badge */}
                  <Box
                    sx={{
                      bgcolor: 'rgba(255,107,53,0.1)',
                      borderRadius: 2,
                      px: 2, py: 1, mb: 1.5,
                      display: 'inline-block',
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                      {getDiscountLabel(coupon)}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" mb={1.5}>
                    {coupon.description}
                  </Typography>

                  {/* Details */}
                  <Box display="flex" flexDirection="column" gap={0.5} mb={2}>
                    <Typography variant="caption" color="text.secondary">
                      Min order: {formatCurrency(coupon.minOrderAmount)}
                      {coupon.maxDiscountAmount && ` • Max discount: ${formatCurrency(coupon.maxDiscountAmount)}`}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Valid: {new Date(coupon.validFrom).toLocaleDateString('en-IN')} -{' '}
                      {new Date(coupon.validUntil).toLocaleDateString('en-IN')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Used: {coupon.currentUsageCount}/{coupon.maxUsageCount} times
                    </Typography>
                  </Box>

                  {/* Actions */}
                  {coupon.status === 'ACTIVE' && (
                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<Block />}
                      onClick={() => handleDeactivate(coupon.id, coupon.code)}
                      sx={{ borderRadius: 2 }}
                    >
                      Deactivate
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Coupon Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); reset(); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>Create New Coupon</DialogTitle>
        <form onSubmit={handleSubmit(handleCreate)}>
          <DialogContent sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="code"
                  control={control}
                  rules={{ required: 'Code required', minLength: { value: 3, message: 'Min 3 chars' } }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Coupon Code *"
                      fullWidth
                      placeholder="e.g. PIZZA50"
                      error={!!errors.code}
                      helperText={errors.code?.message}
                      inputProps={{ style: { textTransform: 'uppercase' } }}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="discountType"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Discount Type *" fullWidth>
                      <MenuItem value="PERCENTAGE">Percentage (%)</MenuItem>
                      <MenuItem value="FLAT_DISCOUNT">Flat Discount (Rs)</MenuItem>
                      <MenuItem value="FREE_DELIVERY">Free Delivery</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: 'Description required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description *"
                      fullWidth
                      placeholder="e.g. Get 50% off on all pizzas"
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="discountValue"
                  control={control}
                  rules={{ required: 'Value required', min: { value: 0.01, message: 'Must be > 0' } }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Discount Value *"
                      fullWidth
                      error={!!errors.discountValue}
                      helperText={errors.discountValue?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="maxDiscountAmount"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Max Discount Amount (Rs)"
                      fullWidth
                      helperText="Optional cap for % discounts"
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="minOrderAmount"
                  control={control}
                  rules={{ required: 'Required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Min Order Amount (Rs) *"
                      fullWidth
                      error={!!errors.minOrderAmount}
                      helperText={errors.minOrderAmount?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="applicableFor"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} select label="Applicable For *" fullWidth>
                      <MenuItem value="ALL">All Users</MenuItem>
                      <MenuItem value="FIRST_ORDER">First Order Only</MenuItem>
                      <MenuItem value="EXISTING_USERS">Existing Users</MenuItem>
                    </TextField>
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="validFrom"
                  control={control}
                  rules={{ required: 'Required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="datetime-local"
                      label="Valid From *"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.validFrom}
                      helperText={errors.validFrom?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="validUntil"
                  control={control}
                  rules={{ required: 'Required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="datetime-local"
                      label="Valid Until *"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.validUntil}
                      helperText={errors.validUntil?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="maxUsageCount"
                  control={control}
                  rules={{ required: 'Required', min: { value: 1, message: 'Min 1' } }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Total Usage Limit *"
                      fullWidth
                      error={!!errors.maxUsageCount}
                      helperText={errors.maxUsageCount?.message}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="maxUsagePerUser"
                  control={control}
                  rules={{ required: 'Required', min: { value: 1, message: 'Min 1' } }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Usage Per User *"
                      fullWidth
                      error={!!errors.maxUsagePerUser}
                      helperText={errors.maxUsagePerUser?.message}
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
              Coupon will be linked to your restaurant automatically.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button
              onClick={() => { setDialogOpen(false); reset(); }}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{ borderRadius: 2, px: 3 }}
            >
              {isSubmitting ? 'Creating...' : 'Create Coupon'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Coupon Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => { setEditDialogOpen(false); editReset(); }}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Edit Coupon — {selectedCoupon?.code}
        </DialogTitle>
        <form onSubmit={handleEditSubmit(handleEditSave)}>
          <DialogContent sx={{ pt: 1 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Controller
                  name="description"
                  control={editControl}
                  rules={{ required: 'Description required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Description *"
                      fullWidth
                      multiline
                      rows={2}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="validUntil"
                  control={editControl}
                  rules={{ required: 'Required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="datetime-local"
                      label="Valid Until *"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="maxUsageCount"
                  control={editControl}
                  rules={{ required: 'Required', min: { value: 1, message: 'Min 1' } }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Total Usage Limit *"
                      fullWidth
                    />
                  )}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Controller
                  name="minOrderAmount"
                  control={editControl}
                  rules={{ required: 'Required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="number"
                      label="Min Order Amount (Rs) *"
                      fullWidth
                    />
                  )}
                />
              </Grid>
            </Grid>
            <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
             Code and discount value cannot be changed.
            </Alert>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
            <Button
              onClick={() => { setEditDialogOpen(false); editReset(); }}
              variant="outlined"
              sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{ borderRadius: 2, px: 3 }}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default PromotionsPage;
