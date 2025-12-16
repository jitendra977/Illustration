import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  Stack,
  Chip,
  Grid,
  Card,
  CardMedia,
  Paper,
  alpha,
  useTheme
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  ZoomIn as ZoomInIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Build as BuildIcon,
  DirectionsCar as CarIcon,
  Store as StoreIcon,
  Image as ImageIcon
} from '@mui/icons-material';

const IllustrationDetailModal = ({ open, onClose, illustration }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const theme = useTheme();

  if (!illustration) return null;

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const handleCloseImageViewer = () => {
    setSelectedImageIndex(null);
  };

  const handlePreviousImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (illustration.files && selectedImageIndex < illustration.files.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'download';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const InfoRow = ({ icon, label, value }) => (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box sx={{ 
        p: 1, 
        borderRadius: 1, 
        bgcolor: alpha(theme.palette.primary.main, 0.1),
        color: theme.palette.primary.main,
        display: 'flex',
        alignItems: 'center'
      }}>
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight="medium" noWrap>
          {value || 'N/A'}
        </Typography>
      </Box>
    </Stack>
  );

  return (
    <>
      {/* Main Detail Modal */}
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0, mr: 2 }}>
              <Typography variant="h5" fontWeight="bold" noWrap>
                {illustration.title || 'Untitled Illustration'}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip 
                  icon={<ImageIcon />}
                  label={`${illustration.files?.length || 0} files`}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
                {illustration.id && (
                  <Typography variant="caption" color="text.secondary">
                    ID: {illustration.id}
                  </Typography>
                )}
              </Stack>
            </Stack>
            <IconButton onClick={onClose} edge="end">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Left Column - Images */}
            <Grid item xs={12} md={7}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 2, 
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Files & Images ({illustration.files?.length || 0})
                </Typography>
                
                {illustration.files && illustration.files.length > 0 ? (
                  <Grid container spacing={2}>
                    {illustration.files.map((file, index) => (
                      <Grid item xs={6} sm={4} key={file.id || index}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: theme.shadows[8]
                            }
                          }}
                          onClick={() => handleImageClick(index)}
                        >
                          <Box sx={{ position: 'relative' }}>
                            <CardMedia
                              component="img"
                              height="120"
                              image={file.file}
                              alt={`${illustration.title || 'Illustration'} - Image ${index + 1}`}
                              sx={{ 
                                bgcolor: 'grey.100',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <Box
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                bgcolor: 'rgba(0,0,0,0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: 0,
                                transition: 'opacity 0.3s ease',
                                '&:hover': {
                                  opacity: 1
                                }
                              }}
                            >
                              <ZoomInIcon sx={{ color: 'white', fontSize: 32 }} />
                            </Box>
                          </Box>
                          <Stack 
                            direction="row" 
                            justifyContent="space-between" 
                            alignItems="center"
                            sx={{ p: 1, bgcolor: 'grey.50' }}
                          >
                            <Typography variant="caption" noWrap sx={{ flex: 1 }}>
                              Image {index + 1}
                            </Typography>
                            <IconButton 
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(file.file, `${illustration.title || 'illustration'}_${index + 1}`);
                              }}
                            >
                              <DownloadIcon fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box 
                    sx={{ 
                      textAlign: 'center', 
                      py: 4,
                      color: 'text.secondary' 
                    }}
                  >
                    <ImageIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />
                    <Typography variant="body2">No files available</Typography>
                  </Box>
                )}
              </Paper>

              {/* Description Section */}
              {illustration.description && (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    mt: 2,
                    bgcolor: alpha(theme.palette.secondary.main, 0.03),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                    {illustration.description}
                  </Typography>
                </Paper>
              )}
            </Grid>

            {/* Right Column - Details */}
            <Grid item xs={12} md={5}>
              <Stack spacing={2}>
                {/* Basic Information */}
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2.5, 
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                    Information
                  </Typography>
                  <Stack spacing={2}>
                    <InfoRow
                      icon={<StoreIcon fontSize="small" />}
                      label="Manufacturer"
                      value={
                        illustration.car_model?.manufacturer?.name || 
                        illustration.manufacturer_name || 
                        illustration.engine_model?.car_model?.manufacturer?.name ||
                        null
                      }
                    />
                    <InfoRow
                      icon={<CarIcon fontSize="small" />}
                      label="Car Model"
                      value={
                        illustration.car_model?.name || 
                        illustration.car_model_name || 
                        illustration.engine_model?.car_model?.name ||
                        null
                      }
                    />
                    <InfoRow
                      icon={<BuildIcon fontSize="small" />}
                      label="Engine Model"
                      value={
                        illustration.engine_model?.name || 
                        illustration.engine_model_name || 
                        null
                      }
                    />
                    <InfoRow
                      icon={<CategoryIcon fontSize="small" />}
                      label="Part Category"
                      value={
                        illustration.part_category?.name || 
                        illustration.part_category_name || 
                        null
                      }
                    />
                  </Stack>
                </Paper>

                {/* Metadata */}
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2.5, 
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                    Metadata
                  </Typography>
                  <Stack spacing={2}>
                    <InfoRow
                      icon={<PersonIcon fontSize="small" />}
                      label="Created By"
                      value={illustration.user_name || illustration.user?.username || 'Unknown'}
                    />
                    <InfoRow
                      icon={<CalendarIcon fontSize="small" />}
                      label="Created At"
                      value={formatDate(illustration.created_at)}
                    />
                    {illustration.updated_at && illustration.updated_at !== illustration.created_at && (
                      <InfoRow
                        icon={<CalendarIcon fontSize="small" />}
                        label="Last Updated"
                        value={formatDate(illustration.updated_at)}
                      />
                    )}
                  </Stack>
                </Paper>

                {/* Download All Button */}
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  fullWidth
                  size="large"
                  onClick={() => {
                    if (illustration.files && illustration.files.length > 0) {
                      illustration.files.forEach((file, index) => {
                        setTimeout(() => {
                          handleDownload(file.file, `${illustration.title || 'illustration'}_${index + 1}`);
                        }, index * 500);
                      });
                    }
                  }}
                  disabled={!illustration.files || illustration.files.length === 0}
                >
                  Download All Files ({illustration.files?.length || 0})
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={onClose} variant="outlined">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Image Viewer Dialog (Lightbox) */}
      <Dialog
        open={selectedImageIndex !== null}
        onClose={handleCloseImageViewer}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.95)',
            borderRadius: 0,
            m: 0,
            maxHeight: '100vh',
            height: '100vh'
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Close Button */}
          <IconButton
            onClick={handleCloseImageViewer}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.2)'
              },
              zIndex: 2
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Image Counter */}
          <Paper
            sx={{
              position: 'absolute',
              top: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              px: 2,
              py: 1,
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              zIndex: 2
            }}
          >
            <Typography variant="body2" color="white">
              {selectedImageIndex !== null ? selectedImageIndex + 1 : 0} / {illustration.files?.length || 0}
            </Typography>
          </Paper>

          {/* Download Button */}
          {selectedImageIndex !== null && illustration.files?.[selectedImageIndex] && (
            <IconButton
              onClick={() => {
                const file = illustration.files[selectedImageIndex];
                handleDownload(file.file, `${illustration.title || 'illustration'}_${selectedImageIndex + 1}`);
              }}
              sx={{
                position: 'absolute',
                top: 16,
                left: 16,
                color: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)'
                },
                zIndex: 2
              }}
            >
              <DownloadIcon />
            </IconButton>
          )}

          {/* Previous Button */}
          {selectedImageIndex !== null && selectedImageIndex > 0 && (
            <IconButton
              onClick={handlePreviousImage}
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)'
                },
                zIndex: 2
              }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}

        

          {/* Main Image */}
          {selectedImageIndex !== null && illustration.files?.[selectedImageIndex] && (
            <Box
              component="img"
              src={illustration.files[selectedImageIndex].file}
              alt={`${illustration.title || 'Illustration'} - Image ${selectedImageIndex + 1}`}
              sx={{
                maxWidth: '95%',
                maxHeight: '95%',
                objectFit: 'contain',
                userSelect: 'none'
              }}
              onError={(e) => {
                console.error('Failed to load image:', e);
              }}
            />
          )}

          {/* Thumbnail Strip */}
          {illustration.files && illustration.files.length > 1 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 1,
                p: 1,
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                borderRadius: 2,
                maxWidth: '90%',
                overflowX: 'auto',
                '&::-webkit-scrollbar': {
                  height: 6
                },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                  borderRadius: 3
                }
              }}
            >
              {illustration.files.map((file, index) => (
                <Box
                  key={file.id || index}
                  component="img"
                  src={file.file}
                  alt={`Thumbnail ${index + 1}`}
                  onClick={() => setSelectedImageIndex(index)}
                  sx={{
                    width: 60,
                    height: 60,
                    objectFit: 'cover',
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: selectedImageIndex === index 
                      ? '2px solid white' 
                      : '2px solid transparent',
                    opacity: selectedImageIndex === index ? 1 : 0.6,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      opacity: 1,
                      transform: 'scale(1.1)'
                    }
                  }}
                  onError={(e) => {
                    e.target.style.opacity = '0.3';
                  }}
                />
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IllustrationDetailModal;