import React from 'react';
import { Box, Typography, IconButton, Stack, alpha, useTheme } from '@mui/material';
import { Heart, Image as ImageIcon, FileText, File } from 'lucide-react';

const IllustrationListCard = ({ illustration, toggleFavorite, favorites = [], onClick }) => {
  const theme = useTheme();
  const zinc = theme.palette.zinc;
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
            borderRadius: 2,
            bgcolor: 'zinc.900',
            border: `1px solid ${alpha(theme.palette.common.white, 0.05)}`
          }}
        />
      );
    } else if (firstFile.file_type === 'pdf') {
      Thumbnail = (
        <Box sx={{
          width: 80,
          height: 80,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.error.main, 0.1),
          border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'error.main'
        }}>
          <FileText size={32} />
        </Box>
      );
    } else {
      Thumbnail = (
        <Box sx={{
          width: 80,
          height: 80,
          borderRadius: 2,
          bgcolor: alpha(theme.palette.zinc[800], 0.5),
          border: `1px solid ${alpha(theme.palette.common.white, 0.05)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'zinc.400'
        }}>
          <File size={32} />
        </Box>
      );
    }
  } else {
    Thumbnail = (
      <Box sx={{
        width: 80,
        height: 80,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.zinc[800], 0.5),
        border: `1px solid ${alpha(theme.palette.common.white, 0.05)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'zinc.400'
      }}>
        <ImageIcon size={32} />
      </Box>
    );
  }

  return (
    <Box
      onClick={onClick}
      sx={{
        p: 1.5,
        borderRadius: 2.5,
        bgcolor: alpha(theme.palette.zinc[900], 0.4),
        border: `1px solid ${alpha(theme.palette.common.white, 0.05)}`,
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        cursor: 'pointer',
        '&:hover': {
          bgcolor: alpha(theme.palette.zinc[900], 0.6),
          borderColor: alpha(theme.palette.primary.main, 0.5),
          transform: 'translateY(-2px)',
          boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.3)}`
        },
        '&:active': {
          transform: 'translateY(0)',
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
          <Box sx={{ pr: 1, flex: 1 }}>
            {/* Metadata Chips (Top) */}
            <Stack direction="row" spacing={0.5} mb={0.5} flexWrap="wrap">
              {illustration.part_subcategory_name && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'primary.light',
                    fontWeight: 700,
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                    px: 0.8,
                    py: 0.25,
                    borderRadius: 1,
                    fontSize: '10px'
                  }}
                >
                  {illustration.part_subcategory_name}
                </Typography>
              )}
              {illustration.file_count > 1 && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'zinc.300',
                    fontWeight: 600,
                    bgcolor: alpha(theme.palette.zinc[800], 0.5),
                    px: 0.8,
                    py: 0.25,
                    borderRadius: 1,
                    fontSize: '10px'
                  }}
                >
                  +{illustration.file_count - 1}枚
                </Typography>
              )}
            </Stack>

            <Typography
              variant="subtitle1"
              fontWeight={700}
              lineHeight={1.3}
              noWrap
              sx={{ mb: 0.5, color: 'text.primary' }}
            >
              {illustration.title}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.4,
                minHeight: '2.8em',
                color: 'text.secondary'
              }}
            >
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
              '&:hover': {
                color: 'error.main',
                bgcolor: alpha(theme.palette.error.main, 0.1)
              }
            }}
          >
            <Heart size={18} fill={isFav ? theme.palette.error.main : 'none'} />
          </IconButton>
        </Stack>

        {/* Footer Info */}
        <Stack direction="row" spacing={1} alignItems="center" mt={1}>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '11px' }}>
            {new Date(illustration.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })}
          </Typography>
          {illustration.user_name && (
            <>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>•</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '11px' }}>
                {illustration.user_name}
              </Typography>
            </>
          )}
        </Stack>
      </Box>
    </Box>
  );
};

export default IllustrationListCard;