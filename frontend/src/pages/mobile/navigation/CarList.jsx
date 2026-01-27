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
import { Search, Car, Image as ImageIcon, ChevronRight, Factory, Settings, Truck, Bus } from 'lucide-react';
import Breadcrumbs from '../../../components/navigation/breadcrumbs/Breadcrumbs';
import { carModelAPI } from '../../../api/illustrations';
import { useAuth } from '../../../context/AuthContext';
import { ShieldAlert, Mail } from 'lucide-react';

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

const CarCard = ({ car, onClick }) => {
    const theme = useTheme();

    const getVehicleIcon = (type) => {
        if (type?.includes('bus')) return <Bus size={20} />;
        if (type?.includes('truck')) return <Truck size={20} />;
        return <Car size={20} />;
    };

    const getVehicleTypeLabel = (type) => {
        const labels = {
            'truck_2t': '2tトラック',
            'truck_3t': '3tトラック',
            'truck_4t': '4tトラック',
            'truck_10t': '10tトラック',
            'truck_light_duty': '小型トラック',
            'truck_medium_duty': '中型トラック',
            'truck_heavy_duty': '大型トラック',
            'bus': 'バス',
            'bus_city': '路線バス',
            'bus_highway': '高速バス'
        };
        return labels[type] || '乗用車';
    };

    return (
        <Box
            onClick={() => onClick(car)}
            sx={{
                position: 'relative',
                bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 3,
                p: 1.5,
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'row',
                gap: 1.5,
                transition: 'all 0.2s',
                '&:active': { transform: 'scale(0.98)' },
                '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[800], 0.6) : alpha(theme.palette.zinc[50], 0.5)
                }
            }}
        >
            {/* Background Decor (Desktop Only) */}
            <Box sx={{
                position: 'absolute',
                right: -16,
                top: -16,
                opacity: 0.03,
                display: { xs: 'none', md: 'block' },
                transition: 'opacity 0.2s',
                '.MuiBox-root:hover &': { opacity: 0.07 }
            }}>
                <Car size={120} strokeWidth={1} />
            </Box>

            <Box sx={{ flexShrink: 0 }}>
                <Box sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: theme.palette.mode === 'dark'
                        ? `linear-gradient(135deg, ${theme.palette.zinc[800]}, ${theme.palette.zinc[900]})`
                        : `linear-gradient(135deg, ${theme.palette.zinc[100]}, ${theme.palette.zinc[200]})`,
                    border: `1px solid ${theme.palette.divider}`,
                    color: theme.palette.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s',
                    '.MuiBox-root:hover &': { color: theme.palette.primary.main }
                }}>
                    {getVehicleIcon(car.vehicle_type)}
                </Box>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }} noWrap>
                        {car.name}
                    </Typography>
                    <Badge sx={{ bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[700], 0.3) : alpha(theme.palette.zinc[200], 0.5), color: 'text.secondary', ml: 1, transform: 'scale(0.85)', transformOrigin: 'right top' }}>
                        {getVehicleTypeLabel(car.vehicle_type)}
                    </Badge>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Factory size={12} color={theme.palette.text.disabled} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500 }} noWrap>
                        {car.manufacturer_name || 'N/A'}
                    </Typography>
                    {car.engine_code && (
                        <>
                            <Box sx={{ width: 2, height: 2, borderRadius: '50%', bgcolor: 'text.disabled' }} />
                            <Settings size={12} color={theme.palette.text.disabled} />
                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500 }} noWrap>
                                {car.engine_code}
                            </Typography>
                        </>
                    )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 0.75,
                        px: 1, py: 0.5,
                        borderRadius: 1.5,
                        bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[800], 0.4) : alpha(theme.palette.zinc[100], 0.5),
                        border: `1px solid ${theme.palette.divider}`
                    }}>
                        <ImageIcon size={12} color={theme.palette.text.disabled} />
                        <Typography component="span" sx={{ fontSize: '11px', color: 'text.secondary', fontWeight: 600 }}>
                            {car.illustration_count || 0} <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, color: 'text.disabled', fontWeight: 400 }}>イラスト</Box>
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{
                display: 'flex', alignItems: 'center',
                opacity: 0.4,
                transition: 'all 0.2s',
                '.MuiBox-root:hover &': {
                    opacity: 1,
                    color: theme.palette.primary.main
                }
            }}>
                <ChevronRight size={18} color={theme.palette.text.disabled} />
            </Box>
        </Box>
    );
};

const CarList = () => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);

    const navigate = useNavigate();
    const theme = useTheme();

    const breadcrumbs = [
        { label: 'ホーム', path: '/' },
        { label: '車種選択' }
    ];

    const { user } = useAuth();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        if (!user?.is_verified) {
            setLoading(false);
            return () => window.removeEventListener('scroll', handleScroll);
        }

        const fetchCars = async () => {
            try {
                setLoading(true);
                const data = await carModelAPI.getAll();
                const results = data.results || data;
                setCars(results);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCars();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [user?.is_verified]);

    const filteredCars = useMemo(() => {
        return cars.filter(c =>
            c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.model_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.chassis_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.manufacturer_name?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [cars, searchTerm]);

    const handleCarClick = (car) => {
        // Navigate directly to car categories
        navigate(`/cars/${car.slug || car.id}/categories`, {
            state: {
                manufacturerId: car.manufacturer,
                manufacturerName: car.manufacturer_name,
                engineId: car.engine_model,
                engineCode: car.engine_code,
                carId: car.id,
                carName: car.name
            }
        });
    };

    // Calculate total stats
    const totalStats = useMemo(() => {
        return cars.reduce((acc, curr) => ({
            illustrations: acc.illustrations + (curr.illustration_count || 0)
        }), { illustrations: 0 });
    }, [cars]);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary', fontFamily: 'Inter, sans-serif', pb: { xs: 12, md: 5 } }}>
            {/* Dynamic Header */}
            <Box component="nav" sx={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                transition: 'all 0.3s',
                px: { xs: 2, md: 3 },
                py: isScrolled ? 1.5 : 2,
                bgcolor: isScrolled ? alpha(theme.palette.background.default, 0.9) : 'transparent',
                backdropFilter: isScrolled ? 'blur(24px)' : 'none',
                borderBottom: isScrolled ? `1px solid ${theme.palette.divider}` : 'none',
            }}>
                <Box sx={{ maxWidth: '1280px', mx: 'auto' }}>
                    <Breadcrumbs items={breadcrumbs} scrollable={true} />
                </Box>
            </Box>

            <Box component="main" sx={{ maxWidth: '1280px', mx: 'auto', px: { xs: 2, md: 3 }, pt: 1 }}>
                {/* Hero Section */}
                <Box component="header" sx={{ mb: { xs: 4, md: 6 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Badge sx={{ bgcolor: alpha('#fff', 0.1), color: '#fff', border: `1px solid ${alpha('#fff', 0.1)}` }}>車両データベース</Badge>
                    </Box>
                    <Typography variant="h1" sx={{
                        fontSize: { xs: '2.5rem', md: '4rem' },
                        fontWeight: 900,
                        letterSpacing: '-0.025em',
                        color: 'text.primary',
                        mb: 2,
                        lineHeight: 1
                    }}>
                        車種
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', maxWidth: '600px', fontSize: { xs: '1rem', md: '1.125rem' }, lineHeight: 1.6 }}>
                        全メーカーの車種モデルから検索できます。
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
                                {cars.length}
                            </Typography>
                            <Typography sx={{ fontSize: '9px', color: 'text.secondary', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em', mt: 0.5 }}>
                                車種
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 1, px: 2.5, py: 1, textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.1 }}>
                                {totalStats.illustrations}
                            </Typography>
                            <Typography sx={{ fontSize: '9px', color: 'text.secondary', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em', mt: 0.5 }}>
                                イラスト
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
                            placeholder="車種を検索..."
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
                            {filteredCars.map((car) => (
                                <Grid item xs={12} sm={6} md={4} key={car.id}>
                                    <CarCard
                                        car={car}
                                        onClick={handleCarClick}
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

export default CarList;
