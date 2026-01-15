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
            bgcolor: theme.palette.mode === 'dark' ? 'zinc.900' : 'action.hover',
            border: `1px solid ${theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : theme.palette.divider}`
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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'error.main',
          gap: 0.5
        }}>
          <FileText size={24} />
          <Typography variant="caption" sx={{ fontWeight: 800, fontSize: '10px', lineHeight: 1 }}>PDF</Typography>
        </Box>
      );
    } else {
      Thumbnail = (
        <Box sx={{
          width: 80,
          height: 80,
          borderRadius: 2,
          bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[800], 0.5) : alpha(theme.palette.action.disabledBackground, 0.5),
          border: `1px solid ${theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.palette.mode === 'dark' ? 'zinc.400' : 'text.disabled'
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
        bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[800], 0.5) : alpha(theme.palette.action.disabledBackground, 0.5),
        border: `1px solid ${theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : theme.palette.divider}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.palette.mode === 'dark' ? 'zinc.400' : 'text.disabled'
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
        bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[900], 0.4) : theme.palette.background.paper,
        border: `1px solid ${theme.palette.mode === 'dark' ? alpha(theme.palette.common.white, 0.05) : theme.palette.divider}`,
        transition: 'all 0.2s',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        cursor: 'pointer',
        '&:hover': {
          bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[900], 0.6) : alpha(theme.palette.primary.main, 0.05),
          borderColor: theme.palette.mode === 'dark' ? alpha(theme.palette.primary.main, 0.5) : theme.palette.primary.main,
          transform: 'translateY(-2px)',
          boxShadow: theme.palette.mode === 'dark'
            ? `0 4px 12px ${alpha(theme.palette.common.black, 0.3)}`
            : `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`
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
      <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box sx={{ pr: 1, flex: 1, minWidth: 0 }}>
            {/* Metadata Chips (Top) */}
            <Stack direction="row" spacing={0.5} mb={0.5} flexWrap="wrap">
              {(illustration.part_category_name || illustration.part_category?.name) && (
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.mode === 'dark' ? 'warning.light' : 'warning.dark',
                    fontWeight: 700,
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.warning.main, 0.15) : alpha(theme.palette.warning.main, 0.1),
                    px: 0.8,
                    py: 0.25,
                    borderRadius: 1,
                    fontSize: '10px',
                    border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`
                  }}
                >
                  {illustration.part_category_name || illustration.part_category?.name}
                </Typography>
              )}
              {(illustration.part_subcategory_name || illustration.part_subcategory?.name) && (
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.mode === 'dark' ? 'secondary.light' : 'secondary.main',
                    fontWeight: 700,
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.secondary.main, 0.15) : alpha(theme.palette.secondary.main, 0.1),
                    px: 0.8,
                    py: 0.25,
                    borderRadius: 1,
                    fontSize: '10px',
                    border: `1px solid ${alpha(theme.palette.secondary.main, 0.2)}`
                  }}
                >
                  {illustration.part_subcategory_name || illustration.part_subcategory?.name}
                </Typography>
              )}
              {illustration.file_count > 1 && (
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.mode === 'dark' ? 'zinc.300' : 'text.secondary',
                    fontWeight: 600,
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[800], 0.5) : alpha(theme.palette.action.disabled, 0.1),
                    px: 0.8,
                    py: 0.25,
                    borderRadius: 1,
                    fontSize: '10px'
                  }}
                >
                  +{illustration.file_count - 1}枚
                </Typography>
              )}
              {(illustration.engine_model_name || illustration.engine_model?.name) && (
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.palette.mode === 'dark' ? 'success.light' : 'success.dark',
                    fontWeight: 700,
                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.success.main, 0.15) : alpha(theme.palette.success.main, 0.1),
                    px: 0.8,
                    py: 0.25,
                    borderRadius: 1,
                    fontSize: '10px',
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                  }}
                >
                  {illustration.engine_model_name || illustration.engine_model?.name}
                </Typography>
              )}
            </Stack>

            <Typography
              variant="subtitle1"
              fontWeight={700}
              lineHeight={1.3}
              noWrap
              sx={{ mb: 0.25, color: 'text.primary' }}
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
                lineHeight: 1,
                minHeight: '2em',
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
        <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '11px' }}>
            {new Date(illustration.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' })}
          </Typography>
          {illustration.factory_name && (
            <>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>•</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '11px' }}>
                {illustration.factory_name}
              </Typography>
            </>
          )}
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