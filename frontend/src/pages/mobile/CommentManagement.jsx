import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    useTheme,
    alpha,
    Grid,
    Rating,
    IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Search, MessageCircle, Trash2, Calendar, Star } from 'lucide-react';
import Breadcrumbs from '../../components/navigation/Breadcrumbs';
import api from '../../services/index';

const CommentCard = ({ comment, onDelete }) => {
    const theme = useTheme();

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    return (
        <Box
            sx={{
                position: 'relative',
                bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 4, // rounded-2xl
                p: { xs: 2, md: 2.5 },
                height: '100%',
                display: 'flex',
                gap: 2, // Spacing between Icon, Content, Action
                transition: 'all 0.2s',
                '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc?.[800] || '#27272a', 0.6) : alpha(theme.palette.zinc?.[100] || '#f4f4f5', 0.6),
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4]
                }
            }}
        >
            {/* Visual Icon Box / Avatar */}
            <Box sx={{ flexShrink: 0 }}>
                <Box sx={{
                    width: { xs: 48, md: 56 },
                    height: { xs: 48, md: 56 },
                    borderRadius: 3, // rounded-xl
                    background: theme.palette.mode === 'dark'
                        ? `linear-gradient(135deg, ${theme.palette.zinc?.[800] || '#27272a'}, ${theme.palette.zinc?.[900] || '#18181b'})`
                        : `linear-gradient(135deg, ${theme.palette.zinc?.[100] || '#f4f4f5'}, ${theme.palette.zinc?.[200] || '#e4e4e7'})`,
                    border: `1px solid ${theme.palette.divider}`,
                    color: theme.palette.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    transition: 'color 0.2s',
                    '.MuiBox-root:hover &': { color: theme.palette.primary.main }
                }}>
                    {comment.department_name.charAt(0)}
                </Box>
            </Box>

            {/* Middle Content Column */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.125rem' }, fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}>
                        {comment.department_name}
                    </Typography>
                    <Rating value={comment.star} readOnly size="small" sx={{ fontSize: '1rem' }} />
                </Box>

                <Typography
                    sx={{
                        fontSize: '0.875rem',
                        color: 'text.secondary',
                        lineHeight: 1.6,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        mb: 1
                    }}
                >
                    {comment.comment}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Calendar size={12} color={theme.palette.text.disabled} />
                        <Typography sx={{ fontSize: '11px', color: theme.palette.text.secondary, fontWeight: 500 }}>
                            {formatDate(comment.date)}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ fontSize: '11px', color: theme.palette.text.secondary, fontWeight: 500 }}>
                            {comment.user_name || 'ゲスト'}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Right Action: Delete Button */}
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(comment.id);
                    }}
                    sx={{
                        color: theme.palette.error.main,
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) }
                    }}
                >
                    <Trash2 size={18} />
                </IconButton>
            </Box>
        </Box>
    );
};

const CommentManagement = () => {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);

    const theme = useTheme();

    const breadcrumbs = [
        { label: 'ホーム', path: '/' },
        { label: 'フィードバック管理' }
    ];

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        fetchComments();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const fetchComments = async () => {
        try {
            setLoading(true);
            const response = await api.get('/auth/comments/');
            let data = [];
            if (Array.isArray(response.data)) {
                data = response.data;
            } else if (response.data && Array.isArray(response.data.results)) {
                data = response.data.results;
            }
            setComments(data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('このコメントを削除してもよろしいですか？')) {
            try {
                await api.delete(`/auth/comments/${id}/`);
                setComments(comments.filter(c => c.id !== id));
            } catch (error) {
                console.error('Error deleting comment:', error);
            }
        }
    };

    const filteredComments = useMemo(() => {
        return comments.filter(c =>
            c.department_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.user_name && c.user_name.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [comments, searchTerm]);

    // Calculate stats
    const stats = useMemo(() => {
        const total = comments.length;
        const avgRating = total > 0
            ? (comments.reduce((acc, curr) => acc + curr.star, 0) / total).toFixed(1)
            : '0.0';
        return { total, avgRating };
    }, [comments]);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', fontFamily: 'Inter, sans-serif', pb: { xs: 12, md: 1 } }}>
            {/* Dynamic Header */}
            <Box component="nav" sx={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                transition: 'all 0.3s',
                px: { xs: 2, md: 1 },
                py: isScrolled ? 1.5 : 2,
                bgcolor: isScrolled ? alpha(theme.palette.background.default, 0.9) : 'transparent',
                backdropFilter: isScrolled ? 'blur(24px)' : 'none',
                borderBottom: isScrolled ? `1px solid ${theme.palette.divider}` : 'none',
            }}>
                <Box sx={{ maxWidth: '1280px', mx: 'auto' }}>
                    <Breadcrumbs items={breadcrumbs} scrollable={true} />
                </Box>
            </Box>

            <Box component="main" sx={{ maxWidth: '1280px', mx: 'auto', px: { xs: 2, md: 1 }, pt: 1 }}>
                {/* Hero Section */}
                <Box component="header" sx={{ mb: { xs: 4, md: 2 } }}>

                    <Typography variant="h1" sx={{
                        fontSize: { xs: '2.5rem', md: '2rem' },
                        fontWeight: 700,
                        color: 'text.primary',
                        lineHeight: 1
                    }}>
                        フィードバック
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', maxWidth: '600px', fontSize: { xs: '1rem', md: '1.125rem' }, lineHeight: 1.6 }}>
                        ユーザーからの評価とコメントを確認・管理できます。
                    </Typography>
                    {/* Quick Stats Pill */}
                    <Box sx={{
                        display: 'flex',
                        mt: 3,
                        p: 0.75,
                        bgcolor: 'background.paper',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 3,
                        width: { xs: '100%', sm: 'max-content' }
                    }}>
                        <Box sx={{ flex: 1, px: 2.5, py: 1, textAlign: 'center', borderRight: `1px solid ${theme.palette.divider}` }}>
                            <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.1 }}>
                                {stats.total}
                            </Typography>
                            <Typography sx={{ fontSize: '9px', color: 'text.secondary', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em', mt: 0.5 }}>
                                コメント数
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 1, px: 2.5, py: 1, textAlign: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.1 }}>
                                    {stats.avgRating}
                                </Typography>
                                <Star size={16} fill={theme.palette.warning.main} color={theme.palette.warning.main} />
                            </Box>
                            <Typography sx={{ fontSize: '9px', color: 'text.secondary', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em', mt: 0.5 }}>
                                平均評価
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Search & Results */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ position: 'relative', flex: 1, '&:focus-within svg': { color: 'primary.main' } }}>
                        <Box sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'text.disabled', transition: 'color 0.2s', display: 'flex' }}>
                            <Search size={18} />
                        </Box>
                        <Box
                            component="input"
                            placeholder="コメントを検索..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{
                                width: '100%',
                                bgcolor: 'background.paper',
                                border: `1px solid ${theme.palette.divider}`,
                                borderRadius: 3,
                                py: 1.75,
                                pl: 6,
                                pr: 2,
                                color: 'text.primary',
                                outline: 'none',
                                transition: 'all 0.2s',
                                fontSize: '0.875rem',
                                '::placeholder': { color: 'text.disabled' },
                                '&:focus': {
                                    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                                    borderColor: 'primary.main'
                                }
                            }}
                        />
                    </Box>

                    {loading ? (
                        <Box display="flex" justifyContent="center" py={8}>
                            <CircularProgress sx={{ color: 'primary.main' }} />
                        </Box>
                    ) : (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            {filteredComments.map((comment) => (
                                <Grid item xs={12} sm={6} md={4} key={comment.id}>
                                    <CommentCard
                                        comment={comment}
                                        onDelete={handleDelete}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default CommentManagement;
