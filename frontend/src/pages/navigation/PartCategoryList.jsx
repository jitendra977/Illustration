import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Grid,
    Typography,
    Avatar,
    TextField,
    Chip,
    Stack,
    CircularProgress,
    useTheme,
    alpha
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { partCategoryAPI } from '../../api/illustrations';
import SearchIcon from '@mui/icons-material/Search';
import CategoryIcon from '@mui/icons-material/Category';
import GlassCard from '../../components/common/GlassCard';
import PageLayout from '../../components/layout/PageLayout';

const PartCategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const navigate = useNavigate();
    const theme = useTheme();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                const data = await partCategoryAPI.getAll();
                const results = data.results || data;
                setCategories(results);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const filteredCategories = useMemo(() => {
        return categories.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [categories, searchTerm]);

    const handleCategoryClick = (category) => {
        navigate(`/part-categories/${category.id}/subcategories`, {
            state: { categoryName: category.name, categoryId: category.id }
        });
    };

    return (
        <PageLayout
            title="カテゴリー選択"
            subtitle="イラストを検索するカテゴリーを選択してください"
            maxWidth="lg"
        >
            {/* Search Bar */}
            <Box sx={{ mb: 4 }}>
                <GlassCard sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
                    <SearchIcon sx={{ color: 'text.secondary', ml: 1, mr: 1 }} />
                    <TextField
                        fullWidth
                        placeholder="カテゴリーを検索..."
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
                    {filteredCategories.map((category, index) => (
                        <Grid item xs={12} sm={6} md={4} key={category.id}>
                            <GlassCard
                                onClick={() => handleCategoryClick(category)}
                                sx={{
                                    height: '100%',
                                    p: 2.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2.5,
                                    animationDelay: `${index * 50}ms`
                                }}
                            >
                                {/* Icon Avatar */}
                                <Avatar
                                    sx={{
                                        width: 64,
                                        height: 64,
                                        bgcolor: alpha(theme.palette.warning.main, 0.2),
                                        color: theme.palette.warning.light,
                                        fontWeight: 'bold',
                                        fontSize: '1.5rem',
                                        border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`
                                    }}
                                >
                                    <CategoryIcon sx={{ fontSize: 32 }} />
                                </Avatar>

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography variant="h6" fontWeight="bold" noWrap gutterBottom>
                                        {category.name}
                                    </Typography>

                                    <Stack direction="row" spacing={1}>
                                        <Chip
                                            label={`${category.subcategory_count || 0} サブカテゴリー`}
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
                                            label={`${category.illustration_count || 0} イラスト`}
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

export default PartCategoryList;
