// src/components/common/IllustrationDetailModal.jsx - Fixed for Backend
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Chip,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  ImageList,
  ImageListItem,
  Avatar,
  Paper,
  Fade,
  Zoom,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudDownload as DownloadIcon,
  Share as ShareIcon,
  ChevronLeft as PrevIcon,
  ChevronRight as NextIcon,
  Engineering as EngineeringIcon,
  Category as CategoryIcon,
  DirectionsCar as CarIcon,
  Person as PersonIcon,
  AccessTime as TimeIcon,
  Update as UpdateIcon,
  Info as InfoIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { illustrationAPI } from '../../api/illustrations';

const IllustrationDetailModal = ({
  open,
  onClose,
  illustration,
  onUpdate,
  onDelete,
  onEdit,
}) => {
  const theme = useTheme();
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const files = illustration?.files || [];
  const currentFile = files[currentFileIndex];

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setCurrentFileIndex(0);
      setImageLoaded(false);
      setDeleteConfirm(false);
      setError(null);
    }
  }, [open]);

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      setTimeout(() => setDeleteConfirm(false), 5000);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await illustrationAPI.delete(illustration.id);
      onDelete(illustration.id);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || '削除に失敗しました');
    } finally {
      setLoading(false);
      setDeleteConfirm(false);
    }
  };

  const handleDownload = () => {
    if (currentFile) {
      window.open(currentFile.file, '_blank');
    }
  };

  const handleShare = async () => {
    if (navigator.share && currentFile) {
      try {
        await navigator.share({
          title: illustration.title,
          text: illustration.description,
          url: currentFile.file,
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    }
  };

  const handlePrevFile = () => {
    setImageLoaded(false);
    setCurrentFileIndex(prev => (prev > 0 ? prev - 1 : files.length - 1));
  };

  const handleNextFile = () => {
    setImageLoaded(false);
    setCurrentFileIndex(prev => (prev < files.length - 1 ? prev + 1 : 0));
  };

  // Get car model names from applicable_car_models_detail
  const getCarModelNames = () => {
    if (!illustration?.applicable_car_models_detail) return [];
    return illustration.applicable_car_models_detail.map(car => car.name);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen
      TransitionComponent={Fade}
      PaperProps={{
        sx: { 
          bgcolor: theme.palette.background.default,
        }
      }}
    >
      {/* Header - Enhanced */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          backdropFilter: 'blur(10px)',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          position: 'sticky',
          top: 0,
          zIndex: 1,
        }}
      >
        <Box sx={{ flex: 1, mr: 2 }}>
          <Typography variant="h6" fontWeight="bold" noWrap>
            {illustration?.title}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
            <Avatar sx={{ width: 20, height: 20, bgcolor: theme.palette.primary.main }}>
              <PersonIcon sx={{ fontSize: 14 }} />
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              {illustration?.user_name || '不明'}
            </Typography>
            <Typography variant="caption" color="text.disabled">•</Typography>
            <Typography variant="caption" color="text.secondary">
              {illustration?.created_at && new Date(illustration.created_at).toLocaleDateString('ja-JP')}
            </Typography>
          </Stack>
        </Box>
        <IconButton 
          edge="end" 
          onClick={onClose}
          sx={{
            bgcolor: alpha(theme.palette.background.paper, 0.8),
            '&:hover': {
              bgcolor: theme.palette.background.paper,
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent sx={{ p: 0 }}>
        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError(null)} 
            sx={{ 
              m: 2, 
              borderRadius: 3,
            }}
            variant="filled"
          >
            {error}
          </Alert>
        )}

        {/* Image Viewer - Enhanced */}
        <Box 
          sx={{ 
            position: 'relative', 
            bgcolor: 'black',
            minHeight: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {currentFile && (
            <>
              <Fade in={imageLoaded || currentFile.file_type !== 'image'} timeout={500}>
                <Box sx={{ width: '100%' }}>
                  {currentFile.file_type === 'image' ? (
                    <img
                      src={currentFile.file}
                      alt={illustration?.title}
                      onLoad={() => setImageLoaded(true)}
                      style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: '60vh',
                        objectFit: 'contain',
                        display: imageLoaded ? 'block' : 'none',
                      }}
                    />
                  ) : (
                    <Paper
                      elevation={3}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: 300,
                        m: 2,
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.background.paper, 0.9),
                      }}
                    >
                      <PdfIcon sx={{ fontSize: 80, color: theme.palette.error.main, mb: 2 }} />
                      <Typography variant="h6" color="text.primary">
                        PDF ドキュメント
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={handleDownload}
                        sx={{ mt: 2, borderRadius: 2 }}
                      >
                        ダウンロードして表示
                      </Button>
                    </Paper>
                  )}
                </Box>
              </Fade>

              {!imageLoaded && currentFile.file_type === 'image' && (
                <CircularProgress 
                  sx={{ 
                    position: 'absolute',
                    color: theme.palette.primary.main,
                  }} 
                />
              )}

              {/* Navigation Buttons - Enhanced */}
              {files.length > 1 && (
                <>
                  <Zoom in timeout={300}>
                    <IconButton
                      sx={{
                        position: 'absolute',
                        left: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: alpha(theme.palette.background.paper, 0.9),
                        backdropFilter: 'blur(10px)',
                        color: theme.palette.text.primary,
                        width: 48,
                        height: 48,
                        '&:hover': { 
                          bgcolor: theme.palette.background.paper,
                          transform: 'translateY(-50%) scale(1.1)',
                        },
                        transition: 'all 0.2s',
                      }}
                      onClick={handlePrevFile}
                    >
                      <PrevIcon />
                    </IconButton>
                  </Zoom>
                  <Zoom in timeout={300}>
                    <IconButton
                      sx={{
                        position: 'absolute',
                        right: 16,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        bgcolor: alpha(theme.palette.background.paper, 0.9),
                        backdropFilter: 'blur(10px)',
                        color: theme.palette.text.primary,
                        width: 48,
                        height: 48,
                        '&:hover': { 
                          bgcolor: theme.palette.background.paper,
                          transform: 'translateY(-50%) scale(1.1)',
                        },
                        transition: 'all 0.2s',
                      }}
                      onClick={handleNextFile}
                    >
                      <NextIcon />
                    </IconButton>
                  </Zoom>

                  {/* File Counter - Enhanced */}
                  <Chip
                    icon={<ImageIcon sx={{ fontSize: 16 }} />}
                    label={`${currentFileIndex + 1} / ${files.length}`}
                    sx={{
                      position: 'absolute',
                      bottom: 24,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      bgcolor: alpha(theme.palette.background.paper, 0.9),
                      backdropFilter: 'blur(10px)',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      height: 32,
                    }}
                  />
                </>
              )}
            </>
          )}
        </Box>

        {/* Thumbnail Strip - Enhanced */}
        {files.length > 1 && (
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: alpha(theme.palette.background.paper, 0.5),
              backdropFilter: 'blur(10px)',
            }}
          >
            <ImageList cols={5} gap={12}>
              {files.map((file, index) => (
                <Zoom in timeout={200 + index * 50} key={file.id}>
                  <ImageListItem
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 2,
                      overflow: 'hidden',
                      transition: 'all 0.3s',
                      opacity: index === currentFileIndex ? 1 : 0.5,
                      border: index === currentFileIndex ? 3 : 1,
                      borderColor: index === currentFileIndex 
                        ? theme.palette.primary.main 
                        : alpha(theme.palette.divider, 0.2),
                      transform: index === currentFileIndex ? 'scale(1.1)' : 'scale(1)',
                      '&:hover': {
                        opacity: 1,
                        transform: 'scale(1.05)',
                      }
                    }}
                    onClick={() => {
                      setImageLoaded(false);
                      setCurrentFileIndex(index);
                    }}
                  >
                    {file.file_type === 'image' ? (
                      <img
                        src={file.file}
                        alt={`thumbnail-${index}`}
                        style={{ height: 70, objectFit: 'cover' }}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 70,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: theme.palette.error.light,
                        }}
                      >
                        <PdfIcon sx={{ color: 'white' }} />
                      </Box>
                    )}
                  </ImageListItem>
                </Zoom>
              ))}
            </ImageList>
          </Box>
        )}

        <Divider />

        {/* Details Section - Enhanced */}
        <Box sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Description */}
            {illustration?.description && (
              <Fade in timeout={500}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2.5, 
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.info.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <InfoIcon sx={{ fontSize: 20, color: theme.palette.info.main }} />
                    <Typography variant="subtitle2" fontWeight="bold" color="info.main">
                      説明
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {illustration.description}
                  </Typography>
                </Paper>
              </Fade>
            )}

            {/* Engine Model */}
            <Fade in timeout={600}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2.5, 
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                  <EngineeringIcon sx={{ fontSize: 20, color: theme.palette.primary.main }} />
                  <Typography variant="subtitle2" fontWeight="bold" color="primary">
                    エンジンモデル
                  </Typography>
                </Stack>
                <Chip
                  label={illustration?.engine_model_detail?.name || illustration?.engine_model_name || '不明'}
                  color="primary"
                  sx={{ 
                    borderRadius: 2,
                    fontWeight: 'bold',
                    height: 36,
                  }}
                />
                {illustration?.engine_model_detail?.manufacturer && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    ({illustration.engine_model_detail.manufacturer.name})
                  </Typography>
                )}
              </Paper>
            </Fade>

            {/* Category */}
            <Fade in timeout={700}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2.5, 
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.secondary.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                  <CategoryIcon sx={{ fontSize: 20, color: theme.palette.secondary.main }} />
                  <Typography variant="subtitle2" fontWeight="bold" color="secondary">
                    カテゴリ
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                  <Chip
                    label={illustration?.part_category_detail?.name || illustration?.part_category_name || '不明'}
                    color="secondary"
                    variant="outlined"
                    sx={{ borderRadius: 2, height: 32 }}
                  />
                  {(illustration?.part_subcategory_detail?.name || illustration?.part_subcategory_name) && (
                    <Chip
                      label={illustration?.part_subcategory_detail?.name || illustration?.part_subcategory_name}
                      color="secondary"
                      variant="outlined"
                      sx={{ borderRadius: 2, height: 32 }}
                    />
                  )}
                </Stack>
              </Paper>
            </Fade>

            {/* Applicable Car Models */}
            {getCarModelNames().length > 0 && (
              <Fade in timeout={800}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 2.5, 
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.success.main, 0.05),
                    border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                    <CarIcon sx={{ fontSize: 20, color: theme.palette.success.main }} />
                    <Typography variant="subtitle2" fontWeight="bold" color="success.main">
                      適用車種
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                    {getCarModelNames().map((carName, idx) => (
                      <Chip
                        key={`car-${idx}`}
                        label={carName}
                        variant="outlined"
                        color="success"
                        sx={{ borderRadius: 2, height: 32 }}
                      />
                    ))}
                  </Stack>
                </Paper>
              </Fade>
            )}

            {/* Metadata */}
            <Fade in timeout={900}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 2.5, 
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.grey[500], 0.05),
                  border: `1px solid ${alpha(theme.palette.grey[500], 0.1)}`,
                }}
              >
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <PersonIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.disabled">
                        作成者
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {illustration?.user_name || illustration?.user_email || '不明'}
                      </Typography>
                    </Box>
                  </Stack>
                  <Divider />
                  <Stack direction="row" spacing={2} alignItems="center">
                    <TimeIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.disabled">
                        作成日
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {illustration?.created_at && new Date(illustration.created_at).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                  </Stack>
                  <Divider />
                  <Stack direction="row" spacing={2} alignItems="center">
                    <UpdateIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.disabled">
                        最終更新
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {illustration?.updated_at && new Date(illustration.updated_at).toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                  </Stack>
                  <Divider />
                  <Stack direction="row" spacing={2} alignItems="center">
                    <ImageIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    <Box>
                      <Typography variant="caption" color="text.disabled">
                        ファイル数
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {files.length} 個
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Paper>
            </Fade>
          </Stack>
        </Box>
      </DialogContent>

      {/* Actions - Enhanced */}
      <DialogActions 
        sx={{ 
          p: 2, 
          gap: 1,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          position: 'sticky',
          bottom: 0,
        }}
      >
        <Button
          variant="outlined"
          startIcon={<ShareIcon />}
          onClick={handleShare}
          disabled={loading}
          sx={{ borderRadius: 2, flex: 1 }}
        >
          シェア
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          disabled={loading || !currentFile}
          sx={{ borderRadius: 2, flex: 1 }}
        >
          保存
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={onEdit}
          disabled={loading}
          sx={{ 
            borderRadius: 2, 
            flex: 1,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          }}
        >
          編集
        </Button>
        <IconButton
          onClick={handleDelete}
          disabled={loading}
          color={deleteConfirm ? 'error' : 'default'}
          sx={{
            bgcolor: deleteConfirm ? alpha(theme.palette.error.main, 0.1) : 'transparent',
            '&:hover': {
              bgcolor: alpha(theme.palette.error.main, 0.2),
            }
          }}
        >
          {loading ? <CircularProgress size={24} /> : <DeleteIcon />}
        </IconButton>
      </DialogActions>

      {/* Delete Confirmation - Enhanced */}
      {deleteConfirm && (
        <Fade in>
          <Alert 
            severity="error" 
            sx={{ 
              m: 2,
              borderRadius: 3,
            }}
            variant="filled"
            action={
              <Stack direction="row" spacing={1}>
                <Button 
                  size="small" 
                  onClick={() => setDeleteConfirm(false)}
                  sx={{ color: 'white' }}
                >
                  キャンセル
                </Button>
                <Button 
                  size="small" 
                  onClick={handleDelete}
                  variant="outlined"
                  sx={{ 
                    color: 'white', 
                    borderColor: 'white',
                    fontWeight: 'bold',
                  }}
                >
                  削除する
                </Button>
              </Stack>
            }
          >
            <Typography variant="body2" fontWeight="bold">
              本当に削除しますか？
            </Typography>
            <Typography variant="caption">
              この操作は取り消せません (5秒後に自動的にキャンセル)
            </Typography>
          </Alert>
        </Fade>
      )}
    </Dialog>
  );
};

export default IllustrationDetailModal;