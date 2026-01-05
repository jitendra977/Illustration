// src/pages/mobile/MobileManufacturerEngines.jsx - WITH ERROR HANDLING
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  IconButton,
  TextField,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  Button,
  Fab,
  SwipeableDrawer,
  Divider,
  Chip,
  alpha,
  AppBar,
  Toolbar,
  Snackbar
} from '@mui/material';
import {
  Add as PlusIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  MoreVert as MoreIcon,
  ArrowBack as ArrowBackIcon,
  LocalGasStation as FuelIcon,
  Speed as DisplacementIcon,
  Build as EngineIcon,
  ChevronRight as ChevronRightIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useEngineModels, useFuelTypes } from '../../hooks/useIllustrations';
import { manufacturerAPI } from '../../api/illustrations';
import ConfirmDialog from "../../components/dialog/ConfirmDialog";

const MobileManufacturerEngines = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [manufacturer, setManufacturer] = useState(location.state?.manufacturer || null);
  const [manufacturerError, setManufacturerError] = useState(null);
  const [manufacturerLoading, setManufacturerLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEngine, setEditingEngine] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    displacement: '',
    fuel_type: '',
    manufacturer: ''
  });
  const [errors, setErrors] = useState({});
  const [selectedEngine, setSelectedEngine] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Pass manufacturer ID to hook for automatic fetching
  const {
    engineModels,
    loading,
    error,
    fetchEngineModels,
    createEngineModel,
    updateEngineModel,
    deleteEngineModel,
  } = useEngineModels(id);

  const { fuelTypes } = useFuelTypes();

  // Show snackbar helper
  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  // Fetch manufacturer with error handling
  const loadManufacturer = async () => {
    if (!id) {
      setManufacturerError('メーカーIDが指定されていません');
      return;
    }

    setManufacturerLoading(true);
    setManufacturerError(null);

    try {
      console.log('📦 Fetching manufacturer by ID:', id);
      const data = await manufacturerAPI.getById(id);
      console.log('✅ Manufacturer loaded:', data);
      setManufacturer(data);
    } catch (err) {
      console.error('❌ Failed to fetch manufacturer:', err);
      const errorMessage = err.error || 'メーカー情報の取得に失敗しました';
      setManufacturerError(errorMessage);

      // Show user-friendly error
      if (err.code === 'NOT_FOUND') {
        showSnackbar('メーカーが見つかりません', 'error');
      } else if (err.code === 'NETWORK_ERROR') {
        showSnackbar('ネットワークエラー: 接続を確認してください', 'error');
      } else {
        showSnackbar(errorMessage, 'error');
      }
    } finally {
      setManufacturerLoading(false);
    }
  };

  useEffect(() => {
    if (!manufacturer && id) {
      loadManufacturer();
    }
  }, [manufacturer, id]);

  const filteredEngines = engineModels.filter(e =>
    e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.displacement?.toString().includes(searchTerm)
  );

  const handleViewParts = (engine) => {
    console.log('🚀 Navigating to illustrations for engine:', engine.name, 'ID:', engine.id);
    navigate(`/manufacturers/${manufacturer.id}/engines/${engine.id}/illustrations`, {
      state: { manufacturer, engine }
    });
  };

  const handleOpenModal = (engine = null) => {
    if (engine) {
      setEditingEngine(engine);
      setFormData({
        name: engine.name,
        slug: engine.slug || '',
        displacement: engine.displacement || '',
        fuel_type: engine.fuel_type || '',
        manufacturer: manufacturer?.id || id // Use text ID if obj not ready
      });
    } else {
      setEditingEngine(null);
      setFormData({
        name: '',
        slug: '',
        displacement: '',
        fuel_type: '',
        manufacturer: manufacturer?.id || id
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const newErrors = {};
    if (!formData.name?.trim()) {
      newErrors.name = '名前は必須です';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug?.trim() || undefined,
        displacement: formData.displacement || null,
        fuel_type: formData.fuel_type || null,
        manufacturer: manufacturer?.id || id
      };

      if (editingEngine) {
        await updateEngineModel(editingEngine.slug, payload);
        showSnackbar('エンジンを更新しました', 'success');
      } else {
        await createEngineModel(payload);
        showSnackbar('エンジンを作成しました', 'success');
      }

      // No need to manually reload, hook state updates
      setShowModal(false);
      setFormData({ name: '', slug: '', displacement: '', fuel_type: '', manufacturer: manufacturer?.id || id });
      setEditingEngine(null);

    } catch (err) {
      console.error('❌ Submit error:', err);

      // Handle API errors
      if (err.details) {
        const fieldErrors = {};
        Object.keys(err.details).forEach(key => {
          if (['name', 'slug', 'displacement', 'fuel_type'].includes(key)) {
            fieldErrors[key] = Array.isArray(err.details[key])
              ? err.details[key].join(', ')
              : err.details[key];
          } else if (key === 'non_field_errors' || key === 'detail') {
            fieldErrors.submit = Array.isArray(err.details[key])
              ? err.details[key].join(', ')
              : err.details[key];
          }
        });
        setErrors(fieldErrors);
      } else {
        setErrors({ submit: err.error || '操作に失敗しました' });
      }

      showSnackbar(err.error || '操作に失敗しました', 'error');
    }
  };

  const handleOpenActions = (engine, e) => {
    e.stopPropagation();
    setSelectedEngine(engine);
    setShowActions(true);
  };

  const handleEdit = () => {
    setShowActions(false);
    handleOpenModal(selectedEngine);
  };

  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  const performDelete = async () => {
    if (!selectedEngine) return;

    try {
      await deleteEngineModel(selectedEngine.slug);
      showSnackbar('エンジンを削除しました', 'success');
      // No need to manually reload
      setShowActions(false);
      setShowConfirmDelete(false);
    } catch (err) {
      console.error('❌ Delete error:', err);
      showSnackbar(err.error || '削除に失敗しました', 'error');
    }
  };

  const EngineCard = ({ engine }) => (
    <Card
      onClick={() => handleViewParts(engine)}
      sx={{
        borderRadius: 3,
        transition: 'all 0.2s',
        border: 1,
        borderColor: 'divider',
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 3,
          borderColor: 'primary.main',
          transform: 'translateY(-2px)'
        },
        '&:active': {
          transform: 'scale(0.98)',
          boxShadow: 1
        }
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Avatar Icon */}
          <Box sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: alpha('#1976d2', 0.1),
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'primary.main',
            flexShrink: 0
          }}>
            <EngineIcon sx={{ fontSize: 24 }} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="start">
              <Box>
                <Typography variant="body1" fontWeight="bold" noWrap>
                  {engine.name}
                </Typography>
                {engine.slug && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {engine.slug.toUpperCase()}
                  </Typography>
                )}
              </Box>
              <IconButton
                size="small"
                onClick={(e) => handleOpenActions(engine, e)}
                sx={{ ml: 1, mt: -0.5, mr: -0.5 }}
              >
                <MoreIcon fontSize="small" />
              </IconButton>
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
              {engine.displacement && (
                <Chip
                  icon={<DisplacementIcon sx={{ fontSize: 14 }} />}
                  label={`${engine.displacement}L`}
                  size="small"
                  sx={{
                    bgcolor: alpha('#ff9800', 0.1),
                    color: '#ff9800',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 22,
                    '& .MuiChip-icon': { color: '#ff9800', fontSize: 14 }
                  }}
                />
              )}

              {engine.fuel_type && (
                <Chip
                  icon={<FuelIcon sx={{ fontSize: 14 }} />}
                  label={engine.fuel_type}
                  size="small"
                  sx={{
                    bgcolor: alpha('#4caf50', 0.1),
                    color: '#4caf50',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    height: 22,
                    '& .MuiChip-icon': { color: '#4caf50', fontSize: 14 }
                  }}
                />
              )}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );

  // Error state for manufacturer
  if (manufacturerError) {
    return (
      <Box>
        <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
          <Toolbar>
            <IconButton edge="start" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" fontWeight="bold">
              エラー
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="sm" sx={{ px: 2, py: 4 }}>
          <Card sx={{ borderRadius: 3, p: 4, textAlign: 'center', border: 2, borderColor: 'error.main' }}>
            <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom color="error">
              メーカー情報の取得に失敗しました
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              {manufacturerError}
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ borderRadius: 2 }}
              >
                戻る
              </Button>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={loadManufacturer}
                sx={{ borderRadius: 2 }}
              >
                再試行
              </Button>
            </Stack>
          </Card>
        </Container>
      </Box>
    );
  }

  // Loading state
  if (manufacturerLoading || !manufacturer) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={48} />
        <Typography variant="body2" color="text.secondary" mt={2}>
          メーカー情報を読み込んでいます...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight="bold">
              {manufacturer.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              エンジンモデル
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" sx={{ px: 2, py: 2 }}>
        {/* Search Bar */}
        <Paper
          sx={{
            display: 'flex',
            alignItems: 'center',
            px: 2,
            py: 1,
            borderRadius: 3,
            mb: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <SearchIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />
          <TextField
            fullWidth
            placeholder="エンジンを検索..."
            variant="standard"
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{ input: { disableUnderline: true } }}
          />
          {searchTerm && (
            <IconButton size="small" onClick={() => setSearchTerm('')}>
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Paper>

        {/* Content */}
        {loading ? (
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" py={8}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" mt={2}>
              エンジン一覧を読み込んでいます...
            </Typography>
          </Box>
        ) : error ? (
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: 2 }}
            action={
              <Button color="inherit" size="small" onClick={loadEngines}>
                再試行
              </Button>
            }
          >
            {error}
          </Alert>
        ) : filteredEngines.length === 0 ? (
          <Card sx={{ borderRadius: 3, p: 4, textAlign: 'center' }}>
            <EngineIcon sx={{ fontSize: 56, color: 'grey.300', mb: 2 }} />
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              エンジンが見つかりません
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? '検索条件を変更してください' : '最初のエンジンを追加しましょう'}
            </Typography>
          </Card>
        ) : (
          <>
            <Typography variant="caption" color="text.secondary" display="block" mb={1.5} fontWeight={600}>
              {filteredEngines.length} 件のエンジン
            </Typography>

            <Stack spacing={1.5}>
              {filteredEngines.map((engine) => (
                <EngineCard key={engine.id} engine={engine} />
              ))}
            </Stack>
          </>
        )}
      </Container>

      {/* Create/Edit Modal */}
      <Dialog
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3, m: 2 } } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight="bold">
              {editingEngine ? 'エンジン編集' : 'エンジン追加'}
            </Typography>
            <IconButton onClick={() => setShowModal(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ pt: 2 }}>
            <Stack spacing={2.5}>
              <TextField
                label="名前"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name || '例: 4HK1, 6HK1, 4JJ1'}
                placeholder="例: 4HK1"
                fullWidth
                required
                autoFocus
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                label="Slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                error={!!errors.slug}
                helperText={errors.slug || '例: 4hk1, 6hk1, 4jj1 (オプション)'}
                placeholder="例: 4hk1"
                fullWidth
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                label="排気量 (L)"
                name="displacement"
                type="number"
                value={formData.displacement}
                onChange={handleChange}
                error={!!errors.displacement}
                helperText={errors.displacement || '例: 5.2, 7.8 (オプション)'}
                placeholder="例: 5.2"
                fullWidth
                inputProps={{ step: '0.1' }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              <TextField
                select
                label="燃料タイプ"
                name="fuel_type"
                value={formData.fuel_type}
                onChange={handleChange}
                error={!!errors.fuel_type}
                helperText={errors.fuel_type}
                fullWidth
                SelectProps={{ native: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                <option value="">選択してください</option>
                {fuelTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </TextField>

              {errors.submit && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {errors.submit}
                </Alert>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button
              onClick={() => setShowModal(false)}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}
            >
              キャンセル
            </Button>
            <Button
              type="submit"
              variant="contained"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)'
              }}
            >
              {editingEngine ? '更新' : '作成'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Actions Bottom Sheet */}
      <SwipeableDrawer
        anchor="bottom"
        open={showActions}
        onClose={() => setShowActions(false)}
        onOpen={() => { }}
        disableSwipeToOpen
        slotProps={{
          paper: {
            sx: { borderTopLeftRadius: 24, borderTopRightRadius: 24, pb: 2 }
          }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ width: 40, height: 4, bgcolor: 'grey.300', borderRadius: 2, mx: 'auto', mb: 2 }} />

          {selectedEngine && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight="bold">
                {selectedEngine.name}
              </Typography>
              <Stack direction="row" spacing={1} mt={1}>
                {selectedEngine.displacement && (
                  <>
                    <Typography variant="caption" color="text.secondary">
                      {selectedEngine.displacement}L
                    </Typography>
                    <Typography variant="caption" color="text.secondary">•</Typography>
                  </>
                )}
                {selectedEngine.fuel_type && (
                  <Typography variant="caption" color="text.secondary">
                    {selectedEngine.fuel_type}
                  </Typography>
                )}
              </Stack>
            </Box>
          )}

          <Stack spacing={1}>
            <Button
              fullWidth
              startIcon={<ChevronRightIcon />}
              onClick={() => {
                setShowActions(false);
                handleViewParts(selectedEngine);
              }}
              sx={{
                py: 1.5,
                justifyContent: 'flex-start',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
                color: 'primary.main'
              }}
            >
              パーツを表示
            </Button>
            <Divider />
            <Button
              fullWidth
              startIcon={<EditIcon />}
              onClick={handleEdit}
              sx={{
                py: 1.5,
                justifyContent: 'flex-start',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2
              }}
            >
              編集
            </Button>
            <Divider />
            <Button
              fullWidth
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDelete}
              sx={{
                py: 1.5,
                justifyContent: 'flex-start',
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2
              }}
            >
              削除
            </Button>
          </Stack>
        </Box>
      </SwipeableDrawer>

      <ConfirmDialog
        open={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        title="削除確認"
        content={`本当に「${selectedEngine?.name}」を削除しますか？この操作は取り消せません。`}
        onConfirm={performDelete}
        confirmText="削除"
        cancelText="キャンセル"
      />

      <Fab
        color="primary"
        aria-label="add"
        onClick={() => handleOpenModal()}
        sx={{
          position: 'fixed',
          bottom: 80,
          right: 16,
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)'
        }}
      >
        <PlusIcon />
      </Fab>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: 100 }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MobileManufacturerEngines;