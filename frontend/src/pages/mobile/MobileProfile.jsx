// src/pages/mobile/MobileProfile.jsx
import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Stack,
  Avatar,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Snackbar
} from '@mui/material';
import { 
  Person as PersonIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  PhotoCamera as PhotoCameraIcon,
  Verified as VerifiedIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';
import { usersAPI } from '../../services/users';

const MobileProfile = () => {
  const { user, logout, updateUser, changePassword, refreshProfile } = useAuth();
  
  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    username: user?.username || '',
    bio: user?.bio || '',
    phone: user?.phone || ''
  });
  
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // UI states
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [errors, setErrors] = useState({});

  const getUserInitial = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`;
    }
    return user?.username?.[0]?.toUpperCase() || 'U';
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({ 
          open: true, 
          message: 'ファイルサイズは5MB以下にしてください', 
          severity: 'error' 
        });
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setSnackbar({ 
          open: true, 
          message: '画像ファイルを選択してください', 
          severity: 'error' 
        });
        return;
      }
      
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProfileEdit = async () => {
    setLoading(true);
    setErrors({});
    
    try {
      const formData = new FormData();
      
      // Add text fields
      Object.keys(profileForm).forEach(key => {
        if (profileForm[key]) {
          formData.append(key, profileForm[key]);
        }
      });
      
      // Add image if selected
      if (profileImage) {
        formData.append('profile_image', profileImage);
      }
      
      const response = await usersAPI.updateProfile(formData);
      
      // Update user context with new data
      updateUser(response);
      
      setSnackbar({ 
        open: true, 
        message: 'プロフィールを更新しました', 
        severity: 'success' 
      });
      
      setEditDialogOpen(false);
      setProfileImage(null);
      setImagePreview(null);
      
      // Refresh profile to get latest data
      await refreshProfile();
      
    } catch (error) {
      console.error('Profile update error:', error);
      
      if (error.response?.data) {
        setErrors(error.response.data);
        setSnackbar({ 
          open: true, 
          message: 'プロフィールの更新に失敗しました', 
          severity: 'error' 
        });
      } else {
        setSnackbar({ 
          open: true, 
          message: error.details || '接続エラーが発生しました', 
          severity: 'error' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setLoading(true);
    setErrors({});
    
    // Validation
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setErrors({ confirm_password: ['パスワードが一致しません'] });
      setLoading(false);
      return;
    }
    
    if (passwordForm.new_password.length < 8) {
      setErrors({ new_password: ['パスワードは8文字以上である必要があります'] });
      setLoading(false);
      return;
    }
    
    try {
      const result = await changePassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      });
      
      if (result.success) {
        setSnackbar({ 
          open: true, 
          message: 'パスワードを変更しました', 
          severity: 'success' 
        });
        setPasswordDialogOpen(false);
        setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Password change error:', error);
      
      if (error.response?.data) {
        setErrors(error.response.data);
      }
      
      setSnackbar({ 
        open: true, 
        message: error.message || 'パスワード変更に失敗しました', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setLoading(true);
    
    try {
      const response = await usersAPI.resendVerification();
      setSnackbar({ 
        open: true, 
        message: '確認メールを送信しました', 
        severity: 'success' 
      });
      setEmailDialogOpen(false);
    } catch (error) {
      console.error('Resend verification error:', error);
      setSnackbar({ 
        open: true, 
        message: error.response?.data?.detail || 'メール送信に失敗しました', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = () => {
    setProfileForm({
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      username: user?.username || '',
      bio: user?.bio || '',
      phone: user?.phone || ''
    });
    setEditDialogOpen(true);
    setErrors({});
  };

  return (
    <Container maxWidth="sm" sx={{ px: 2, py: 3 }}>
      <Stack spacing={3}>
        {/* Profile Header */}
        <Card sx={{ borderRadius: 3, py: 3 }}>
  <Stack spacing={1.5} alignItems="center">

    {/* Avatar */}
    <Box sx={{ position: 'relative' }}>
      <Avatar
        src={imagePreview || user?.profile_image}
        sx={{
          width: 88,
          height: 88,
          fontSize: '2rem',
          bgcolor: 'primary.main'
        }}
      >
        {getUserInitial()}
      </Avatar>

      <IconButton
        onClick={openEditDialog}
        sx={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          bgcolor: 'primary.main',
          color: 'white',
          width: 30,
          height: 30,
          '&:hover': { bgcolor: 'primary.dark' }
        }}
      >
        <EditIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>

    {/* Name */}
    <Stack direction="row" spacing={0.5} alignItems="center">
      <Typography variant="h6" fontWeight="bold">
        {user?.first_name || user?.username || 'ゲスト'}
      </Typography>
      {user?.is_verified && (
        <VerifiedIcon color="primary" sx={{ fontSize: 18 }} />
      )}
    </Stack>

    {/* Email */}
    <Typography variant="body2" color="text.secondary">
      {user?.email}
    </Typography>

    {/* Factory (IMPORTANT PART) */}
    <Box
      sx={{
        mt: 0.5,
        px: 1.5,
        py: 0.5,
        borderRadius: 2,
        bgcolor: 'grey.100',
        fontSize: '0.75rem',
        color: 'text.secondary'
      }}
    >
      🏭 {user?.factory || 'No Factory'}
    </Box>

    {/* Bio */}
    {user?.bio && (
      <Typography
        variant="body2"
        sx={{ mt: 1, px: 3, textAlign: 'center', color: 'text.secondary' }}
      >
        {user.bio}
      </Typography>
    )}
  </Stack>
</Card>

        {/* Settings List */}
        <Card sx={{ borderRadius: 3 }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={openEditDialog}>
                <ListItemIcon><PersonIcon /></ListItemIcon>
                <ListItemText primary="プロフィール編集" />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton onClick={() => setEmailDialogOpen(true)}>
                <ListItemIcon><EmailIcon /></ListItemIcon>
                <ListItemText 
                  primary="メール設定" 
                  secondary={user?.is_verified ? '確認済み' : '未確認'}
                />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon><NotificationsIcon /></ListItemIcon>
                <ListItemText primary="通知設定" />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton onClick={() => setPasswordDialogOpen(true)}>
                <ListItemIcon><SecurityIcon /></ListItemIcon>
                <ListItemText primary="パスワード変更" />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon><LanguageIcon /></ListItemIcon>
                <ListItemText primary="言語設定" secondary="日本語" />
              </ListItemButton>
            </ListItem>
          </List>
        </Card>

        {/* Help & Info */}
        <Card sx={{ borderRadius: 3 }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon><HelpIcon /></ListItemIcon>
                <ListItemText primary="ヘルプ & サポート" />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon><InfoIcon /></ListItemIcon>
                <ListItemText primary="アプリについて" secondary="バージョン 1.0.0" />
              </ListItemButton>
            </ListItem>
          </List>
        </Card>

        {/* Logout Button */}
        <Button
          fullWidth
          variant="outlined"
          color="error"
          size="large"
          startIcon={<LogoutIcon />}
          onClick={logout}
          sx={{ 
            py: 1.75,
            fontSize: '0.95rem',
            fontWeight: 600,
            borderRadius: 3,
            borderWidth: 2,
            textTransform: 'none'
          }}
        >
          ログアウト
        </Button>
      </Stack>

      {/* Edit Profile Dialog */}
      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          プロフィール編集
          <IconButton
            onClick={() => setEditDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            {/* Profile Image Upload */}
            <Box sx={{ textAlign: 'center' }}>
              <input
                accept="image/*"
                type="file"
                id="profile-image-upload"
                hidden
                onChange={handleImageChange}
              />
              <label htmlFor="profile-image-upload">
                <Avatar
                  src={imagePreview || user?.profile_image}
                  sx={{ 
                    width: 100, 
                    height: 100, 
                    margin: '0 auto',
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 }
                  }}
                >
                  {getUserInitial()}
                </Avatar>
                <Button
                  component="span"
                  startIcon={<PhotoCameraIcon />}
                  sx={{ mt: 1 }}
                  size="small"
                >
                  画像を変更
                </Button>
              </label>
            </Box>

            <TextField
              label="ユーザー名"
              value={profileForm.username}
              onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
              error={!!errors.username}
              helperText={errors.username?.[0]}
              fullWidth
            />
            
            <TextField
              label="名"
              value={profileForm.first_name}
              onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
              error={!!errors.first_name}
              helperText={errors.first_name?.[0]}
              fullWidth
            />
            
            <TextField
              label="姓"
              value={profileForm.last_name}
              onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
              error={!!errors.last_name}
              helperText={errors.last_name?.[0]}
              fullWidth
            />
            
            <TextField
              label="電話番号"
              value={profileForm.phone}
              onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              error={!!errors.phone}
              helperText={errors.phone?.[0]}
              fullWidth
            />
            
            <TextField
              label="自己紹介"
              value={profileForm.bio}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              error={!!errors.bio}
              helperText={errors.bio?.[0]}
              multiline
              rows={3}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)}>
            キャンセル
          </Button>
          <Button 
            variant="contained" 
            onClick={handleProfileEdit}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : '保存'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog 
        open={passwordDialogOpen} 
        onClose={() => setPasswordDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          パスワード変更
          <IconButton
            onClick={() => setPasswordDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField
              label="現在のパスワード"
              type="password"
              value={passwordForm.old_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
              error={!!errors.old_password}
              helperText={errors.old_password?.[0]}
              fullWidth
            />
            
            <TextField
              label="新しいパスワード"
              type="password"
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
              error={!!errors.new_password}
              helperText={errors.new_password?.[0] || '8文字以上で入力してください'}
              fullWidth
            />
            
            <TextField
              label="新しいパスワード（確認）"
              type="password"
              value={passwordForm.confirm_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
              error={!!errors.confirm_password}
              helperText={errors.confirm_password?.[0]}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPasswordDialogOpen(false)}>
            キャンセル
          </Button>
          <Button 
            variant="contained" 
            onClick={handlePasswordChange}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : '変更'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Verification Dialog */}
      <Dialog 
        open={emailDialogOpen} 
        onClose={() => setEmailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          メール確認
          <IconButton
            onClick={() => setEmailDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Typography>
              {user?.email} に確認メールを送信します。
            </Typography>
            {!user?.is_verified && (
              <Alert severity="info">
                メールアドレスの確認が完了していません。
                メール内のリンクをクリックして確認を完了してください。
              </Alert>
            )}
            {user?.is_verified && (
              <Alert severity="success">
                メールアドレスは確認済みです。
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEmailDialogOpen(false)}>
            閉じる
          </Button>
          {!user?.is_verified && (
            <Button 
              variant="contained" 
              onClick={handleResendVerification}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : '確認メール送信'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MobileProfile;