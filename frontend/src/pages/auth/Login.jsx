// src/components/Login/Login.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { validateLoginForm, hasFormErrors } from '../../utils/validators';
import {
  Box,
  Paper,
  Typography,
  Container,
  Stack,
  CircularProgress,
  Alert,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Checkbox,
  FormControlLabel,
  Divider,
  Fade,
  Slide
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  PersonOutline,
  Shield,
  Google,
  GitHub,
  Apple
} from '@mui/icons-material';

const Login = () => {
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState('');
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const getErrorMessage = (error) => {
    if (typeof error === 'string') {
      return error;
    }

    if (error.type) {
      switch (error.type) {
        case 'OFFLINE_ERROR':
          return '📱 You are offline. Please check your internet connection and try again.';
        case 'TIMEOUT_ERROR':
          return '⏰ Connection timeout. The server is taking too long to respond. Please try again.';
        case 'SERVER_UNREACHABLE':
          return '🔌 Cannot connect to the server. Please check:\n• Server is running\n• Correct API URL\n• Network connectivity';
        case 'CORS_ERROR':
          return '🛡️ CORS error. Please contact administrator or check server configuration.';
        case 'ENDPOINT_NOT_FOUND':
          return '🔍 Login endpoint not found. Please check if the API URL is correct.';
        case 'SERVER_ERROR':
          return '🚨 Server error. Please try again later or contact support.';
        case 'UNAUTHORIZED':
          return '❌ Invalid username or password. Please check your credentials.';
        case 'REQUEST_CONFIG_ERROR':
          return '⚙️ Request configuration error. Please try again.';
        default:
          return error.details || 'An unexpected error occurred. Please try again.';
      }
    }

    if (error.response) {
      if (error.response.status === 401) {
        return '❌ Invalid username or password.';
      } else if (error.response.status >= 500) {
        return `🚨 Server error (${error.response.status}). Please try again later.`;
      } else {
        return error.response.data?.message || `Error: ${error.response.status}`;
      }
    }

    if (error.message === 'Network Error') {
      if (!navigator.onLine) {
        return '📱 You are offline. Please check your internet connection.';
      } else {
        return '🔌 Cannot connect to server. The server may be down or the URL is incorrect.';
      }
    }

    return 'Login failed. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validateLoginForm(form);

    if (hasFormErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const result = await login(form);

      if (result.success) {
        navigate('/');
      } else {
        setErrors({
          general: getErrorMessage(result.error || result.originalError)
        });
      }
    } catch (err) {
      console.error('Login error details:', err);
      setErrors({ general: getErrorMessage(err) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #1e1b4b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-50%',
          right: '-50%',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
          animation: 'float 20s ease-in-out infinite',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-50%',
          left: '-50%',
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
          animation: 'float 15s ease-in-out infinite reverse',
        },
        '@keyframes float': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(50px, 50px)' },
        },
      }}
    >
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Slide direction="down" in={mounted} timeout={800}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                boxShadow: '0 8px 32px rgba(168, 85, 247, 0.4)',
                mb: 2,
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.1) rotate(5deg)',
                },
              }}
            >
              <Shield sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                color: 'white',
                mb: 1,
                letterSpacing: '-0.5px',
              }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              ✨ Sign in to continue your journey
            </Typography>
          </Box>
        </Slide>

        <Fade in={mounted} timeout={1000}>
          <Paper
            elevation={0}
            sx={{
              padding: 4,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            }}
          >
            {/* Header with Gradient */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, rgba(168,85,247,0.2) 0%, rgba(236,72,153,0.2) 100%)',
                padding: 3,
                borderRadius: 2,
                mb: 3,
                border: '1px solid rgba(168, 85, 247, 0.3)',
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <LockOutlined />
                Secure Login
              </Typography>
            </Box>

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                {successMessage && (
                  <Fade in timeout={500}>
                    <Alert
                      severity="success"
                      sx={{
                        borderRadius: 2,
                        background: 'rgba(34, 197, 94, 0.15)',
                        border: '1px solid rgba(34, 197, 94, 0.3)',
                        color: '#86efac',
                        '& .MuiAlert-icon': {
                          color: '#86efac',
                        },
                      }}
                    >
                      {successMessage}
                    </Alert>
                  </Fade>
                )}

                {errors.general && (
                  <Fade in timeout={500}>
                    <Alert
                      severity="error"
                      sx={{
                        borderRadius: 2,
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#fca5a5',
                        whiteSpace: 'pre-line',
                        '& .MuiAlert-icon': {
                          color: '#fca5a5',
                        },
                      }}
                    >
                      {errors.general}
                    </Alert>
                  </Fade>
                )}

                <TextField
                  type="text"
                  label="Username"
                  placeholder="Enter your username"
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  error={!!errors.username}
                  helperText={errors.username}
                  required
                  disabled={isLoading}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutline sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(168, 85, 247, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#a855f7',
                        boxShadow: '0 0 0 3px rgba(168, 85, 247, 0.2)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&.Mui-focused': {
                        color: '#a855f7',
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#fca5a5',
                    },
                  }}
                />

                <TextField
                  type={showPassword ? 'text' : 'password'}
                  label="Password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  error={!!errors.password}
                  helperText={errors.password}
                  required
                  disabled={isLoading}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          sx={{ color: 'rgba(255, 255, 255, 0.5)' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: 'white',
                      background: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 2,
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                        borderWidth: 2,
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(168, 85, 247, 0.5)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#a855f7',
                        boxShadow: '0 0 0 3px rgba(168, 85, 247, 0.2)',
                      },
                    },
                    '& .MuiInputLabel-root': {
                      color: 'rgba(255, 255, 255, 0.7)',
                      '&.Mui-focused': {
                        color: '#a855f7',
                      },
                    },
                    '& .MuiFormHelperText-root': {
                      color: '#fca5a5',
                    },
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        sx={{
                          color: 'rgba(255, 255, 255, 0.5)',
                          '&.Mui-checked': {
                            color: '#a855f7',
                          },
                        }}
                      />
                    }
                    label={<Typography sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>Remember me</Typography>}
                  />
                  <Typography
                    component="a"
                    href="#"
                    sx={{
                      color: '#c084fc',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      '&:hover': {
                        color: '#e9d5ff',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Forgot password?
                  </Typography>
                </Box>

                <Button
                  type="submit"
                  size="large"
                  fullWidth
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : null}
                  sx={{
                    background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                    color: 'white',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '1rem',
                    padding: '14px 24px',
                    boxShadow: '0 4px 20px rgba(168, 85, 247, 0.4)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #9333ea 0%, #db2777 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 24px rgba(168, 85, 247, 0.6)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                    '&.Mui-disabled': {
                      background: 'rgba(255, 255, 255, 0.1)',
                      color: 'rgba(255, 255, 255, 0.5)',
                    },
                  }}
                >
                  {isLoading ? 'Logging in...' : 'Sign In →'}
                </Button>

                <Button
                  type="button"
                  size="large"
                  onClick={() => navigate('/register')}
                  fullWidth
                  disabled={isLoading}
                  sx={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'white',
                    border: '2px solid rgba(168, 85, 247, 0.5)',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    padding: '14px 24px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(168, 85, 247, 0.1)',
                      borderColor: '#a855f7',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 16px rgba(168, 85, 247, 0.3)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                    '&.Mui-disabled': {
                      background: 'rgba(255, 255, 255, 0.03)',
                      color: 'rgba(255, 255, 255, 0.3)',
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Create New Account
                </Button>

                <Divider sx={{ my: 2 }}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.875rem' }}>
                    Or continue with
                  </Typography>
                </Divider>

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
                  {[
                    { icon: <Google />, name: 'Google' },
                    { icon: <GitHub />, name: 'GitHub' },
                    { icon: <Apple />, name: 'Apple' },
                  ].map((provider) => (
                    <Button
                      key={provider.name}
                      variant="outlined"
                      sx={{
                        py: 1.5,
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: 'white',
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'rgba(255, 255, 255, 0.1)',
                          borderColor: 'rgba(255, 255, 255, 0.3)',
                          transform: 'scale(1.05)',
                        },
                      }}
                    >
                      {provider.icon}
                    </Button>
                  ))}
                </Box>

                {process.env.NODE_ENV === 'development' && (
                  <Alert
                    severity="info"
                    sx={{
                      borderRadius: 2,
                      background: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#93c5fd',
                      '& .MuiAlert-icon': {
                        color: '#93c5fd',
                      },
                    }}
                  >
                    <Typography variant="caption">
                      API URL: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}
                    </Typography>
                  </Alert>
                )}
              </Stack>
            </Box>
          </Paper>
        </Fade>

        <Typography
          sx={{
            textAlign: 'center',
            mt: 3,
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '0.875rem',
          }}
        >
          🔒 Protected by enterprise-grade encryption
        </Typography>
      </Container>
    </Box>
  );
};

export default Login;