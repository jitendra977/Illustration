import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  Alert,
  Skeleton,
  Slide,
  useTheme,
  alpha,
  Box,
} from '@mui/material';
import {
  Store as StoreIcon,
  DirectionsCar as CarIcon,
  Build as BuildIcon,
  Image as ImageIcon,
  Add as AddIcon,
  ChevronRight as ChevronRightIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { illustrationAPI, manufacturerAPI, carModelAPI, engineModelAPI } from '../../api/illustrations';
import { useNavigate } from 'react-router-dom';
import MobileIllustrationFormModal from '../../components/forms/MobileIllustrationFormModal';
import MobileLayout from '../../layouts/MobileLayout';
import { useManufacturers, useEngineModels, usePartCategories, usePartSubCategories, useCarModels } from '../../hooks/useIllustrations';

const MobileHome = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalIllustrations: 0,
    totalManufacturers: 0,
    totalCarModels: 0,
    totalEngineModels: 0,
    recentIllustrations: [],
    loading: true,
    error: null,
  });
  
  const [refreshing, setRefreshing] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  
  const { manufacturers } = useManufacturers();
  const { engineModels } = useEngineModels();
  const { categories } = usePartCategories();
  const { subCategories } = usePartSubCategories();
  const { carModels } = useCarModels();
  
  const hasFetchedRef = useRef(false);

  const fetchDashboardData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setStats(prev => ({ ...prev, loading: true }));
    
    try {
      const [illustrationsRes, manufacturersRes, carModelsRes, engineModelsRes] = await Promise.all([
        illustrationAPI.getAll({ limit: 5, ordering: '-created_at' }),
        manufacturerAPI.getAll({ limit: 1 }),
        carModelAPI.getAll({ limit: 1 }),
        engineModelAPI.getAll({ limit: 1 })
      ]);

      setStats({
        totalIllustrations: illustrationsRes.count || 0,
        totalManufacturers: manufacturersRes.count || 0,
        totalCarModels: carModelsRes.count || 0,
        totalEngineModels: engineModelsRes.count || 0,
        recentIllustrations: illustrationsRes.results || [],
        loading: false,
        error: null,
      });
    } catch (error) {
      setStats(prev => ({ ...prev, loading: false, error: 'データの読み込みに失敗しました' }));
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!hasFetchedRef.current) {
      fetchDashboardData();
      hasFetchedRef.current = true;
    }
  }, []);

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return '数秒前';
    if (seconds < 3600) return Math.floor(seconds / 60) + '分前';
    if (seconds < 86400) return Math.floor(seconds / 3600) + '時間前';
    return Math.floor(seconds / 86400) + '日前';
  };

  const StatCard = ({ title, value, icon, gradient, onClick }) => (
    <Card sx={{ background: gradient, color: 'white', borderRadius: 3, cursor: 'pointer', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }} onClick={onClick}>
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ bgcolor: 'rgba(255,255,255,0.25)', borderRadius: 2.5, p: 1 }}>
            {React.cloneElement(icon, { sx: { fontSize: 28 } })}
          </Box>
          <Stack spacing={0.5}>
            {stats.loading ? (
              <Skeleton variant="text" width={60} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
            ) : (
              <Typography variant="h4" fontWeight="bold">{value.toLocaleString()}</Typography>
            )}
            <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600 }}>{title}</Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );

  const IllustrationCard = ({ illustration, index }) => {
    const firstFile = illustration.first_file;
    const isImage = firstFile?.file_type === 'image';
    const isPdf = firstFile?.file_type === 'pdf';
    
    return (
      <Slide direction="up" in timeout={300 + (index * 100)}>
        <Card sx={{ borderRadius: 3, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[8] } }} onClick={() => navigate(`/illustrations/${illustration.id}`)}>
          <CardContent sx={{ p: 1.5 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ width: 64, height: 64, borderRadius: 2.5, backgroundColor: isImage ? 'transparent' : alpha(theme.palette.primary.main, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                {isImage ? (
                  <>
                    <img src={firstFile.file} alt={illustration.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {illustration.file_count > 1 && <Chip label={`+${illustration.file_count - 1}`} size="small" sx={{ position: 'absolute', bottom: 4, right: 4, bgcolor: alpha('#000', 0.7), color: 'white', fontSize: '0.6rem', height: 18 }} />}
                  </>
                ) : isPdf ? (
                  <>
                    <PdfIcon sx={{ color: theme.palette.error.main, fontSize: 32 }} />
                    {illustration.file_count > 1 && <Chip label={illustration.file_count} size="small" sx={{ position: 'absolute', bottom: 4, right: 4, bgcolor: theme.palette.error.main, color: 'white', fontSize: '0.6rem', height: 18, fontWeight: 'bold' }} />}
                  </>
                ) : (
                  <ImageIcon sx={{ color: theme.palette.primary.main, fontSize: 28, opacity: 0.6 }} />
                )}
              </Box>
              
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body1" fontWeight={600} noWrap sx={{ mb: 0.5 }}>{illustration.title}</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 0.5 }}>
                  {isPdf && <Chip icon={<PdfIcon sx={{ fontSize: 12 }} />} label="PDF" size="small" sx={{ height: 22, fontSize: '0.7rem', bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.main }} />}
                  {illustration.part_category_name && <Chip label={illustration.part_category_name} size="small" sx={{ height: 22, fontSize: '0.7rem', bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }} />}
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', mt: 0.5, display: 'block' }}>{getTimeAgo(illustration.created_at)}</Typography>
              </Box>
              <ChevronRightIcon sx={{ color: 'text.secondary', fontSize: 20, flexShrink: 0 }} />
            </Stack>
          </CardContent>
        </Card>
      </Slide>
    );
  };

  if (stats.loading && !refreshing) {
    return (
      <MobileLayout showHeader={false}>
        <Container maxWidth="sm" sx={{ px: 2, pt: 4 }}>
          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 3, mb: 2 }} />
          {[1, 2, 3].map(i => <Skeleton key={i} variant="rectangular" height={80} sx={{ borderRadius: 3, mb: 1.5 }} />)}
        </Container>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout showHeader onRefresh={() => fetchDashboardData(true)} refreshing={refreshing}>
      <Container maxWidth="sm" sx={{ px: 2, mt: -3, pb: 2 }}>
        {stats.error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }} action={<Button color="inherit" size="small" onClick={() => fetchDashboardData(true)}>再試行</Button>}>
            {stats.error}
          </Alert>
        )}

        {/* Stats Grid */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, mb: 2 ,mt:5}}>
          <StatCard title="イラスト" value={stats.totalIllustrations} icon={<ImageIcon />} gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" onClick={() => navigate('/illustrations')} />
          <StatCard title="メーカー" value={stats.totalManufacturers} icon={<StoreIcon />} gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" onClick={() => navigate('/manufacturers')} />
          <StatCard title="車種" value={stats.totalCarModels} icon={<CarIcon />} gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" onClick={() => navigate('/car-models')} />
          <StatCard title="エンジン" value={stats.totalEngineModels} icon={<BuildIcon />} gradient="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" onClick={() => navigate('/engine-models')} />
        </Box>

        {/* Quick Actions */}
        <Stack spacing={1.5} mb={3}>
          <Button fullWidth variant="contained" size="large" startIcon={<AddIcon />} onClick={() => setCreateModalOpen(true)} sx={{ py: 1.75, borderRadius: 3, textTransform: 'none', fontWeight: 600 }}>新規イラスト作成</Button>
          <Button fullWidth variant="outlined" size="large" startIcon={<ImageIcon />} onClick={() => navigate('/illustrations')} sx={{ py: 1.75, borderRadius: 3, textTransform: 'none', fontWeight: 600, borderWidth: 2 }}>すべて表示</Button>
        </Stack>

        {/* Recent Illustrations */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight="bold">最近のイラスト</Typography>
            <Button size="small" endIcon={<ChevronRightIcon />} onClick={() => navigate('/illustrations')} sx={{ textTransform: 'none', fontWeight: 600 }}>すべて</Button>
          </Stack>
          <Stack spacing={1.5}>
            {stats.recentIllustrations.length > 0 ? (
              stats.recentIllustrations.map((illustration, index) => <IllustrationCard key={illustration.id} illustration={illustration} index={index} />)
            ) : (
              <Card sx={{ borderRadius: 3, textAlign: 'center', py: 6, bgcolor: alpha(theme.palette.primary.main, 0.03) }}>
                <ImageIcon sx={{ fontSize: 48, color: theme.palette.primary.main, opacity: 0.5, mb: 2 }} />
                <Typography variant="body1" color="text.secondary" fontWeight={500}>まだイラストがありません</Typography>
                <Button variant="text" size="small" onClick={() => setCreateModalOpen(true)} sx={{ mt: 2, textTransform: 'none', fontWeight: 600 }}>作成する</Button>
              </Card>
            )}
          </Stack>
        </Box>
      </Container>

      {/* Create Modal */}
      <MobileIllustrationFormModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => { setCreateModalOpen(false); fetchDashboardData(true); }}
        mode="create"
        manufacturers={manufacturers}
        engineModels={engineModels}
        categories={categories}
        subCategories={subCategories}
        carModels={carModels}
      />
    </MobileLayout>
  );
};

export default MobileHome;