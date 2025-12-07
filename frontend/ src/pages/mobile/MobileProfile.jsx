// src/pages/mobile/MobileProfile.jsx
import React from 'react';
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
  Button
} from '@mui/material';
import { 
  Person as PersonIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
  Language as LanguageIcon,
  Help as HelpIcon,
  Info as InfoIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const MobileProfile = () => {
  const { user, logout } = useAuth();

  const getUserInitial = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`;
    }
    return user?.username?.[0]?.toUpperCase() || 'U';
  };

  return (
    <Container maxWidth="sm" sx={{ px: 2, py: 3 }}>
      <Stack spacing={3}>
        {/* Profile Header */}
        <Card sx={{ borderRadius: 3, textAlign: 'center', py: 3 }}>
          <Avatar 
            src={user?.profile_image}
            sx={{ 
              width: 80, 
              height: 80,
              margin: '0 auto',
              mb: 2,
              fontSize: '2rem',
              bgcolor: 'primary.main'
            }}
          >
            {getUserInitial()}
          </Avatar>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {user?.first_name || user?.username || 'ゲスト'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email || ''}
          </Typography>
        </Card>

        {/* Settings List */}
        <Card sx={{ borderRadius: 3 }}>
          <List>
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon><PersonIcon /></ListItemIcon>
                <ListItemText primary="プロフィール編集" />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon><EmailIcon /></ListItemIcon>
                <ListItemText primary="メール設定" />
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
              <ListItemButton>
                <ListItemIcon><SecurityIcon /></ListItemIcon>
                <ListItemText primary="セキュリティ" />
              </ListItemButton>
            </ListItem>
            <Divider />
            <ListItem disablePadding>
              <ListItemButton>
                <ListItemIcon><LanguageIcon /></ListItemIcon>
                <ListItemText primary="言語設定" />
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
                <ListItemText primary="アプリについて" />
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
    </Container>
  );
};

export default MobileProfile;