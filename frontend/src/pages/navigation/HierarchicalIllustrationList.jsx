import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    useTheme,
    useMediaQuery,
    Button
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { partSubCategoryAPI, partCategoryAPI, carModelAPI } from '../../api/illustrations';
import Breadcrumb from '../../components/navigation/Breadcrumb';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MobileIllustrationListView from '../../components/mobile/MobileIllustrationListView';
import PageLayout from '../../components/layout/PageLayout';

const HierarchicalIllustrationList = () => {
    const { carSlug, categoryId, subcategoryId } = useParams();
    const location = useLocation();

    const [subcategory, setSubcategory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Context state for breadcrumbs
    const [contextData, setContextData] = useState({
        manufacturer: null,
        engine: null,
        car: null,
        category: null
    });

    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch subcategory details
                const subData = await partSubCategoryAPI.getById(subcategoryId);
                setSubcategory(subData);

                // Recover context
                const state = location.state || {};
                const newContext = { ...contextData };

                if (state.manufacturerName) newContext.manufacturer = { id: state.manufacturerId, name: state.manufacturerName };
                if (state.engineCode) newContext.engine = { id: state.engineId, model_code: state.engineCode };
                if (state.carName) newContext.car = { id: state.carId, name: state.carName };
                if (state.categoryName) newContext.category = { id: state.categoryId, name: state.categoryName };

                // If context missing, fetch properly
                if (!newContext.car && carSlug) {
                    const car = await carModelAPI.getBySlug(carSlug);
                    newContext.car = car;
                }
                if (!newContext.category && categoryId) {
                    const cat = await partCategoryAPI.getById(categoryId);
                    newContext.category = cat;
                }

                setContextData(newContext);

            } catch (err) {
                console.error('Failed to fetch data:', err);
                setError('データの取得に失敗しました。');
            } finally {
                setLoading(false);
            }
        };

        if (subcategoryId) {
            fetchData();
        }
    }, [subcategoryId, categoryId, carSlug]);

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
        {
            label: contextData.category?.name || 'カテゴリ',
            path: contextData.category ? `/cars/${carSlug}/categories/${contextData.category.id}/subcategories` : '#',
            state: {
                manufacturerId: contextData.manufacturer?.id,
                manufacturerName: contextData.manufacturer?.name,
                engineId: contextData.engine?.id,
                engineCode: contextData.engine?.model_code,
                carId: contextData.car?.id,
                carName: contextData.car?.name,
                categoryId: contextData.category?.id,
                categoryName: contextData.category?.name
            }
        },
        { label: subcategory?.name || 'イラスト一覧' }
    ];

    const handleBack = () => {
        navigate(`/cars/${carSlug}/categories/${categoryId}/subcategories`, { state: location.state });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    // Filters to lock the list to this specific hierarchy
    const lockedFilters = {
        part_subcategory: subcategoryId,
        part_category: categoryId,
    };
    if (contextData.car?.id) {
        lockedFilters.car_model = contextData.car.id;
    }

    return (
        <PageLayout
            title={subcategory?.name || "イラスト一覧"}
            subtitle={`${contextData.car?.name || ''} - ${contextData.category?.name || ''}`}
            maxWidth="lg"
            showBack={false}
        >
            <Box sx={{ mb: 2 }}>
                <Breadcrumb items={breadcrumbs} isMobile={false} />
            </Box>

            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    variant="outlined"
                    size="small"
                    sx={{
                        borderColor: theme.palette.divider,
                        color: 'text.primary',
                        '&:hover': {
                            borderColor: theme.palette.primary.main,
                            bgcolor: alpha(theme.palette.primary.main, 0.05)
                        }
                    }}
                >
                    戻る
                </Button>
            </Box>

            {error ? (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            ) : (
                <MobileIllustrationListView
                    lockedFilters={lockedFilters}
                    enableHeader={false}
                    enableCreate={false}
                />
            )}
        </PageLayout>
    );
};

export default HierarchicalIllustrationList;
