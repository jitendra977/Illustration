import React, { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Container,
    Typography,
    Stack,
    CircularProgress,
    Alert,
    alpha,
    useTheme,
    IconButton,
    TextField,
    InputAdornment
} from '@mui/material';
import {
    Search as SearchIcon,
    Close as CloseIcon,
    Favorite as FavoriteIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { favoriteAPI } from '../../api/illustrations';
import IllustrationList from '../../components/illustrations/IllustrationList';
import IllustrationDetailModal from '../../components/illustrations/IllustrationDetailModal';
import Breadcrumbs from '../../components/navigation/Breadcrumbs';

const MobileFavorites = () => {
    const theme = useTheme();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState([]);
    const [displayIllustrations, setDisplayIllustrations] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal state
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedIllustration, setSelectedIllustration] = useState(null);

    const fetchFavorites = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Get all favorites
            // Note: Pagination could be implemented here if list gets long
            const response = await favoriteAPI.getAll({ limit: 100 });

            // Transform response to illustration list format
            const items = response.results || response;
            const formattedIllustrations = items.map(item => ({
                ...item.illustration_detail,
                is_favorited: true, // Explicitly set true for favorites page
                favorited_at: item.created_at // Keep track of when it was favored
            }));

            setFavorites(formattedIllustrations);
            setDisplayIllustrations(formattedIllustrations);
        } catch (err) {
            console.error('Failed to fetch favorites:', err);
            setError('お気に入りの読み込みに失敗しました');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);

    // Handle Search locally since we fetched all (or first batch)
    useEffect(() => {
        if (!searchTerm.trim()) {
            setDisplayIllustrations(favorites);
            return;
        }

        const lowerTerm = searchTerm.toLowerCase();
        const filtered = favorites.filter(ill =>
            ill.title?.toLowerCase().includes(lowerTerm) ||
            ill.description?.toLowerCase().includes(lowerTerm) ||
            ill.engine_model_name?.toLowerCase().includes(lowerTerm) ||
            ill.part_category_name?.toLowerCase().includes(lowerTerm)
        );
        setDisplayIllustrations(filtered);
    }, [searchTerm, favorites]);

    const handleCardClick = (illustration) => {
        setSelectedIllustration(illustration);
        setShowDetailModal(true);
    };

    const handleUpdate = () => {
        fetchFavorites();
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                pb: 10,
                bgcolor: theme.palette.background.default,
            }}
        >
            <Container maxWidth="sm" sx={{ px: 2, py: 3 }}>
                <Breadcrumbs items={[{ label: 'お気に入り' }]} />

                <Box sx={{ mb: 3, mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FavoriteIcon color="error" />
                    <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary' }}>
                        お気に入り
                    </Typography>
                </Box>

                {/* Search Toolbar */}
                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        placeholder="お気に入りを検索..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        variant="outlined"
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" color="action" />
                                </InputAdornment>
                            ),
                            endAdornment: searchTerm && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                            sx: {
                                borderRadius: 2,
                                bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[900], 0.5) : 'background.paper',
                            }
                        }}
                    />
                </Box>

                {/* Content */}
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                        {error}
                    </Alert>
                ) : displayIllustrations.length === 0 ? (
                    <Box sx={{
                        textAlign: 'center',
                        py: 8,
                        px: 2,
                        bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[900], 0.5) : alpha(theme.palette.text.primary, 0.02),
                        borderRadius: 3
                    }}>
                        <FavoriteIcon sx={{ fontSize: 48, color: 'text.disabled', opacity: 0.3, mb: 2 }} />
                        <Typography variant="h6" color="text.secondary" fontWeight="bold" gutterBottom>
                            お気に入りがありません
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            イラストの♡ボタンを押して、お気に入りに追加しましょう。
                        </Typography>
                    </Box>
                ) : (
                    <IllustrationList
                        illustrations={displayIllustrations}
                        onView={handleCardClick}
                    // onDelete logic if needed, but remove from favorites is handled by button
                    />
                )}
            </Container>

            {selectedIllustration && (
                <IllustrationDetailModal
                    open={showDetailModal}
                    illustration={selectedIllustration}
                    onClose={() => setShowDetailModal(false)}
                    onUpdate={handleUpdate}
                    onDelete={handleUpdate} // If illustration deleted, refresh list
                />
            )}
        </Box>
    );
};

export default MobileFavorites;
