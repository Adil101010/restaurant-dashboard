import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';  
import toast from 'react-hot-toast';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, CircularProgress, Alert,
} from '@mui/material';
import { Visibility, VisibilityOff, Restaurant } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

interface LoginFormData {
  emailOrPhone: string;
  password: string;
  expectedRole?: string;
}

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string>('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: { emailOrPhone: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setApiError('');
    try {
      await login({
        emailOrPhone: data.emailOrPhone,
        password: data.password,
        expectedRole: 'RESTAURANT_OWNER',
      });
      toast.success('Login successful! Welcome back');
      navigate('/');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const message = err?.response?.data?.message || 'Invalid credentials. Please try again.';
      setApiError(message);
      toast.error(message);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)', px: 2,
    }}>
      <Card sx={{ maxWidth: 420, width: '100%', borderRadius: 3, boxShadow: 8 }}>
        <CardContent sx={{ p: 4 }}>

        
          <Box textAlign="center" mb={4}>
            <Box sx={{
              bgcolor: 'primary.main', borderRadius: '50%', width: 64, height: 64,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              mx: 'auto', mb: 2, boxShadow: '0 4px 14px rgba(255,107,53,0.4)',
            }}>
              <Restaurant sx={{ fontSize: 36, color: 'white' }} />
            </Box>
            <Typography variant="h5" fontWeight={700} color="text.primary">
              Restaurant Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Sign in to manage your restaurant
            </Typography>
          </Box>

          
          {apiError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setApiError('')}>
              {apiError}
            </Alert>
          )}

         
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Controller
              name="emailOrPhone"
              control={control}
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Enter a valid email address',
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email Address"
                  type="email"
                  fullWidth
                  margin="normal"
                  error={!!errors.emailOrPhone}
                  helperText={errors.emailOrPhone?.message}
                  autoComplete="email"
                  autoFocus
                  sx={{ mb: 1 }}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              rules={{
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  fullWidth
                  margin="normal"
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  autoComplete="current-password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" tabIndex={-1}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            <Button
              type="submit" fullWidth variant="contained" size="large"
              disabled={isSubmitting}
              sx={{
                mt: 3, mb: 2, py: 1.5, borderRadius: 2, fontSize: '1rem',
                boxShadow: '0 4px 14px rgba(255,107,53,0.4)',
                '&:hover': { boxShadow: '0 6px 20px rgba(255,107,53,0.5)' },
              }}
            >
              {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
            </Button>
          </Box>

         
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={1}>
            New restaurant owner?{' '}
            <Link
              to="/signup"
              style={{ color: '#FF6B35', fontWeight: 600, textDecoration: 'none' }}
            >
              Register here
            </Link>
          </Typography>

          <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
            Only authorized restaurant owners can access this dashboard
          </Typography>

        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginPage;
