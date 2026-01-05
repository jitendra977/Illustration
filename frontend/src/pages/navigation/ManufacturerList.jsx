import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Grid,
    Typography,
    Avatar,
    TextField,
    InputAdornment,
    Chip,
    Stack,
    CircularProgress,
    useTheme,
    alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { manufacturerAPI } from '../../api/illustrations';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SettingsIcon from '@mui/icons-material/Settings';
import GlassCard from '../../components/common/GlassCard';
import PageLayout from '../../components/layout/PageLayout';

const ManufacturerList = () => {
    const [manufacturers, setManufacturers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
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

    return (
        <PageLayout
            title="メーカー選択"
            subtitle="イラストを検索するメーカーを選択してください"
            maxWidth="lg"
        >
            {/* Search Bar */}
            <Box sx={{ mb: 4 }}>
                <GlassCard sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
                    <SearchIcon sx={{ color: 'text.secondary', ml: 1, mr: 1 }} />
                    <TextField
                        fullWidth
                        placeholder="メーカーを検索..."
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
            ) : (
                <Grid container spacing={2}>
                    {filteredManufacturers.map((manufacturer, index) => (
                        <Grid item xs={12} sm={6} md={4} key={manufacturer.id}>
                            <GlassCard
                                onClick={() => handleManufacturerClick(manufacturer)}
                                sx={{
                                    height: '100%',
                                    p: 2.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2.5,
                                    animationDelay: `${index * 50}ms`
                                }}
                            >
                                {/* Initials Avatar */}
                                <Avatar
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                                        color: theme.palette.primary.light,
                                        fontWeight: 'bold',
                                        fontSize: '1.5rem',
                                        border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                                    }}
                                >
                                    {manufacturer.name.charAt(0)}
                                </Avatar>

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="h6" fontWeight="bold" noWrap gutterBottom>
                                        {manufacturer.name}
                                    </Typography>

                                    <Stack direction="row" spacing={1}>
                                        <Chip
                                            icon={<SettingsIcon sx={{ fontSize: '14px !important' }} />}
                                            label={`${manufacturer.engine_count || 0} エンジン`}
                                            size="small"
                                            sx={{
                                                height: 24,
                                                bgcolor: alpha(theme.palette.background.default, 0.3),
                                                color: 'text.secondary',
                                                border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                                '& .MuiChip-icon': { color: 'inherit' }
                                            }}
                                        />
                                        <Chip
                                            icon={<DirectionsCarIcon sx={{ fontSize: '14px !important' }} />}
                                            label={`${manufacturer.car_model_count || 0} 車種`}
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
                                </Box>
                            </GlassCard>
                        </Grid>
                    ))}
                </Grid>
            )}
        </PageLayout>
    );
};

export default ManufacturerList;
