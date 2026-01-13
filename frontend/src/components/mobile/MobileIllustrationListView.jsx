import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    IconButton,
    TextField,
    Chip,
    Stack,
    CircularProgress,
    Alert,
    MenuItem,
    Fade,
    useTheme,
    alpha,
    Button,
    Badge,
    Backdrop
} from '@mui/material';
import {
    Search,
    Filter,
    X,
    Plus,
    Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { illustrationAPI, clearCache } from '../../api/illustrations';
import { useManufacturers, useEngineModels, usePartCategories, usePartSubCategories, useCarModels } from '../../hooks/useIllustrations';
import IllustrationDetailModal from '../illustrations/IllustrationDetailModal';
import IllustrationListCard from './IllustrationListCard';
import MobileIllustrationFormModal from '../forms/MobileIllustrationFormModal';
import MobileFilterPanel from './MobileFilterPanel';
import FloatingAddButton from './FloatingAddButton';

const DEFAULT_EMPTY_OBJECT = {};

// Zinc color palette
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

const MobileIllustrationListView = ({
    initialFilters = DEFAULT_EMPTY_OBJECT,
    lockedFilters = DEFAULT_EMPTY_OBJECT,
    enableHeader = true,
    enableCreate = true,
    basePath = '/illustrations'
}) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedIllustration, setSelectedIllustration] = useState(null);
    const [selectedIllustrationDetail, setSelectedIllustrationDetail] = useState(null);

    // Combine initial filters with state
    const [filters, setFilters] = useState({ ...initialFilters, ...lockedFilters });

    const [sortBy, setSortBy] = useState('newest');
    const [editMode, setEditMode] = useState('create');
    const [favorites, setFavorites] = useState([]);
    const [detailLoading, setDetailLoading] = useState(false);

    // State for illustrations
    const [illustrations, setIllustrations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { manufacturers } = useManufacturers(1000);
    const { engineModels } = useEngineModels(null, 1000);
    const { categories } = usePartCategories(1000);
    const { subCategories } = usePartSubCategories(null, 1000);
    const { carModels } = useCarModels(null, 1000);

    // Fetch illustrations
    const fetchIllustrations = useCallback(async (customFilters = {}) => {
        setLoading(true);
        setError(null);

        try {
            // Merge all filters: lockedFilters overrides everything, customFilters overrides current state filters
            const params = {
                ...filters,
                ...customFilters,
                ...lockedFilters,
                include_files: true,
            };

            if (searchTerm) {
                params.search = searchTerm;
            }

            // Apply sorting
            if (sortBy === 'oldest') {
                params.ordering = 'created_at';
            } else if (sortBy === 'title') {
                params.ordering = 'title';
            } else {
                params.ordering = '-created_at';
            }

            const data = await illustrationAPI.getAll(params);
            setIllustrations(data.results || data);
        } catch (err) {
            console.error('Failed to fetch illustrations:', err);
            setError('イラストの読み込みに失敗しました');
        } finally {
            setLoading(false);
        }
    }, [filters, searchTerm, sortBy, lockedFilters]);

    // Initial fetch
    useEffect(() => {
        fetchIllustrations();
    }, [fetchIllustrations]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchIllustrations();
    };

    const handleFilterChange = (newFilters) => {
        // Ensure locked filters are preserved
        const safeFilters = { ...newFilters, ...lockedFilters };
        setFilters(safeFilters);
        setShowFilters(false);
    };

    const toggleFavorite = (id, e) => {
        e.stopPropagation();
        setFavorites((prev) =>
            prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
        );
    };

    const handleCardClick = async (illustration) => {
        // Fetch details and open modal directly
        setDetailLoading(true);
        try {
            const detailData = await illustrationAPI.getById(illustration.id);
            setSelectedIllustrationDetail(detailData);
            setDetailModalOpen(true);
        } catch (err) {
            console.error("Failed to fetch detail:", err);
            // Fallback to basic data
            setSelectedIllustrationDetail(illustration);
            setDetailModalOpen(true);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleCloseDetailModal = () => {
        setDetailModalOpen(false);
        setSelectedIllustrationDetail(null);
    };

    const handleFormModalClose = () => {
        setFormModalOpen(false);
        setSelectedIllustration(null);
        setEditMode('create');
    };

    const handleCreateClick = () => {
        setEditMode('create');
        setSelectedIllustration(null);
        setFormModalOpen(true);
    };

    const handleEditClick = async (illustration) => {
        try {
            const detailData = await illustrationAPI.getById(illustration.id);
            setEditMode('edit');
            setSelectedIllustration(detailData);
            setFormModalOpen(true);
            setDetailModalOpen(false);
        } catch (err) {
            console.error('Failed to fetch illustration for editing:', err);
        }
    };

    const handleFormModalSuccess = async () => {
        clearCache();
        await fetchIllustrations();
    };

    const handleDetailModalUpdate = () => {
        clearCache();
        fetchIllustrations();
    };

    const handleDetailModalDelete = (deletedId) => {
        clearCache();
        fetchIllustrations();
        if (selectedIllustrationDetail?.id === deletedId) {
            setDetailModalOpen(false);
        }
    };

    // Count active filters excluding locked ones (for display)
    const activeFilterCount = Object.keys(filters).filter(k => filters[k] && !lockedFilters[k]).length;

    return (
        <Box>
            {enableHeader && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: '#fff' }}>
                        イラストライブラリ
                    </Typography>
                    <Typography variant="body2" sx={{ color: zinc[400] }}>
                        エンジンパーツの図解・イラスト集
                    </Typography>
                </Box>
            )}

            {/* Search Bar */}
            <Box
                component="form"
                onSubmit={handleSearch}
                sx={{
                    position: 'relative',
                    mb: 2,
                    '&:focus-within svg': { color: '#3b82f6' }
                }}
            >
                <Box sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: zinc[500], transition: 'color 0.2s', display: 'flex', zIndex: 1 }}>
                    <Search size={18} />
                </Box>
                <Box
                    component="input"
                    placeholder="タイトル、説明で検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{
                        width: '100%',
                        bgcolor: alpha(zinc[900], 0.8),
                        border: `1px solid ${alpha('#fff', 0.05)}`,
                        borderRadius: 3,
                        py: 1.75,
                        pl: 6,
                        pr: searchTerm ? 6 : 2,
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
                {searchTerm && (
                    <IconButton
                        size="small"
                        onClick={() => setSearchTerm('')}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: zinc[400],
                            '&:hover': { bgcolor: alpha('#fff', 0.05) }
                        }}
                    >
                        <X size={18} />
                    </IconButton>
                )}
            </Box>

            {/* Toolbar */}
            <Stack direction="row" spacing={1} mb={2} alignItems="center">
                <Badge badgeContent={activeFilterCount} color="primary">
                    <Button
                        variant={activeFilterCount > 0 ? 'contained' : 'outlined'}
                        onClick={() => setShowFilters(true)}
                        startIcon={<Filter size={16} />}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            bgcolor: activeFilterCount > 0 ? '#3b82f6' : alpha(zinc[800], 0.5),
                            color: activeFilterCount > 0 ? '#fff' : zinc[300],
                            border: `1px solid ${alpha('#fff', 0.05)}`,
                            '&:hover': {
                                bgcolor: activeFilterCount > 0 ? '#2563eb' : zinc[800],
                                color: '#fff'
                            }
                        }}
                    >
                        フィルター
                    </Button>
                </Badge>
                <TextField
                    select
                    size="small"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    sx={{
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                            bgcolor: alpha(zinc[900], 0.8),
                            border: `1px solid ${alpha('#fff', 0.05)}`,
                            borderRadius: 2,
                            color: '#fff',
                            '& fieldset': { border: 'none' }
                        }
                    }}
                >
                    <MenuItem value="newest">新しい順</MenuItem>
                    <MenuItem value="oldest">古い順</MenuItem>
                    <MenuItem value="title">タイトル順</MenuItem>
                </TextField>
            </Stack>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
                <Fade in>
                    <Box
                        sx={{
                            p: 1.5,
                            mb: 2,
                            borderRadius: 2,
                            bgcolor: alpha('#3b82f6', 0.1),
                            border: `1px solid ${alpha('#3b82f6', 0.3)}`,
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            flexWrap="wrap"
                            gap={1}
                        >
                            <Typography variant="caption" fontWeight="bold" sx={{ color: '#3b82f6' }}>
                                適用中:
                            </Typography>
                            {Object.entries(filters).map(([k, v]) =>
                                v && !lockedFilters[k] ? (
                                    <Chip
                                        key={k}
                                        label={`${k}:${v}`}
                                        size="small"
                                        onDelete={() =>
                                            handleFilterChange({ ...filters, [k]: undefined })
                                        }
                                        sx={{
                                            borderRadius: 1.5,
                                            bgcolor: alpha(zinc[800], 0.5),
                                            color: '#fff',
                                            '& .MuiChip-deleteIcon': { color: zinc[400] }
                                        }}
                                    />
                                ) : null
                            )}
                            <Button
                                size="small"
                                onClick={() => handleFilterChange({})}
                                sx={{
                                    ml: 'auto',
                                    textTransform: 'none',
                                    color: zinc[300],
                                    '&:hover': { color: '#fff' }
                                }}
                            >
                                クリア
                            </Button>
                        </Stack>
                    </Box>
                </Fade>
            )}

            <MobileFilterPanel
                open={showFilters}
                onClose={() => setShowFilters(false)}
                onFilterChange={handleFilterChange}
                currentFilters={filters}
            />

            {/* Loading */}
            {loading && (
                <Box textAlign="center" py={8}>
                    <CircularProgress size={40} sx={{ color: '#3b82f6' }} />
                    <Typography variant="body2" sx={{ color: zinc[400], mt: 2 }}>
                        読み込み中...
                    </Typography>
                </Box>
            )}

            {/* Error */}
            {error && !loading && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2, bgcolor: alpha('#ef4444', 0.1), color: '#ef4444' }}>
                    {error}
                </Alert>
            )}

            {/* No Results */}
            {!loading && !error && illustrations.length === 0 && (
                <Fade in>
                    <Box
                        sx={{
                            borderRadius: 3,
                            p: 4,
                            textAlign: 'center',
                            border: `2px dashed ${alpha('#fff', 0.1)}`,
                            bgcolor: alpha(zinc[900], 0.2)
                        }}
                    >
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                margin: '0 auto',
                                mb: 2,
                                borderRadius: 2,
                                bgcolor: alpha('#3b82f6', 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <ImageIcon size={32} color="#3b82f6" />
                        </Box>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: '#fff' }}>
                            イラストが見つかりません
                        </Typography>
                        <Typography variant="body2" sx={{ color: zinc[400], mb: 3 }}>
                            {searchTerm || activeFilterCount > 0
                                ? '検索条件を変更してください'
                                : '最初のイラストを作成しましょう'}
                        </Typography>
                        {enableCreate && !searchTerm && activeFilterCount === 0 && (
                            <Button
                                variant="contained"
                                startIcon={<Plus size={16} />}
                                onClick={handleCreateClick}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    bgcolor: '#3b82f6',
                                    '&:hover': { bgcolor: '#2563eb' }
                                }}
                            >
                                イラストを作成
                            </Button>
                        )}
                    </Box>
                </Fade>
            )}

            {/* Results - List View */}
            {!loading && !error && illustrations.length > 0 && (
                <Stack spacing={2}>
                    {illustrations.map((ill, i) => (
                        <Fade key={ill.id} in timeout={150 + i * 25}>
                            <Box>
                                <IllustrationListCard
                                    illustration={ill}
                                    toggleFavorite={toggleFavorite}
                                    favorites={favorites}
                                    onClick={() => handleCardClick(ill)}
                                    theme={theme}
                                />
                            </Box>
                        </Fade>
                    ))}
                </Stack>
            )}

            {/* create illustration button */}
            {enableCreate && <FloatingAddButton onClick={handleCreateClick} />}

            <MobileIllustrationFormModal
                open={formModalOpen}
                onClose={handleFormModalClose}
                onSuccess={handleFormModalSuccess}
                mode={editMode}
                illustration={selectedIllustration}
                manufacturers={manufacturers}
                engineModels={engineModels}
                categories={categories}
                subCategories={subCategories}
                carModels={carModels}
                // Pass locked values as defaults/fixed
                initialValues={lockedFilters} // Assuming form modal can accept this
            />

            {selectedIllustrationDetail && (
                <IllustrationDetailModal
                    open={detailModalOpen}
                    illustration={selectedIllustrationDetail}
                    onClose={handleCloseDetailModal}
                    onUpdate={handleDetailModalUpdate}
                    onDelete={handleDetailModalDelete}
                    onEdit={() => handleEditClick(selectedIllustrationDetail)}
                />
            )}

            {/* Loading Backdrop for details */}
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={detailLoading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </Box>
    );
};

export default MobileIllustrationListView;
