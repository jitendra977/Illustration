import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Fab,
    Card,
    Stack,
    useTheme,
    CircularProgress,
    InputAdornment,
    TextField,
    alpha,
    Tabs,
    Tab,
    Grid,
    Chip,
    useMediaQuery
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
    Security as SecurityIcon,
    Business as BusinessIcon,
    AdminPanelSettings as AdminIcon,
    History as HistoryIcon
} from '@mui/icons-material';
import { usersAPI, factoriesAPI, rolesAPI } from '../../../services/users';
import UserDialog from './UserDialog';
import MobileLayout from '../../../layouts/MobileLayout';

// Imported Components
import UsersTab from '../../../components/admin/UsersTab';
import FactoriesTab from '../../../components/admin/FactoriesTab';
import RolesTab from '../../../components/admin/RolesTab';
import FactoryDialog from '../../../components/admin/FactoryDialog';
import RoleDialog from '../../../components/admin/RoleDialog';
import ActivityLogsTab from '../../../components/admin/ActivityLogsTab';

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
                // Ensure users is always an array
                const userList = response.results || (Array.isArray(response) ? response : []);
                setUsers(userList);
            } else if (currentTab === 1) {
                const response = await factoriesAPI.getAll();
                const factoryList = response.results || (Array.isArray(response) ? response : []);
                setFactories(factoryList);
            } else if (currentTab === 2) {
                const response = await rolesAPI.getAll();
                const roleList = response.results || (Array.isArray(response) ? response : []);
                setRoles(roleList);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
            // On error, set empty arrays to prevent mapping errors
            if (currentTab === 0) setUsers([]);
            else if (currentTab === 1) setFactories([]);
            else if (currentTab === 2) setRoles([]);
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
                        <Tab label="Activity Logs" icon={<HistoryIcon fontSize="small" />} iconPosition="start" />
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
                            {currentTab === 0 && (
                                <UsersTab
                                    users={users}
                                    searchQuery={searchQuery}
                                    onEdit={(user) => { setSelectedUser(user); setUserDialogOpen(true); }}
                                    onDelete={handleUserDelete}
                                    isDesktop={isDesktop}
                                />
                            )}
                            {currentTab === 1 && (
                                <FactoriesTab
                                    factories={factories}
                                    onEdit={handleFactoryEdit}
                                    onDelete={handleFactoryDelete}
                                    isDesktop={isDesktop}
                                />
                            )}
                            {currentTab === 2 && (
                                <RolesTab
                                    roles={roles}
                                    onEdit={handleRoleEdit}
                                    onDelete={handleRoleDelete}
                                    isDesktop={isDesktop}
                                />
                            )}
                            {currentTab === 3 && (
                                <ActivityLogsTab
                                    isDesktop={isDesktop}
                                />
                            )}
                        </Box>
                    )}
                </Box>

                {/* Floating Action Button - Hide on Activity Logs tab */}
                {currentTab !== 3 && (
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
                )}

                {/* Dialogs */}
                <UserDialog
                    open={userDialogOpen}
                    onClose={() => setUserDialogOpen(false)}
                    user={selectedUser}
                    onSave={handleUserSave}
                    loading={saveLoading}
                />

                <FactoryDialog
                    open={factoryDialogOpen}
                    onClose={() => setFactoryDialogOpen(false)}
                    form={factoryForm}
                    setForm={setFactoryForm}
                    errors={formErrors}
                    onSave={handleFactorySave}
                    loading={saveLoading}
                    isEdit={!!selectedFactory}
                />

                <RoleDialog
                    open={roleDialogOpen}
                    onClose={() => setRoleDialogOpen(false)}
                    form={roleForm}
                    setForm={setRoleForm}
                    errors={formErrors}
                    onSave={handleRoleSave}
                    loading={saveLoading}
                    isEdit={!!selectedRole}
                />
            </Box>
        </MobileLayout>
    );
};

export default MobileUserManagement;
