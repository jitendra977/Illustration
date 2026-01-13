import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    useTheme,
    alpha,
    IconButton,
    Button,
    Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { manufacturerAPI } from '../../api/illustrations'; // Assumed API export
import {
    Search,
    Factory,
    Car,
    Image as ImageIcon,
    ChevronRight,
    Menu,
    Filter,
    Activity,
    Globe
} from 'lucide-react';

// Utility for Zinc colors (simulating Tailwind Zinc palette)
const zinc = {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
};

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
                bgcolor: alpha(zinc[900], 0.4),
                border: `1px solid ${alpha('#fff', 0.05)}`,
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
                    borderColor: { md: alpha('#fff', 0.2) },
                    bgcolor: { md: alpha(zinc[900], 0.6) }
                }
            }}
        >
            {/* Visual Icon Box / Logo Placeholder */}
            <Box sx={{ flexShrink: 0 }}>
                <Box sx={{
                    width: { xs: 48, md: 56 },
                    height: { xs: 48, md: 56 },
                    borderRadius: 3, // rounded-xl
                    background: `linear-gradient(135deg, ${zinc[800]}, ${zinc[900]})`,
                    border: `1px solid ${alpha('#fff', 0.1)}`,
                    color: zinc[400],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    transition: 'color 0.2s',
                    '.MuiBox-root:hover &': { color: '#fff' }
                }}>
                    {manufacturer.name.charAt(0)}
                </Box>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.125rem' }, fontWeight: 700, color: '#fff', lineHeight: 1.2 }} noWrap>
                        {manufacturer.name}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Factory size={12} color={zinc[500]} />
                        <Typography sx={{ fontSize: '11px', color: zinc[400], fontWeight: 500 }}>
                            {manufacturer.engine_count || 0} エンジン
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Car size={12} color={zinc[500]} />
                        <Typography sx={{ fontSize: '11px', color: zinc[400], fontWeight: 500 }}>
                            {manufacturer.car_model_count || 0} 車種
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{
                display: 'flex', alignItems: 'center',
                color: zinc[600],
                transition: 'transform 0.2s',
                '.MuiBox-root:hover &': {
                    color: '#60a5fa',
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

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

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
    }, []);

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

    // Calculate total stats
    const totalStats = useMemo(() => {
        return manufacturers.reduce((acc, curr) => ({
            engines: acc.engines + (curr.engine_count || 0),
            illustrations: acc.illustrations + (curr.illustration_count || 0)
        }), { engines: 0, illustrations: 0 });
    }, [manufacturers]);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: zinc[950], color: zinc[100], fontFamily: 'Inter, sans-serif', pb: { xs: 12, md: 5 } }}>
            {/* Dynamic Header */}
            <Box component="nav" sx={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                transition: 'all 0.3s',
                px: { xs: 2, md: 3 },
                py: isScrolled ? 1.5 : 2,
                bgcolor: isScrolled ? alpha(zinc[950], 0.9) : 'transparent',
                backdropFilter: isScrolled ? 'blur(24px)' : 'none',
                borderBottom: isScrolled ? `1px solid ${alpha('#fff', 0.1)}` : 'none',
            }}>

            </Box>

            <Box component="main" sx={{ maxWidth: '1280px', mx: 'auto', px: { xs: 2, md: 3 }, pt: 1 }}>
                {/* Hero Section */}
                <Box component="header" sx={{ mb: { xs: 4, md: 6 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Badge sx={{ bgcolor: alpha('#fff', 0.1), color: '#fff', border: `1px solid ${alpha('#fff', 0.1)}` }}>グローバルDB</Badge>
                    </Box>
                    <Typography variant="h1" sx={{
                        fontSize: { xs: '2.5rem', md: '4rem' },
                        fontWeight: 900,
                        letterSpacing: '-0.025em',
                        color: '#fff',
                        mb: 2,
                        lineHeight: 1
                    }}>
                        メーカー
                    </Typography>
                    <Typography sx={{ color: zinc[400], maxWidth: '600px', fontSize: { xs: '1rem', md: '1.125rem' }, lineHeight: 1.6 }}>
                        世界クラスの自動車メーカーの認定設計図と仕様書。
                    </Typography>

                    {/* Quick Stats Pill */}
                    <Box sx={{
                        display: 'flex',
                        mt: 3,
                        p: 0.75,
                        bgcolor: alpha(zinc[900], 0.5),
                        border: `1px solid ${alpha('#fff', 0.05)}`,
                        borderRadius: 3,
                        width: { xs: '100%', sm: 'max-content' }
                    }}>
                        <Box sx={{ flex: 1, px: 2.5, py: 1, textAlign: 'center', borderRight: `1px solid ${alpha('#fff', 0.05)}` }}>
                            <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>
                                {manufacturers.length}
                            </Typography>
                            <Typography sx={{ fontSize: '9px', color: zinc[500], textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em', mt: 0.5 }}>
                                ブランド
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 1, px: 2.5, py: 1, textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>
                                {totalStats.engines}
                            </Typography>
                            <Typography sx={{ fontSize: '9px', color: zinc[500], textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em', mt: 0.5 }}>
                                エンジン
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Search & Results */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ position: 'relative', flex: 1, '&:focus-within svg': { color: '#3b82f6' } }}>
                        <Box sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: zinc[500], transition: 'color 0.2s', display: 'flex' }}>
                            <Search size={18} />
                        </Box>
                        <Box
                            component="input"
                            placeholder="メーカーを検索..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{
                                width: '100%',
                                bgcolor: alpha(zinc[900], 0.8),
                                border: `1px solid ${alpha('#fff', 0.05)}`,
                                borderRadius: 3,
                                py: 1.75,
                                pl: 6,
                                pr: 2,
                                color: '#fff',
                                outline: 'none',
                                transition: 'all 0.2s',
                                fontSize: '0.875rem',
                                '::placeholder': { color: zinc[600] },
                                '&:focus': {
                                    boxShadow: `0 0 0 2px ${alpha('#3b82f6', 0.2)}`,
                                    borderColor: alpha('#3b82f6', 0.5)
                                }
                            }}
                        />
                    </Box>

                    {loading ? (
                        <Box display="flex" justifyContent="center" py={8}>
                            <CircularProgress sx={{ color: zinc[600] }} />
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
            <Box component="footer" sx={{ display: { xs: 'none', md: 'block' }, maxWidth: '1280px', mx: 'auto', px: 3, mt: 10, pt: 5, borderTop: `1px solid ${alpha('#fff', 0.05)}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: zinc[600], fontSize: '0.75rem', fontWeight: 500 }}>
                    <Typography variant="caption">© 2024 エンジンイラストレーション本部</Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default ManufacturerList;
