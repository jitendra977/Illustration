import React from 'react';
import {
    Box,
    Typography,
    IconButton,
    Card,
    CardContent,
    Avatar,
    Chip,
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
    useTheme
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Email as EmailIcon
} from '@mui/icons-material';

const UsersTab = ({
    users,
    searchQuery,
    onEdit,
    onDelete,
    isDesktop
}) => {
    const theme = useTheme();

    const filtered = users.filter(u =>
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                            <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Factory & Role</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Joined</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Last Login</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filtered.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar
                                            src={user.profile_image}
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                border: `2px solid ${user.is_active ? theme.palette.success.light : theme.palette.grey[300]}`
                                            }}
                                        >
                                            {user.username[0].toUpperCase()}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="600">{user.username}</Typography>
                                            <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                                                {user.is_superuser && <Chip size="small" label="ROOT" color="error" variant="filled" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 900 }} />}
                                                {user.is_staff && !user.is_superuser && <Chip size="small" label="STAFF" color="warning" variant="filled" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 900 }} />}
                                            </Stack>
                                        </Box>
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    <Box>
                                        <Typography variant="body2" sx={{ mb: 0.5 }}>{user.email}</Typography>
                                        {user.phone_number && (
                                            <Typography variant="caption" color="text.secondary">
                                                📱 {user.phone_number}
                                            </Typography>
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Stack spacing={0.5}>
                                        {user.is_active ? (
                                            <Chip label="Active" size="small" color="success" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
                                        ) : (
                                            <Chip label="Inactive" size="small" color="default" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
                                        )}
                                        {user.is_verified ? (
                                            <Chip label="Verified ✓" size="small" color="info" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
                                        ) : (
                                            <Chip label="Unverified" size="small" color="warning" variant="outlined" sx={{ height: 22, fontSize: '0.7rem' }} />
                                        )}
                                    </Stack>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ maxWidth: 250 }}>
                                        {user.factory_memberships && user.factory_memberships.length > 0 ? (
                                            <Stack spacing={0.5}>
                                                {user.factory_memberships.map((membership, idx) => (
                                                    <Box key={idx}>
                                                        <Typography variant="caption" fontWeight="600" display="block">
                                                            {membership.factory_name}
                                                        </Typography>
                                                        <Chip
                                                            label={membership.role_name || membership.role_code}
                                                            size="small"
                                                            sx={{
                                                                height: 20,
                                                                fontSize: '0.65rem',
                                                                bgcolor: membership.is_active ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.text.disabled, 0.1),
                                                                color: membership.is_active ? 'primary.main' : 'text.disabled'
                                                            }}
                                                        />
                                                    </Box>
                                                ))}
                                            </Stack>
                                        ) : (
                                            <Typography variant="caption" color="text.disabled" fontStyle="italic">
                                                No factory assignments
                                            </Typography>
                                        )}
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption" color="text.secondary">
                                        {user.date_joined ? new Date(user.date_joined).toLocaleDateString('ja-JP') : '-'}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption" color="text.secondary">
                                        {user.last_login ? new Date(user.last_login).toLocaleString('ja-JP', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 'Never'}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => onEdit(user)}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    {!user.is_superuser && (
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => onDelete(user)}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    )}
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
                {filtered.map(user => (
                    <Grid item xs={12} sm={6} lg={4} key={user.id}>
                        <Card sx={cardStyle}>
                            <CardContent sx={{ p: 2.5 }}>
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box position="relative">
                                        <Avatar
                                            src={user.profile_image}
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                border: `2px solid ${theme.palette.background.paper}`,
                                                boxShadow: `0 0 0 2px ${user.is_active ? theme.palette.success.light : theme.palette.grey[300]}`
                                            }}
                                        >
                                            {user.username[0].toUpperCase()}
                                        </Avatar>
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                bottom: 0,
                                                right: 0,
                                                width: 14,
                                                height: 14,
                                                bgcolor: user.is_active ? 'success.main' : 'text.disabled',
                                                border: `2px solid ${theme.palette.background.paper}`,
                                                borderRadius: '50%'
                                            }}
                                        />
                                    </Box>
                                    <Box flex={1} minWidth={0}>
                                        <Typography variant="subtitle1" fontWeight="800" noWrap>
                                            {user.username}
                                        </Typography>
                                        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.secondary', mb: 0.5 }}>
                                            <EmailIcon sx={{ fontSize: 12 }} />
                                            <Typography variant="caption" noWrap>{user.email}</Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={0.5} flexWrap="wrap" gap={0.5}>
                                            {user.is_superuser && <Chip size="small" label="ROOT" color="error" variant="filled" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 900 }} />}
                                            {user.is_staff && !user.is_superuser && <Chip size="small" label="STAFF" color="warning" variant="filled" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 900 }} />}
                                            {!user.is_active && <Chip label="Inactive" size="small" sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha(theme.palette.text.disabled, 0.1) }} />}
                                        </Stack>
                                    </Box>
                                </Stack>

                                <Divider sx={{ my: 2, borderStyle: 'dashed' }} />

                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Typography variant="caption" color="text.secondary" fontWeight="600">
                                        ACTIONS
                                    </Typography>
                                    <Stack direction="row" spacing={1}>
                                        <IconButton
                                            size="small"
                                            sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', '&:hover': { bgcolor: 'primary.main', color: 'white' } }}
                                            onClick={() => onEdit(user)}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        {!user.is_superuser && (
                                            <IconButton
                                                size="small"
                                                sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', '&:hover': { bgcolor: 'error.main', color: 'white' } }}
                                                onClick={() => onDelete(user)}
                                            >
                                                <DeleteIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default UsersTab;
