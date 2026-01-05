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
import { manufacturerAPI, engineModelAPI } from '../../api/illustrations';
import SettingsIcon from '@mui/icons-material/Settings';
import SearchIcon from '@mui/icons-material/Search';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import GlassCard from '../../components/common/GlassCard';
import PageLayout from '../../components/layout/PageLayout';

const ManufacturerEngines = () => {
    const { manufacturerId } = useParams();
    const location = useLocation();
    const [manufacturer, setManufacturer] = useState(null);
    const [engines, setEngines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
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

    const getFuelTypeIcon = (fuelType) => {
        return <LocalGasStationIcon sx={{ fontSize: '14px !important' }} />;
    };

    const getFuelTypeLabel = (fuelType) => {
        const labels = {
            'diesel': 'ディーゼル',
            'petrol': 'ガソリン',
            'hybrid': 'ハイブリッド',
            'electric': '電気',
            'lpg': 'LPG'
        };
        return labels[fuelType] || fuelType;
    };

    return (
        <PageLayout
            title={manufacturer?.name || "読み込み中..."}
            subtitle="エンジンモデルを選択してください"
            maxWidth="lg"
        >
            {/* Search Bar */}
            <Box sx={{ mb: 4 }}>
                <GlassCard sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
                    <SearchIcon sx={{ color: 'text.secondary', ml: 1, mr: 1 }} />
                    <TextField
                        fullWidth
                        placeholder="エンジンモデルを検索..."
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
            ) : filteredEngines.length === 0 ? (
                <GlassCard sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                        エンジンが見つかりません
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {searchTerm ? '検索条件を変更してください' : 'このメーカーにはエンジンがありません'}
                    </Typography>
                </GlassCard>
            ) : (
                <Grid container spacing={2}>
                    {filteredEngines.map((engine, index) => (
                        <Grid item xs={12} sm={6} md={4} key={engine.id}>
                            <GlassCard
                                onClick={() => handleEngineClick(engine)}
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
                                            bgcolor: alpha(theme.palette.secondary.main, 0.2),
                                            color: theme.palette.secondary.light,
                                            border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`
                                        }}
                                    >
                                        <SettingsIcon />
                                    </Avatar>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="h6" fontWeight="bold" noWrap>
                                            {engine.engine_code || engine.name}
                                        </Typography>
                                        {engine.engine_code && engine.name !== engine.engine_code && (
                                            <Typography variant="caption" color="text.secondary" noWrap>
                                                {engine.name}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>

                                {/* Stats */}
                                <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                                    {engine.fuel_type && (
                                        <Chip
                                            icon={getFuelTypeIcon(engine.fuel_type)}
                                            label={getFuelTypeLabel(engine.fuel_type)}
                                            size="small"
                                            sx={{
                                                height: 24,
                                                bgcolor: alpha(theme.palette.warning.main, 0.15),
                                                color: theme.palette.warning.light,
                                                border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
                                                '& .MuiChip-icon': { color: 'inherit' }
                                            }}
                                        />
                                    )}
                                    <Chip
                                        icon={<DirectionsCarIcon sx={{ fontSize: '14px !important' }} />}
                                        label={`${engine.car_model_count || 0} 車種`}
                                        size="small"
                                        sx={{
                                            height: 24,
                                            bgcolor: alpha(theme.palette.background.default, 0.3),
                                            color: 'text.secondary',
                                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                            '& .MuiChip-icon': { color: 'inherit' }
                                        }}
                                    />
                                </Stack>
                            </GlassCard>
                        </Grid>
                    ))}
                </Grid>
            )}
        </PageLayout>
    );
};

export default ManufacturerEngines;
