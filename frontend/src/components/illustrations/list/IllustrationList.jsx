import {
  Box,
  Typography,
  Stack,
  alpha,
  Grid,
  Fade,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  useMediaQuery,
  Avatar,
  Chip,
  useTheme
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Image as ImageIcon,
  PictureAsPdf,
  VideoFile,
  AudioFile,
  InsertDriveFile
} from '@mui/icons-material';
import IllustrationListCard from '../mobile/IllustrationListCard';
import FavoriteButton from '../shared/FavoriteButton';
import { useAuth } from '../../../context/AuthContext';

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

const IllustrationList = ({ illustrations, onDelete, onView, onEdit }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const canModify = (illustration) => {
    if (!user) return false;
    if (user.is_superuser || user.is_staff) return true;
    return user.id === illustration.user;
  };

  const handleRowClick = (illustration) => {
    if (onView) {
      onView(illustration);
    }
  };

  const handleDownload = (e, illustration) => {
    e.stopPropagation();
    const firstFile = illustration.first_file || (illustration.files && illustration.files.length > 0 ? illustration.files[0] : null);
    const imageUrl = firstFile?.file;

    if (!imageUrl) {
      console.warn('No image URL found for download');
      return;
    }

    const downloadFileName = firstFile?.title ||
      firstFile?.file_name ||
      `${illustration.title}_download`;

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = downloadFileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!illustrations || illustrations.length === 0) {
    return (
      <Fade in>
        <Box sx={{
          p: 8,
          textAlign: 'center',
          bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[950], 0.3) : alpha(theme.palette.text.primary, 0.02),
          borderRadius: 4,
          border: `1px dashed ${theme.palette.divider}`
        }}>
          <ImageIcon sx={{ fontSize: 64, color: 'text.disabled', opacity: 0.3, mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'text.secondary', fontWeight: 600 }}>
            イラストが見つかりません
          </Typography>
        </Box>
      </Fade>
    );
  }

  // Desktop Table View
  if (isDesktop) {
    return (
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
              <TableCell sx={{ fontWeight: 700 }}>タイトル / 説明</TableCell>
              <TableCell sx={{ fontWeight: 700, width: 180 }}>カテゴリ / エンジン</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>工場 / ユーザー</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700 }}>アクション</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {illustrations.map((illustration) => {
              const firstFile = illustration.first_file || (illustration.files && illustration.files.length > 0 ? illustration.files[0] : null);
              const previewUrl = firstFile?.preview_url || firstFile?.file;
              const fileType = firstFile ? (firstFile.file_type || 'image') : 'image';

              return (
                <TableRow
                  key={illustration.id}
                  hover
                  onClick={() => handleRowClick(illustration)}
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
                      {illustration.file_count > 0 && (
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
                          {illustration.file_count}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                        {illustration.title}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 300, noWrap: true, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {illustration.description || 'No description'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0.5} direction="column" alignItems="flex-start">
                      {illustration.part_category_name && (
                        <Chip
                          label={illustration.part_category_name}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                            color: 'warning.main',
                            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                            maxWidth: '100%'
                          }}
                        />
                      )}
                      {illustration.part_subcategory_name && (
                        <Chip
                          label={illustration.part_subcategory_name}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            color: 'secondary.main',
                            border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`,
                            maxWidth: '100%'
                          }}
                        />
                      )}
                      {illustration.engine_model_name && (
                        <Chip
                          label={illustration.engine_model_name}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            color: 'success.main',
                            border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                            maxWidth: '100%'
                          }}
                        />
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack spacing={0}>
                      <Typography variant="body2" fontWeight={600}>
                        {illustration.factory_name || '-'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {illustration.user_name || '-'}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                      <FavoriteButton illustration={illustration} />

                      <Tooltip title="ダウンロード">
                        <IconButton
                          size="small"
                          onClick={(e) => handleDownload(e, illustration)}
                          sx={{ color: 'success.main', bgcolor: alpha(theme.palette.success.main, 0.05) }}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="詳細表示">
                        <IconButton
                          size="small"
                          onClick={(e) => { e.stopPropagation(); handleRowClick(illustration); }}
                          sx={{ color: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) }}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>

                      {canModify(illustration) && (
                        <>
                          <Tooltip title="編集">
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); onEdit(illustration); }}
                              sx={{ color: 'info.main', bgcolor: alpha(theme.palette.info.main, 0.05) }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="削除">
                            <IconButton
                              size="small"
                              onClick={(e) => { e.stopPropagation(); onDelete(illustration.id); }}
                              sx={{ color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.05) }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  // Mobile/Small Screen Card View
  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto' }}>
      <Grid container spacing={2.5}>
        {illustrations.map((illustration, index) => (
          <Grid item xs={12} sm={6} key={illustration.id}>
            <Fade in timeout={150 + index * 50}>
              <Box>
                <IllustrationListCard
                  illustration={illustration}
                  onClick={() => handleRowClick(illustration)}
                  toggleFavorite={() => { }}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onDownload={handleDownload}
                />
              </Box>
            </Fade>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default IllustrationList;