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
  Stack,
  useTheme,
  alpha
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
  const theme = useTheme();
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
    <TableContainer component={Paper} sx={{
      bgcolor: 'background.paper',
      backgroundImage: 'none',
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 3,
      overflow: 'hidden'
    }}>
      <Table size="small">
        <TableHead sx={{
          bgcolor: theme.palette.mode === 'dark'
            ? alpha(theme.palette.zinc[950], 0.5)
            : alpha(theme.palette.primary.main, 0.03)
        }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2, borderBottom: `1px solid ${theme.palette.divider}`, fontSize: '0.75rem', textTransform: 'uppercase' }}>Preview</TableCell>
            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2, borderBottom: `1px solid ${theme.palette.divider}`, fontSize: '0.75rem', textTransform: 'uppercase' }}>Title</TableCell>
            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2, borderBottom: `1px solid ${theme.palette.divider}`, fontSize: '0.75rem', textTransform: 'uppercase' }}>Details</TableCell>
            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2, borderBottom: `1px solid ${theme.palette.divider}`, fontSize: '0.75rem', textTransform: 'uppercase' }}>Files</TableCell>
            <TableCell sx={{ fontWeight: 800, color: 'text.secondary', py: 2, borderBottom: `1px solid ${theme.palette.divider}`, fontSize: '0.75rem', textTransform: 'uppercase' }}>Created</TableCell>
            <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary', py: 2, borderBottom: `1px solid ${theme.palette.divider}`, fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</TableCell>
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
                  backgroundColor: alpha(theme.palette.primary.main, 0.05)
                },
                '& td': { borderColor: theme.palette.divider }
              }}
              onClick={() => handleRowClick(illustration)}
            >
              <TableCell sx={{ py: 1.5 }}>
                <Avatar
                  variant="rounded"
                  src={getImageUrl(illustration)}
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[950], 0.5) : alpha(theme.palette.text.primary, 0.03),
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <ImageIcon sx={{ color: 'text.disabled' }} />
                </Avatar>
              </TableCell>

              <TableCell sx={{ py: 1.5 }}>
                <Box>
                  <Typography variant="body2" fontWeight="800" sx={{ color: 'text.primary' }} noWrap>
                    {illustration.title}
                  </Typography>
                  {illustration.description && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                      {illustration.description}
                    </Typography>
                  )}
                  <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <PersonIcon sx={{ color: 'text.disabled', fontSize: 14 }} />
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                        {illustration.user_name}
                      </Typography>
                    </Stack>
                    {illustration.factory_name && (
                      <Chip
                        label={illustration.factory_name}
                        size="small"
                        sx={{
                          height: 16,
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: 'primary.main',
                          borderRadius: 1
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              </TableCell>

              <TableCell sx={{ py: 1.5 }}>
                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    <strong style={{ color: theme.palette.text.disabled }}>Engine:</strong> <span style={{ color: theme.palette.text.primary, fontWeight: 600 }}>{illustration.engine_model?.name || illustration.engine_model_name}</span>
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    <strong style={{ color: theme.palette.text.disabled }}>Category:</strong> <span style={{ color: theme.palette.text.primary, fontWeight: 600 }}>{illustration.part_category?.name || illustration.part_category_name}</span>
                  </Typography>
                </Stack>
              </TableCell>

              <TableCell sx={{ py: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <AttachIcon sx={{ color: 'text.disabled', fontSize: 14 }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {illustration.files?.length || 0}
                  </Typography>
                </Stack>
              </TableCell>

              <TableCell sx={{ py: 1.5 }}>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <CalendarIcon sx={{ color: 'text.disabled', fontSize: 14 }} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
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
                    sx={{ color: 'primary.main' }}
                  >
                    <EyeIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => handleDownload(e, illustration)}
                    sx={{ color: 'text.secondary' }}
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => handleDelete(e, illustration.id)}
                    sx={{ color: 'error.main' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {
        illustrations.length === 0 && (
          <Box sx={{
            p: 4,
            textAlign: 'center',
            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[950], 0.3) : alpha(theme.palette.text.primary, 0.02)
          }}>
            <ImageIcon sx={{ fontSize: 48, color: 'text.disabled', opacity: 0.3, mb: 2 }} />
            <Typography sx={{ color: 'text.secondary', fontWeight: 600 }}>No illustrations</Typography>
          </Box>
        )
      }
    </TableContainer >
  );
};

export default IllustrationList;