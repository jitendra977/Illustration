import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Grid,
    Typography,
    Chip,
    TextField,
    CircularProgress,
    useTheme,
    alpha,
    Avatar,
    Stack
} from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { engineModelAPI, carModelAPI, manufacturerAPI } from '../../api/illustrations';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SearchIcon from '@mui/icons-material/Search';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import GlassCard from '../../components/common/GlassCard';
import PageLayout from '../../components/layout/PageLayout';

const EngineCars = () => {
    const { engineId } = useParams();
    const location = useLocation();
    const [engine, setEngine] = useState(null);
    const [manufacturer, setManufacturer] = useState(null);
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
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

    const getVehicleTypeIcon = (vehicleType) => {
        if (vehicleType?.includes('bus')) return <DirectionsBusIcon />;
        return <LocalShippingIcon />;
    };

    const getVehicleTypeLabel = (vehicleType) => {
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
        return labels[vehicleType] || vehicleType;
    };

    return (
        <PageLayout
            title={engine?.engine_code || engine?.name || "読み込み中..."}
            subtitle="車種を選択してください"
            maxWidth="lg"
        >
            {/* Search Bar */}
            <Box sx={{ mb: 4 }}>
                <GlassCard sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
                    <SearchIcon sx={{ color: 'text.secondary', ml: 1, mr: 1 }} />
                    <TextField
                        fullWidth
                        placeholder="車種名、型式、シャーシコードで検索..."
                        variant="standard"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{ disableUnderline: true }}
                        sx={{ input: { color: 'white' } }}
                    />
                </GlassCard>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" py={8}>
                    <CircularProgress />
                </Box>
            ) : filteredCars.length === 0 ? (
                <GlassCard sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                        車種が見つかりません
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {searchTerm ? '検索条件を変更してください' : 'このエンジンに対応する車種がありません'}
                    </Typography>
                </GlassCard>
            ) : (
                <Grid container spacing={2}>
                    {filteredCars.map((car, index) => (
                        <Grid item xs={12} sm={6} md={4} key={car.id}>
                            <GlassCard
                                onClick={() => handleCarClick(car)}
                                sx={{
                                    height: '100%',
                                    p: 2.5,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1.5,
                                    animationDelay: `${index * 50}ms`
                                }}
                            >
                                {/* Header with Icon */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            bgcolor: alpha(theme.palette.info.main, 0.2),
                                            color: theme.palette.info.light,
                                            border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`
                                        }}
                                    >
                                        {getVehicleTypeIcon(car.vehicle_type)}
                                    </Avatar>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="h6" fontWeight="bold" noWrap>
                                            {car.name}
                                        </Typography>
                                        {car.model_code && (
                                            <Typography variant="caption" color="text.secondary" noWrap>
                                                型式: {car.model_code}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                {/* Details */}
                                <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                                    {car.vehicle_type && (
                                        <Chip
                                            label={getVehicleTypeLabel(car.vehicle_type)}
                                            size="small"
                                            sx={{
                                                height: 24,
                                                bgcolor: alpha(theme.palette.info.main, 0.15),
                                                color: theme.palette.info.light,
                                                border: `1px solid ${alpha(theme.palette.info.main, 0.3)}`
                                            }}
                                        />
                                    )}
                                    {car.chassis_code && (
                                        <Chip
                                            label={`シャーシ: ${car.chassis_code}`}
                                            size="small"
                                            sx={{
                                                height: 24,
                                                bgcolor: alpha(theme.palette.background.default, 0.3),
                                                color: 'text.secondary',
                                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
                                            }}
                                        />
                                    )}
                                </Stack>
                            </GlassCard>
                        </Grid>
                    ))}
                </Grid>
            )}
        </PageLayout>
    );
};

export default EngineCars;
