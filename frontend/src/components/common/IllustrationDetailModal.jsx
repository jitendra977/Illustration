import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Button,
  Box,
  Typography,
  IconButton,
  Chip,
  Stack,
  Alert,
  Menu,
  MenuItem,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  MoreVert as MoreIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  GetApp as GetAppIcon,
} from '@mui/icons-material';
import { illustrationFileAPI, illustrationAPI } from '../../api/illustrations';

const IllustrationDetailModal = ({
  open,
  onClose,
  illustration,
  onUpdate,
  onDelete,
  onEdit,
  userRole = 'user',
  currentUserId,
}) => {
  const theme = useTheme();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [files, setFiles] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = currentUserId || currentUser?.id;
  const canEdit = userRole === 'admin' || userRole === 'staff' || (userRole === 'user' && illustration?.user_id === userId);

  useEffect(() => {
    if (open && illustration?.id) {
      fetchFiles();
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favorites.includes(illustration.id));
    }
  }, [open, illustration?.id]);

  const fetchFiles = async () => {
    try {
      const data = await illustrationFileAPI.getByIllustration(illustration.id);
      setFiles(data.results || data);
    } catch (err) {
      console.error('Failed to fetch files:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('本当に削除しますか？')) return;
    try {
      await illustrationAPI.delete(illustration.id);
      onDelete(illustration.id);
      setSuccess('削除しました');
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      setError('削除失敗');
    }
  };

  // ============================================================================
// FRONTEND - Fixed Download with Proper Authentication
// ============================================================================

const handleDownload = async (file) => {
  try {
    // Use the download endpoint instead of direct file URL
    const downloadUrl = file.download_url || `/api/illustration-files/${file.id}/download/`;
    
    const response = await fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('access_token')}` // Add if using auth
      }
    });
    
    if (!response.ok) throw new Error('Download failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.file_name || `${illustration.title}_${file.id}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    setSuccess('ダウンロード中');
  } catch (err) {
    setError('ダウンロード失敗');
  }
};

  const handleShare = async () => {
    if (files[0]) {
      navigator.clipboard.writeText(files[0].file);
      setSuccess('リンクをコピー');
    }
  };

  const handleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (isFavorite) {
      localStorage.setItem('favorites', JSON.stringify(favorites.filter(id => id !== illustration.id)));
      setIsFavorite(false);
    } else {
      favorites.push(illustration.id);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(true);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }} noWrap>{illustration?.title}</Typography>
            <IconButton onClick={handleFavorite} size="small" color={isFavorite ? 'error' : 'default'}>
              {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <IconButton onClick={handleShare} size="small"><ShareIcon /></IconButton>
            <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} size="small"><MoreIcon /></IconButton>
          </Stack>
        </Box>

        <DialogContent sx={{ p: 0 }}>
          {error && <Alert severity="error" onClose={() => setError(null)} sx={{ m: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" onClose={() => setSuccess(null)} sx={{ m: 2 }}>{success}</Alert>}

          <Stack spacing={3} sx={{ p: 3 }}>
            <Typography variant="body2" color="text.secondary">{illustration?.description || '説明なし'}</Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              {illustration?.engine_model_name && <Chip label={illustration.engine_model_name} size="small" color="primary" />}
              {illustration?.part_category_name && <Chip label={illustration.part_category_name} size="small" color="secondary" />}
            </Stack>

            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>ファイル ({files.length})</Typography>
              <Stack spacing={1}>
                {files.map((file, i) => (
                  <Box key={file.id} sx={{ p: 2, borderRadius: 2, border: 1, borderColor: 'divider', bgcolor: alpha(theme.palette.primary.main, 0.02), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>{file.file_type_display || 'ファイル'} #{i + 1}</Typography>
                        <Typography variant="caption" color="text.secondary">{file.file_name || file.file?.split('/').pop()}</Typography>
                      </Box>
                      <IconButton onClick={() => handleDownload(file)} color="primary" sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                        <GetAppIcon />
                      </IconButton>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>

            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <PersonIcon fontSize="small" color="action" />
                <Typography variant="body2">{illustration?.user_name || '不明'}</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <CalendarIcon fontSize="small" color="action" />
                <Typography variant="body2">{new Date(illustration?.created_at).toLocaleDateString('ja-JP')}</Typography>
              </Stack>
            </Stack>

            {canEdit && (
              <Stack direction="row" spacing={2}>
                <Button fullWidth variant="outlined" startIcon={<EditIcon />} onClick={onEdit}>編集</Button>
                <Button fullWidth variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleDelete}>削除</Button>
              </Stack>
            )}
          </Stack>
        </DialogContent>
      </Dialog>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => { navigator.clipboard.writeText(illustration?.title); setSuccess('コピー'); setMenuAnchor(null); }}>タイトルをコピー</MenuItem>
      </Menu>
    </>
  );
};

export default IllustrationDetailModal;