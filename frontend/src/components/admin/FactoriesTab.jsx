import React from 'react';
import {
    Box,
    Typography,
    IconButton,
    Button,
    Card,
    CardContent,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    alpha,
    Grid,
    useTheme
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Business as BusinessIcon
} from '@mui/icons-material';

const FactoriesTab = ({
    factories,
    onEdit,
    onDelete,
    isDesktop
}) => {
    const theme = useTheme();

    // Common Card Style
    const cardStyle = {
        height: '100%',
        borderRadius: 4,
        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        background: theme.palette.background.paper,
        boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'visible',
        position: 'relative',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.15)}`,
            borderColor: alpha(theme.palette.primary.main, 0.3),
        }
    };

    if (isDesktop) {
        return (
            <TableContainer component={Paper} sx={{ borderRadius: 4, boxShadow: theme.shadows[2], overflow: 'hidden' }}>
                <Table>
                    <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Factory Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Address</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {factories.map((factory) => (
                            <TableRow key={factory.id} hover>
                                <TableCell>{factory.id}</TableCell>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight="600">{factory.name}</Typography>
                                </TableCell>
                                <TableCell>{factory.address || 'No address provided'}</TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => onEdit(factory)}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => onDelete(factory)}
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }

    return (
        <Box sx={{ px: { xs: 2, md: 4 } }}>
            <Grid container spacing={2}>
                {factories.map(factory => (
                    <Grid item xs={12} sm={6} lg={4} key={factory.id}>
                        <Card sx={cardStyle}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{
                                            p: 1.5,
                                            borderRadius: 3,
                                            bgcolor: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                                            color: 'white',
                                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                                        }}>
                                            <BusinessIcon />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="800">{factory.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">ID: {factory.id}</Typography>
                                        </Box>
                                    </Stack>
                                </Box>

                                <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.background.default, 0.5), borderRadius: 2, mb: 2 }}>
                                    <Stack direction="row" spacing={1} alignItems="flex-start">
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.2 }}>Address:</Typography>
                                        <Typography variant="body2" fontWeight="500" sx={{ lineHeight: 1.4 }}>
                                            {factory.address || 'No address provided'}
                                        </Typography>
                                    </Stack>
                                </Box>

                                <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                    <Button
                                        size="small"
                                        startIcon={<EditIcon />}
                                        onClick={() => onEdit(factory)}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        size="small"
                                        startIcon={<DeleteIcon />}
                                        color="error"
                                        onClick={() => onDelete(factory)}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Delete
                                    </Button>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default FactoriesTab;
