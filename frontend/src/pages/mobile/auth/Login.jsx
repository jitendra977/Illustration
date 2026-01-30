// src/pages/mobile/auth/Login.js
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { validateLoginForm, hasFormErrors } from '../../../utils/validators';
// Note: Install jsQR with: npm install jsqr
// If jsQR is not available, you can use this alternative HTML5 Barcode Detection API
// which works in modern browsers without external libraries
import {
  Box,
  Paper,
  Typography,
  Stack,
  CircularProgress,
  Alert,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Tabs,
  Tab,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  EmailOutlined,
  PersonOutlined,
  Google,
  GitHub,
  Apple,
  LoginOutlined,
  QrCodeScanner,
  Close,
  CameraAlt,
  HelpOutline,
} from '@mui/icons-material';

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState('');
  const { login } = useAuth();
  const [loginType, setLoginType] = useState(0); // 0 for username, 1 for email, 2 for QR
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  // QR Scanner states
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanningRef = useRef(false);

  useEffect(() => {
    setMounted(true);
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    return () => {
      stopQRScanner();
    };
  }, []);

  const handleTabChange = (event, newValue) => {
    setLoginType(newValue);
    if (newValue === 0) {
      setForm({ ...form, email: '' });
    } else if (newValue === 1) {
      setForm({ ...form, username: '' });
    }
    setErrors({});
  };

  // QR Scanner Functions
  const startQRScanner = async () => {
    try {
      setErrors({});
      setShowScanner(true);
      setScanning(true);
      scanningRef.current = true;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        requestAnimationFrame(tick);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setErrors({
        general: 'カメラへのアクセスが拒否されました。設定を確認してください。'
      });
      stopQRScanner();
    }
  };

  const stopQRScanner = () => {
    scanningRef.current = false;
    setScanning(false);
    setShowScanner(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const tick = async () => {
    if (!scanningRef.current || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Try using BarcodeDetector API if available (modern browsers)
      if ('BarcodeDetector' in window) {
        try {
          const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });
          const barcodes = await barcodeDetector.detect(canvas);

          if (barcodes.length > 0) {
            handleQRCodeDetected(barcodes[0].rawValue);
            return;
          }
        } catch (err) {
          console.log('BarcodeDetector error:', err);
        }
      } else {
        // Fallback: Try using jsQR if installed
        try {
          // Dynamic import to avoid error if jsQR is not installed
          const jsQR = (await import('jsqr')).default;
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            handleQRCodeDetected(code.data);
            return;
          }
        } catch (err) {
          // jsQR not available - show error once
          if (!window.qrErrorShown) {
            window.qrErrorShown = true;
            console.warn('QR scanning requires jsQR library. Install with: npm install jsqr');
            setErrors({
              general: 'QRスキャン機能を使用するには jsqr ライブラリが必要です。管理者に連絡してください。'
            });
            stopQRScanner();
          }
          return;
        }
      }
    }

    requestAnimationFrame(tick);
  };

  const handleQRCodeDetected = (data) => {
    try {
      const credentials = JSON.parse(data);

      if ((credentials.email || credentials.username) && credentials.password) {
        stopQRScanner();
        setSuccessMessage('QRコードを読み取りました！自動ログイン中...');

        setTimeout(() => {
          handleAutoLogin(credentials);
        }, 1000);
      } else {
        setErrors({
          general: '無効なQRコードです。ログイン情報が含まれていません。'
        });
      }
    } catch (err) {
      setErrors({
        general: 'QRコードの読み取りに失敗しました。正しいフォーマットか確認してください。'
      });
    }
  };

  const handleAutoLogin = async (credentials) => {
    setIsLoading(true);
    try {
      const result = await login(credentials);

      if (result.success) {
        navigate('/how-to-use');
      } else {
        setErrors({
          general: getErrorMessage(result.error || result.originalError)
        });
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrors({ general: getErrorMessage(err) });
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorMessage = (error) => {
    if (typeof error === 'string') {
      return error;
    }

    if (error.type) {
      switch (error.type) {
        case 'OFFLINE_ERROR':
          return '📱 インターネット接続がオフラインです。接続を確認して再度お試しください。';
        case 'TIMEOUT_ERROR':
          return '⏰ 接続がタイムアウトしました。サーバーの応答が遅い可能性があります。再度お試しください。';
        case 'SERVER_UNREACHABLE':
          return '🔌 サーバーに接続できません。以下を確認してください：\n• サーバーが起動しているか\n• API URLが正しいか\n• ネットワーク接続';
        case 'CORS_ERROR':
          return '🛡️ CORSエラーが発生しました。管理者に連絡するか、サーバー設定を確認してください。';
        case 'ENDPOINT_NOT_FOUND':
          return '🔍 ログインエンドポイントが見つかりません。API URLが正しいか確認してください。';
        case 'SERVER_ERROR':
          return '🚨 サーバーエラーが発生しました。後ほど再度お試しいただくか、サポートにお問い合わせください。';
        case 'UNAUTHORIZED':
          return '❌ メールアドレス/ユーザー名またはパスワードが正しくありません。';
        case 'REQUEST_CONFIG_ERROR':
          return '⚙️ リクエスト設定エラーが発生しました。再度お試しください。';
        default:
          return error.details || '予期せぬエラーが発生しました。再度お試しください。';
      }
    }

    if (error.response) {
      if (error.response.status === 401) {
        return '❌ メールアドレス/ユーザー名またはパスワードが正しくありません。';
      } else if (error.response.status >= 500) {
        return `🚨 サーバーエラー（${error.response.status}）が発生しました。後ほど再度お試しください。`;
      } else {
        return error.response.data?.message || error.response.data?.detail || `エラー: ${error.response.status}`;
      }
    }

    if (error.message === 'Network Error') {
      if (!navigator.onLine) {
        return '📱 インターネット接続がオフラインです。接続を確認してください。';
      } else {
        return '🔌 サーバーに接続できません。サーバーがダウンしているか、URLが正しくありません。';
      }
    }

    return 'ログインに失敗しました。再度お試しください。';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const validationType = loginType === 0 ? 'username' : 'email';
    const validationErrors = validateLoginForm(form, validationType);

    if (hasFormErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    try {
      const credentials = {
        password: form.password
      };

      if (loginType === 0) {
        credentials.username = form.username;
      } else {
        credentials.email = form.email;
      }

      const result = await login(credentials);

      if (result.success) {
        navigate('/how-to-use');
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
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #0f172a, #1e1b4b, #312e81)',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
          top: '-250px',
          right: '-250px',
          animation: 'pulse 8s ease-in-out infinite',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.1) 0%, transparent 70%)',
          bottom: '-200px',
          left: '-200px',
          animation: 'pulse 10s ease-in-out infinite',
        },
        '@keyframes pulse': {
          '0%, 100%': { transform: 'scale(1)', opacity: 0.3 },
          '50%': { transform: 'scale(1.1)', opacity: 0.5 },
        },
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 480,
          maxHeight: '100vh',
          overflowY: 'auto',
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 3 },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Paper
          elevation={24}
          sx={{
            width: '100%',
            borderRadius: 4,
            overflow: 'hidden',
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(99, 102, 241, 0.1)',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
              borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
              p: { xs: 2, sm: 3 },
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: { xs: 56, sm: 64 },
                height: { xs: 56, sm: 64 },
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                mb: 2,
                boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
              }}
            >
              <LoginOutlined sx={{ fontSize: { xs: 28, sm: 32 }, color: 'white' }} />
            </Box>
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              sx={{
                fontWeight: 900,
                color: 'white',
                fontSize: 40,
                mb: 0.5,
                letterSpacing: '-0.5px',
              }}
            >
              ようこそ
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: 500,
              }}
            >
              楽天検索丸にログイン
            </Typography>
          </Box>

          {/* Form Content */}
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={2}>
                {successMessage && (
                  <Alert
                    severity="success"
                    sx={{
                      borderRadius: 2,
                      background: 'rgba(34, 197, 94, 0.1)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      color: '#86efac',
                      '& .MuiAlert-icon': { color: '#86efac' },
                    }}
                  >
                    {successMessage}
                  </Alert>
                )}

                {errors.general && (
                  <Alert
                    severity="error"
                    sx={{
                      borderRadius: 2,
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#fca5a5',
                      whiteSpace: 'pre-line',
                      '& .MuiAlert-icon': { color: '#fca5a5' },
                    }}
                  >
                    {errors.general}
                  </Alert>
                )}

                {/* Login Type Tabs */}
                <Tabs
                  value={loginType}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{
                    minHeight: 44,
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 2,
                    p: 0.5,
                    '& .MuiTabs-indicator': {
                      display: 'none',
                    },
                    '& .MuiTab-root': {
                      minHeight: 40,
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      fontWeight: 600,
                      textTransform: 'none',
                      borderRadius: 1.5,
                      transition: 'all 0.3s ease',
                      '&.Mui-selected': {
                        color: 'white',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                      },
                    },
                  }}
                >
                  <Tab icon={<PersonOutlined sx={{ fontSize: 18 }} />} iconPosition="start" label="ユーザー名" />
                  <Tab icon={<EmailOutlined sx={{ fontSize: 18 }} />} iconPosition="start" label="メール" />
                  <Tab icon={<QrCodeScanner sx={{ fontSize: 18 }} />} iconPosition="start" label="QR" />
                </Tabs>

                {/* Username/Email Login Forms */}
                {loginType !== 2 && (
                  <>
                    {/* Input Field */}
                    {loginType === 0 ? (
                      <TextField
                        type="text"
                        placeholder="ユーザー名"
                        value={form.username || ''}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                        error={!!errors.username}
                        helperText={errors.username}
                        required
                        disabled={isLoading}
                        fullWidth
                        autoComplete="username"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonOutlined sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 20 }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 2,
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            '& fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.1)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(99, 102, 241, 0.5)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#6366f1',
                              borderWidth: 2,
                            },
                          },
                          '& .MuiFormHelperText-root': {
                            color: '#fca5a5',
                            fontSize: '0.75rem',
                          },
                        }}
                      />
                    ) : (
                      <TextField
                        type="email"
                        placeholder="your.email@example.com"
                        value={form.email || ''}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        error={!!errors.email}
                        helperText={errors.email}
                        required
                        disabled={isLoading}
                        fullWidth
                        autoComplete="email"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailOutlined sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 20 }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            color: 'white',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderRadius: 2,
                            fontSize: { xs: '0.9rem', sm: '1rem' },
                            '& fieldset': {
                              borderColor: 'rgba(255, 255, 255, 0.1)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'rgba(99, 102, 241, 0.5)',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: '#6366f1',
                              borderWidth: 2,
                            },
                          },
                          '& .MuiFormHelperText-root': {
                            color: '#fca5a5',
                            fontSize: '0.75rem',
                          },
                        }}
                      />
                    )}

                    {/* Password Field */}
                    <TextField
                      type={showPassword ? 'text' : 'password'}
                      placeholder="パスワード"
                      value={form.password || ''}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      error={!!errors.password}
                      helperText={errors.password}
                      required
                      disabled={isLoading}
                      fullWidth
                      autoComplete="current-password"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlined sx={{ color: 'rgba(255, 255, 255, 0.4)', fontSize: 20 }} />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                              sx={{ color: 'rgba(255, 255, 255, 0.4)' }}
                            >
                              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          color: 'white',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: 2,
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          '& fieldset': {
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                          },
                          '&:hover fieldset': {
                            borderColor: 'rgba(99, 102, 241, 0.5)',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#6366f1',
                            borderWidth: 2,
                          },
                        },
                        '& .MuiFormHelperText-root': {
                          color: '#fca5a5',
                          fontSize: '0.75rem',
                        },
                      }}
                    />

                    {/* Forgot Password */}
                    <Box sx={{ textAlign: 'right' }}>
                      <Link
                        href="#"
                        underline="none"
                        sx={{
                          color: '#818cf8',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          '&:hover': { color: '#a5b4fc' },
                        }}
                      >
                        パスワードをお忘れですか？
                      </Link>
                    </Box>

                    {/* Login Button */}
                    <Button
                      type="submit"
                      fullWidth
                      disabled={isLoading}
                      sx={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: 'white',
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: { xs: '0.95rem', sm: '1rem' },
                        py: { xs: 1.5, sm: 1.75 },
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                          boxShadow: '0 12px 32px rgba(99, 102, 241, 0.4)',
                          transform: 'translateY(-2px)',
                        },
                        '&:active': {
                          transform: 'translateY(0)',
                        },
                        '&.Mui-disabled': {
                          background: 'rgba(255, 255, 255, 0.1)',
                          color: 'rgba(255, 255, 255, 0.4)',
                        },
                      }}
                    >
                      {isLoading ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CircularProgress size={20} sx={{ color: 'white' }} />
                          <span>ログイン中...</span>
                        </Box>
                      ) : (
                        'ログイン'
                      )}
                    </Button>

                    {/* Login Help Link */}
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Link
                        href="/login-help"
                        underline="none"
                        sx={{
                          color: '#818cf8',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.5,
                          '&:hover': { color: '#a5b4fc' },
                        }}
                      >
                        <HelpOutline sx={{ fontSize: 18 }} />
                        ログインできない方はこちら
                      </Link>
                    </Box>
                  </>
                )}

                {/* QR Code Scanner */}
                {loginType === 2 && (
                  <>
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 120,
                          height: 120,
                          borderRadius: '50%',
                          background: 'rgba(99, 102, 241, 0.1)',
                          border: '3px dashed rgba(99, 102, 241, 0.3)',
                          mb: 3,
                        }}
                      >
                        <QrCodeScanner sx={{ fontSize: 60, color: '#818cf8' }} />
                      </Box>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)', mb: 1 }}>
                        QRコードでログイン
                      </Typography>
                      <Typography sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.875rem' }}>
                        カメラでQRコードをスキャンしてください
                      </Typography>
                    </Box>

                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<CameraAlt />}
                      onClick={startQRScanner}
                      disabled={isLoading}
                      sx={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        color: 'white',
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: { xs: '0.95rem', sm: '1rem' },
                        py: { xs: 1.5, sm: 1.75 },
                        mb: 2,
                        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                          boxShadow: '0 12px 32px rgba(99, 102, 241, 0.4)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      カメラを起動
                    </Button>

                    {/* Test Mode Button */}
                    {process.env.NODE_ENV === 'development' && (
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => {
                          // Simulate QR code scan with test credentials
                          const testCredentials = {
                            email: 'test@example.com',
                            password: 'test123'
                          };
                          setSuccessMessage('テストQRコードを読み取りました！');
                          setTimeout(() => handleAutoLogin(testCredentials), 1000);
                        }}
                        sx={{
                          borderColor: 'rgba(99, 102, 241, 0.3)',
                          color: '#818cf8',
                          borderRadius: 2,
                          py: 1.5,
                          mb: 2,
                          textTransform: 'none',
                          '&:hover': {
                            borderColor: '#6366f1',
                            background: 'rgba(99, 102, 241, 0.1)',
                          },
                        }}
                      >
                        テストQRログイン
                      </Button>
                    )}

                    {/* QR Instructions */}
                    <Paper
                      sx={{
                        p: 3,
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 2,
                      }}
                    >
                      <Typography
                        sx={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          fontSize: '0.875rem',
                          mb: 2,
                          fontWeight: 600,
                        }}
                      >
                        QRコードの形式：
                      </Typography>
                      <Box
                        sx={{
                          p: 2,
                          background: 'rgba(0, 0, 0, 0.3)',
                          borderRadius: 1,
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          color: '#86efac',
                          overflowX: 'auto',
                        }}
                      >
                        {`{"email":"user@example.com","password":"pass123"}`}
                      </Box>
                    </Paper>
                  </>
                )}

                {/* Divider and Alternative Login Options */}
                <Box sx={{ position: 'relative', my: 2 }}>
                  <Box sx={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
                  <Typography
                    sx={{
                      position: 'relative',
                      textAlign: 'center',
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: '0.75rem',
                      background: 'rgba(15, 23, 42, 0.7)',
                      width: 'fit-content',
                      margin: '0 auto',
                      px: 2,
                    }}
                  >
                    または
                  </Typography>
                </Box>

                {/* QR Code Login Button - Available on all tabs */}
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<QrCodeScanner />}
                  onClick={startQRScanner}
                  disabled={isLoading}
                  sx={{
                    py: 1.5,
                    background: 'rgba(99, 102, 241, 0.05)',
                    border: '2px solid rgba(99, 102, 241, 0.3)',
                    color: '#818cf8',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'rgba(99, 102, 241, 0.15)',
                      borderColor: '#6366f1',
                      color: '#a5b4fc',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                    },
                  }}
                >
                  QRコードでログイン
                </Button>

                {/* Social Login (only for email/username login) */}
                {loginType !== 2 && (
                  <>
                    <Box sx={{ position: 'relative', my: 2 }}>
                      <Box sx={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
                      <Typography
                        sx={{
                          position: 'relative',
                          textAlign: 'center',
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontSize: '0.75rem',
                          background: 'rgba(15, 23, 42, 0.7)',
                          width: 'fit-content',
                          margin: '0 auto',
                          px: 2,
                        }}
                      >
                        ソーシャルログイン
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.5 }}>
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
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'rgba(255, 255, 255, 0.6)',
                            borderRadius: 2,
                            minWidth: 'unset',
                            transition: 'all 0.3s ease',
                            '& svg': {
                              fontSize: { xs: 20, sm: 22 },
                            },
                            '&:hover': {
                              background: 'rgba(255, 255, 255, 0.08)',
                              borderColor: 'rgba(99, 102, 241, 0.3)',
                              color: 'white',
                            },
                          }}
                        >
                          {provider.icon}
                        </Button>
                      ))}
                    </Box>
                  </>
                )}

                {/* Sign Up Link */}
                <Box sx={{ textAlign: 'center', pt: 2 }}>
                  <Typography sx={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.875rem' }}>
                    アカウントをお持ちでないですか？{' '}
                    <Link
                      component="button"
                      type="button"
                      onClick={() => navigate('/register')}
                      underline="none"
                      sx={{
                        color: '#818cf8',
                        fontWeight: 600,
                        '&:hover': { color: '#a5b4fc' },
                      }}
                    >
                      新規登録
                    </Link>
                  </Typography>
                </Box>

                {/* Dev Mode Info */}
                {process.env.NODE_ENV === 'development' && (
                  <Alert
                    severity="info"
                    sx={{
                      borderRadius: 2,
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      color: '#93c5fd',
                      fontSize: '0.7rem',
                      '& .MuiAlert-icon': { color: '#93c5fd' },
                    }}
                  >
                    開発モード - API: {import.meta.env.VITE_API_URL || '/api'}
                  </Alert>
                )}
              </Stack>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* QR Scanner Dialog */}
      <Dialog
        open={showScanner}
        onClose={stopQRScanner}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            color: 'white',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            pb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CameraAlt sx={{ color: '#818cf8' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              QRコードをスキャン
            </Typography>
          </Box>
          <IconButton
            onClick={stopQRScanner}
            sx={{
              color: 'rgba(255, 255, 255, 0.6)',
              '&:hover': { background: 'rgba(255, 255, 255, 0.1)' }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <Box sx={{ position: 'relative', width: '100%', height: 400, background: '#000' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {/* Scanning overlay */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 250,
                height: 250,
                border: '3px solid #6366f1',
                borderRadius: 2,
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                '&::before, &::after': {
                  content: '""',
                  position: 'absolute',
                  width: 20,
                  height: 20,
                  border: '3px solid #818cf8',
                },
                '&::before': {
                  top: -3,
                  left: -3,
                  borderRight: 'none',
                  borderBottom: 'none',
                },
                '&::after': {
                  bottom: -3,
                  right: -3,
                  borderLeft: 'none',
                  borderTop: 'none',
                },
              }}
            />

            {/* Scanning line animation */}
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 244,
                height: 2,
                background: 'linear-gradient(90deg, transparent, #818cf8, transparent)',
                animation: 'scan 2s ease-in-out infinite',
                '@keyframes scan': {
                  '0%, 100%': { transform: 'translate(-50%, -120px)' },
                  '50%': { transform: 'translate(-50%, 120px)' },
                },
              }}
            />

            {/* Hidden canvas for QR detection */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
          </Box>

          {/* Instructions */}
          <Box
            sx={{
              p: 3,
              background: 'rgba(99, 102, 241, 0.1)',
              borderTop: '1px solid rgba(99, 102, 241, 0.2)'
            }}
          >
            <Typography
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontSize: '0.875rem',
                textAlign: 'center'
              }}
            >
              QRコードをフレーム内に配置してください
            </Typography>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Login;