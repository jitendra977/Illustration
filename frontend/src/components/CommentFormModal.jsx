import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Rating,
    Box,
    Typography,
    Alert,
    IconButton,
    Stack,
    Fade,
    CircularProgress
} from '@mui/material';
import { Close as CloseIcon, Star as StarIcon } from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import api from '../services/index';

const CommentFormModal = ({ open, onClose }) => {
    const theme = useTheme();
    const [formData, setFormData] = useState({
        department_name: '',
        comment: '',
        star: 5
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (field) => (event) => {
        setFormData({ ...formData, [field]: event.target.value });
    };

    const handleStarChange = (event, newValue) => {
        setFormData({ ...formData, star: newValue });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await api.post('/auth/comments/', formData);
            setSuccess(true);

            // Auto-close after 2 seconds
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err) {
            console.error('Comment submission error:', err);
            setError(err.response?.data?.detail || 'コメントの送信に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ department_name: '', comment: '', star: 5 });
        setSuccess(false);
        setError('');
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    background: theme.palette.mode === 'dark'
                        ? `linear-gradient(135deg, ${theme.palette.zinc[900]} 0%, ${theme.palette.zinc[950]} 100%)`
                        : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                }
            }}
        >
            <DialogTitle sx={{
                pb: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Typography variant="h6" fontWeight={700}>
                    フィードバック
                </Typography>
                <IconButton onClick={handleClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent>
                    {success ? (
                        <Fade in={success}>
                            <Box sx={{ py: 4, textAlign: 'center' }}>
                                <Box
                                    sx={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: '50%',
                                        bgcolor: alpha(theme.palette.success.main, 0.1),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 16px',
                                        animation: 'pulse 1.5s ease-in-out infinite'
                                    }}
                                >
                                    <Typography variant="h2">✓</Typography>
                                </Box>
                                <Typography variant="h5" fontWeight={700} color="success.main" gutterBottom>
                                    ありがとうございます！
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    フィードバックを受け付けました
                                </Typography>
                            </Box>
                        </Fade>
                    ) : (
                        <Stack spacing={3}>
                            {error && (
                                <Alert severity="error" onClose={() => setError('')}>
                                    {error}
                                </Alert>
                            )}

                            <TextField
                                label="部所名"
                                fullWidth
                                required
                                value={formData.department_name}
                                onChange={handleChange('department_name')}
                                disabled={loading}
                                placeholder="例: YAW　新東京工場"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2
                                    }
                                }}
                            />

                            <TextField
                                label="コメント"
                                fullWidth
                                required
                                multiline
                                rows={4}
                                value={formData.comment}
                                onChange={handleChange('comment')}
                                disabled={loading}
                                placeholder="例: イラストのプレビュー機能について、ズームができるようになると嬉しいです。"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 2
                                    }
                                }}
                            />

                            <Box>
                                <Typography variant="body2" fontWeight={600} gutterBottom>
                                    評価
                                </Typography>
                                <Rating
                                    name="star-rating"
                                    value={formData.star}
                                    onChange={handleStarChange}
                                    size="large"
                                    disabled={loading}
                                    icon={<StarIcon fontSize="inherit" />}
                                    emptyIcon={<StarIcon fontSize="inherit" />}
                                    sx={{
                                        '& .MuiRating-iconFilled': {
                                            color: theme.palette.warning.main
                                        },
                                        '& .MuiRating-iconHover': {
                                            color: theme.palette.warning.dark
                                        }
                                    }}
                                />
                            </Box>
                        </Stack>
                    )}
                </DialogContent>

                {!success && (
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            onClick={handleClose}
                            disabled={loading}
                            sx={{ borderRadius: 2 }}
                        >
                            キャンセル
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{
                                borderRadius: 2,
                                px: 3,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                '&:hover': {
                                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                }
                            }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : '送信'}
                        </Button>
                    </DialogActions>
                )}
            </form>

            <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
      `}</style>
        </Dialog>
    );
};

export default CommentFormModal;
