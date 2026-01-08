// IllustrationList.jsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
  Avatar,
  Chip,
  Stack
} from '@mui/material';
import {
  Visibility as EyeIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  AttachFile as AttachIcon
} from '@mui/icons-material';

const IllustrationList = ({ illustrations, onDelete, onView }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getImageUrl = (illustration) => {
    if (illustration.files && illustration.files.length > 0) {
      return illustration.files[0].file;
    }
    return null;
  };

  const handleRowClick = (illustration) => {
    if (onView) {
      onView(illustration);
    }
  };

  const handleDownload = (e, illustration) => {
    e.stopPropagation();
    const imageUrl = getImageUrl(illustration);
    if (imageUrl) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `${illustration.title}_1`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    onDelete?.(id);
  };

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead sx={{ bgcolor: 'grey.50' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Preview</TableCell>
            <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Title</TableCell>
            <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Details</TableCell>
            <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Files</TableCell>
            <TableCell sx={{ fontWeight: 'bold', py: 1.5 }}>Created</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold', py: 1.5 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {illustrations.map((illustration) => (
            <TableRow 
              key={illustration.id} 
              hover
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
              onClick={() => handleRowClick(illustration)}
            >
              <TableCell sx={{ py: 1.5 }}>
                <Avatar
                  variant="rounded"
                  src={getImageUrl(illustration)}
                  sx={{ width: 48, height: 48, bgcolor: 'grey.100' }}
                >
                  <ImageIcon />
                </Avatar>
              </TableCell>

              <TableCell sx={{ py: 1.5 }}>
                <Box>
                  <Typography variant="body2" fontWeight="medium" noWrap>
                    {illustration.title}
                  </Typography>
                  {illustration.description && (
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {illustration.description}
                    </Typography>
                  )}
                  <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
                    <PersonIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {illustration.user_name}
                    </Typography>
                  </Stack>
                </Box>
              </TableCell>

              <TableCell sx={{ py: 1.5 }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption">
                    <strong>Engine:</strong> {illustration.engine_model?.name || illustration.engine_model_name}
                  </Typography>
                  <Typography variant="caption">
                    <strong>Category:</strong> {illustration.part_category?.name || illustration.part_category_name}
                  </Typography>
                </Stack>
              </TableCell>

              <TableCell sx={{ py: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <AttachIcon fontSize="small" />
                  <Typography variant="caption">
                    {illustration.files?.length || 0}
                  </Typography>
                </Stack>
              </TableCell>

              <TableCell sx={{ py: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <CalendarIcon fontSize="small" />
                  <Typography variant="caption">
                    {formatDate(illustration.created_at)}
                  </Typography>
                </Stack>
              </TableCell>

              <TableCell align="right" sx={{ py: 1.5 }}>
                <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                  <IconButton 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onView) onView(illustration);
                    }}
                  >
                    <EyeIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={(e) => handleDownload(e, illustration)}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={(e) => handleDelete(e, illustration.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {illustrations.length === 0 && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <ImageIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
          <Typography color="text.secondary">No illustrations</Typography>
        </Box>
      )}
    </TableContainer>
  );
};

export default IllustrationList;