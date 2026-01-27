import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    IconButton,
    Fab,
    Card,
    CardContent,
    Avatar,
    Chip,
    Stack,
    useTheme,
    CircularProgress,
    Container,
    InputAdornment,
    TextField,
    alpha,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Alert,
    FormControlLabel,
    Switch,
    Grid,
    Paper,
    Divider,
    MenuItem,
    Autocomplete,
    useMediaQuery,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Security as SecurityIcon,
    Business as BusinessIcon,
    AdminPanelSettings as AdminIcon,
    Email as EmailIcon,
    Lock as LockIcon
} from '@mui/icons-material';
import { usersAPI, factoriesAPI, rolesAPI } from '../../../services/users';
import UserDialog from './UserDialog';
import MobileLayout from '../../../layouts/MobileLayout';

const MobileUserManagement = () => {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    const [currentTab, setCurrentTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [saveLoading, setSaveLoading] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    // Data State
    const [users, setUsers] = useState([]);
    const [factories, setFactories] = useState([]);
    const [roles, setRoles] = useState([]);

    // Dialog States
    const [userDialogOpen, setUserDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [factoryDialogOpen, setFactoryDialogOpen] = useState(false);
    const [selectedFactory, setSelectedFactory] = useState(null);
    const [factoryForm, setFactoryForm] = useState({ name: '', address: '' });

    const [roleDialogOpen, setRoleDialogOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [roleForm, setRoleForm] = useState({
        name: '',
        code: '',
        can_manage_all_systems: false,
        can_manage_factory: false,
        can_manage_users: false,
        can_manage_jobs: false,
        can_view_finance: false,
        can_edit_finance: false,
        can_manage_catalog: false,
        can_manage_feedback: false,
        can_create_illustration: false,
        can_view_illustration: false,
        can_edit_illustration: false,
        can_delete_illustration: false,
        can_view_all_factory_illustrations: false
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            if (currentTab === 0) {
                const response = await usersAPI.getAllUsers();
                setUsers(response.results || response);
            } else if (currentTab === 1) {
                const response = await factoriesAPI.getAll();
                setFactories(response.results || response);
            } else if (currentTab === 2) {
                const response = await rolesAPI.getAll();
                setRoles(response.results || response);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentTab]);

    // ============================================================================
    // USER HANDLERS
    // ============================================================================
    const handleUserSave = async (id, userData) => {
        setSaveLoading(true);
        try {
            if (id) {
                await usersAPI.updateUser(id, userData);
            } else {
                await usersAPI.createUser(userData);
            }
            setUserDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error("User save error:", error);
            throw error; // Let UserDialog handle it
        } finally {
            setSaveLoading(false);
        }
    };

    const handleUserDelete = async (user) => {
        if (window.confirm(`${user.username}を削除してもよろしいですか？`)) {
            try {
                await usersAPI.deleteUser(user.id);
                fetchData();
            } catch (error) {
                alert("ユーザーの削除に失敗しました。");
            }
        }
    };

    // ============================================================================
    // FACTORY HANDLERS
    // ============================================================================
    const handleFactoryEdit = (factory) => {
        setSelectedFactory(factory);
        setFactoryForm({ name: factory.name, address: factory.address });
        setFormErrors({});
        setFactoryDialogOpen(true);
    };

    const handleFactorySave = async () => {
        setSaveLoading(true);
        setFormErrors({});
        try {
            if (selectedFactory) {
                await factoriesAPI.update(selectedFactory.id, factoryForm);
            } else {
                await factoriesAPI.create(factoryForm);
            }
            setFactoryDialogOpen(false);
            fetchData();
        } catch (error) {
            setFormErrors(error.response?.data || { detail: "工場の保存に失敗しました。" });
        } finally {
            setSaveLoading(false);
        }
    };

    const handleFactoryDelete = async (factory) => {
        if (window.confirm(`${factory.name}を削除してもよろしいですか？`)) {
            try {
                await factoriesAPI.delete(factory.id);
                fetchData();
            } catch (error) {
                alert("工場の削除に失敗しました。");
            }
        }
    };

    // ============================================================================
    // ROLE HANDLERS
    // ============================================================================
    const handleRoleEdit = (role) => {
        setSelectedRole(role);
        setRoleForm({
            name: role.name,
            code: role.code,
            can_manage_all_systems: role.can_manage_all_systems,
            can_manage_factory: role.can_manage_factory,
            can_manage_users: role.can_manage_users,
            can_manage_jobs: role.can_manage_jobs,
            can_view_finance: role.can_view_finance,
            can_edit_finance: role.can_edit_finance,
            can_create_illustration: role.can_create_illustration,
            can_view_illustration: role.can_view_illustration,
            can_edit_illustration: role.can_edit_illustration,
            can_delete_illustration: role.can_delete_illustration,
            can_view_all_factory_illustrations: role.can_view_all_factory_illustrations
        });
        setFormErrors({});
        setRoleDialogOpen(true);
    };

    const handleRoleSave = async () => {
        setSaveLoading(true);
        setFormErrors({});
        try {
            if (selectedRole) {
                await rolesAPI.update(selectedRole.id, roleForm);
            } else {
                await rolesAPI.create(roleForm);
            }
            setRoleDialogOpen(false);
            fetchData();
        } catch (error) {
            console.error("Role save error:", error.response?.data);
            setFormErrors(error.response?.data || { detail: "ロールの保存に失敗しました。" });
        } finally {
            setSaveLoading(false);
        }
    };

    const handleRoleDelete = async (role) => {
        if (window.confirm(`${role.name}を削除してもよろしいですか？関連する所属も削除される可能性があります。`)) {
            try {
                await rolesAPI.delete(role.id);
                fetchData();
            } catch (error) {
                alert("ロールの削除に失敗しました。");
            }
        }
    };

    // ============================================================================
    // RENDERING
    // ============================================================================

    // ============================================================================
    // RENDERING
    // ============================================================================

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

    const renderUsersTable = () => {
        const filtered = users.filter(u =>
            u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
        );

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
                                        onClick={() => { setSelectedUser(user); setUserDialogOpen(true); }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    {!user.is_superuser && (
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleUserDelete(user)}
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
    };

    const renderUsers = () => {
        if (isDesktop) return renderUsersTable();

        const filtered = users.filter(u =>
            u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
        );

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
                                                onClick={() => { setSelectedUser(user); setUserDialogOpen(true); }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            {!user.is_superuser && (
                                                <IconButton
                                                    size="small"
                                                    sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), color: 'error.main', '&:hover': { bgcolor: 'error.main', color: 'white' } }}
                                                    onClick={() => handleUserDelete(user)}
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

    const renderFactoriesTable = () => (
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
                                    onClick={() => handleFactoryEdit(factory)}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => handleFactoryDelete(factory)}
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

    const renderFactories = () => {
        if (isDesktop) return renderFactoriesTable();

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
                                            onClick={() => handleFactoryEdit(factory)}
                                            sx={{ borderRadius: 2 }}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            size="small"
                                            startIcon={<DeleteIcon />}
                                            color="error"
                                            onClick={() => handleFactoryDelete(factory)}
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

    // Translation Maps
    const ROLE_NAME_MAP = {
        'SUPER_ADMIN': 'スーパー管理者',
        'FACTORY_MANAGER': '工場管理者',
        'ILLUSTRATION_ADMIN': 'イラスト管理者',
        'ILLUSTRATION_EDITOR': 'イラスト編集者',
        'ILLUSTRATION_CONTRIBUTOR': 'イラスト投稿者',
        'ILLUSTRATION_VIEWER': 'イラスト閲覧者',
        'FEEDBACK_MANAGER': 'フィードバック管理者',
        // Legacy
        'OWNER': '所有者',
        'MANAGER': 'マネージャー',
        'SUPERVISOR': 'スーパーバイザー',
        'WORKER': '作業員',
        'VIEWER': '閲覧者',
        'ADMIN': '管理者'
    };

    const PERMISSION_MAP = {
        'can_manage_all_systems': 'システム全般管理',
        'can_manage_factory': '工場管理',
        'can_manage_users': 'ユーザー管理',
        'can_manage_jobs': 'ジョブ管理',
        'can_view_finance': '財務閲覧',
        'can_edit_finance': '財務編集',
        'can_manage_catalog': 'カタログ管理',
        'can_manage_feedback': 'フィードバック管理',
        'can_create_illustration': 'イラスト作成',
        'can_view_illustration': 'イラスト閲覧',
        'can_edit_illustration': 'イラスト編集',
        'can_delete_illustration': 'イラスト削除',
        'can_view_all_factory_illustrations': '全工場イラスト閲覧'
    };

    const renderRolesTable = () => (
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
                                    onClick={() => handleRoleEdit(role)}
                                    sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                                >
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => handleRoleDelete(role)}
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

    const renderRoles = () => {
        if (isDesktop) return renderRolesTable();

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
                                            <IconButton size="small" onClick={() => handleRoleEdit(role)} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleRoleDelete(role)} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
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

    return (
        <MobileLayout>
            <Box sx={{ pb: 10, bgcolor: 'background.default', minHeight: '100vh' }}>
                <Box sx={{
                    pt: 4, pb: 2, px: 3,
                    bgcolor: 'background.paper',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.05)}`
                }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                        <Box>
                            <Typography variant="overline" color="primary" fontWeight="800" sx={{ letterSpacing: 1.2 }}>
                                SYSTEM ADMINISTRATION
                            </Typography>
                            <Typography variant="h4" fontWeight="900" sx={{
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                backgroundClip: 'text',
                                textFillColor: 'transparent',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                letterSpacing: '-0.02em'
                            }}>
                                Dashboard
                            </Typography>
                        </Box>
                        <Chip
                            label={new Date().toLocaleDateString()}
                            variant="outlined"
                            size="small"
                            sx={{ fontWeight: 600, borderColor: theme.palette.divider }}
                        />
                    </Stack>

                    <Tabs
                        value={currentTab}
                        onChange={(e, val) => setCurrentTab(val)}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                        sx={{
                            minHeight: 48,
                            '& .MuiTab-root': {
                                fontWeight: 800,
                                fontSize: '0.9rem',
                                textTransform: 'none',
                                minHeight: 48,
                                borderRadius: 2,
                                px: 3,
                                mr: 1,
                                transition: 'all 0.2s',
                                '&.Mui-selected': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: 'primary.main'
                                }
                            },
                            '& .MuiTabs-indicator': {
                                height: 3,
                                borderRadius: 1.5
                            }
                        }}
                    >
                        <Tab label="Users & Staff" icon={<SecurityIcon fontSize="small" />} iconPosition="start" />
                        <Tab label="Factories" icon={<BusinessIcon fontSize="small" />} iconPosition="start" />
                        <Tab label="Roles & Permissions" icon={<AdminIcon fontSize="small" />} iconPosition="start" />
                    </Tabs>

                    {currentTab === 0 && (
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: 'text.disabled' }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                mt: 2,
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: alpha(theme.palette.background.default, 0.5),
                                    borderRadius: 3,
                                    fieldset: { border: 'none' },
                                    '&:hover fieldset': { border: `1px solid ${theme.palette.divider}` },
                                    '&.Mui-focused fieldset': { border: `1px solid ${theme.palette.primary.main}` },
                                    boxShadow: 'inner 0 2px 4px rgba(0,0,0,0.02)'
                                }
                            }}
                        />
                    )}
                </Box>

                <Box sx={{ mt: 4, px: isDesktop ? 0 : { xs: 2, md: 4 } }}>
                    {loading ? (
                        <Grid container spacing={2}>
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <Grid item xs={12} sm={6} md={4} key={i}>
                                    <Card sx={{ height: 200, borderRadius: 4 }}>
                                        <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                                            <CircularProgress size={30} thickness={4} />
                                        </Box>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <Box sx={{ animation: 'fadeIn 0.5s ease-out', '@keyframes fadeIn': { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
                            {currentTab === 0 && renderUsers()}
                            {currentTab === 1 && renderFactories()}
                            {currentTab === 2 && renderRoles()}
                        </Box>
                    )}
                </Box>

                {/* Floating Action Button */}
                <Fab
                    color="primary"
                    aria-label="add"
                    sx={{
                        position: 'fixed',
                        bottom: 30,
                        right: 30,
                        width: 64,
                        height: 64,
                        boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.4)}`,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                        '&:hover': { transform: 'scale(1.05)' },
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onClick={() => {
                        if (currentTab === 0) {
                            setSelectedUser(null);
                            setUserDialogOpen(true);
                        } else if (currentTab === 1) {
                            setSelectedFactory(null);
                            setFactoryForm({ name: '', address: '' });
                            setFormErrors({});
                            setFactoryDialogOpen(true);
                        } else if (currentTab === 2) {
                            setSelectedRole(null);
                            setRoleForm({
                                name: '',
                                code: '',
                                can_manage_all_systems: false,
                                can_manage_factory: false,
                                can_manage_users: false,
                                can_manage_jobs: false,
                                can_view_finance: false,
                                can_edit_finance: false,
                                can_create_illustration: false,
                                can_view_illustration: false,
                                can_edit_illustration: false,
                                can_delete_illustration: false,
                                can_view_all_factory_illustrations: false
                            });
                            setFormErrors({});
                            setRoleDialogOpen(true);
                        }
                    }}
                >
                    <AddIcon sx={{ fontSize: 32 }} />
                </Fab>

                {/* Dialogs */}
                <UserDialog
                    open={userDialogOpen}
                    onClose={() => setUserDialogOpen(false)}
                    user={selectedUser}
                    onSave={handleUserSave}
                    loading={saveLoading}
                />

                {/* Factory Dialog */}
                <Dialog
                    open={factoryDialogOpen}
                    onClose={() => setFactoryDialogOpen(false)}
                    fullWidth
                    maxWidth="xs"
                    PaperProps={{ sx: { borderRadius: 3 } }}
                >
                    <DialogTitle sx={{ fontWeight: 800, p: 3 }}>{selectedFactory ? '工場の編集' : '新しい工場の作成'}</DialogTitle>
                    <DialogContent dividers sx={{ p: 3 }}>
                        {formErrors.detail && <Alert severity="error" sx={{ mb: 2 }}>{formErrors.detail}</Alert>}
                        <Stack spacing={2} sx={{ mt: 1 }}>
                            <TextField
                                label="工場名"
                                fullWidth
                                required
                                value={factoryForm.name}
                                onChange={(e) => setFactoryForm({ ...factoryForm, name: e.target.value })}
                                error={!!formErrors.name}
                                helperText={formErrors.name}
                            />
                            <TextField
                                label="住所"
                                fullWidth
                                required
                                value={factoryForm.address}
                                onChange={(e) => setFactoryForm({ ...factoryForm, address: e.target.value })}
                                error={!!formErrors.address}
                                helperText={formErrors.address}
                            />
                        </Stack>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => setFactoryDialogOpen(false)} color="inherit" disabled={saveLoading} sx={{ borderRadius: 2 }}>キャンセル</Button>
                        <Button variant="contained" onClick={handleFactorySave} disabled={!factoryForm.name || !factoryForm.address || saveLoading} sx={{ borderRadius: 2, px: 4 }}>
                            {saveLoading ? <CircularProgress size={20} /> : '保存'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Role Dialog */}
                <Dialog
                    open={roleDialogOpen}
                    onClose={() => setRoleDialogOpen(false)}
                    fullWidth
                    maxWidth="md"
                    PaperProps={{ sx: { borderRadius: 3 } }}
                >
                    <DialogTitle sx={{ fontWeight: 800, p: 3 }}>{selectedRole ? 'ロールの編集' : '新しいロールの作成'}</DialogTitle>
                    <DialogContent dividers sx={{ p: 3 }}>
                        {formErrors.detail && <Alert severity="error" sx={{ mb: 2 }}>{formErrors.detail}</Alert>}
                        <Grid container spacing={3} sx={{ mt: 0 }}>
                            <Grid item xs={12} md={6}>
                                <Stack spacing={3}>
                                    <TextField
                                        label="ロール名"
                                        fullWidth
                                        required
                                        value={roleForm.name}
                                        onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                                        error={!!formErrors.name}
                                        helperText={formErrors.name}
                                    />
                                    <Autocomplete
                                        freeSolo
                                        options={[
                                            'SUPER_ADMIN',
                                            'FACTORY_MANAGER',
                                            'ILLUSTRATION_ADMIN',
                                            'ILLUSTRATION_EDITOR',
                                            'ILLUSTRATION_CONTRIBUTOR',
                                            'ILLUSTRATION_VIEWER',
                                            'FEEDBACK_MANAGER'
                                        ]}
                                        value={roleForm.code}
                                        onInputChange={(event, newValue) => {
                                            setRoleForm({ ...roleForm, code: newValue.toUpperCase() });
                                        }}
                                        disabled={!!selectedRole}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="コード (英字)"
                                                required
                                                error={!!formErrors.code}
                                                helperText={formErrors.code || (selectedRole ? "" : "システムが識別するための短縮コード（一意）")}
                                            />
                                        )}
                                    />
                                </Stack>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 700 }}>権限設定</Typography>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                                    <Grid container spacing={1}>
                                        {Object.keys(roleForm).filter(k => k.startsWith('can_')).map(key => (
                                            <Grid item xs={12} key={key}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={roleForm[key]}
                                                            onChange={(e) => setRoleForm({ ...roleForm, [key]: e.target.checked })}
                                                            size="small"
                                                            color="success"
                                                        />
                                                    }
                                                    label={
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="600">
                                                                {PERMISSION_MAP[key] || key.replace('can_', '').replace(/_/g, ' ')}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {key}
                                                            </Typography>
                                                        </Box>
                                                    }
                                                    sx={{ alignItems: 'flex-start', ml: 0 }}
                                                />
                                                <Divider sx={{ my: 0.5, opacity: 0.5 }} />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Paper>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button onClick={() => setRoleDialogOpen(false)} color="inherit" disabled={saveLoading} sx={{ borderRadius: 2 }}>キャンセル</Button>
                        <Button variant="contained" onClick={handleRoleSave} disabled={!roleForm.name || !roleForm.code || saveLoading} sx={{ borderRadius: 2, px: 4 }}>
                            {saveLoading ? <CircularProgress size={20} /> : '保存'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </MobileLayout>
    );
};

export default MobileUserManagement;
