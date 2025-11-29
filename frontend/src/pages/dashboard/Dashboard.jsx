import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Badge,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  People,
  Verified,
  SupervisorAccount,
  PersonAdd,
  Email,
  Refresh,
  CheckCircle,
  ArrowForward,
  TrendingUp,
  Settings,
  Home,
  Receipt,
  Add,
  Analytics,
  Person,
} from '@mui/icons-material';
import { usersAPI } from '../../services/users';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const usersData = await usersAPI.getAllUsers();
      setUsers(usersData.results || usersData || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUsers();
    setTimeout(() => setRefreshing(false), 500);
  };

  // V Point inspired stats with your brand colors
  const stats = [
    { 
      title: 'Total Users', 
      value: users.length, 
      icon: People,
      color: '#004A8F', // vpoint-blue
      gradient: 'linear-gradient(135deg, #004A8F 0%, #003366 100%)',
      change: '+12%'
    },
    { 
      title: 'Active', 
      value: users.filter(u => u.is_active).length, 
      icon: CheckCircle,
      color: '#22c55e',
      gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      change: '+8%'
    },
    { 
      title: 'Verified', 
      value: users.filter(u => u.is_verified).length, 
      icon: Verified,
      color: '#FFD500', // vpoint-yellow
      gradient: 'linear-gradient(135deg, #FFD500 0%, #E6BE00 100%)',
      change: '+5%'
    },
    { 
      title: 'Staff', 
      value: users.filter(u => u.is_staff).length, 
      icon: SupervisorAccount,
      color: '#00445C', // card-blue
      gradient: 'linear-gradient(135deg, #00445C 0%, #003344 100%)',
      change: '+2%'
    },
  ];

  const getUserInitial = (user) => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`;
    }
    return user?.username?.[0]?.toUpperCase() || 'U';
  };

  const getUserName = (user) => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    return user?.username || 'Unknown User';
  };

  const getUserRole = (user) => {
    if (user?.is_superuser) return 'Admin';
    if (user?.is_staff) return 'Staff';
    return 'User';
  };

  const getRoleColor = (user) => {
    if (user?.is_superuser) return 'error';
    if (user?.is_staff) return 'warning';
    return 'default';
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh'
      }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%',
      p: { xs: 2, sm: 3, md: 4 },
      minHeight: '100vh',
      bgcolor: '#E8EBF0', // page-bg from V Point
      pb: 8, // Space for bottom navigation
    }}>
      {/* Welcome Header with V Point Style */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          mb: 1
        }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              variant={isMobile ? 'h5' : 'h4'} 
              fontWeight="bold" 
              sx={{ mb: 0.5, color: '#004A8F' }} // vpoint-blue
            >
              User Management Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome back, {currentUser?.username || 'User'}! 
              <span role="img" aria-label="wave"> 👋</span>
            </Typography>
          </Box>
          <IconButton 
            onClick={handleRefresh}
            disabled={refreshing}
            size={isMobile ? 'small' : 'medium'}
            sx={{
              bgcolor: 'white',
              boxShadow: 1,
              p: 1.5,
              borderRadius: '50%',
              transform: refreshing ? 'rotate(360deg)' : 'none',
              transition: 'transform 0.5s ease-in-out',
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
          >
            <Refresh sx={{ fontSize: 20, color: '#004A8F' }} />
          </IconButton>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={fetchUsers}
            >
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Stats Grid - V Point Style */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { 
          xs: 'repeat(2, 1fr)', 
          sm: 'repeat(2, 1fr)', 
          md: 'repeat(4, 1fr)' 
        },
        gap: { xs: 1.5, sm: 2 },
        mb: 3
      }}>
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={index}
              elevation={3}
              sx={{ 
                background: stat.gradient,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                minHeight: { xs: 110, sm: 120 },
                borderRadius: 3,
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
            >
              {/* Background Pattern Icon */}
              <Box sx={{
                position: 'absolute',
                top: -10,
                right: -10,
                opacity: 0.2,
              }}>
                <Icon sx={{ fontSize: 100 }} />
              </Box>

              <CardContent sx={{ 
                p: { xs: 1.5, sm: 2 },
                position: 'relative',
                zIndex: 1,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                '&:last-child': { pb: { xs: 1.5, sm: 2 } }
              }}>
                <Box>
                  <Box sx={{ 
                    bgcolor: 'rgba(255,255,255,0.2)', 
                    borderRadius: 1.5, 
                    p: 0.8,
                    display: 'inline-flex',
                    mb: 1
                  }}>
                    <Icon sx={{ fontSize: 24 }} />
                  </Box>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      display: 'block',
                      opacity: 0.9,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      mb: 0.5
                    }}
                  >
                    {stat.title}
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'flex-end'
                }}>
                  <Typography 
                    variant="h4" 
                    fontWeight="bold"
                    sx={{ fontSize: { xs: '1.75rem', sm: '2rem' } }}
                  >
                    {stat.value}
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    borderRadius: 1,
                    px: 0.75,
                    py: 0.25
                  }}>
                    <TrendingUp sx={{ fontSize: 12 }} />
                    <Typography variant="caption" sx={{ fontSize: '0.7rem', fontWeight: 600, ml: 0.5 }}>
                      {stat.change}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Main Content: Recent Users & Quick Actions */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { 
          xs: '1fr', 
          md: '2fr 1fr'
        },
        gap: { xs: 2, sm: 3 }
      }}>

        {/* Recent Users List */}
        <Card elevation={0} sx={{ 
          border: '1px solid', 
          borderColor: 'divider',
          borderRadius: 3,
          bgcolor: 'white'
        }}>
          <CardContent sx={{ p: 0 }}>
            {/* Header */}
            <Box sx={{ 
              px: { xs: 2, sm: 3 }, 
              py: { xs: 1.5, sm: 2 }, 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box>
                <Typography variant="h6" fontWeight="bold" color="#004A8F">
                  Recent Users
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Showing {users.slice(0, isMobile ? 5 : 8).length} of {users.length} total users
                </Typography>
              </Box>
              <Button 
                size="medium" 
                startIcon={<PersonAdd sx={{ fontSize: 20 }} />}
                variant="contained"
                disableElevation
                sx={{ 
                  borderRadius: 2,
                  textTransform: 'none',
                  minWidth: { xs: 'auto', sm: 'auto' },
                  px: { xs: 1.5, sm: 2 },
                  py: 1,
                  bgcolor: '#004A8F',
                  '&:hover': { bgcolor: '#003366' }
                }}
              >
                {isMobile ? '' : 'Add User'}
              </Button>
            </Box>

            <Divider />

            {/* Users List */}
            <Stack spacing={0}>
              {users.slice(0, isMobile ? 5 : 8).map((user, index) => (
                <React.Fragment key={user.id}>
                  <Box 
                    sx={{ 
                      p: { xs: 1.5, sm: 2 },
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      }
                    }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      gap: { xs: 1.5, sm: 2 },
                      alignItems: 'center'
                    }}>
                      {/* Avatar */}
                      <Badge
                        color={user.is_active ? 'success' : 'error'}
                        variant="dot"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        overlap="circular"
                        sx={{ '& .MuiBadge-dot': { width: 10, height: 10, borderRadius: '50%', border: '2px solid white' } }}
                      >
                        <Avatar 
                          src={user.profile_image}
                          sx={{ 
                            width: { xs: 48, sm: 56 }, 
                            height: { xs: 48, sm: 56 },
                            bgcolor: '#004A8F',
                            fontWeight: 600,
                            fontSize: { xs: '1rem', sm: '1.1rem' }
                          }}
                        >
                          {getUserInitial(user)}
                        </Avatar>
                      </Badge>

                      {/* User Info */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 0.5, 
                          mb: 0.25
                        }}>
                          <Typography 
                            variant="subtitle1" 
                            fontWeight="600"
                            sx={{ 
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              fontSize: { xs: '0.9rem', sm: '1rem' }
                            }}
                          >
                            {getUserName(user)}
                          </Typography>
                          {user.is_verified && (
                            <Verified sx={{ fontSize: 16, color: '#FFD500' }} />
                          )}
                        </Box>

                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block',
                            mb: 0.75,
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}
                        >
                          {user.email}
                        </Typography>

                        {/* Chips */}
                        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                          <Chip 
                            label={getUserRole(user)} 
                            size="small" 
                            color={getRoleColor(user)}
                            sx={{ 
                              height: { xs: 20, sm: 24 }, 
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              fontWeight: 600,
                              '& .MuiChip-label': { px: 1 }
                            }}
                          />
                          {!user.is_verified && (
                            <Chip 
                              label="Unverified" 
                              size="small" 
                              color="warning"
                              variant="outlined"
                              sx={{ 
                                height: { xs: 20, sm: 24 }, 
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                fontWeight: 600,
                                '& .MuiChip-label': { px: 1 }
                              }}
                            />
                          )}
                        </Box>
                      </Box>

                      {/* Arrow Button */}
                      <IconButton 
                        size="small"
                        sx={{ 
                          color: '#004A8F',
                          display: { xs: 'flex', sm: 'flex' }
                        }}
                      >
                        <ArrowForward sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Box>
                  </Box>
                  {index < users.slice(0, isMobile ? 5 : 8).length - 1 && <Divider />}
                </React.Fragment>
              ))}

              {users.length === 0 && (
                <Box sx={{ p: 6, textAlign: 'center' }}>
                  <People sx={{ fontSize: 48, color: theme.palette.text.disabled, mb: 2 }} />
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    No users found
                  </Typography>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    onClick={fetchUsers}
                    sx={{ 
                      mt: 2, 
                      borderRadius: 2, 
                      textTransform: 'none',
                      borderColor: '#004A8F',
                      color: '#004A8F',
                      '&:hover': {
                        borderColor: '#003366',
                        bgcolor: 'rgba(0, 74, 143, 0.04)'
                      }
                    }}
                  >
                    Reload
                  </Button>
                </Box>
              )}
            </Stack>

            {/* View All Button */}
            {users.length > (isMobile ? 5 : 8) && (
              <>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <Button 
                    variant="text" 
                    fullWidth
                    endIcon={<ArrowForward sx={{ fontSize: 20 }} />}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1,
                      color: '#004A8F',
                      '&:hover': {
                        bgcolor: 'rgba(0, 74, 143, 0.04)'
                      }
                    }}
                  >
                    View All {users.length} Users
                  </Button>
                </Box>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions - V Point Style */}
        <Card elevation={0} sx={{ 
          border: '1px solid', 
          borderColor: 'divider',
          borderRadius: 3,
          minHeight: { md: 'min-content' },
          bgcolor: 'white'
        }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#004A8F' }}>
              Quick Actions
            </Typography>
            <Stack spacing={1.5}>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<PersonAdd sx={{ fontSize: 20 }} />}
                sx={{ 
                  justifyContent: 'flex-start', 
                  borderRadius: 2,
                  textTransform: 'none',
                  py: 1.25,
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  borderColor: '#004A8F',
                  color: '#004A8F',
                  '&:hover': {
                    borderColor: '#003366',
                    bgcolor: 'rgba(0, 74, 143, 0.04)'
                  }
                }}
              >
                Add New User
              </Button>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<Email sx={{ fontSize: 20 }} />}
                sx={{ 
                  justifyContent: 'flex-start', 
                  borderRadius: 2,
                  textTransform: 'none',
                  py: 1.25,
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  borderColor: '#004A8F',
                  color: '#004A8F',
                  '&:hover': {
                    borderColor: '#003366',
                    bgcolor: 'rgba(0, 74, 143, 0.04)'
                  }
                }}
              >
                Send Bulk Email
              </Button>
              <Button 
                variant="outlined" 
                fullWidth 
                startIcon={<Settings sx={{ fontSize: 20 }} />}
                sx={{ 
                  justifyContent: 'flex-start', 
                  borderRadius: 2,
                  textTransform: 'none',
                  py: 1.25,
                  fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                  borderColor: '#004A8F',
                  color: '#004A8F',
                  '&:hover': {
                    borderColor: '#003366',
                    bgcolor: 'rgba(0, 74, 143, 0.04)'
                  }
                }}
              >
                System Settings
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Dashboard;