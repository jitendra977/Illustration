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
  CircularProgress
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

const IllustrationCard = ({ illustration, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 6
          }
        }}
        onClick={(e) => {
          if (onClick) {
            onClick(illustration);
          } else {
            // Fallback to opening modal directly
            setShowDetailModal(true);
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="160"
            image={getImageUrl() || '/placeholder.jpg'}
            alt={illustration.title}
            sx={{ bgcolor: 'grey.100' }}
          />
          {illustration.files && illustration.files.length > 1 && (
            <Chip
              size="small"
              label={`${illustration.files.length} files`}
              sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.7)', color: 'white' }}
            />
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom noWrap>
            {illustration.title}
          </Typography>
          
          {illustration.description && (
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              {illustration.description}
            </Typography>
          )}

          <Stack spacing={0.5}>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography variant="caption" fontWeight="medium">Engine:</Typography>
              <Typography variant="caption" color="text.secondary">
                {illustration.engine_model?.name || illustration.engine_model_name}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography variant="caption" fontWeight="medium">Category:</Typography>
              <Typography variant="caption" color="text.secondary">
                {illustration.part_category?.name || illustration.part_category_name}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {illustration.user_name}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <CalendarIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="caption" color="text.secondary">
                {formatDate(illustration.created_at)}
              </Typography>
            </Stack>
          </Stack>
        </CardContent>

        <CardActions sx={{ p: 1, justifyContent: 'space-between' }}>
          <IconButton 
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetailModal(true);
            }}
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
          >
            <DownloadIcon fontSize="small" />
          </IconButton>
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
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
      >
        <DialogTitle>Delete Illustration?</DialogTitle>
        <DialogContent>
          <Typography>
            Delete "{illustration.title}"? This cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteConfirm(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button 
            onClick={handleDelete} 
            color="error" 
            variant="contained"
            disabled={deleting}
          >
            {deleting ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default IllustrationCard;