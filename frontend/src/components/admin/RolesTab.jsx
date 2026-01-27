import React from 'react';
import {
    Box,
    Typography,
    IconButton,
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
    Divider,
    alpha,
    Grid,
    Chip,
    useTheme
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    AdminPanelSettings as AdminIcon
} from '@mui/icons-material';
import { ROLE_NAME_MAP, PERMISSION_MAP } from './roleConstants';

const RolesTab = ({
    roles,
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
                    <TableHead sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.05) }}>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Role Name</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Code</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Permissions</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {roles.map((role) => (
                            <TableRow key={role.id} hover>
                                <TableCell>
                                    <Typography variant="subtitle2" fontWeight="600">
                                        {ROLE_NAME_MAP[role.code] || role.name}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip label={role.code} size="small" variant="outlined" sx={{ fontFamily: 'monospace' }} />
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                        {Object.entries(role)
                                            .filter(([k, v]) => k.startsWith('can_') && v === true)
                                            .map(([k]) => (
                                                <Chip
                                                    key={k}
                                                    label={PERMISSION_MAP[k] || k.replace('can_', '').replace(/_/g, ' ')}
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: '0.65rem',
                                                        bgcolor: alpha(theme.palette.success.main, 0.1),
                                                        color: theme.palette.success.dark,
                                                        border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                                                    }}
                                                />
                                            ))}
                                        {Object.entries(role).filter(([k, v]) => k.startsWith('can_') && v === true).length === 0 && (
                                            <Typography variant="caption" color="text.disabled" fontStyle="italic">
                                                No active permissions
                                            </Typography>
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        size="small"
                                        onClick={() => onEdit(role)}
                                        sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => onDelete(role)}
                                        sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
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
                {roles.map(role => (
                    <Grid item xs={12} md={6} key={role.id}>
                        <Card sx={cardStyle}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                                    <Box sx={{
                                        p: 1.5,
                                        borderRadius: 3,
                                        background: `linear-gradient(135deg, ${theme.palette.secondary.light} 0%, ${theme.palette.secondary.main} 100%)`,
                                        color: 'white',
                                        boxShadow: `0 4px 12px ${alpha(theme.palette.secondary.main, 0.3)}`
                                    }}>
                                        <AdminIcon />
                                    </Box>
                                    <Box flex={1}>
                                        <Stack direction="row" alignItems="center" gap={1}>
                                            <Typography variant="h6" fontWeight="800" sx={{ lineHeight: 1.2 }}>
                                                {ROLE_NAME_MAP[role.code] || role.name}
                                            </Typography>
                                        </Stack>
                                        <Typography variant="caption" sx={{ fontFamily: 'monospace', bgcolor: alpha(theme.palette.text.primary, 0.05), px: 0.5, borderRadius: 0.5 }}>
                                            {role.code}
                                        </Typography>
                                    </Box>
                                    <Box>
                                        <IconButton size="small" onClick={() => onEdit(role)} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => onDelete(role)} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Stack>

                                <Divider sx={{ mb: 2 }} />

                                <Typography variant="caption" fontWeight="700" color="text.secondary" gutterBottom display="block">
                                    PERMISSIONS
                                </Typography>

                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                                    {Object.entries(role)
                                        .filter(([k, v]) => k.startsWith('can_') && v === true)
                                        .map(([k]) => (
                                            <Chip
                                                key={k}
                                                label={PERMISSION_MAP[k] || k.replace('can_', '').replace(/_/g, ' ')}
                                                size="small"
                                                sx={{
                                                    height: 24,
                                                    fontSize: '0.7rem',
                                                    bgcolor: alpha(theme.palette.success.main, 0.1),
                                                    color: theme.palette.success.dark,
                                                    fontWeight: 600,
                                                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`
                                                }}
                                            />
                                        ))}
                                    {Object.entries(role).filter(([k, v]) => k.startsWith('can_') && v === true).length === 0 && (
                                        <Typography variant="caption" color="text.disabled" fontStyle="italic">
                                            No active permissions
                                        </Typography>
                                    )}
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default RolesTab;
