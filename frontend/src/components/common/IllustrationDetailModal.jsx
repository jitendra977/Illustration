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
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { illustrationFileAPI, illustrationAPI } from '../../api/illustrations';
import PDFPreviewModal from './PDFPreviewModal';

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
  
  // PDF Preview state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

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

  const handlePreview = (file) => {
    setPreviewFile(file);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewFile(null);
  };

  const handleDownload = async (file) => {
    try {
      setSuccess('ダウンロード中...');

      const baseUrl = import.meta.env.VITE_API_URL || '/api';
      const downloadUrl = `${baseUrl}/illustration-files/${file.id}/download/`;

      const token = localStorage.getItem('access_token');

      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `${illustration.title || 'download'}.pdf`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, '');
        }
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error('ファイルが空です');
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();

      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);

      setSuccess('ダウンロード完了');

    } catch (err) {
      console.error('Download failed:', err);
      setError(`ダウンロード失敗: ${err.message}`);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = `${window.location.origin}/illustration/${illustration.id}`;
      
      if (navigator.share) {
        await navigator.share({
          title: illustration.title,
          text: illustration.description || '',
          url: shareUrl,
        });
        setSuccess('共有しました');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        setSuccess('リンクをコピーしました');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Share failed:', err);
        setError('共有に失敗しました');
      }
    }
  };

  const handleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (isFavorite) {
      const updated = favorites.filter(id => id !== illustration.id);
      localStorage.setItem('favorites', JSON.stringify(updated));
      setIsFavorite(false);
      setSuccess('お気に入りから削除しました');
    } else {
      favorites.push(illustration.id);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(true);
      setSuccess('お気に入りに追加しました');
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
                  <Box 
                    key={file.id} 
                    sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      border: 1, 
                      borderColor: 'divider', 
                      bgcolor: alpha(theme.palette.primary.main, 0.02), 
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) },
                      transition: 'all 0.2s'
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {file.file_type_display || 'ファイル'} #{i + 1}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {file.file_name || file.file?.split('/').pop()}
                        </Typography>
                      </Box>
                      
                      <Stack direction="row" spacing={1}>
                        {/* Preview Button */}
                        <IconButton 
                          onClick={() => handlePreview(file)} 
                          color="secondary" 
                          size="small"
                          sx={{ 
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            '&:hover': { bgcolor: alpha(theme.palette.secondary.main, 0.2) }
                          }}
                          title="プレビュー"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>

                        {/* Download Button */}
                        <IconButton 
                          onClick={() => handleDownload(file)} 
                          color="primary" 
                          size="small"
                          sx={{ 
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                          }}
                          title="ダウンロード"
                        >
                          <GetAppIcon fontSize="small" />
                        </IconButton>
                      </Stack>
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
        <MenuItem onClick={() => { navigator.clipboard.writeText(illustration?.title); setSuccess('タイトルをコピーしました'); setMenuAnchor(null); }}>
          タイトルをコピー
        </MenuItem>
        <MenuItem onClick={() => { navigator.clipboard.writeText(illustration?.description || ''); setSuccess('説明をコピーしました'); setMenuAnchor(null); }}>
          説明をコピー
        </MenuItem>
        <MenuItem onClick={() => { 
          const url = `${window.location.origin}/illustrations/${illustration?.id}`; 
          navigator.clipboard.writeText(url); 
          setSuccess('URLをコピーしました'); 
          setMenuAnchor(null); 
        }}>
          URLをコピー
        </MenuItem>
      </Menu>

      {/* PDF Preview Modal */}
      <PDFPreviewModal
        open={previewOpen}
        onClose={handleClosePreview}
        fileId={previewFile?.id}
        fileName={previewFile?.file_name || previewFile?.file?.split('/').pop()}
      />
    </>
  );
};

export default IllustrationDetailModal;