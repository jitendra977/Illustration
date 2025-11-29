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
  Button
} from '@mui/material';

const Login = () => {
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState('');
  const { login } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the state to avoid showing the message again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const getErrorMessage = (error) => {
    // If it's already a string error message
    if (typeof error === 'string') {
      return error;
    }

    // If it's our enhanced error object
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

    // Handle Axios original errors
    if (error.response) {
      if (error.response.status === 401) {
        return '❌ Invalid username or password.';
      } else if (error.response.status >= 500) {
        return `🚨 Server error (${error.response.status}). Please try again later.`;
      } else {
        return error.response.data?.message || `Error: ${error.response.status}`;
      }
    }

    // Generic network errors
    if (error.message === 'Network Error') {
      if (!navigator.onLine) {
        return '📱 You are offline. Please check your internet connection.';
      } else {
        return '🔌 Cannot connect to server. The server may be down or the URL is incorrect.';
      }
    }

    // Default fallback
    return 'Login failed. Please try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form using validators
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            padding: 4,
            borderRadius: 3,
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          }}
        >
          <Box component="form" onSubmit={handleSubmit}>
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              sx={{
                textAlign: 'center',
                fontWeight: 700,
                color: '#333',
                marginBottom: 3,
              }}
            >
              Login
            </Typography>

            <Stack spacing={2}>
              {successMessage && (
                <Alert
                  severity="success"
                  sx={{
                    mb: 2,
                    borderRadius: 1,
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="body2">
                    {successMessage}
                  </Typography>
                </Alert>
              )}

              {errors.general && (
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: 1,
                    alignItems: 'center'
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {errors.general}
                  </Typography>
                </Alert>
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
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#667eea',
                  },
                }}
              />

              <TextField
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                error={!!errors.password}
                helperText={errors.password}
                required
                disabled={isLoading}
                fullWidth
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1.5,
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#667eea',
                  },
                }}
              />

              <Stack spacing={2} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  size="large"
                  fullWidth
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '12px 24px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5568d3 0%, #653a8b 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                    '&.Mui-disabled': {
                      background: 'linear-gradient(135deg, #a0a0a0 0%, #808080 100%)',
                      color: 'rgba(255, 255, 255, 0.5)',
                    },
                  }}
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
                
                <Button
                  type="button"
                  size="large"
                  onClick={() => navigate('/register')}
                  fullWidth
                  disabled={isLoading}
                  sx={{
                    background: '#fff',
                    color: '#667eea',
                    border: '2px solid #667eea',
                    borderRadius: 1.5,
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '12px 24px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: '#f5f5ff',
                      borderColor: '#5568d3',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                    },
                    '&:active': {
                      transform: 'translateY(0)',
                    },
                    '&.Mui-disabled': {
                      background: '#f5f5f5',
                      color: '#a0a0a0',
                      borderColor: '#d0d0d0',
                    },
                  }}
                >
                  Register
                </Button>
              </Stack>

              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="caption">
                    API URL: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}
                  </Typography>
                </Alert>
              )}
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;