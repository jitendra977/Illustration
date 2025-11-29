import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Avatar,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  alpha,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  AttachMoney,
  People,
  ShoppingCart,
  Visibility,
  MoreVert,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';

const Dashboard = () => {
  const theme = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('week');

  const stats = [
    { 
      title: 'Total Revenue', 
      value: '$45,231', 
      change: '+12.5%', 
      trend: 'up',
      icon: <AttachMoney />,
      color: '#3b82f6',
      illustration: '💰'
    },
    { 
      title: 'Total Users', 
      value: '8,282', 
      change: '+8.2%', 
      trend: 'up',
      icon: <People />,
      color: '#a855f7',
      illustration: '👥'
    },
    { 
      title: 'Total Orders', 
      value: '1,426', 
      change: '-2.4%', 
      trend: 'down',
      icon: <ShoppingCart />,
      color: '#22c55e',
      illustration: '🛒'
    },
    { 
      title: 'Page Views', 
      value: '24,567', 
      change: '+15.3%', 
      trend: 'up',
      icon: <Visibility />,
      color: '#f97316',
      illustration: '👁️'
    },
  ];

  const recentActivities = [
    { id: 1, user: 'John Doe', action: 'placed an order', amount: '$234', time: '2 min ago', avatar: '👨' },
    { id: 2, user: 'Jane Smith', action: 'registered account', amount: '', time: '5 min ago', avatar: '👩' },
    { id: 3, user: 'Mike Johnson', action: 'left a review', amount: '⭐⭐⭐⭐⭐', time: '10 min ago', avatar: '👨‍💼' },
    { id: 4, user: 'Sarah Wilson', action: 'placed an order', amount: '$567', time: '15 min ago', avatar: '👩‍💻' },
    { id: 5, user: 'Tom Brown', action: 'cancelled order', amount: '$123', time: '20 min ago', avatar: '🧑' },
  ];

  const topProducts = [
    { id: 1, name: 'Wireless Headphones', sales: 234, revenue: '$4,680', icon: '🎧' },
    { id: 2, name: 'Smart Watch', sales: 189, revenue: '$3,780', icon: '⌚' },
    { id: 3, name: 'Laptop Stand', sales: 156, revenue: '$1,560', icon: '💻' },
    { id: 4, name: 'Phone Case', sales: 142, revenue: '$710', icon: '📱' },
    { id: 5, name: 'USB Cable', sales: 128, revenue: '$384', icon: '🔌' },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Welcome back! Here's what's happening today.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {['day', 'week', 'month'].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setSelectedPeriod(period)}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </Button>
            ))}
          </Box>
        </Box>
      </Paper>

      <Box sx={{ px: 3 }}>
        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={6} lg={3} key={index}>
              <Card sx={{ 
                borderRadius: 3, 
                transition: 'all 0.3s',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ 
                      bgcolor: stat.color, 
                      borderRadius: 2, 
                      p: 1.5, 
                      display: 'flex',
                      color: 'white'
                    }}>
                      {stat.icon}
                    </Box>
                    <Typography variant="h3">{stat.illustration}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {stat.title}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <Typography variant="h5" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Chip
                      icon={stat.trend === 'up' ? <ArrowUpward sx={{ fontSize: 14 }} /> : <ArrowDownward sx={{ fontSize: 14 }} />}
                      label={stat.change}
                      size="small"
                      color={stat.trend === 'up' ? 'success' : 'error'}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Recent Activities */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Recent Activities
                  </Typography>
                  <IconButton size="small">
                    <MoreVert />
                  </IconButton>
                </Box>
                <List>
                  {recentActivities.map((activity) => (
                    <ListItem
                      key={activity.id}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.05)
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          fontSize: 24
                        }}>
                          {activity.avatar}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="medium">
                            {activity.user}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {activity.action}
                          </Typography>
                        }
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        {activity.amount && (
                          <Typography variant="body2" fontWeight="bold">
                            {activity.amount}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {activity.time}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Products */}
          <Grid item xs={12} lg={6}>
            <Card sx={{ borderRadius: 3, height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    Top Products
                  </Typography>
                  <IconButton size="small">
                    <MoreVert />
                  </IconButton>
                </Box>
                <List>
                  {topProducts.map((product, index) => (
                    <ListItem
                      key={product.id}
                      sx={{
                        borderRadius: 2,
                        mb: 1,
                        transition: 'all 0.2s',
                        '&:hover': {
                          bgcolor: alpha(theme.palette.primary.main, 0.05)
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ 
                          background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                          fontSize: 24
                        }}>
                          {product.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="medium">
                            {product.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {product.sales} sales
                          </Typography>
                        }
                      />
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="body2" fontWeight="bold">
                          {product.revenue}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          #{index + 1}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Action Banner */}
        <Paper
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3,
            p: 4,
            mb: 3,
            color: 'white'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between', 
            alignItems: 'center',
            gap: 3
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Typography variant="h1">🚀</Typography>
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Ready to boost your sales?
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Check out our premium features and analytics tools
                </Typography>
              </Box>
            </Box>
            <Button 
              variant="contained" 
              size="large"
              sx={{ 
                bgcolor: 'white', 
                color: 'primary.main',
                fontWeight: 'bold',
                '&:hover': { 
                  bgcolor: alpha('#fff', 0.9)
                }
              }}
            >
              Get Started
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;