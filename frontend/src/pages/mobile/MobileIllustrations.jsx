// src/pages/mobile/MobileIllustrations.jsx - Optimized
import React, { useEffect, useState } from 'react';
import { Box, Container, useTheme } from '@mui/material';
import { useParams, useLocation } from 'react-router-dom';

import MobileIllustrationListView from '../../components/mobile/MobileIllustrationListView';
import Breadcrumbs from '../../components/navigation/Breadcrumbs';

const MobileIllustrations = () => {
  const theme = useTheme();
  const location = useLocation();
  const { id: paramId } = useParams(); // Get ID from URL if present

  const [initialFilters, setInitialFilters] = useState({});

  // Parse initial filters from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const parsedFilters = {};

    // Parse known filter keys from URL
    ['manufacturer', 'engine_model', 'part_category', 'part_subcategory', 'car_model', 'factory'].forEach(key => {
      const value = searchParams.get(key);
      if (value) {
        parsedFilters[key] = value;
      }
    });

    setInitialFilters(parsedFilters);
  }, [location.search]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        pb: 10,
        bgcolor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="sm" sx={{ px: 2, py: 3 }}>
        {/* Breadcrumbs for main page */}
        <Breadcrumbs
          items={[
            { label: 'イラスト' }
          ]}
        />

        <MobileIllustrationListView
          initialFilters={initialFilters}
          basePath="/illustrations"
          enableHeader={true}
          enableCreate={true}
        />
      </Container>
    </Box>
  );
};

export default MobileIllustrations;