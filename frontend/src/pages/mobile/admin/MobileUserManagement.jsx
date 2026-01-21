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
    Autocomplete
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
        can_manage_users: false,
        can_manage_jobs: false,
        can_view_finance: false,
        can_edit_finance: false,
        can_create_illustrations: false,
        can_edit_illustrations: false,
        can_delete_illustrations: false,
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
            can_manage_users: role.can_manage_users,
            can_manage_jobs: role.can_manage_jobs,
            can_view_finance: role.can_view_finance,
            can_edit_finance: role.can_edit_finance,
            can_create_illustrations: role.can_create_illustrations,
            can_edit_illustrations: role.can_edit_illustrations,
            can_delete_illustrations: role.can_delete_illustrations,
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

    const renderUsers = () => {
        const filtered = users.filter(u =>
            u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return (
            <Stack spacing={1.5}>
                {filtered.map(user => (
                    <Card key={user.id} sx={{
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        transition: 'all 0.2s',
                        '&:active': { transform: 'scale(0.98)' }
                    }}>
                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar src={user.profile_image} sx={{ width: 48, height: 48 }}>
                                    {user.username[0].toUpperCase()}
                                </Avatar>
                                <Box flex={1} minWidth={0}>
                                    <Typography variant="subtitle2" fontWeight="800" noWrap>{user.username}</Typography>
                                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <EmailIcon sx={{ fontSize: 12 }} /> {user.email}
                                    </Typography>
                                    <Stack direction="row" spacing={0.5} mt={0.5} flexWrap="wrap" gap={0.5}>
                                        {user.is_superuser && <Chip size="small" label="ROOT" color="error" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 900 }} />}
                                        {user.is_staff && !user.is_superuser && <Chip size="small" label="STAFF" color="warning" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 900 }} />}
                                        <Chip label={user.is_active ? "Active" : "Inactive"} color={user.is_active ? "success" : "default"} size="small" sx={{ height: 18, fontSize: '0.65rem' }} />
                                    </Stack>
                                </Box>
                                <Stack>
                                    <IconButton size="small" color="primary" onClick={() => { setSelectedUser(user); setUserDialogOpen(true); }}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    {!user.is_superuser && (
                                        <IconButton size="small" color="error" onClick={() => handleUserDelete(user)}>
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    )}
                                </Stack>
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        );
    };

    const renderFactories = () => (
        <Stack spacing={1.5}>
            {factories.map(factory => (
                <Card key={factory.id} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ p: 1, bgcolor: alpha(theme.palette.primary.main, 0.1), borderRadius: 2 }}>
                                <BusinessIcon color="primary" />
                            </Box>
                            <Box flex={1}>
                                <Typography variant="subtitle2" fontWeight="800">{factory.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{factory.address}</Typography>
                            </Box>
                            <Stack direction="row">
                                <IconButton size="small" color="primary" onClick={() => handleFactoryEdit(factory)}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => handleFactoryDelete(factory)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            ))}
        </Stack>
    );

    const renderRoles = () => (
        <Stack spacing={1.5}>
            {roles.map(role => (
                <Card key={role.id} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box sx={{ p: 1, bgcolor: alpha(theme.palette.secondary.main, 0.1), borderRadius: 2 }}>
                                <AdminIcon color="secondary" />
                            </Box>
                            <Box flex={1}>
                                <Typography variant="subtitle2" fontWeight="800">{role.name} ({role.code})</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    {Object.entries(role)
                                        .filter(([k, v]) => k.startsWith('can_') && v === true)
                                        .map(([k]) => k.replace('can_', '').replace(/_/g, ' '))
                                        .join(' • ') || 'No permissions'}
                                </Typography>
                            </Box>
                            <Stack direction="row">
                                <IconButton size="small" color="primary" onClick={() => handleRoleEdit(role)}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => handleRoleDelete(role)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Stack>
                        </Stack>
                    </CardContent>
                </Card>
            ))}
        </Stack>
    );

    return (
        <MobileLayout>
            <Box sx={{ pb: 10, bgcolor: 'background.default', minHeight: '100vh' }}>
                <Box sx={{
                    pt: 3, pb: 1, px: 2,
                    bgcolor: 'background.paper',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    position: 'sticky',
                    top: 0, // In MobileLayout, main content has mt: 64px, so top: 0 here is relative to that? 
                    // Wait, if content flows under fixed Topbar, top: 0 will stick to view top 0.
                    // But MobileLayout main has mt: 64. 
                    // Let's use top: 0 and see. If it overlaps, I'll fix it.
                    // Actually, Topbar is fixed. 0 is the viewport top.
                    // So it should be top: 0 if we want it to hide under Topbar? No, we want it below.
                    // But if it's inside the main box which has mt: 64, then top: 0 sticky should stick to its parent's top? 
                    // No, sticky is viewport relative if parents don't have overflow.
                    zIndex: 10
                }}>
                    <Typography variant="h5" fontWeight="900" sx={{ mb: 2, letterSpacing: '-0.02em' }}>
                        ADMIN DASHBOARD
                    </Typography>

                    <Tabs
                        value={currentTab}
                        onChange={(e, val) => setCurrentTab(val)}
                        variant="fullWidth"
                        sx={{
                            mb: 1,
                            '& .MuiTab-root': { fontWeight: 800, fontSize: '0.8rem' }
                        }}
                    >
                        <Tab label="ユーザー" />
                        <Tab label="工場" />
                        <Tab label="ロール" />
                    </Tabs>

                    {currentTab === 0 && (
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="ユーザーを検索..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                mt: 1,
                                '& .MuiOutlinedInput-root': {
                                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                    borderRadius: 2.5,
                                }
                            }}
                        />
                    )}
                </Box>

                <Container sx={{ mt: 2 }}>
                    {loading ? (
                        <Box display="flex" justifyContent="center" py={8}>
                            <CircularProgress thickness={5} size={30} />
                        </Box>
                    ) : (
                        <>
                            {currentTab === 0 && renderUsers()}
                            {currentTab === 1 && renderFactories()}
                            {currentTab === 2 && renderRoles()}
                        </>
                    )}
                </Container>

                {/* Floating Action Button */}
                <Fab
                    color="primary"
                    aria-label="add"
                    sx={{
                        position: 'fixed',
                        bottom: 90,
                        right: 20,
                        boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.4)}`
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
                                can_manage_users: false,
                                can_manage_jobs: false,
                                can_view_finance: false,
                                can_edit_finance: false,
                                can_create_illustrations: false,
                                can_edit_illustrations: false,
                                can_delete_illustrations: false,
                                can_view_all_factory_illustrations: false
                            });
                            setFormErrors({});
                            setRoleDialogOpen(true);
                        }
                    }}
                >
                    <AddIcon />
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
                <Dialog open={factoryDialogOpen} onClose={() => setFactoryDialogOpen(false)} fullWidth maxWidth="xs">
                    <DialogTitle sx={{ fontWeight: 800 }}>{selectedFactory ? '工場の編集' : '新しい工場の作成'}</DialogTitle>
                    <DialogContent dividers>
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
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setFactoryDialogOpen(false)} color="inherit" disabled={saveLoading}>キャンセル</Button>
                        <Button variant="contained" onClick={handleFactorySave} disabled={!factoryForm.name || !factoryForm.address || saveLoading}>
                            {saveLoading ? <CircularProgress size={20} /> : '保存'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Role Dialog */}
                <Dialog open={roleDialogOpen} onClose={() => setRoleDialogOpen(false)} fullWidth maxWidth="sm">
                    <DialogTitle sx={{ fontWeight: 800 }}>{selectedRole ? 'ロールの編集' : '新しいロールの作成'}</DialogTitle>
                    <DialogContent dividers>
                        {formErrors.detail && <Alert severity="error" sx={{ mb: 2 }}>{formErrors.detail}</Alert>}
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="ロール名"
                                    fullWidth
                                    required
                                    size="small"
                                    value={roleForm.name}
                                    onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                                    error={!!formErrors.name}
                                    helperText={formErrors.name}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Autocomplete
                                    freeSolo
                                    options={['OWNER', 'MANAGER', 'SUPERVISOR', 'WORKER', 'VIEWER', 'ADMIN']}
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
                                            size="small"
                                            error={!!formErrors.code}
                                            helperText={formErrors.code || (selectedRole ? "" : "システムが識別するための短縮コード（一意）")}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Typography variant="subtitle2" color="primary" sx={{ mt: 1, mb: 1, fontWeight: 700 }}>権限設定</Typography>
                                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                                    <Grid container spacing={0.5}>
                                        {Object.keys(roleForm).filter(k => k.startsWith('can_')).map(key => (
                                            <Grid item xs={12} sm={6} key={key}>
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            checked={roleForm[key]}
                                                            onChange={(e) => setRoleForm({ ...roleForm, [key]: e.target.checked })}
                                                            size="small"
                                                        />
                                                    }
                                                    label={<Typography variant="caption">{key.replace('can_', '').replace(/_/g, ' ')}</Typography>}
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Paper>
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setRoleDialogOpen(false)} color="inherit" disabled={saveLoading}>キャンセル</Button>
                        <Button variant="contained" onClick={handleRoleSave} disabled={!roleForm.name || !roleForm.code || saveLoading}>
                            {saveLoading ? <CircularProgress size={20} /> : '保存'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </MobileLayout>
    );
};

export default MobileUserManagement;
