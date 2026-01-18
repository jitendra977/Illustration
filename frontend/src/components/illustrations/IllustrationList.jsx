import React from 'react';
import {
  Box,
  Typography,
  Stack,
  useTheme,
  alpha,
  Grid,
  Fade
} from '@mui/material';
import {
  Image as ImageIcon
} from '@mui/icons-material';
import IllustrationListCard from '../mobile/IllustrationListCard';

const IllustrationList = ({ illustrations, onDelete, onView, onEdit }) => {
  const theme = useTheme();

  const handleRowClick = (illustration) => {
    if (onView) {
      onView(illustration);
    }
  };

  const handleDownload = (e, illustration) => {
    e.stopPropagation();
    // Use the getImageUrl logic or similar
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

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Grid container spacing={2}>
        {illustrations.map((illustration, index) => (
          <Grid item xs={12} key={illustration.id}>
            <Fade in timeout={150 + index * 50}>
              <Box>
                <IllustrationListCard
                  illustration={illustration}
                  onClick={() => handleRowClick(illustration)}
                  toggleFavorite={() => { }} // FavoriteButton handles itself or through state
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