import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    useTheme,
    alpha,
    Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Search, Car, Factory, ChevronRight } from 'lucide-react';
import Breadcrumbs from '../../../components/navigation/breadcrumbs/Breadcrumbs';
import { manufacturerAPI } from '../../../api/illustrations';
import { useAuth } from '../../../context/AuthContext';
import { ShieldAlert, Mail } from 'lucide-react';

// Utility for Zinc colors (simulating Tailwind Zinc palette)
// Zinc palette from theme

const Badge = ({ children, sx = {}, ...props }) => (
    <Box
        component="span"
        sx={{
            px: 1,
            py: 0.5,
            borderRadius: '9999px',
            fontSize: '10px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'inline-block',
            ...sx
        }}
        {...props}
    >
        {children}
    </Box>
);

const ManufacturerCard = ({ manufacturer, onClick }) => {
    const theme = useTheme();

    return (
        <Box
            onClick={() => onClick(manufacturer)}
            sx={{
                position: 'relative',
                bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 4, // rounded-2xl
                p: { xs: 2, md: 2.5 },
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                transition: 'all 0.2s',
                '&:active': { transform: 'scale(0.98)' },
                '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[800], 0.6) : alpha(theme.palette.zinc[100], 0.6)
                }
            }}
        >
            {/* Visual Icon Box / Logo Placeholder */}
            <Box sx={{ flexShrink: 0 }}>
                <Box sx={{
                    width: { xs: 48, md: 56 },
                    height: { xs: 48, md: 56 },
                    borderRadius: 3, // rounded-xl
                    background: theme.palette.mode === 'dark'
                        ? `linear-gradient(135deg, ${theme.palette.zinc[800]}, ${theme.palette.zinc[900]})`
                        : `linear-gradient(135deg, ${theme.palette.zinc[100]}, ${theme.palette.zinc[200]})`,
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
                    {manufacturer.name.charAt(0)}
                </Box>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.125rem' }, fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }} noWrap>
                        {manufacturer.name}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Factory size={12} color={theme.palette.text.disabled} />
                        <Typography sx={{ fontSize: '11px', color: theme.palette.text.secondary, fontWeight: 500 }}>
                            {manufacturer.engine_count || 0} エンジン
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Car size={12} color={theme.palette.text.disabled} />
                        <Typography sx={{ fontSize: '11px', color: theme.palette.text.secondary, fontWeight: 500 }}>
                            {manufacturer.car_model_count || 0} 車種
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Search size={12} color={theme.palette.text.disabled} />
                        <Typography sx={{ fontSize: '11px', color: theme.palette.text.secondary, fontWeight: 500 }}>
                            {manufacturer.illustration_count || 0} 図面
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{
                display: 'flex', alignItems: 'center',
                color: theme.palette.text.disabled,
                transition: 'transform 0.2s',
                '.MuiBox-root:hover &': {
                    color: theme.palette.primary.main,
                    transform: 'translateX(2px)'
                }
            }}>
                <ChevronRight size={20} />
            </Box>
        </Box>
    );
};

const ManufacturerList = () => {
    const [manufacturers, setManufacturers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);

    const navigate = useNavigate();
    const theme = useTheme();

    const breadcrumbs = [
        { label: 'ホーム', path: '/' },
        { label: 'メーカー選択' }
    ];

    const { user } = useAuth();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        if (!user?.is_verified) {
            setLoading(false);
            return () => window.removeEventListener('scroll', handleScroll);
        }

        const fetchManufacturers = async () => {
            try {
                setLoading(true);
                const data = await manufacturerAPI.getAll();
                const results = data.results || data;
                setManufacturers(results);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchManufacturers();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [user?.is_verified]);

    const filteredManufacturers = useMemo(() => {
        return manufacturers.filter(m =>
            m.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [manufacturers, searchTerm]);

    const handleManufacturerClick = (manufacturer) => {
        navigate(`/manufacturers/${manufacturer.id}/engines`, {
            state: { manufacturerName: manufacturer.name, manufacturerId: manufacturer.id }
        });
    };

    // Calculate total stats
    const totalStats = useMemo(() => {
        return manufacturers.reduce((acc, curr) => ({
            engines: acc.engines + (curr.engine_count || 0),
            illustrations: acc.illustrations + (curr.illustration_count || 0)
        }), { engines: 0, illustrations: 0 });
    }, [manufacturers]);

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
                        メーカー
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', maxWidth: '600px', fontSize: { xs: '1rem', md: '1.125rem' }, lineHeight: 1.6 }}>
                        世界クラスの自動車メーカーの認定設計図と仕様書。
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
                                {manufacturers.length}
                            </Typography>
                            <Typography sx={{ fontSize: '9px', color: 'text.secondary', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em', mt: 0.5 }}>
                                ブランド
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 1, px: 2.5, py: 1, textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.1 }}>
                                {totalStats.engines}
                            </Typography>
                            <Typography sx={{ fontSize: '9px', color: 'text.secondary', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em', mt: 0.5 }}>
                                エンジン
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
                            placeholder="メーカーを検索..."
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
                    ) : !user?.is_verified ? (
                        <Box sx={{
                            mt: 4,
                            p: 4,
                            textAlign: 'center',
                            bgcolor: 'background.paper',
                            borderRadius: 4,
                            border: `1px solid ${theme.palette.divider}`,
                        }}>
                            <Box sx={{
                                width: 64,
                                height: 64,
                                borderRadius: '20px',
                                bgcolor: alpha(theme.palette.warning.main, 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mx: 'auto',
                                mb: 2
                            }}>
                                <ShieldAlert size={32} color={theme.palette.warning.main} />
                            </Box>
                            <Typography variant="h6" fontWeight="800" gutterBottom>
                                認証が必要です
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                カタログライブラリにアクセスするには、メールアドレスの認証を行ってください。
                            </Typography>
                            <Box
                                component="button"
                                onClick={() => navigate('/profile')}
                                sx={{
                                    width: '100%',
                                    py: 1.5,
                                    borderRadius: 3,
                                    bgcolor: theme.palette.primary.main,
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 1,
                                    '&:active': { transform: 'scale(0.98)' }
                                }}
                            >
                                <Mail size={18} />
                                認証設定へ移動
                            </Box>
                        </Box>
                    ) : (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            {filteredManufacturers.map((manufacturer, index) => (
                                <Grid item xs={12} sm={6} md={4} key={manufacturer.id}>
                                    <ManufacturerCard
                                        manufacturer={manufacturer}
                                        onClick={handleManufacturerClick}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>
            </Box>

            {/* Footer */}
            <Box component="footer" sx={{ display: { xs: 'none', md: 'block' }, maxWidth: '1280px', mx: 'auto', px: 3, mt: 10, pt: 5, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500 }}>
                    <Typography variant="caption">© 2024 エンジンイラストレーション本部</Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default ManufacturerList;
