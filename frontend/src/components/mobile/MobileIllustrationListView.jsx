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
    Backdrop,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    Tooltip,
    useMediaQuery
} from '@mui/material';
import {
    Search,
    Filter,
    X,
    Plus,
    Image as ImageIcon
} from 'lucide-react';
import {
    Favorite as FavoriteIcon,
    Visibility as ViewIcon,
    Edit as EditIcon,
    Download as DownloadIcon,
    Delete as DeleteIcon,
    PictureAsPdf,
    VideoFile,
    AudioFile,
    InsertDriveFile
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { illustrationAPI, clearCache } from '../../api/illustrations';
import { useManufacturers, useEngineModels, usePartCategories, usePartSubCategories, useCarModels } from '../../hooks/useIllustrations';
import IllustrationDetailModal from '../illustrations/IllustrationDetailModal';
import IllustrationListCard from './IllustrationListCard';
import MobileIllustrationFormModal from '../forms/MobileIllustrationFormModal';
import FilterPanel from '../illustrations/FilterPanel'; // Import FilterPanel
import FloatingAddButton from './FloatingAddButton';

// Additional imports for Drawer wrapper
import { Drawer } from '@mui/material';

// Default empty object constant
const DEFAULT_EMPTY_OBJECT = {};

const getFileIcon = (fileType, sx = {}) => {
    const defaultSx = { fontSize: 24, ...sx };
    switch (fileType) {
        case 'pdf': return <PictureAsPdf sx={{ ...defaultSx, color: 'error.main' }} />;
        case 'image': return <ImageIcon sx={defaultSx} />;
        case 'video': return <VideoFile sx={defaultSx} />;
        case 'audio': return <AudioFile sx={defaultSx} />;
        default: return <InsertDriveFile sx={defaultSx} />;
    }
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

    // Permission check for modifying
    const canModify = (illustration) => {
        // Logic should be consistent with IllustrationList or based on user role
        // For now, assuming basic edit permission logic if user object is available (it's not directly in props here)
        // If we need strict permission check, we might need to useAuth() here too.
        return true; // Simplified for now since useAuth is not imported yet. 
    };

    // Count active filters excluding locked ones (for display)
    const activeFilterCount = Object.keys(filters).filter(k => filters[k] && !lockedFilters[k]).length;
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

    return (
        <Box>
            {enableHeader && (
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: 'text.primary' }}>
                        イラストライブラリ
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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
                <Box sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'text.secondary', transition: 'color 0.2s', display: 'flex', zIndex: 1 }}>
                    <Search size={18} />
                </Box>
                <Box
                    component="input"
                    placeholder="タイトル、説明で検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{
                        width: '100%',
                        bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[900], 0.8) : theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 3,
                        py: 1.75,
                        pl: 6,
                        pr: searchTerm ? 6 : 2,
                        color: 'text.primary',
                        outline: 'none',
                        transition: 'all 0.2s',
                        fontSize: '0.875rem',
                        '::placeholder': { color: 'text.disabled' },
                        '&:focus': {
                            boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                            borderColor: theme.palette.primary.main
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
                            color: 'text.secondary',
                            '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.05) }
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
                            bgcolor: activeFilterCount > 0 ? 'primary.main' : alpha(theme.palette.zinc[800], 0.5),
                            color: activeFilterCount > 0 ? 'white' : 'text.secondary',
                            border: `1px solid ${theme.palette.divider}`,
                            '&:hover': {
                                bgcolor: activeFilterCount > 0 ? 'primary.dark' : 'action.hover',
                                color: 'text.primary'
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
                            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[900], 0.8) : theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 2,
                            color: 'text.primary',
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
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                        }}
                    >
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            flexWrap="wrap"
                            gap={1}
                        >
                            <Typography variant="caption" fontWeight="bold" sx={{ color: 'primary.main' }}>
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
                                            bgcolor: alpha(theme.palette.zinc[800], 0.5),
                                            color: 'text.primary',
                                            '& .MuiChip-deleteIcon': { color: 'text.disabled' }
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
                                    color: 'text.secondary',
                                    '&:hover': { color: 'text.primary' }
                                }}
                            >
                                クリア
                            </Button>
                        </Stack>
                    </Box>
                </Fade>
            )}

            <Drawer
                anchor="right"
                open={showFilters}
                onClose={() => setShowFilters(false)}
                PaperProps={{
                    sx: { width: '85%', maxWidth: 360, p: 2 }
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                    <IconButton onClick={() => setShowFilters(false)}>
                        <X size={24} />
                    </IconButton>
                </Box>
                <FilterPanel
                    initialFilters={filters}
                    onFilterChange={(newFilters) => {
                        handleFilterChange(newFilters);
                        setShowFilters(false);
                    }}
                />
            </Drawer>

            {/* Loading */}
            {loading && (
                <Box textAlign="center" py={8}>
                    <CircularProgress size={40} sx={{ color: 'primary.main' }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 2 }}>
                        読み込み中...
                    </Typography>
                </Box>
            )}

            {/* Error */}
            {error && !loading && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main' }}>
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
                            border: `2px dashed ${theme.palette.divider}`,
                            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[900], 0.2) : alpha(theme.palette.action.hover, 0.5)
                        }}
                    >
                        <Box
                            sx={{
                                width: 64,
                                height: 64,
                                margin: '0 auto',
                                mb: 2,
                                borderRadius: 2,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <ImageIcon size={32} color={theme.palette.primary.main} />
                        </Box>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: 'text.primary' }}>
                            イラストが見つかりません
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
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
                                    bgcolor: 'primary.main',
                                    '&:hover': { bgcolor: 'primary.dark' }
                                }}
                            >
                                イラストを作成
                            </Button>
                        )}
                    </Box>
                </Fade>
            )}

            {/* Results */}
            {!loading && !error && illustrations.length > 0 && (
                isDesktop ? (
                    <TableContainer
                        component={Paper}
                        elevation={0}
                        sx={{
                            borderRadius: 3,
                            border: `1px solid ${theme.palette.divider}`,
                            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[950], 0.5) : 'background.paper',
                            overflow: 'hidden'
                        }}
                    >
                        <Table sx={{ minWidth: 800 }}>
                            <TableHead>
                                <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[900], 0.5) : alpha(theme.palette.primary.main, 0.02) }}>
                                    <TableCell sx={{ fontWeight: 700, width: 80 }}>プレビュー</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>タイトル</TableCell>
                                    <TableCell sx={{ fontWeight: 700, width: 180 }}>カテゴリ / エンジン</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>工場 / ユーザー</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>アクション</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {illustrations.map((ill) => {
                                    const firstFile = ill.first_file || (ill.files && ill.files.length > 0 ? ill.files[0] : null);
                                    const previewUrl = firstFile?.preview_url || firstFile?.file;
                                    const fileType = firstFile ? (firstFile.file_type || 'image') : 'image';

                                    return (
                                        <TableRow
                                            key={ill.id}
                                            hover
                                            onClick={() => handleCardClick(ill)}
                                            sx={{
                                                cursor: 'pointer',
                                                '&:last-child td, &:last-child th': { border: 0 },
                                                bgcolor: theme.palette.mode === 'dark' ? 'transparent' : 'inherit',
                                                '&:nth-of-type(odd)': {
                                                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[900], 0.3) : alpha(theme.palette.action.hover, 0.5)
                                                },
                                                '&:hover': {
                                                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[800], 0.5) : alpha(theme.palette.action.hover, 0.8)
                                                }
                                            }}
                                        >
                                            <TableCell>
                                                <Box sx={{ position: 'relative', width: 50, height: 50 }}>
                                                    {fileType === 'image' ? (
                                                        <Avatar
                                                            variant="rounded"
                                                            src={previewUrl}
                                                            sx={{
                                                                width: 50,
                                                                height: 50,
                                                                bgcolor: theme.palette.mode === 'dark' ? 'zinc.800' : 'action.hover',
                                                                border: `1px solid ${theme.palette.divider}`
                                                            }}
                                                        >
                                                            <ImageIcon />
                                                        </Avatar>
                                                    ) : (
                                                        <Box
                                                            sx={{
                                                                width: 50,
                                                                height: 50,
                                                                borderRadius: 2,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                bgcolor: fileType === 'pdf' ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.primary.main, 0.1),
                                                                border: `1px solid ${fileType === 'pdf' ? alpha(theme.palette.error.main, 0.2) : theme.palette.divider}`,
                                                                color: fileType === 'pdf' ? 'error.main' : 'primary.main'
                                                            }}
                                                        >
                                                            {getFileIcon(fileType, { fontSize: 32 })}
                                                        </Box>
                                                    )}
                                                    {ill.file_count > 0 && (
                                                        <Box
                                                            sx={{
                                                                position: 'absolute',
                                                                top: -6,
                                                                right: -6,
                                                                minWidth: 20,
                                                                height: 20,
                                                                borderRadius: '10px',
                                                                bgcolor: 'error.main',
                                                                color: 'white',
                                                                fontSize: '10px',
                                                                fontWeight: 900,
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                px: 0.5,
                                                                boxShadow: `0 2px 4px ${alpha(theme.palette.error.main, 0.3)}`,
                                                                border: `2px solid ${theme.palette.background.paper}`,
                                                                zIndex: 2
                                                            }}
                                                        >
                                                            {ill.file_count}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Stack direction="row" alignItems="center" spacing={1}>
                                                    <Typography variant="subtitle2" fontWeight={700}>
                                                        {ill.title}
                                                    </Typography>
                                                </Stack>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 300, noWrap: true, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {ill.description || 'No description'}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Stack spacing={0.5} direction="column" alignItems="flex-start">
                                                    {(ill.part_category_name || ill.part_category?.name) && (
                                                        <Chip
                                                            label={ill.part_category_name || ill.part_category?.name}
                                                            size="small"
                                                            sx={{
                                                                height: 20,
                                                                fontSize: '0.65rem',
                                                                fontWeight: 700,
                                                                bgcolor: alpha(theme.palette.warning.main, 0.1),
                                                                color: 'warning.main',
                                                                maxWidth: '100%'
                                                            }}
                                                        />
                                                    )}
                                                    {(ill.engine_model_name || ill.engine_model?.name) && (
                                                        <Chip
                                                            label={ill.engine_model_name || ill.engine_model?.name}
                                                            size="small"
                                                            sx={{
                                                                height: 20,
                                                                fontSize: '0.65rem',
                                                                fontWeight: 700,
                                                                bgcolor: alpha(theme.palette.success.main, 0.1),
                                                                color: 'success.main',
                                                                maxWidth: '100%'
                                                            }}
                                                        />
                                                    )}
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Stack spacing={0}>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        {ill.factory_name || '-'}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {ill.user_name || '-'}
                                                    </Typography>
                                                </Stack>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center" onClick={(e) => e.stopPropagation()}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => toggleFavorite(ill.id, { stopPropagation: () => { } })}
                                                        sx={{ color: favorites.includes(ill.id) ? 'error.main' : 'text.disabled' }}
                                                    >
                                                        <FavoriteIcon fontSize="small" />
                                                    </IconButton>

                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleCardClick(ill)}
                                                        sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) }}
                                                    >
                                                        <ViewIcon fontSize="small" />
                                                    </IconButton>

                                                    {canModify(ill) && (
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleEditClick(ill)}
                                                            sx={{ color: 'info.main', bgcolor: alpha(theme.palette.info.main, 0.05) }}
                                                        >
                                                            <EditIcon fontSize="small" />
                                                        </IconButton>
                                                    )}
                                                </Stack>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ) : (
                    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto' }}>
                        <Grid container spacing={2.5}>
                            {illustrations.map((ill, i) => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={ill.id}>
                                    <Fade in timeout={150 + i * 25}>
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
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                )
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
