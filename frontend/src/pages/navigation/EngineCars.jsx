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
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { engineModelAPI, carModelAPI, manufacturerAPI } from '../../api/illustrations';
import {
    Search,
    Car,
    Image as ImageIcon,
    ChevronRight,
    ArrowLeft,
    Menu,
    Filter,
    Activity,
    Truck,
    Bus
} from 'lucide-react';

// Utility for Zinc colors
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
                bgcolor: alpha(zinc[900], 0.4),
                border: `1px solid ${alpha('#fff', 0.05)}`,
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
                    borderColor: alpha('#fff', 0.2)
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
                    background: `linear-gradient(135deg, ${zinc[800]}, ${zinc[900]})`,
                    border: `1px solid ${alpha('#fff', 0.1)}`,
                    color: zinc[400],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s',
                    '.MuiBox-root:hover &': { color: '#60a5fa' }
                }}>
                    {getVehicleIcon(car.vehicle_type)}
                </Box>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, color: '#fff', lineHeight: 1.2 }} noWrap>
                        {car.name}
                    </Typography>
                    <Badge sx={{ bgcolor: alpha(zinc[700], 0.3), color: zinc[300], ml: 1, transform: 'scale(0.85)', transformOrigin: 'right top' }}>
                        {getVehicleTypeLabel(car.vehicle_type)}
                    </Badge>
                </Box>

                <Typography variant="body2" sx={{ color: zinc[500], fontSize: '0.75rem', fontWeight: 500, mb: 1 }} noWrap>
                    {car.model_code ? `型式: ${car.model_code}` : '型式不明'}
                    {car.chassis_code ? ` • シャーシ: ${car.chassis_code}` : ''}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 0.75,
                        px: 1, py: 0.5,
                        borderRadius: 1.5,
                        bgcolor: alpha('#fff', 0.05),
                        border: `1px solid ${alpha('#fff', 0.05)}`
                    }}>
                        <ImageIcon size={14} color={zinc[500]} />
                        <Typography component="span" sx={{ fontSize: '11px', color: zinc[300], fontWeight: 600 }}>
                            {car.illustration_count || 0} <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, color: zinc[500], fontWeight: 400 }}>イラスト</Box>
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{
                display: 'flex', alignItems: 'center',
                opacity: 0.4,
                transition: 'all 0.2s',
                '.MuiBox-root:hover &': {
                    opacity: 1
                }
            }}>
                <ChevronRight size={18} color={zinc[400]} />
            </Box>
        </Box>
    );
};

const EngineCars = () => {
    const { engineId } = useParams();
    const location = useLocation();
    const [engine, setEngine] = useState(null);
    const [manufacturer, setManufacturer] = useState(null);
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        const fetchData = async () => {
            try {
                setLoading(true);
                const engineData = await engineModelAPI.getById(engineId);
                setEngine(engineData);

                // Recover manufacturer
                let mf = null;
                if (location.state?.manufacturerName) {
                    mf = {
                        id: location.state.manufacturerId,
                        name: location.state.manufacturerName
                    };
                } else if (engineData.manufacturer) {
                    if (typeof engineData.manufacturer === 'object') {
                        mf = engineData.manufacturer;
                    } else {
                        mf = await manufacturerAPI.getById(engineData.manufacturer);
                    }
                }
                setManufacturer(mf);

                const carsData = await carModelAPI.getAll({
                    manufacturer: mf?.id,
                    engine_model: engineId
                });

                const engineCars = carsData.results || carsData;
                setCars(engineCars);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (engineId) fetchData();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [engineId, location.state]);

    const filteredCars = useMemo(() => {
        return cars.filter(car =>
            car.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            car.model_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            car.chassis_code?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, cars]);

    const handleCarClick = (car) => {
        navigate(`/cars/${car.slug || car.id}/categories`, {
            state: {
                manufacturerId: manufacturer?.id,
                manufacturerName: manufacturer?.name,
                engineId: engineId,
                engineCode: engine?.engine_code || engine?.name,
                carId: car.id,
                carName: car.name
            }
        });
    };

    const handleBack = () => navigate(-1);

    // Sum total views for stats (just simple count for now)
    const totalViews = useMemo(() => {
        return cars.reduce((acc, curr) => acc + (curr.illustration_count || 0), 0);
    }, [cars]);


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
                <Box sx={{ maxWidth: '1280px', mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <IconButton onClick={handleBack} sx={{ color: zinc[400], '&:hover': { bgcolor: alpha('#fff', 0.05), color: '#fff' } }}>
                        <ArrowLeft size={20} />
                    </IconButton>

                    <Typography sx={{
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontWeight: 700,
                        fontSize: { xs: '1.125rem', md: '1.25rem' },
                        opacity: isScrolled ? 1 : 0,
                        transition: 'all 0.3s',
                        transform: isScrolled ? 'translate(-50%, 0)' : 'translate(-50%, -10px)',
                        pointerEvents: 'none'
                    }}>
                        {engine?.engine_code || engine?.name}
                    </Typography>


                </Box>
            </Box>

            <Box component="main" sx={{ maxWidth: '1280px', mx: 'auto', px: { xs: 1.5, md: 3 }, pt: 1 }}>
                {/* Hero Section */}
                <Box component="header" sx={{ mb: { xs: 4, md: 6 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Badge sx={{ bgcolor: alpha(zinc[700], 0.5), color: zinc[200] }}>パワーユニット</Badge>
                        <Typography sx={{ color: zinc[600], fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                            {manufacturer?.name}
                        </Typography>
                    </Box>
                    <Typography variant="h1" sx={{
                        fontSize: { xs: '3rem', md: '4.5rem' },
                        fontWeight: 900,
                        letterSpacing: '-0.025em',
                        color: '#fff',
                        mb: 2,
                        lineHeight: 1
                    }}>
                        {engine?.engine_code || <CircularProgress size={40} />}
                    </Typography>
                    <Typography sx={{ color: zinc[400], maxWidth: '600px', fontSize: { xs: '1rem', md: '1.125rem' }, lineHeight: 1.6 }}>
                        車種を選択して、特定の技術イラストを表示します。
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
                                {cars.length}
                            </Typography>
                            <Typography sx={{ fontSize: '9px', color: zinc[500], textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em', mt: 0.5 }}>
                                車種
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 1, px: 2.5, py: 1, textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>
                                {totalViews}
                            </Typography>
                            <Typography sx={{ fontSize: '9px', color: zinc[500], textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em', mt: 0.5 }}>
                                イラスト
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Search & Results */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, mb: 4 }}>
                    <Box sx={{ position: 'relative', flex: 1, '&:focus-within svg': { color: '#3b82f6' } }}>
                        <Box sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: zinc[500], transition: 'color 0.2s', display: 'flex' }}>
                            <Search size={18} />
                        </Box>
                        <Box
                            component="input"
                            placeholder="車種を検索..."
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
                    <Button
                        variant="text"
                        startIcon={<Filter size={16} />}
                        sx={{
                            bgcolor: alpha(zinc[800], 0.5),
                            color: zinc[300],
                            border: `1px solid ${alpha('#fff', 0.05)}`,
                            fontWeight: 700,
                            borderRadius: 3,
                            px: 3,
                            py: 1.75,
                            textTransform: 'none',
                            '&:hover': { bgcolor: zinc[800], color: '#fff' }
                        }}
                    >
                        フィルター
                    </Button>
                </Box>

                {/* Content Area */}
                {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12, gap: 2 }}>
                        <CircularProgress sx={{ color: '#3b82f6' }} />
                    </Box>
                ) : filteredCars.length > 0 ? (
                    <Grid container spacing={{ xs: 1, md: 2 }}>
                        {filteredCars.map((car, idx) => (
                            <Grid item xs={12} sm={6} key={car.id}>
                                <CarCard car={car} onClick={handleCarClick} />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Box sx={{
                        bgcolor: alpha(zinc[900], 0.2),
                        border: `1px dashed ${alpha('#fff', 0.1)}`,
                        borderRadius: 4,
                        py: 10,
                        textAlign: 'center'
                    }}>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                            「{searchTerm}」の検索結果はありません
                        </Typography>
                        <Typography variant="body2" sx={{ color: zinc[500] }}>
                            別の検索語句を試してください。
                        </Typography>
                    </Box>
                )}
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

export default EngineCars;
