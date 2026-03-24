import { useEffect, useState } from 'react';
import {
  Box, Grid, Typography, TextField, Button, Card, CardContent,
  Divider, Alert, Skeleton, InputAdornment, IconButton,
} from '@mui/material';
import {
  Person, Lock, Visibility, VisibilityOff, Save, Edit,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { settingsApi, type UserProfile } from '../api/settingsApi';

const SectionCard = ({ title, icon, children }: {
  title: string; icon: React.ReactNode; children: React.ReactNode;
}) => (
  <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', mb: 3 }}>
    <CardContent sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2.5}>
        <Box sx={{ color: '#FF6B35' }}>{icon}</Box>
        <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
      </Box>
      <Divider sx={{ mb: 2.5 }} />
      {children}
    </CardContent>
  </Card>
);


const SettingsPage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

 
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

 
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  
  useEffect(() => {
    settingsApi.getProfile()
      .then(data => {
        setProfile(data);
        setName(data.name ?? '');
        setPhone(data.phone ?? '');
      })
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setIsLoading(false));
  }, []);

  
  const handleSaveProfile = async () => {
    if (!name.trim()) return toast.error('Name is required');
    setSavingProfile(true);
    try {
      const updated = await settingsApi.updateProfile({ name, phone });
      setProfile(prev => prev ? {
        ...prev,
        name: updated.name ?? prev.name,
        phone: updated.phone ?? prev.phone,
      } : prev);
      setIsEditingProfile(false);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelProfile = () => {
    if (profile) {
      setName(profile.name ?? '');
      setPhone(profile.phone ?? '');
    }
    setIsEditingProfile(false);
  };

 
  const handleChangePassword = async () => {
    setPasswordError('');
    if (!currentPassword) return setPasswordError('Current password is required');
    if (!newPassword) return setPasswordError('New password is required');
    if (newPassword.length < 6) return setPasswordError('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return setPasswordError('Passwords do not match');
    if (currentPassword === newPassword) return setPasswordError('New password must be different');

    setSavingPassword(true);
    try {
      await settingsApi.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message || 'Failed to change password';
      toast.error(msg);
      setPasswordError(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  if (isLoading) return (
    <Box>
      {[1, 2].map(i => (
        <Skeleton key={i} variant="rectangular" height={200}
          sx={{ borderRadius: 3, mb: 3 }} />
      ))}
    </Box>
  );

  return (
    <Box maxWidth={720}>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>Settings</Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your account settings
        </Typography>
      </Box>

      
      <SectionCard title="Account Information" icon={<Person />}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Email" size="small"
              value={profile?.email ?? ''} disabled
              helperText="Email cannot be changed"
              sx={{ '& .MuiInputBase-root': { bgcolor: '#F9F9F9' } }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Full Name" size="small"
              value={name ?? ''} onChange={e => setName(e.target.value)}
              disabled={!isEditingProfile} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Phone Number" size="small"
              value={phone ?? ''} onChange={e => setPhone(e.target.value)}
              disabled={!isEditingProfile}
              inputProps={{ maxLength: 10 }}
              InputProps={{
                startAdornment: <InputAdornment position="start">+91</InputAdornment>
              }} />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Role" size="small"
              value={profile?.role?.replace('_', ' ') ?? ''} disabled
              sx={{ '& .MuiInputBase-root': { bgcolor: '#F9F9F9' } }} />
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end" gap={1} mt={2}>
          {!isEditingProfile ? (
            <Button variant="contained" startIcon={<Edit />}
              onClick={() => setIsEditingProfile(true)}
              sx={{ borderRadius: 2, bgcolor: '#FF6B35', '&:hover': { bgcolor: '#e55a28' } }}>
              Edit Profile
            </Button>
          ) : (
            <>
              <Button variant="outlined" onClick={handleCancelProfile}
                sx={{ borderRadius: 2 }}>
                Cancel
              </Button>
              <Button variant="contained" startIcon={<Save />}
                onClick={handleSaveProfile} disabled={savingProfile}
                sx={{ borderRadius: 2, bgcolor: '#FF6B35', '&:hover': { bgcolor: '#e55a28' } }}>
                {savingProfile ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </Box>
      </SectionCard>

     
      <SectionCard title="Change Password" icon={<Lock />}>
        {passwordError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}
            onClose={() => setPasswordError('')}>
            {passwordError}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField fullWidth label="Current Password" size="small"
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword ?? ''}
              onChange={e => setCurrentPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowCurrent(p => !p)}>
                      {showCurrent
                        ? <VisibilityOff fontSize="small" />
                        : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )
              }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="New Password" size="small"
              type={showNew ? 'text' : 'password'}
              value={newPassword ?? ''}
              onChange={e => setNewPassword(e.target.value)}
              helperText="Minimum 6 characters"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowNew(p => !p)}>
                      {showNew
                        ? <VisibilityOff fontSize="small" />
                        : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )
              }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label="Confirm New Password" size="small"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword ?? ''}
              onChange={e => setConfirmPassword(e.target.value)}
              error={confirmPassword.length > 0 && confirmPassword !== newPassword}
              helperText={
                confirmPassword.length > 0 && confirmPassword !== newPassword
                  ? 'Passwords do not match' : ''
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowConfirm(p => !p)}>
                      {showConfirm
                        ? <VisibilityOff fontSize="small" />
                        : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )
              }} />
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="flex-end" mt={2}>
          <Button variant="contained" startIcon={<Lock />}
            onClick={handleChangePassword} disabled={savingPassword}
            sx={{ borderRadius: 2, bgcolor: '#FF6B35', '&:hover': { bgcolor: '#e55a28' } }}>
            {savingPassword ? 'Changing...' : 'Change Password'}
          </Button>
        </Box>
      </SectionCard>
    </Box>
  );
};

export default SettingsPage;
