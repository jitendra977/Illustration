import React from 'react';
import { Card, Box, Typography, IconButton, Stack, alpha, useTheme } from '@mui/material';
import { Favorite as FavIcon, FavoriteBorder as FavBorderIcon } from '@mui/icons-material';

const IllustrationListCard = ({ illustration, toggleFavorite, favorites = [], onClick }) => {
  const theme = useTheme();
  const isFav = favorites.includes(illustration.id);

  return (
    <Card
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.2s',
        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.03), borderColor: 'primary.main', transform: 'translateX(4px)' }
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>{illustration.title}</Typography>
            {illustration.file_count > 1 && (
              <Box sx={{ px: 0.8, py: 0.2, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 0.5, fontSize: '0.7rem', fontWeight: 700, color: 'primary.main' }}>
                {illustration.file_count}
              </Box>
            )}
          </Stack>

          <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
            {illustration.description || 'No description'}
          </Typography>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="caption" fontWeight={600}>{illustration.user_name || 'System'}</Typography>
            <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }} />
            <Typography variant="caption" color="text.disabled">{new Date(illustration.created_at).toLocaleDateString('ja-JP')}</Typography>
            {illustration.engine_model_name && <><Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }} /><Typography variant="caption" color="primary.main" fontWeight={600}>{illustration.engine_model_name}</Typography></>}
            {illustration.part_category_name && <><Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: 'text.disabled' }} /><Typography variant="caption" color="secondary.main" fontWeight={600}>{illustration.part_category_name}</Typography></>}
          </Stack>
        </Box>

        <IconButton size="small" onClick={(e) => { e.stopPropagation(); toggleFavorite(illustration.id, e); }} sx={{ ml: 2 }}>
          {isFav ? <FavIcon sx={{ fontSize: 20, color: 'error.main' }} /> : <FavBorderIcon sx={{ fontSize: 20 }} />}
        </IconButton>
      </Stack>
    </Card>
  );
};

export default IllustrationListCard;