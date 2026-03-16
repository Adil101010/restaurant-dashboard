import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, CircularProgress, Alert,
  Grid, MenuItem, Stepper, Step, StepLabel,
} from '@mui/material';
import { Visibility, VisibilityOff, Restaurant } from '@mui/icons-material';
import { authApi } from '../api/authApi';
import { restaurantApi } from '../api/restaurantApi';

// ─── Constants ───
const CUISINE_TYPES = [
  'North Indian', 'South Indian', 'Chinese', 'Italian',
  'Fast Food', 'Biryani', 'Pizza', 'Burger',
  'Street Food', 'Desserts', 'Beverages', 'Multi-Cuisine',
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Other',
];

const steps = ['Owner Details', 'Restaurant Info', 'Timings & Extras'];

// ─── Form Type ───
interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  restaurantName: string;
  description: string;
  cuisine: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  openingTime: string;
  closingTime: string;
  deliveryFee: string;
  minOrderAmount: string;
  avgDeliveryTime: string;
}

// ─── Component ───
const SignupPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<SignupFormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      restaurantName: '',
      description: '',
      cuisine: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      openingTime: '09:00',
      closingTime: '22:00',
      deliveryFee: '30',
      minOrderAmount: '100',
      avgDeliveryTime: '30',
    },
  });

  const password = watch('password');

  const handleNext = async () => {
    const stepFields: Record<number, (keyof SignupFormData)[]> = {
      0: ['email', 'password', 'confirmPassword', 'phone'],
      1: ['restaurantName', 'cuisine', 'address', 'city', 'state', 'pincode'],
    };
    const valid = await trigger(stepFields[activeStep]);
    if (valid) setActiveStep((prev) => prev + 1);
  };

  const onSubmit = async (data: SignupFormData) => {
    setApiError('');
    setIsSubmitting(true);

    try {
      // Step 1 — Auth Service
      const authResponse = await authApi.register({
        email: data.email,
        password: data.password,
        phone: data.phone,
        role: 'RESTAURANT_OWNER',
      });

      // Step 2 — Restaurant Service
      await restaurantApi.register({
        ownerId: authResponse.userId,
        name: data.restaurantName,
        description: data.description || undefined,
        cuisine: data.cuisine || undefined,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        phone: data.phone,
        email: data.email,
        openingTime: data.openingTime,
        closingTime: data.closingTime,
        deliveryFee: data.deliveryFee ? parseFloat(data.deliveryFee) : undefined,
        minOrderAmount: data.minOrderAmount ? parseInt(data.minOrderAmount) : undefined,
        avgDeliveryTime: data.avgDeliveryTime ? parseInt(data.avgDeliveryTime) : undefined,
      });

      toast.success('Restaurant registered successfully! Please login.');
      navigate('/login');

    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || 'Registration failed. Please try again.';
      setApiError(message);
      toast.error(message);
      // Auth fail hua toh Step 1 pe wapis
      setActiveStep(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)',
      px: 2,
      py: 4,
    }}>
      <Card sx={{ maxWidth: 620, width: '100%', borderRadius: 3, boxShadow: 8 }}>
        <CardContent sx={{ p: 4 }}>

          {/* ── Header ── */}
          <Box textAlign="center" mb={3}>
            <Box sx={{
              bgcolor: 'primary.main', borderRadius: '50%',
              width: 64, height: 64,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 2,
              boxShadow: '0 4px 14px rgba(255,107,53,0.4)',
            }}>
              <Restaurant sx={{ fontSize: 36, color: 'white' }} />
            </Box>
            <Typography variant="h5" fontWeight={700}>Register Your Restaurant</Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Join us and start accepting orders
            </Typography>
          </Box>

          {/* ── Stepper ── */}
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* ── Error ── */}
          {apiError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setApiError('')}>
              {apiError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* ══════════════════════════════════
                STEP 0 — Owner / Account Details
            ══════════════════════════════════ */}
            {activeStep === 0 && (
              <Grid container spacing={2}>

                <Grid item xs={12}>
                  <Controller name="email" control={control}
                    rules={{
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Valid email address enter karo',
                      },
                    }}
                    render={({ field }) => (
                      <TextField {...field} label="Email Address" type="email"
                        fullWidth autoFocus
                        error={!!errors.email} helperText={errors.email?.message} />
                    )} />
                </Grid>

                <Grid item xs={12}>
                  <Controller name="phone" control={control}
                    rules={{
                      required: 'Phone number required',
                      pattern: {
                        value: /^[6-9]\d{9}$/,
                        message: 'Valid 10-digit Indian number enter karo',
                      },
                    }}
                    render={({ field }) => (
                      <TextField {...field} label="Phone Number" fullWidth
                        error={!!errors.phone} helperText={errors.phone?.message}
                        inputProps={{ maxLength: 10 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">+91</InputAdornment>
                          ),
                        }} />
                    )} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller name="password" control={control}
                    rules={{
                      required: 'Password required',
                      pattern: {
                        value: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\S+$).{8,}$/,
                        message: 'Min 8 chars, uppercase, lowercase, number aur special char (@#$%^&+=) chahiye',
                      },
                    }}
                    render={({ field }) => (
                      <TextField {...field} label="Password"
                        type={showPassword ? 'text' : 'password'} fullWidth
                        error={!!errors.password} helperText={errors.password?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" tabIndex={-1}>
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }} />
                    )} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller name="confirmPassword" control={control}
                    rules={{
                      required: 'Please confirm your password',
                      validate: (v) => v === password || 'Passwords do not match',
                    }}
                    render={({ field }) => (
                      <TextField {...field} label="Confirm Password"
                        type={showConfirmPassword ? 'text' : 'password'} fullWidth
                        error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" tabIndex={-1}>
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }} />
                    )} />
                </Grid>

              </Grid>
            )}

            {/* ══════════════════════════════════
                STEP 1 — Restaurant Info
            ══════════════════════════════════ */}
            {activeStep === 1 && (
              <Grid container spacing={2}>

                <Grid item xs={12} sm={6}>
                  <Controller name="restaurantName" control={control}
                    rules={{ required: 'Restaurant name required' }}
                    render={({ field }) => (
                      <TextField {...field} label="Restaurant Name" fullWidth autoFocus
                        error={!!errors.restaurantName} helperText={errors.restaurantName?.message} />
                    )} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller name="cuisine" control={control}
                    rules={{ required: 'Cuisine type required' }}
                    render={({ field }) => (
                      <TextField {...field} label="Cuisine Type" select fullWidth
                        error={!!errors.cuisine} helperText={errors.cuisine?.message}>
                        {CUISINE_TYPES.map((c) => (
                          <MenuItem key={c} value={c}>{c}</MenuItem>
                        ))}
                      </TextField>
                    )} />
                </Grid>

                <Grid item xs={12}>
                  <Controller name="description" control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Description (optional)"
                        fullWidth multiline rows={2} />
                    )} />
                </Grid>

                <Grid item xs={12}>
                  <Controller name="address" control={control}
                    rules={{ required: 'Address required' }}
                    render={({ field }) => (
                      <TextField {...field} label="Full Address" fullWidth
                        error={!!errors.address} helperText={errors.address?.message} />
                    )} />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Controller name="city" control={control}
                    rules={{ required: 'City required' }}
                    render={({ field }) => (
                      <TextField {...field} label="City" fullWidth
                        error={!!errors.city} helperText={errors.city?.message} />
                    )} />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Controller name="state" control={control}
                    rules={{ required: 'State required' }}
                    render={({ field }) => (
                      <TextField {...field} label="State" select fullWidth
                        error={!!errors.state} helperText={errors.state?.message}>
                        {INDIAN_STATES.map((s) => (
                          <MenuItem key={s} value={s}>{s}</MenuItem>
                        ))}
                      </TextField>
                    )} />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Controller name="pincode" control={control}
                    rules={{
                      required: 'Pincode required',
                      pattern: { value: /^\d{6}$/, message: '6 digit pincode chahiye' },
                    }}
                    render={({ field }) => (
                      <TextField {...field} label="Pincode" fullWidth
                        error={!!errors.pincode} helperText={errors.pincode?.message}
                        inputProps={{ maxLength: 6 }} />
                    )} />
                </Grid>

              </Grid>
            )}

            {/* ══════════════════════════════════
                STEP 2 — Timings & Extras
            ══════════════════════════════════ */}
            {activeStep === 2 && (
              <Grid container spacing={2}>

                <Grid item xs={12} sm={6}>
                  <Controller name="openingTime" control={control}
                    rules={{ required: 'Opening time required' }}
                    render={({ field }) => (
                      <TextField {...field} label="Opening Time" type="time"
                        fullWidth InputLabelProps={{ shrink: true }}
                        error={!!errors.openingTime} helperText={errors.openingTime?.message} />
                    )} />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Controller name="closingTime" control={control}
                    rules={{ required: 'Closing time required' }}
                    render={({ field }) => (
                      <TextField {...field} label="Closing Time" type="time"
                        fullWidth InputLabelProps={{ shrink: true }}
                        error={!!errors.closingTime} helperText={errors.closingTime?.message} />
                    )} />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Controller name="deliveryFee" control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Delivery Fee" type="number" fullWidth
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }} />
                    )} />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Controller name="minOrderAmount" control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Min Order Amount" type="number" fullWidth
                        InputProps={{
                          startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                        }} />
                    )} />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Controller name="avgDeliveryTime" control={control}
                    render={({ field }) => (
                      <TextField {...field} label="Avg Delivery Time" type="number" fullWidth
                        InputProps={{
                          endAdornment: <InputAdornment position="end">min</InputAdornment>,
                        }} />
                    )} />
                </Grid>

              </Grid>
            )}

            {/* ── Navigation Buttons ── */}
            <Box display="flex" justifyContent="space-between" mt={3}>
              <Button
                variant="outlined"
                disabled={activeStep === 0}
                onClick={() => setActiveStep((prev) => prev - 1)}
                sx={{ borderRadius: 2, px: 3 }}
              >
                Back
              </Button>

              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    borderRadius: 2, px: 3,
                    boxShadow: '0 4px 14px rgba(255,107,53,0.4)',
                    '&:hover': { boxShadow: '0 6px 20px rgba(255,107,53,0.5)' },
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isSubmitting}
                  sx={{
                    borderRadius: 2, px: 3,
                    boxShadow: '0 4px 14px rgba(255,107,53,0.4)',
                    '&:hover': { boxShadow: '0 6px 20px rgba(255,107,53,0.5)' },
                  }}
                >
                  {isSubmitting
                    ? <CircularProgress size={24} color="inherit" />
                    : 'Register Restaurant'}
                </Button>
              )}
            </Box>

          </Box>

          {/* ── Login Link ── */}
          <Typography variant="body2" color="text.secondary" textAlign="center" mt={2}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#FF6B35', fontWeight: 600, textDecoration: 'none' }}>
              Sign In
            </Link>
          </Typography>

        </CardContent>
      </Card>
    </Box>
  );
};

export default SignupPage;
