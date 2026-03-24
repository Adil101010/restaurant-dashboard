import { useEffect, useState } from 'react';
import {
  Box, Grid, Typography, TextField, Button, Card, CardContent,
  Avatar, Divider, Alert, Skeleton, Chip, InputAdornment,
} from '@mui/material';
import {
  Edit, Save, Cancel, Restaurant as RestaurantIcon, Phone, Email,
  LocationOn, AccessTime, Star, DeliveryDining,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { restaurantApi, type Restaurant, type RestaurantRequest } from '../api/restaurantApi';


const toInputTime = (t?: string) => t?.slice(0, 5) ?? '';
const toApiTime  = (t: string)   => t ? `${t}:00` : undefined;


const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string | number }) => (
  <Box display="flex" alignItems="flex-start" gap={1.5} py={1}>
    <Box sx={{ color: '#FF6B35', mt: 0.2 }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
      <Typography variant="body2" fontWeight={600}>{value || '—'}</Typography>
    </Box>
  </Box>
);


const ProfilePage = () => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<RestaurantRequest | null>(null);

  const restaurantId = user?.restaurantId ?? 0;

  useEffect(() => {
    if (!restaurantId) return;
    setIsLoading(true);
    restaurantApi.getById(restaurantId)
      .then(data => { setRestaurant(data); initForm(data); })
      .catch(() => setError('Failed to load restaurant profile'))
      .finally(() => setIsLoading(false));
  }, [restaurantId]);

  const initForm = (data: Restaurant) => {
    setForm({
      ownerId: data.ownerId,
      name: data.name,
      description: data.description || '',
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      phone: data.phone,
      email: data.email,
      cuisine: data.cuisine || '',
      openingTime: toInputTime(data.openingTime),
      closingTime: toInputTime(data.closingTime),
      imageUrl: data.imageUrl || '',
      deliveryFee: data.deliveryFee,
      minOrderAmount: data.minOrderAmount,
      avgDeliveryTime: data.avgDeliveryTime,
    });
  };

  const set = (key: keyof RestaurantRequest, val: unknown) =>
    setForm(f => f ? { ...f, [key]: val } : f);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const payload: RestaurantRequest = {
        ...form,
        openingTime: toApiTime(form.openingTime ?? ''),
        closingTime: toApiTime(form.closingTime ?? ''),
      };
      const updated = await restaurantApi.update(restaurantId, payload);
      setRestaurant(updated);
      initForm(updated);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (restaurant) initForm(restaurant);
    setIsEditing(false);
  };

  if (isLoading) return (
    <Box>
      <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, mb: 2 }} />
      <Grid container spacing={3}>
        {[1, 2, 3].map(i => (
          <Grid key={i} size={{ xs: 12, md: 4 }}>
            <Skeleton height={300} sx={{ borderRadius: 3 }} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  return (
    <Box>
     
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Restaurant Profile</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your restaurant information
          </Typography>
        </Box>
        {!isEditing ? (
          <Button variant="contained" startIcon={<Edit />} onClick={() => setIsEditing(true)}
            sx={{ borderRadius: 2, bgcolor: '#FF6B35', '&:hover': { bgcolor: '#e55a28' }, fontWeight: 600 }}>
            Edit Profile
          </Button>
        ) : (
          <Box display="flex" gap={1}>
            <Button variant="outlined" startIcon={<Cancel />} onClick={handleCancel}
              sx={{ borderRadius: 2 }}>
              Cancel
            </Button>
            <Button variant="contained" startIcon={<Save />} onClick={handleSave} disabled={saving}
              sx={{ borderRadius: 2, bgcolor: '#FF6B35', '&:hover': { bgcolor: '#e55a28' }, fontWeight: 600 }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Grid container spacing={3}>
     
        <Grid size={{ xs: 12, md: 4 }}>
          
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', mb: 3, overflow: 'hidden' }}>
            <Box sx={{
              height: 120, bgcolor: '#FF6B35',
              backgroundImage: restaurant?.imageUrl ? `url(${restaurant.imageUrl})` : 'none',
              backgroundSize: 'cover', backgroundPosition: 'center',
              position: 'relative',
            }}>
              <Box sx={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))',
              }} />
            </Box>
            <CardContent sx={{ textAlign: 'center', pt: 0, mt: -4 }}>
              <Avatar sx={{
                width: 80, height: 80, mx: 'auto', mb: 1,
                bgcolor: '#FF6B35', fontSize: 32, fontWeight: 700,
                border: '4px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}>
                {restaurant?.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="h6" fontWeight={700}>{restaurant?.name}</Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {restaurant?.cuisine || 'Multi-Cuisine'}
              </Typography>
              <Box display="flex" justifyContent="center" gap={1} mb={1}>
                <Chip label={restaurant?.isActive ? 'Active' : 'Inactive'} size="small"
                  sx={{
                    bgcolor: restaurant?.isActive ? '#E8F5E9' : '#FFEBEE',
                    color: restaurant?.isActive ? '#4CAF50' : '#f44336',
                    fontWeight: 600,
                  }} />
                <Chip label={restaurant?.isOpen ? 'Open Now' : 'Closed'} size="small"
                  sx={{
                    bgcolor: restaurant?.isOpen ? '#E3F2FD' : '#F5F5F5',
                    color: restaurant?.isOpen ? '#2196F3' : '#757575',
                    fontWeight: 600,
                  }} />
              </Box>
            </CardContent>
          </Card>

        
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <CardContent>
              <Typography variant="subtitle2" fontWeight={700} mb={2} color="text.secondary">
                QUICK STATS
              </Typography>
              {[
                { icon: <Star sx={{ fontSize: 18 }} />, label: 'Rating', value: `${restaurant?.rating?.toFixed(1) ?? '0.0'} (${restaurant?.totalReviews ?? 0} reviews)` },
                { icon: <DeliveryDining sx={{ fontSize: 18 }} />, label: 'Avg Delivery', value: `${restaurant?.avgDeliveryTime ?? 30} min` },
                { icon: <RestaurantIcon sx={{ fontSize: 18 }} />, label: 'Min Order', value: `₹${restaurant?.minOrderAmount ?? 0}` },
                { icon: <DeliveryDining sx={{ fontSize: 18 }} />, label: 'Delivery Fee', value: `₹${restaurant?.deliveryFee ?? 0}` },
              ].map(({ icon, label, value }) => (
                <InfoRow key={label} icon={icon} label={label} value={value} />
              ))}
            </CardContent>
          </Card>
        </Grid>

        
        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: 3 }}>
              {!isEditing ? (
              
                <Box>
                  <Typography variant="subtitle1" fontWeight={700} mb={2}>Basic Information</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                      <InfoRow icon={<RestaurantIcon sx={{ fontSize: 18 }} />} label="Restaurant Name" value={restaurant?.name} />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                      <InfoRow icon={<RestaurantIcon sx={{ fontSize: 18 }} />} label="Description" value={restaurant?.description} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <InfoRow icon={<Phone sx={{ fontSize: 18 }} />} label="Phone" value={restaurant?.phone} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <InfoRow icon={<Email sx={{ fontSize: 18 }} />} label="Email" value={restaurant?.email} />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight={700} mb={2}>Location</Typography>
                  <InfoRow icon={<LocationOn sx={{ fontSize: 18 }} />} label="Address"
                    value={`${restaurant?.address}, ${restaurant?.city}, ${restaurant?.state} - ${restaurant?.pincode}`} />

                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight={700} mb={2}>Business Hours</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <InfoRow icon={<AccessTime sx={{ fontSize: 18 }} />} label="Opening Time"
                        value={toInputTime(restaurant?.openingTime)} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <InfoRow icon={<AccessTime sx={{ fontSize: 18 }} />} label="Closing Time"
                        value={toInputTime(restaurant?.closingTime)} />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight={700} mb={2}>Delivery Settings</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <InfoRow icon={<DeliveryDining sx={{ fontSize: 18 }} />} label="Delivery Fee"
                        value={`₹${restaurant?.deliveryFee ?? 0}`} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <InfoRow icon={<RestaurantIcon sx={{ fontSize: 18 }} />} label="Min Order"
                        value={`₹${restaurant?.minOrderAmount ?? 0}`} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <InfoRow icon={<AccessTime sx={{ fontSize: 18 }} />} label="Avg Delivery Time"
                        value={`${restaurant?.avgDeliveryTime ?? 30} min`} />
                    </Grid>
                  </Grid>
                </Box>
              ) : (
             
                form && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} mb={2}>Basic Information</Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth label="Restaurant Name *" size="small"
                          value={form.name} onChange={e => set('name', e.target.value)} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth label="Cuisine Type" size="small"
                          value={form.cuisine} onChange={e => set('cuisine', e.target.value)}
                          placeholder="e.g. North Indian, Chinese" />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField fullWidth label="Description" size="small" multiline rows={2}
                          value={form.description} onChange={e => set('description', e.target.value)} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth label="Phone *" size="small"
                          value={form.phone} onChange={e => set('phone', e.target.value)}
                          inputProps={{ maxLength: 10 }} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth label="Email *" size="small"
                          value={form.email} onChange={e => set('email', e.target.value)} />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <TextField fullWidth label="Image URL" size="small"
                          value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)}
                          placeholder="https://example.com/restaurant.jpg" />
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2.5 }} />
                    <Typography variant="subtitle1" fontWeight={700} mb={2}>Location</Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <TextField fullWidth label="Address *" size="small"
                          value={form.address} onChange={e => set('address', e.target.value)} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField fullWidth label="City *" size="small"
                          value={form.city} onChange={e => set('city', e.target.value)} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField fullWidth label="State *" size="small"
                          value={form.state} onChange={e => set('state', e.target.value)} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField fullWidth label="Pincode *" size="small"
                          value={form.pincode} onChange={e => set('pincode', e.target.value)}
                          inputProps={{ maxLength: 6 }} />
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2.5 }} />
                    <Typography variant="subtitle1" fontWeight={700} mb={2}>Business Hours</Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth label="Opening Time" size="small" type="time"
                          value={form.openingTime} onChange={e => set('openingTime', e.target.value)}
                          InputLabelProps={{ shrink: true }} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField fullWidth label="Closing Time" size="small" type="time"
                          value={form.closingTime} onChange={e => set('closingTime', e.target.value)}
                          InputLabelProps={{ shrink: true }} />
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2.5 }} />
                    <Typography variant="subtitle1" fontWeight={700} mb={2}>Delivery Settings</Typography>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField fullWidth label="Delivery Fee (₹)" size="small" type="number"
                          value={form.deliveryFee ?? ''}
                          onChange={e => set('deliveryFee', parseFloat(e.target.value))}
                          InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField fullWidth label="Min Order (₹)" size="small" type="number"
                          value={form.minOrderAmount ?? ''}
                          onChange={e => set('minOrderAmount', parseInt(e.target.value))}
                          InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField fullWidth label="Avg Delivery Time (min)" size="small" type="number"
                          value={form.avgDeliveryTime ?? ''}
                          onChange={e => set('avgDeliveryTime', parseInt(e.target.value))} />
                      </Grid>
                    </Grid>
                  </Box>
                )
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProfilePage;
