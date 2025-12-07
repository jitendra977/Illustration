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
  useTheme,
  useMediaQuery
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

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
    if (selectedImageIndex < illustration.files.length - 1) {
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
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: isMobile ? 'short' : 'long',
      day: 'numeric',
      ...(!isMobile && { hour: '2-digit', minute: '2-digit' })
    });
  };

  const InfoRow = ({ icon, label, value }) => (
    <Stack direction="row" spacing={isMobile ? 1.5 : 2} alignItems="center">
      <Box sx={{ 
        p: isMobile ? 0.75 : 1,
        borderRadius: 1, 
        bgcolor: alpha(theme.palette.primary.main, 0.1),
        color: theme.palette.primary.main,
        display: 'flex',
        alignItems: 'center',
        minWidth: isMobile ? 32 : 36,
        minHeight: isMobile ? 32 : 36,
        justifyContent: 'center'
      }}>
        {React.cloneElement(icon, { sx: { fontSize: isMobile ? 18 : 20 } })}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
          {label}
        </Typography>
        <Typography 
          variant="body2" 
          fontWeight="medium" 
          sx={{ 
            fontSize: isMobile ? '0.875rem' : '0.875rem',
            wordBreak: 'break-word'
          }}
        >
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
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            maxHeight: isMobile ? '100vh' : '90vh',
            m: isMobile ? 0 : 2
          }
        }}
      >
        <DialogTitle sx={{ p: isMobile ? 2 : 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Stack spacing={0.5} sx={{ flex: 1, pr: 1 }}>
              <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight="bold">
                {illustration.title}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                <Chip 
                  icon={<ImageIcon />}
                  label={`${illustration.files?.length || 0} files`}
                  size="small"
                  variant="outlined"
                  color="primary"
                  sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
                  ID: {illustration.id}
                </Typography>
              </Stack>
            </Stack>
            <IconButton onClick={onClose} sx={{ mt: -1 }}>
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ p: isMobile ? 2 : 3 }}>
          <Grid container spacing={isMobile ? 2 : 3}>
            {/* Images Section */}
            <Grid item xs={12} md={7}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: isMobile ? 1.5 : 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                <Typography variant={isMobile ? 'body2' : 'subtitle1'} fontWeight="bold" gutterBottom sx={{ px: isMobile ? 0.5 : 0 }}>
                  Files & Images ({illustration.files?.length || 0})
                </Typography>
                
                {illustration.files && illustration.files.length > 0 ? (
                  <Grid container spacing={isMobile ? 1.5 : 2}>
                    {illustration.files.map((file, index) => (
                      <Grid item xs={6} sm={4} key={file.id || index}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:active': {
                              transform: 'scale(0.98)'
                            },
                            ...(!isMobile && {
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: theme.shadows[8]
                              }
                            })
                          }}
                          onClick={() => handleImageClick(index)}
                        >
                          <Box sx={{ position: 'relative' }}>
                            <CardMedia
                              component="img"
                              height={isMobile ? 100 : 120}
                              image={file.file}
                              alt={`${illustration.title} - Image ${index + 1}`}
                              sx={{ 
                                bgcolor: 'grey.100',
                                objectFit: 'cover'
                              }}
                            />
                            {!isMobile && (
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
                            )}
                          </Box>
                          <Stack 
                            direction="row" 
                            justifyContent="space-between" 
                            alignItems="center"
                            sx={{ p: isMobile ? 0.75 : 1, bgcolor: 'grey.50' }}
                          >
                            <Typography variant="caption" noWrap sx={{ flex: 1, fontSize: isMobile ? '0.7rem' : '0.75rem' }}>
                              Image {index + 1}
                            </Typography>
                            <IconButton 
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(file.file, `${illustration.title}_${index + 1}`);
                              }}
                              sx={{ p: isMobile ? 0.5 : 0.75 }}
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
                      py: isMobile ? 3 : 4,
                      color: 'text.secondary' 
                    }}
                  >
                    <ImageIcon sx={{ fontSize: isMobile ? 40 : 48, mb: 1 }} />
                    <Typography variant="body2">No files available</Typography>
                  </Box>
                )}
              </Paper>

              {/* Description Section */}
              {illustration.description && (
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: isMobile ? 1.5 : 2,
                    mt: 2,
                    bgcolor: alpha(theme.palette.secondary.main, 0.03),
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`
                  }}
                >
                  <Typography variant={isMobile ? 'body2' : 'subtitle1'} fontWeight="bold" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: isMobile ? '0.875rem' : '0.875rem' }}>
                    {illustration.description}
                  </Typography>
                </Paper>
              )}
            </Grid>

            {/* Details Section */}
            <Grid item xs={12} md={5}>
              <Stack spacing={2}>
                {/* Basic Information */}
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: isMobile ? 1.5 : 2.5,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Typography variant={isMobile ? 'body2' : 'subtitle1'} fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                    Information
                  </Typography>
                  <Stack spacing={isMobile ? 1.5 : 2}>
                    <InfoRow
                      icon={<StoreIcon />}
                      label="Manufacturer"
                      value={
                        illustration.car_model?.manufacturer?.name || 
                        illustration.manufacturer_name || 
                        illustration.engine_model?.car_model?.manufacturer?.name ||
                        'N/A'
                      }
                    />
                    <InfoRow
                      icon={<CarIcon />}
                      label="Car Model"
                      value={
                        illustration.car_model?.name || 
                        illustration.car_model_name || 
                        illustration.engine_model?.car_model?.name ||
                        'N/A'
                      }
                    />
                    <InfoRow
                      icon={<BuildIcon />}
                      label="Engine Model"
                      value={
                        illustration.engine_model?.name || 
                        illustration.engine_model_name || 
                        'N/A'
                      }
                    />
                    <InfoRow
                      icon={<CategoryIcon />}
                      label="Part Category"
                      value={
                        illustration.part_category?.name || 
                        illustration.part_category_name || 
                        'N/A'
                      }
                    />
                  </Stack>
                </Paper>

                {/* Metadata */}
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: isMobile ? 1.5 : 2.5,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Typography variant={isMobile ? 'body2' : 'subtitle1'} fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                    Metadata
                  </Typography>
                  <Stack spacing={isMobile ? 1.5 : 2}>
                    <InfoRow
                      icon={<PersonIcon />}
                      label="Created By"
                      value={illustration.user_name || illustration.user?.username || 'Unknown'}
                    />
                    <InfoRow
                      icon={<CalendarIcon />}
                      label="Created At"
                      value={formatDate(illustration.created_at)}
                    />
                    {illustration.updated_at && illustration.updated_at !== illustration.created_at && (
                      <InfoRow
                        icon={<CalendarIcon />}
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
                  size={isMobile ? 'medium' : 'large'}
                  onClick={() => {
                    illustration.files?.forEach((file, index) => {
                      setTimeout(() => {
                        handleDownload(file.file, `${illustration.title}_${index + 1}`);
                      }, index * 500);
                    });
                  }}
                  disabled={!illustration.files || illustration.files.length === 0}
                  sx={{ 
                    py: isMobile ? 1.25 : 1.5,
                    fontSize: isMobile ? '0.875rem' : '1rem'
                  }}
                >
                  Download All Files
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </DialogContent>

        {!isMobile && (
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={onClose}>Close</Button>
          </DialogActions>
        )}
      </Dialog>

      {/* Image Viewer Dialog (Lightbox) */}
      <Dialog
        open={selectedImageIndex !== null}
        onClose={handleCloseImageViewer}
        maxWidth="xl"
        fullWidth
        fullScreen
        PaperProps={{
          sx: {
            bgcolor: 'rgba(0, 0, 0, 0.95)',
            borderRadius: 0,
            m: 0
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Close Button */}
          <IconButton
            onClick={handleCloseImageViewer}
            sx={{
              position: 'absolute',
              top: isMobile ? 8 : 16,
              right: isMobile ? 8 : 16,
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.2)'
              },
              '&:active': {
                bgcolor: 'rgba(255, 255, 255, 0.3)'
              },
              zIndex: 2,
              width: isMobile ? 44 : 48,
              height: isMobile ? 44 : 48
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Image Counter */}
          <Paper
            sx={{
              position: 'absolute',
              top: isMobile ? 8 : 16,
              left: '50%',
              transform: 'translateX(-50%)',
              px: isMobile ? 1.5 : 2,
              py: isMobile ? 0.75 : 1,
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              zIndex: 2
            }}
          >
            <Typography variant="body2" color="white" sx={{ fontSize: isMobile ? '0.875rem' : '1rem' }}>
              {selectedImageIndex + 1} / {illustration.files?.length || 0}
            </Typography>
          </Paper>

          {/* Download Button */}
          <IconButton
            onClick={() => {
              const file = illustration.files[selectedImageIndex];
              handleDownload(file.file, `${illustration.title}_${selectedImageIndex + 1}`);
            }}
            sx={{
              position: 'absolute',
              top: isMobile ? 8 : 16,
              left: isMobile ? 8 : 16,
              color: 'white',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.2)'
              },
              '&:active': {
                bgcolor: 'rgba(255, 255, 255, 0.3)'
              },
              zIndex: 2,
              width: isMobile ? 44 : 48,
              height: isMobile ? 44 : 48
            }}
          >
            <DownloadIcon />
          </IconButton>

          {/* Previous Button */}
          {selectedImageIndex > 0 && (
            <IconButton
              onClick={handlePreviousImage}
              sx={{
                position: 'absolute',
                left: isMobile ? 8 : 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)'
                },
                '&:active': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)'
                },
                zIndex: 2,
                width: isMobile ? 48 : 56,
                height: isMobile ? 48 : 56
              }}
            >
              <ArrowBackIcon sx={{ fontSize: isMobile ? 28 : 32 }} />
            </IconButton>
          )}

          {/* Next Button */}
          {selectedImageIndex < illustration.files.length - 1 && (
            <IconButton
              onClick={handleNextImage}
              sx={{
                position: 'absolute',
                right: isMobile ? 8 : 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.2)'
                },
                '&:active': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)'
                },
                zIndex: 2,
                width: isMobile ? 48 : 56,
                height: isMobile ? 48 : 56
              }}
            >
              <ArrowForwardIcon sx={{ fontSize: isMobile ? 28 : 32 }} />
            </IconButton>
          )}

          {/* Main Image */}
          {selectedImageIndex !== null && illustration.files?.[selectedImageIndex] && (
            <Box
              component="img"
              src={illustration.files[selectedImageIndex].file}
              alt={`${illustration.title} - Image ${selectedImageIndex + 1}`}
              sx={{
                maxWidth: isMobile ? '100%' : '95%',
                maxHeight: isMobile ? '100%' : '95%',
                objectFit: 'contain',
                userSelect: 'none',
                touchAction: 'pan-x pan-y pinch-zoom'
              }}
            />
          )}

          {/* Thumbnail Strip */}
          <Box
            sx={{
              position: 'absolute',
              bottom: isMobile ? 8 : 16,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: isMobile ? 0.75 : 1,
              p: isMobile ? 0.75 : 1,
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              maxWidth: isMobile ? '95%' : '90%',
              overflowX: 'auto',
              '&::-webkit-scrollbar': {
                height: isMobile ? 4 : 6
              },
              '&::-webkit-scrollbar-thumb': {
                bgcolor: 'rgba(255, 255, 255, 0.3)',
                borderRadius: 3
              }
            }}
          >
            {illustration.files?.map((file, index) => (
              <Box
                key={file.id || index}
                component="img"
                src={file.file}
                alt={`Thumbnail ${index + 1}`}
                onClick={() => setSelectedImageIndex(index)}
                sx={{
                  width: isMobile ? 50 : 60,
                  height: isMobile ? 50 : 60,
                  objectFit: 'cover',
                  borderRadius: 1,
                  cursor: 'pointer',
                  border: selectedImageIndex === index 
                    ? '2px solid white' 
                    : '2px solid transparent',
                  opacity: selectedImageIndex === index ? 1 : 0.6,
                  transition: 'all 0.2s ease',
                  flexShrink: 0,
                  '&:hover': {
                    opacity: 1
                  },
                  '&:active': {
                    transform: 'scale(0.95)'
                  }
                }}
              />
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default IllustrationDetailModal;