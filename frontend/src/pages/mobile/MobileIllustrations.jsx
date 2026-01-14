// src/pages/mobile/MobileIllustrations.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Stack,
  CircularProgress,
  Alert,
  alpha,
  useTheme,
  Fab,
  Collapse,
  MenuItem,
} from '@mui/material';
import {
  Add as PlusIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

import {
  useIllustrations,
  useFactories,
  useUsersList
} from '../../hooks/useIllustrations';
import CreateIllustrationModal from '../../components/forms/CreateIllustrationModal';
import IllustrationDetailModal from '../../components/illustrations/IllustrationDetailModal';
import FilterPanel from '../../components/illustrations/FilterPanel';
import IllustrationList from '../../components/illustrations/IllustrationList';
import Breadcrumbs from '../../components/navigation/Breadcrumbs';

const MobileIllustrations = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const { id: paramId } = useParams();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedIllustration, setSelectedIllustration] = useState(null);
  const [filters, setFilters] = useState({ include_files: true });
  const [sortBy, setSortBy] = useState('newest');
  const [editMode, setEditMode] = useState('create');

  // Sync filters from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const parsedFilters = { include_files: true };
    ['manufacturer', 'engine_model', 'part_category', 'part_subcategory', 'car_model', 'factory', 'user'].forEach(key => {
      const value = searchParams.get(key);
      if (value) parsedFilters[key] = value;
    });
    setFilters(parsedFilters);
  }, [location.search]);

  const { factories } = useFactories();
  const { users } = useUsersList(filters.factory);

  const { illustrations, loading, error, fetchIllustrations, deleteIllustration } = useIllustrations(filters);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchIllustrations({ search: searchTerm });
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...newFilters, include_files: true });
    setShowFilters(false);
  };

  const handleCardClick = (illustration) => {
    setSelectedIllustration(illustration);
    setShowDetailModal(true);
  };

  const handleCreate = () => {
    setEditMode('create');
    setSelectedIllustration(null);
    setShowCreateModal(true);
  };

  const handleEdit = (illustration) => {
    setSelectedIllustration(illustration);
    setEditMode('edit');
    setShowDetailModal(false);
    setShowCreateModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('このイラストを削除してもよろしいですか？')) {
      try {
        await deleteIllustration(id);
        if (selectedIllustration?.id === id) {
          setShowDetailModal(false);
        }
      } catch (err) {
        console.error('Delete failed:', err);
      }
    }
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
        <Breadcrumbs items={[{ label: 'イラスト' }]} />

        <Box sx={{ mb: 3, mt: 1 }}>
          <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary' }}>
            イラストライブラリ
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            エンジンパーツの図解・イラスト集
          </Typography>
        </Box>

        {/* Search and Sort Toolbar */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Box component="form" onSubmit={handleSearch}>
            <TextField
              fullWidth
              placeholder="タイトル、説明で検索..."
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

          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              variant={showFilters ? 'contained' : 'outlined'}
              size="small"
              startIcon={<FilterIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ borderRadius: 2, textTransform: 'none', flexShrink: 0, height: 40 }}
            >
              フィルター
            </Button>

            <TextField
              select
              size="small"
              value={sortBy}
              onChange={(e) => {
                const value = e.target.value;
                setSortBy(value);
                let ordering = '-created_at';
                if (value === 'oldest') ordering = 'created_at';
                if (value === 'title') ordering = 'title';
                if (value === 'factory') ordering = 'factory__name';
                if (value === 'user') ordering = 'user__username';
                setFilters(prev => ({ ...prev, ordering }));
              }}
              SelectProps={{ native: true }}
              sx={{
                flexGrow: 1,
                '& .MuiOutlinedInput-root': { borderRadius: 2, height: 40 }
              }}
            >
              <option value="newest">新しい順</option>
              <option value="oldest">古い順</option>
              <option value="title">タイトル順</option>
              <option value="factory">工場順 (A-Z)</option>
              <option value="user">ユーザー順 (A-Z)</option>
            </TextField>
          </Stack>

          <Stack direction="row" spacing={1}>
            <TextField
              select
              label="工場"
              fullWidth
              size="small"
              value={filters.factory || ''}
              onChange={(e) => {
                const val = e.target.value;
                setFilters(prev => ({ ...prev, factory: val, user: '' }));
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              <MenuItem value="">全工場</MenuItem>
              {factories.map(f => (
                <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="ユーザー"
              fullWidth
              size="small"
              value={filters.user || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
              disabled={!filters.factory}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            >
              <MenuItem value="">全ユーザー</MenuItem>
              {users.map(u => (
                <MenuItem key={u.id} value={u.id}>{u.username}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>

        {/* Filter Panel */}
        <Collapse in={showFilters}>
          <Box sx={{ mb: 3 }}>
            <FilterPanel
              onFilterChange={handleFilterChange}
              initialFilters={filters}
            />
          </Box>
        </Collapse>

        {/* Content */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        ) : (
          <IllustrationList
            illustrations={illustrations}
            onView={handleCardClick}
            onDelete={handleDelete}
          />
        )}
      </Container>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={handleCreate}
        sx={{
          position: 'fixed',
          bottom: 80, // Above bottom navigation
          right: 16,
          zIndex: 1000,
        }}
      >
        <PlusIcon />
      </Fab>

      {/* Modals */}
      <CreateIllustrationModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          fetchIllustrations();
        }}
        mode={editMode}
        illustration={selectedIllustration}
      />

      {selectedIllustration && (
        <IllustrationDetailModal
          open={showDetailModal}
          illustration={selectedIllustration}
          onClose={() => setShowDetailModal(false)}
          onUpdate={fetchIllustrations}
          onDelete={(id) => {
            setShowDetailModal(false);
            fetchIllustrations();
          }}
          onEdit={() => handleEdit(selectedIllustration)}
        />
      )}
    </Box>
  );
};

export default MobileIllustrations;