import React, { useState, useMemo } from 'react';
import {
  Container, Typography, Box, Stack, Avatar, Card, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, Divider, Chip, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  IconButton, Alert, Snackbar, useTheme, alpha, Tabs, Tab, Paper,
  Fade, useMediaQuery, CardActionArea
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Person as PersonIcon, Email as EmailIcon, Notifications as NotificationsIcon,
  Security as SecurityIcon, Language as LanguageIcon, Help as HelpIcon,
  Info as InfoIcon, Logout as LogoutIcon, Edit as EditIcon,
  Close as CloseIcon, Verified as VerifiedIcon, Settings as SettingsIcon,
  Factory as FactoryIcon, ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { usersAPI } from '../../../services/users';
import MobileLayout from '../../../layouts/MobileLayout';

// --- Enhanced Styling ---
const glassStyle = (theme) => ({
  backdropFilter: 'blur(12px)',
  bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === 'dark' ? 0.6 : 0.8),
  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
  boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.08)}`,
  borderRadius: 4,
});

const MobileProfile = () => {
  const { user, logout, updateUser, changePassword, refreshProfile } = useAuth();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [dialog, setDialog] = useState({ open: false, type: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form States
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    username: user?.username || '',
    bio: user?.bio || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  // --- Handlers ---
  const handleOpenDialog = (type) => setDialog({ open: true, type });
  const handleCloseDialog = () => setDialog({ open: false, type: '' });

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.updateProfile(profileForm);
      updateUser(response);
      setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
      handleCloseDialog();
    } catch (error) {
      setSnackbar({ open: true, message: 'Update failed', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- Sub-Components ---

  const ProfileHero = () => (
    <Card sx={{ ...glassStyle(theme), overflow: 'hidden', position: 'relative' }}>
      <Box sx={{
        height: isDesktop ? 140 : 100,
        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        opacity: 0.8
      }} />
      <Stack sx={{ px: 3, pb: 3, mt: isDesktop ? -6 : -5 }} alignItems={isDesktop ? 'flex-start' : 'center'} spacing={2}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={user?.profile_image}
            sx={{
              width: isDesktop ? 120 : 100,
              height: isDesktop ? 120 : 100,
              border: `4px solid ${theme.palette.background.paper}`,
              boxShadow: theme.shadows[4]
            }}
          >
            {user?.username?.[0]?.toUpperCase()}
          </Avatar>
          <IconButton
            size="small"
            onClick={() => handleOpenDialog('profile')}
            sx={{
              position: 'absolute', bottom: 5, right: 5,
              bgcolor: 'primary.main', color: 'white',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ textAlign: isDesktop ? 'left' : 'center', width: '100%' }}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent={isDesktop ? 'flex-start' : 'center'}>
            <Typography variant="h5" fontWeight="800">{user?.first_name} {user?.last_name}</Typography>
            {user?.is_verified && <VerifiedIcon color="primary" sx={{ fontSize: 20 }} />}
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>@{user?.username}</Typography>

          <Stack direction="row" spacing={1} justifyContent={isDesktop ? 'flex-start' : 'center'} flexWrap="wrap" useFlexGap>
            <Chip
              label={user?.is_staff ? 'Administrator' : 'Team Member'}
              size="small"
              color="primary"
              variant="light"
              sx={{ fontWeight: 600 }}
            />
            {user?.factory_memberships?.map((m, i) => (
              <Chip key={i} icon={<FactoryIcon style={{ fontSize: 14 }} />} label={m.factory_name} size="small" variant="outlined" />
            ))}
          </Stack>
        </Box>
      </Stack>
    </Card>
  );

  const SettingsMenu = () => (
    <Stack spacing={2}>
      {!isDesktop && <Typography variant="overline" color="text.secondary" sx={{ ml: 1 }}>Account Settings</Typography>}
      <Grid container spacing={2}>
        {[
          { icon: <PersonIcon />, title: 'Personal Info', subtitle: 'Manage names and bio', type: 'profile' },
          { icon: <SecurityIcon />, title: 'Security', subtitle: 'Password & Auth', type: 'password' },
          { icon: <EmailIcon />, title: 'Email', subtitle: user?.email, type: 'email' },
          { icon: <NotificationsIcon />, title: 'Notifications', subtitle: 'Alerts & Preferences' },
        ].map((item, idx) => (
          <Grid size={{ xs: 12, sm: 6 }} key={idx}>
            <Paper
              elevation={0}
              sx={{
                ...glassStyle(theme),
                transition: '0.2s',
                '&:hover': { transform: 'translateY(-2px)', bgcolor: alpha(theme.palette.primary.main, 0.04) }
              }}
            >
              <ListItemButton onClick={() => item.type && handleOpenDialog(item.type)} sx={{ p: 2, borderRadius: 4 }}>
                <ListItemIcon>
                  <Box sx={{ p: 1, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', display: 'flex' }}>
                    {item.icon}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={<Typography fontWeight="700">{item.title}</Typography>}
                  secondary={item.subtitle}
                />
                <ChevronRightIcon sx={{ color: 'text.disabled' }} />
              </ListItemButton>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Button
        fullWidth
        variant="outlined"
        color="error"
        startIcon={<LogoutIcon />}
        onClick={logout}
        sx={{ borderRadius: 3, py: 1.5, mt: 2, borderWidth: 2, '&:hover': { borderWidth: 2 } }}
      >
        Sign Out
      </Button>
    </Stack>
  );

  return (
    <MobileLayout>
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 5 } }}>
        <Grid container spacing={4}>
          {/* Left Column: Identity */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={3} sx={{ position: { md: 'sticky' }, top: 100 }}>
              <ProfileHero />
              {isDesktop && (
                <Card sx={{ ...glassStyle(theme), p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom fontWeight="700">Bio</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user?.bio || "No biography provided yet."}
                  </Typography>
                </Card>
              )}
            </Stack>
          </Grid>

          {/* Right Column: Settings */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Box sx={{ mb: 4 }}>
              <Typography variant={isDesktop ? "h4" : "h5"} fontWeight="900" gutterBottom>
                Account Settings
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your profile, security, and notification preferences.
              </Typography>
            </Box>

            {isDesktop && (
              <Tabs
                value={activeTab}
                onChange={(e, v) => setActiveTab(v)}
                sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
              >
                <Tab label="General" icon={<SettingsIcon />} iconPosition="start" />
                <Tab label="Support" icon={<HelpIcon />} iconPosition="start" />
              </Tabs>
            )}

            <Fade in timeout={500}>
              <Box>
                {activeTab === 0 ? <SettingsMenu /> : <Typography>Support Content...</Typography>}
              </Box>
            </Fade>
          </Grid>
        </Grid>

        {/* --- Global Dialogs --- */}
        <Dialog
          open={dialog.open}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="xs"
          PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {dialog.type === 'profile' ? 'Edit Profile' : 'Security'}
            <IconButton onClick={handleCloseDialog} size="small"><CloseIcon /></IconButton>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              {dialog.type === 'profile' && (
                <>
                  <TextField
                    fullWidth label="First Name" variant="filled"
                    value={profileForm.first_name}
                    onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                  />
                  <TextField
                    fullWidth label="Last Name" variant="filled"
                    value={profileForm.last_name}
                    onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                  />
                  <TextField
                    fullWidth label="Bio" multiline rows={3} variant="filled"
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  />
                </>
              )}
              {dialog.type === 'password' && (
                <>
                  <TextField fullWidth type="password" label="Current Password" variant="filled" />
                  <TextField fullWidth type="password" label="New Password" variant="filled" />
                  <TextField fullWidth type="password" label="Confirm Password" variant="filled" />
                </>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleCloseDialog} color="inherit">Cancel</Button>
            <Button
              variant="contained"
              onClick={handleProfileUpdate}
              disabled={loading}
              sx={{ borderRadius: 2, px: 4 }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} variant="filled" sx={{ borderRadius: 2 }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </MobileLayout>
  );
};

export default MobileProfile;