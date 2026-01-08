import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Grid,
    Typography,
    Skeleton,
    useTheme,
    useMediaQuery,
    Divider
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { carModelAPI, partCategoryAPI } from '../../api/illustrations';
import CategoryIcon from '@mui/icons-material/Category';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import GlassCard from '../../components/common/GlassCard';
import PageHeader from '../../components/layout/PageHeader';

const CarCategories = () => {
    const { carSlug } = useParams();
    const location = useLocation();

    const [car, setCar] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [contextData, setContextData] = useState({
        manufacturer: null,
        engine: null
    });

    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                let carData;
                if (isNaN(carSlug)) {
                    carData = await carModelAPI.getBySlug(carSlug);
                } else {
                    const allCars = await carModelAPI.getAll();
                    const results = allCars.results || allCars;
                    carData = results.find(c => c.id == carSlug);
                }
                setCar(carData);

                const state = location.state || {};
                const newContext = { ...contextData };

                if (state.manufacturerName) {
                    newContext.manufacturer = { id: state.manufacturerId, name: state.manufacturerName };
                }
                if (state.engineCode) {
                    newContext.engine = { id: state.engineId, model_code: state.engineCode };
                }
                setContextData(newContext);

                // Prepare params for filtered counts
                const params = {};
                if (newContext.engine?.id) params.engine_model = newContext.engine.id;
                if (carData.id) params.car_model = carData.id;

                const categoriesData = await partCategoryAPI.getAll(params);
                const results = categoriesData.results || categoriesData;

                // Filter categories with 0 illustrations
                const filteredCategories = results.filter(cat => (cat.illustration_count || 0) > 0);
                setCategories(filteredCategories);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (carSlug) fetchData();
    }, [carSlug]);

    const handleCategoryClick = (category) => {
        navigate(`/cars/${carSlug}/categories/${category.id}/subcategories`, {
            state: {
                ...contextData,
                carId: car?.id,
                carName: car?.name,
                categoryId: category.id,
                categoryName: category.name
            }
        });
    };

    const breadcrumbs = [
        { label: 'ホーム', path: '/' },
        { label: 'メーカー選択', path: '/manufacturers' },
        {
            label: contextData.manufacturer?.name || 'メーカー',
            path: contextData.manufacturer ? `/manufacturers/${contextData.manufacturer.id}/engines` : '#',
            state: { manufacturerId: contextData.manufacturer?.id, manufacturerName: contextData.manufacturer?.name }
        },
        {
            label: contextData.engine?.model_code || 'エンジン',
            path: contextData.engine ? `/engines/${contextData.engine.id}/cars` : '#',
            state: {
                manufacturerId: contextData.manufacturer?.id,
                manufacturerName: contextData.manufacturer?.name,
                engineId: contextData.engine?.id,
                engineCode: contextData.engine?.model_code
            }
        },
        { label: car?.name || '車種' }
    ];

    const handleBack = () => {
        if (contextData.engine) {
            navigate(`/engines/${contextData.engine.id}/cars`, {
                state: {
                    manufacturerId: contextData.manufacturer?.id,
                    manufacturerName: contextData.manufacturer?.name
                }
            });
        } else {
            navigate(-1);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 3, px: isMobile ? 2 : 3 }}>
            <PageHeader
                title={car?.name || "Loading..."}
                subtitle="カテゴリーを選択してください"
                breadcrumbs={breadcrumbs}
                icon={CategoryIcon}
                onBack={handleBack}
            />

            {loading ? (
                <Grid container spacing={2}>
                    {[1, 2, 3].map((i) => (
                        <Grid item xs={12} sm={6} md={4} key={i}>
                            <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 4 }} />
                        </Grid>
                    ))}
                </Grid>
            ) : categories.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, opacity: 0.6 }}>
                    <CategoryIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                    <Typography>表示可能なカテゴリがありません</Typography>
                </Box>
            ) : (
                isMobile ? (
                    <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
                        {categories.map((category, index) => (
                            <Box key={category.id}>
                                <Box
                                    onClick={() => handleCategoryClick(category)}
                                    sx={{
                                        p: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        cursor: 'pointer',
                                        '&:active': { bgcolor: 'action.hover' }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            flexShrink: 0
                                        }}
                                    >
                                        <CategoryIcon fontSize="small" />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {category.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" fontWeight="bold">
                                                ({category.illustration_count || 0})
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <ArrowForwardIosIcon fontSize="small" sx={{ color: 'text.disabled', fontSize: 16 }} />
                                </Box>
                                {index < categories.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Grid container spacing={2}>
                        {categories.map((category) => (
                            <Grid item xs={12} sm={6} md={4} key={category.id}>
                                <GlassCard
                                    onClick={() => handleCategoryClick(category)}
                                    sx={{
                                        p: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 2,
                                        height: '100%'
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            borderRadius: 3,
                                            bgcolor: 'warning.main',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            boxShadow: '0 4px 12px rgba(237, 108, 2, 0.3)',
                                        }}
                                    >
                                        <CategoryIcon />
                                    </Box>

                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                            <Typography variant="h6" fontWeight="bold">
                                                {category.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" fontWeight="bold">
                                                ({category.illustration_count || 0})
                                            </Typography>
                                        </Box>
                                        {category.description && (
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {category.description}
                                            </Typography>
                                        )}
                                    </Box>

                                    <ArrowForwardIosIcon
                                        fontSize="small"
                                        sx={{ color: theme.palette.text.disabled, opacity: 0.5 }}
                                    />
                                </GlassCard>
                            </Grid>
                        ))}
                    </Grid>
                )
            )}
        </Container >
    );
};

export default CarCategories;
