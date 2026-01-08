import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Grid,
    Typography,
    Skeleton,
    useTheme,
    useMediaQuery,
    Button,
    Alert,
    Divider
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { partSubCategoryAPI, partCategoryAPI, carModelAPI } from '../../api/illustrations';
import ExtensionIcon from '@mui/icons-material/Extension';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import GlassCard from '../../components/common/GlassCard';
import PageHeader from '../../components/layout/PageHeader';

const CategorySubcategories = () => {
    const { carSlug, categoryId } = useParams();
    const location = useLocation();

    const [category, setCategory] = useState(null);
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const [contextData, setContextData] = useState({
        manufacturer: null,
        engine: null,
        car: null
    });

    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                const catData = await partCategoryAPI.getById(categoryId);
                setCategory(catData);

                // Context Resolution
                const state = location.state || {};
                const newContext = { ...contextData };

                if (state.manufacturerName) {
                    newContext.manufacturer = { id: state.manufacturerId, name: state.manufacturerName };
                }
                if (state.engineCode) {
                    newContext.engine = { id: state.engineId, model_code: state.engineCode };
                }

                // Resolve Car
                let currentCar = null;
                if (state.carName) {
                    newContext.car = { id: state.carId, name: state.carName };
                    currentCar = newContext.car;
                } else if (carSlug) {
                    if (isNaN(carSlug)) {
                        const car = await carModelAPI.getBySlug(carSlug);
                        newContext.car = car;
                        currentCar = car;
                    } else {
                        // If slug is ID (should verify but simplistic here)
                        // Ideally we have a better way, but sticking to existing pattern
                        newContext.car = { id: carSlug };
                        currentCar = newContext.car;
                    }
                }
                setContextData(newContext);

                // Fetch Subcategories with Context
                const params = {};
                if (newContext.engine?.id) params.engine_model = newContext.engine.id;
                if (currentCar?.id) params.car_model = currentCar.id;

                const subCatData = await partSubCategoryAPI.getByCategory(categoryId, params);
                const results = subCatData.results || subCatData;

                // Filter subcategories with 0 illustrations
                const filteredSubcategories = results.filter(sub => (sub.illustration_count || 0) > 0);
                setSubcategories(filteredSubcategories);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (categoryId) fetchData();
    }, [categoryId, carSlug]);

    const handleSubCategoryClick = (subcategory) => {
        navigate(`/cars/${carSlug}/categories/${categoryId}/subcategories/${subcategory.id}/illustrations`, {
            state: {
                ...contextData,
                categoryId: categoryId,
                categoryName: category?.name,
                subcategoryId: subcategory.id,
                subcategoryName: subcategory.name
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
        {
            label: contextData.car?.name || '車種',
            path: contextData.car ? `/cars/${carSlug}/categories` : '#',
            state: {
                manufacturerId: contextData.manufacturer?.id,
                manufacturerName: contextData.manufacturer?.name,
                engineId: contextData.engine?.id,
                engineCode: contextData.engine?.model_code,
                carId: contextData.car?.id,
                carName: contextData.car?.name
            }
        },
        { label: category?.name || 'カテゴリ' }
    ];

    const handleBack = () => {
        navigate(`/cars/${carSlug}/categories`, { state: { ...location.state, ...contextData } });
    };

    return (
        <Container maxWidth="lg" sx={{ py: 3, px: isMobile ? 2 : 3 }}>
            <PageHeader
                title={category?.name || "Loading..."}
                subtitle="サブカテゴリを選択してください"
                breadcrumbs={breadcrumbs}
                icon={ExtensionIcon}
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
            ) : subcategories.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, opacity: 0.6 }}>
                    <ExtensionIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                    <Typography>表示可能なサブカテゴリがありません</Typography>
                </Box>
            ) : (
                isMobile ? (
                    <Box sx={{ bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
                        {subcategories.map((sub, index) => (
                            <Box key={sub.id}>
                                <Box
                                    onClick={() => handleSubCategoryClick(sub)}
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
                                            background: `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            flexShrink: 0
                                        }}
                                    >
                                        <ExtensionIcon fontSize="small" />
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {sub.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" fontWeight="bold">
                                                ({sub.illustration_count || 0})
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <ArrowForwardIosIcon fontSize="small" sx={{ color: 'text.disabled', fontSize: 16 }} />
                                </Box>
                                {index < subcategories.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </Box>
                ) : (
                    <Grid container spacing={2}>
                        {subcategories.map((sub) => (
                            <Grid item xs={12} sm={6} md={4} key={sub.id}>
                                <GlassCard
                                    onClick={() => handleSubCategoryClick(sub)}
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
                                            bgcolor: 'info.main',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            boxShadow: '0 4px 12px rgba(2, 136, 209, 0.3)',
                                        }}
                                    >
                                        <ExtensionIcon />
                                    </Box>

                                    <Box sx={{ flex: 1 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                            <Typography variant="h6" fontWeight="bold">
                                                {sub.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" fontWeight="bold">
                                                ({sub.illustration_count || 0})
                                            </Typography>
                                        </Box>
                                        {sub.description && (
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {sub.description}
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

export default CategorySubcategories;
