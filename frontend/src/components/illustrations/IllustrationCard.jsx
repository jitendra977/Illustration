import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Button,
  Box,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  useTheme,
  alpha
} from '@mui/material';
import {
  Visibility as EyeIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { illustrationAPI } from '../../api/illustrations';
import IllustrationDetailModal from './IllustrationDetailModal';
import { useAuth } from '../../context/AuthContext';

const IllustrationCard = ({ illustration, onDelete }) => {
  const { user } = useAuth();
  const canEdit = user?.is_staff || user?.is_superuser;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const theme = useTheme();

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await illustrationAPI.delete(illustration.id);
      onDelete?.(illustration.id);
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const getImageUrl = () => {
    if (illustration.files && illustration.files.length > 0) {
      return illustration.files[0].file;
    }
    return null;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 3,
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 24px -10px ${alpha(theme.palette.common.black, 0.5)}`,
            borderColor: alpha(theme.palette.primary.main, 1.0),
          }
        }}
        onClick={(e) => {
          // Check for prop or fallback
          setShowDetailModal(true);
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="160"
            image={getImageUrl() || '/placeholder.jpg'}
            alt={illustration.title}
            sx={{
              bgcolor: alpha(theme.palette.zinc[950], 0.5),
              objectFit: 'cover'
            }}
          />
          {illustration.files && illustration.files.length > 1 && (
            <Chip
              size="small"
              label={`${illustration.files.length} files`}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: alpha(theme.palette.common.black, 0.6),
                color: 'white',
                backdropFilter: 'blur(4px)',
                fontWeight: 600,
                fontSize: '0.65rem'
              }}
            />
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Typography variant="subtitle2" fontWeight="800" sx={{ color: 'text.primary', fontSize: '0.9rem' }} noWrap>
            {illustration.title}
          </Typography>

          {illustration.description && (
            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '2.5em' }}>
              {illustration.description}
            </Typography>
          )}

          <Stack spacing={0.5}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography variant="caption" fontWeight="800" sx={{ color: 'text.secondary', fontSize: '10px', textTransform: 'uppercase' }}>Engine:</Typography>
              <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {illustration.engine_model?.name || illustration.engine_model_name}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography variant="caption" fontWeight="800" sx={{ color: 'text.secondary', fontSize: '10px', textTransform: 'uppercase' }}>Category:</Typography>
              <Typography variant="caption" sx={{ color: 'text.primary', fontWeight: 600 }}>
                {illustration.part_category?.name || illustration.part_category_name}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2} pt={1.5} sx={{ borderTop: `1px solid ${theme.palette.divider}` }}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <PersonIcon sx={{ color: 'text.disabled', fontSize: 14 }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {illustration.user_name}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <CalendarIcon sx={{ color: 'text.disabled', fontSize: 14 }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                {formatDate(illustration.created_at)}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>

        <CardActions sx={{ p: 1, justifyContent: 'space-between', bgcolor: alpha(theme.palette.zinc[950], 0.3) }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetailModal(true);
            }}
            sx={{ color: 'primary.main' }}
          >
            <EyeIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              const imageUrl = getImageUrl();
              if (imageUrl) {
                const link = document.createElement('a');
                link.href = imageUrl;
                link.download = `${illustration.title}_1`;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }
            }}
            sx={{ color: 'text.secondary' }}
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
          {canEdit && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              sx={{ color: 'error.main' }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          )}
        </CardActions>
      </Card>

      {/* Detail Modal */}
      <IllustrationDetailModal
        open={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        illustration={illustration}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => !deleting && setShowDeleteConfirm(false)}
        PaperProps={{
          sx: {
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            borderRadius: 3
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Illustration?</DialogTitle>
        <DialogContent>
          <Typography>
            Delete "{illustration.title}"? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => setShowDeleteConfirm(false)}
            disabled={deleting}
            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', color: 'text.secondary' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', px: 3 }}
          >
            {deleting ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default IllustrationCard;