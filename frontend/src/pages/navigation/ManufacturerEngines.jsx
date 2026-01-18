import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Grid,
    Typography,
    CircularProgress,
    useTheme,
    alpha,
    IconButton,
    Button
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumbs from '../../components/navigation/Breadcrumbs';
import { manufacturerAPI, engineModelAPI } from '../../api/illustrations';
import {
    Search,
    Settings,
    Car,
    Image as ImageIcon,
    ChevronRight,
    ArrowLeft,
    Menu,
    Filter,
    Activity
} from 'lucide-react';

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

const EngineCard = ({ engine, onClick }) => {
    const theme = useTheme();

    const getFuelStyles = (type) => {
        switch (type) {
            case 'petrol': // ガソリン
                return { bgcolor: alpha('#3b82f6', 0.1), color: '#60a5fa', border: `1px solid ${alpha('#3b82f6', 0.2)}` };
            case 'hybrid': // ハイブリッド
                return { bgcolor: alpha('#10b981', 0.1), color: '#34d399', border: `1px solid ${alpha('#10b981', 0.2)}` };
            case 'diesel': // ディーゼル
                return { bgcolor: alpha('#f59e0b', 0.1), color: '#fbbf24', border: `1px solid ${alpha('#f59e0b', 0.2)}` };
            default:
                return {
                    bgcolor: theme.palette.mode === 'dark' ? alpha('#6b7280', 0.1) : alpha('#6b7280', 0.05),
                    color: theme.palette.mode === 'dark' ? '#9ca3af' : '#4b5563',
                    border: `1px solid ${alpha('#6b7280', 0.2)}`
                };
        }
    };

    const getFuelLabel = (type) => {
        const labels = {
            'diesel': 'ディーゼル',
            'petrol': 'ガソリン',
            'hybrid': 'ハイブリッド',
            'electric': '電気',
            'lpg': 'LPG'
        };
        return labels[type] || type;
    };

    return (
        <Box
            onClick={() => onClick(engine)}
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
                <Settings size={120} strokeWidth={1} />
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
                    <Settings size={18} />
                </Box>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                    <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }} noWrap>
                        {engine.engine_code || engine.name}
                    </Typography>
                    <Badge sx={{ ...getFuelStyles(engine.fuel_type), ml: 1, transform: 'scale(0.85)', transformOrigin: 'right top' }}>
                        {getFuelLabel(engine.fuel_type)}
                    </Badge>
                </Box>

                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500, mb: 1 }} noWrap>
                    {engine.name !== engine.engine_code ? engine.name : (engine.specs || 'N/A')}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 0.75,
                        px: { md: 1.5 }, py: { md: 1 },
                        borderRadius: { md: 2 },
                        bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[800], 0.4) : alpha(theme.palette.zinc[100], 0.5),
                        border: `1px solid ${theme.palette.divider}`
                    }}>
                        <Car size={14} color={theme.palette.text.disabled} />
                        <Typography component="span" sx={{ fontSize: '11px', color: 'text.secondary', fontWeight: 600 }}>
                            {engine.car_model_count} <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, color: 'text.disabled', fontWeight: 400 }}>車種</Box>
                        </Typography>
                    </Box>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 0.75,
                        px: { md: 1.5 }, py: { md: 1 },
                        borderRadius: { md: 2 },
                        bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[800], 0.4) : alpha(theme.palette.zinc[100], 0.5),
                        border: `1px solid ${theme.palette.divider}`
                    }}>
                        <ImageIcon size={14} color={theme.palette.text.disabled} />
                        <Typography component="span" sx={{ fontSize: '11px', color: 'text.secondary', fontWeight: 600 }}>
                            {engine.illustration_count || 0} <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, color: 'text.disabled', fontWeight: 400 }}>イラスト</Box>
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

const ManufacturerEngines = () => {
    const { manufacturerId } = useParams();
    const [manufacturer, setManufacturer] = useState(null);
    const [engines, setEngines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);

    const navigate = useNavigate();
    const theme = useTheme();

    const breadcrumbs = [
        { label: 'ホーム', path: '/' },
        { label: 'メーカー選択', path: '/manufacturers' },
        { label: manufacturer?.name || 'メーカー' }
    ];

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        const fetchData = async () => {
            try {
                setLoading(true);
                const [mfData, enginesData] = await Promise.all([
                    manufacturerAPI.getById(manufacturerId),
                    engineModelAPI.getByManufacturer(manufacturerId)
                ]);
                setManufacturer(mfData);
                const results = enginesData.results || enginesData;
                setEngines(results);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (manufacturerId) fetchData();

        return () => window.removeEventListener('scroll', handleScroll);
    }, [manufacturerId]);

    const filteredEngines = useMemo(() => {
        return engines.filter(engine =>
            engine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            engine.engine_code?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, engines]);

    const handleEngineClick = (engine) => {
        navigate(`/engines/${engine.id}/cars`, {
            state: {
                manufacturerId,
                manufacturerName: manufacturer?.name,
                engineId: engine.id,
                engineCode: engine.engine_code || engine.name
            }
        });
    };

    const handleBack = () => navigate(-1);

    // Sum total views for stats
    const totalViews = useMemo(() => {
        return engines.reduce((acc, curr) => acc + (curr.illustration_count || 0), 0);
    }, [engines]);

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

            <Box component="main" sx={{ maxWidth: '1280px', mx: 'auto', px: { xs: 1.5, md: 3 }, pt: 1 }}>
                {/* Mobile-Optimized Hero */}
                <Box component="header" sx={{ mb: { xs: 4, md: 6 } }}>
                    <Typography variant="h1" sx={{
                        fontSize: { xs: '3rem', md: '4.5rem' },
                        fontWeight: 900,
                        color: 'text.primary',
                        mb: 2,
                        lineHeight: 1
                    }}>
                        {manufacturer?.name || <CircularProgress size={40} />}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', maxWidth: '600px', fontSize: { xs: '1rem', md: '1.125rem' }, lineHeight: 1.6 }}>
                        技術設計図データベースと高精度パワーユニットイラスト。
                    </Typography>

                    {/* Quick Stats Pill (Mobile Centered) */}
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
                                {engines.length}
                            </Typography>
                            <Typography sx={{ fontSize: '9px', color: 'text.secondary', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em', mt: 0.5 }}>
                                エンジン
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 1, px: 2.5, py: 1, textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: 'text.primary', lineHeight: 1.1 }}>
                                {totalViews}
                            </Typography>
                            <Typography sx={{ fontSize: '9px', color: 'text.secondary', textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em', mt: 0.5 }}>
                                イラスト
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Action Bar */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, mb: 4 }}>
                    <Box sx={{ position: 'relative', flex: 1, '&:focus-within svg': { color: 'primary.main' } }}>
                        <Box sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'text.disabled', transition: 'color 0.2s', display: 'flex' }}>
                            <Search size={18} />
                        </Box>
                        <Box
                            component="input"
                            placeholder="エンジンコードを検索..."
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
                    <Button
                        variant="text"
                        startIcon={<Filter size={16} />}
                        sx={{
                            bgcolor: alpha(theme.palette.zinc[800], 0.5),
                            color: theme.palette.zinc[300],
                            border: `1px solid ${alpha('#fff', 0.05)}`,
                            fontWeight: 700,
                            borderRadius: 3,
                            px: 3,
                            py: 1.75,
                            textTransform: 'none',
                            '&:hover': { bgcolor: theme.palette.zinc[800], color: '#fff' }
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
                ) : filteredEngines.length > 0 ? (
                    <Grid container spacing={{ xs: 1, md: 2 }}>
                        {filteredEngines.map((engine, idx) => (
                            <Grid item xs={12} sm={6} key={engine.id}>
                                <EngineCard engine={engine} onClick={handleEngineClick} />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        py: 10,
                        bgcolor: alpha(theme.palette.zinc[900], 0.2),
                        border: `1px dashed ${alpha(theme.palette.text.primary, 0.1)}`,
                        borderRadius: 4,
                        textAlign: 'center'
                    }}>
                        <Box sx={{
                            bgcolor: alpha(theme.palette.zinc[900], 0.2),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 4,
                            mx: 'auto',
                            border: `1px solid ${theme.palette.divider}`,
                        }}>
                            <ImageIcon size={48} color={theme.palette.zinc[600]} />
                        </Box>
                        <Typography variant="h5" fontWeight="800" gutterBottom>
                            おっと！エンジンが見つかりません
                        </Typography>
                        <Typography variant="body2" sx={{ color: theme.palette.zinc[500] }}>
                            2JZやB58などの一般的なコードを試してください。
                        </Typography>
                    </Box>
                )}
            </Box>



            {/* Footer */}
            <Box component="footer" sx={{ display: { xs: 'none', md: 'block' }, maxWidth: '1280px', mx: 'auto', px: 3, mt: 10, pt: 5, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500 }}>
                    <Typography variant="caption">© 2024 エンジンイラストレーション本部</Typography>
                    <Box sx={{ display: 'flex', gap: 3, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                        <Box component="a" href="#" sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: '#fff' } }}>Privacy</Box>
                        <Box component="a" href="#" sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: '#fff' } }}>Terms</Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default ManufacturerEngines;
