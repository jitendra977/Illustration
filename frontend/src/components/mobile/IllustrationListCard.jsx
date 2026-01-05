import React from 'react';
import { Card, Box, Typography, IconButton, Stack, alpha, useTheme, Avatar } from '@mui/material';
import { Favorite as FavIcon, FavoriteBorder as FavBorderIcon, Image as ImageIcon, PictureAsPdf as PdfIcon, InsertDriveFile as FileIcon } from '@mui/icons-material';

const IllustrationListCard = ({ illustration, toggleFavorite, favorites = [], onClick }) => {
  const theme = useTheme();
  const isFav = favorites.includes(illustration.id);

  // Determine thumbnail
  let Thumbnail = null;
  const firstFile = illustration.first_file;

  if (firstFile) {
    if (firstFile.file_type === 'image') {
      const previewUrl = firstFile.preview_url || firstFile.file;
      Thumbnail = (
        <Box
          component="img"
          src={previewUrl}
          alt={illustration.title}
          sx={{
            width: 80,
            height: 80,
            objectFit: 'cover',
            borderRadius: 1.5,
            bgcolor: 'grey.100'
          }}
        />
      );
    } else if (firstFile.file_type === 'pdf') {
      Thumbnail = (
        <Avatar variant="rounded" sx={{ width: 80, height: 80, bgcolor: alpha('#f44336', 0.1), color: '#f44336' }}>
          <PdfIcon sx={{ fontSize: 32 }} />
        </Avatar>
      );
    } else {
      Thumbnail = (
        <Avatar variant="rounded" sx={{ width: 80, height: 80, bgcolor: 'action.hover', color: 'text.secondary' }}>
          <FileIcon sx={{ fontSize: 32 }} />
        </Avatar>
      );
    }
  } else {
    Thumbnail = (
      <Avatar variant="rounded" sx={{ width: 80, height: 80, bgcolor: 'action.hover', color: 'text.secondary' }}>
        <ImageIcon sx={{ fontSize: 32 }} />
      </Avatar>
    );
  }

  return (
    <Card
      onClick={onClick}
      sx={{
        p: 1.5,
        borderRadius: 2.5,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        '&:hover': {
          bgcolor: alpha(theme.palette.primary.main, 0.03),
          borderColor: 'primary.main',
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[2]
        }
      }}
    >
      {/* Thumbnail Section */}
      <Box sx={{ flexShrink: 0 }}>
        {Thumbnail}
      </Box>

      {/* Content Section */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ pr: 1 }}>
            {/* Metadata Chips (Top) */}
            <Stack direction="row" spacing={0.5} mb={0.5} flexWrap="wrap">
              {illustration.part_subcategory_name && (
                <Typography variant="caption" color="secondary.main" fontWeight={700} sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.08), px: 0.8, py: 0, borderRadius: 0.5 }}>
                  {illustration.part_subcategory_name}
                </Typography>
              )}
              {illustration.file_count > 1 && (
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ bgcolor: 'action.hover', px: 0.8, py: 0, borderRadius: 0.5 }}>
                  +{illustration.file_count - 1}枚
                </Typography>
              )}
            </Stack>

            <Typography variant="subtitle1" fontWeight={700} lineHeight={1.3} noWrap sx={{ mb: 0.5 }}>
              {illustration.title}
            </Typography>

            <Typography variant="caption" color="text.secondary" sx={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4,
              minHeight: '2.8em' // Reserve space for 2 lines usually
            }}>
              {illustration.description || 'No description'}
            </Typography>
          </Box>

          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); toggleFavorite(illustration.id, e); }}
            sx={{
              mt: -0.5,
              mr: -0.5,
              color: isFav ? 'error.main' : 'text.disabled',
              '&:hover': { color: 'error.main' }
            }}
          >
            {isFav ? <FavIcon fontSize="small" /> : <FavBorderIcon fontSize="small" />}
          </IconButton>
        </Stack>

        {/* Footer Info */}
        <Stack direction="row" spacing={1} alignItems="center" mt={1}>
          <Typography variant="caption" color="text.disabled">
            {new Date(illustration.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })}
          </Typography>
          {illustration.user_name && (
            <>
              <Typography variant="caption" color="text.disabled">•</Typography>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                {illustration.user_name}
              </Typography>
            </>
          )}
        </Stack>
      </Box>
    </Card>
  );
};

export default IllustrationListCard;