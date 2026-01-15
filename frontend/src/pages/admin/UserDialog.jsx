import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Switch,
    Grid,
    MenuItem,
    Stack,
    Alert,
    Typography,
    Box,
    IconButton,
    Paper,
    Divider,
    Chip
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Business as BusinessIcon, Security as SecurityIcon, Lock as LockIcon } from '@mui/icons-material';
import { factoriesAPI, rolesAPI, factoryMembersAPI } from '../../services/users';

const UserDialog = ({ open, onClose, user, onSave, loading: externalLoading }) => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        first_name: '',
        last_name: '',
        password: '',
        is_active: true,
        is_staff: false,
        is_superuser: false,
        is_verified: false,
    });
    const [memberships, setMemberships] = useState([]);
    const [factories, setFactories] = useState([]);
    const [roles, setRoles] = useState([]);
    const [newMember, setNewMember] = useState({ factory: '', role: '' });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const isLoading = loading || externalLoading;

    // Password change dialog state
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
    const [passwordData, setPasswordData] = useState({
        new_password: '',
        confirm_password: ''
    });
    const [passwordErrors, setPasswordErrors] = useState({});

    useEffect(() => {
        if (open) {
            fetchInitialData();
        }
    }, [open]);

    useEffect(() => {
        if (open) {
            if (user) {
                setFormData({
                    username: user.username || '',
                    email: user.email || '',
                    first_name: user.first_name || '',
                    last_name: user.last_name || '',
                    password: '', // Not used in edit mode
                    is_active: user.is_active ?? true,
                    is_staff: user.is_staff ?? false,
                    is_superuser: user.is_superuser ?? false,
                    is_verified: user.is_verified ?? false,
                });
                setMemberships(user.factory_memberships || []);
            } else {
                setFormData({
                    username: '',
                    email: '',
                    first_name: '',
                    last_name: '',
                    password: '',
                    is_active: true,
                    is_staff: false,
                    is_superuser: false,
                    is_verified: false,
                });
                setMemberships([]);
            }
            setErrors({});
            setNewMember({ factory: '', role: '' });
            setPasswordData({ new_password: '', confirm_password: '' });
            setPasswordErrors({});
        }
    }, [user, open]);

    const fetchInitialData = async () => {
        try {
            console.log('Fetching factories and roles...');
            const factoriesRes = await factoriesAPI.getAll();
            console.log('Factories response:', factoriesRes);
            setFactories(factoriesRes.results || factoriesRes || []);
        } catch (error) {
            console.error("Failed to fetch factories:", error);
            setFactories([]);
        }

        try {
            const rolesRes = await rolesAPI.getAll();
            console.log('Roles response:', rolesRes);
            setRoles(rolesRes.results || rolesRes || []);
        } catch (error) {
            console.error("Failed to fetch roles:", error);
            setRoles([]);
        }
    };

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAddMembership = async () => {
        if (!newMember.factory || !newMember.role) return;

        if (user?.id) {
            try {
                setLoading(true);
                setErrors(prev => ({ ...prev, membership: null }));

                const memberData = {
                    user: user.id,
                    factory: newMember.factory,
                    role: newMember.role,
                    is_active: true
                };

                const response = await factoryMembersAPI.create(memberData);
                if (response && response.id) {
                    setMemberships(prev => [...prev, response]);
                    setNewMember({ factory: '', role: '' });
                } else if (response?.error) {
                    setErrors({ membership: response.error });
                }
            } catch (error) {
                console.error("Failed to add membership:", error);
                const message = error.response?.data?.detail ||
                    error.response?.data?.non_field_errors?.[0] ||
                    "所属の追加に失敗しました。既に追加されている可能性があります。";
                setErrors({ membership: message });
            } finally {
                setLoading(false);
            }
        } else {
            setErrors({ membership: "ユーザー作成後に工場の所属を設定できます。" });
        }
    };

    const handleRemoveMembership = async (id) => {
        try {
            setLoading(true);
            await factoryMembersAPI.delete(id);
            setMemberships(memberships.filter(m => m.id !== id));
        } catch (error) {
            console.error("Failed to remove membership:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        setPasswordErrors({});

        // Validation
        if (!passwordData.new_password) {
            setPasswordErrors({ new_password: '新しいパスワードを入力してください。' });
            return;
        }
        if (passwordData.new_password.length < 8) {
            setPasswordErrors({ new_password: 'パスワードは8文字以上である必要があります。' });
            return;
        }
        if (passwordData.new_password !== passwordData.confirm_password) {
            setPasswordErrors({ confirm_password: 'パスワードが一致しません。' });
            return;
        }

        try {
            setLoading(true);
            // Update user with new password
            await onSave(user.id, { password: passwordData.new_password });
            setPasswordDialogOpen(false);
            setPasswordData({ new_password: '', confirm_password: '' });
            alert('パスワードが正常に変更されました。');
        } catch (error) {
            console.error("Password change error:", error);
            setPasswordErrors({ detail: error.response?.data?.detail || "パスワードの変更に失敗しました。" });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Warning if membership selected but not added
        if (newMember.factory && newMember.role) {
            if (!window.confirm("工場とロールが選択されていますが、追加ボタン(+)が押されていません。このまま保存しますか?(選択中の所属は保存されません)")) {
                return;
            }
        }

        setLoading(true);
        setErrors({});

        try {
            // For edit mode, don't include password field
            const dataToSave = user ? { ...formData } : formData;
            if (user) {
                delete dataToSave.password;
            }

            await onSave(user?.id, dataToSave);
            onClose();
        } catch (error) {
            console.error("Save error:", error);
            setErrors(error.response?.data || { detail: "保存に失敗しました。" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
                <form onSubmit={handleSubmit}>
                    <DialogTitle sx={{ fontWeight: 800 }}>{user ? 'Edit User' : 'Create New User'}</DialogTitle>
                    <DialogContent dividers>
                        {errors.detail && <Alert severity="error" sx={{ mb: 2 }}>{errors.detail}</Alert>}

                        <Grid container spacing={3}>
                            {/* Basic Info */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 700 }}>基本情報</Typography>
                                <Stack spacing={2}>
                                    <TextField
                                        name="username"
                                        label="Username"
                                        fullWidth
                                        required
                                        size="small"
                                        value={formData.username}
                                        onChange={handleChange}
                                        error={!!errors.username}
                                        helperText={errors.username}
                                    />
                                    <TextField
                                        name="email"
                                        label="Email"
                                        type="email"
                                        fullWidth
                                        required
                                        size="small"
                                        value={formData.email}
                                        onChange={handleChange}
                                        error={!!errors.email}
                                        helperText={errors.email}
                                    />
                                    <Stack direction="row" spacing={2}>
                                        <TextField
                                            name="first_name"
                                            label="First Name"
                                            fullWidth
                                            size="small"
                                            value={formData.first_name}
                                            onChange={handleChange}
                                        />
                                        <TextField
                                            name="last_name"
                                            label="Last Name"
                                            fullWidth
                                            size="small"
                                            value={formData.last_name}
                                            onChange={handleChange}
                                        />
                                    </Stack>

                                    {/* Password field only for new users */}
                                    {!user && (
                                        <TextField
                                            name="password"
                                            label="Password"
                                            type="password"
                                            fullWidth
                                            size="small"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            error={!!errors.password}
                                            helperText={errors.password || "Minimum 8 characters"}
                                        />
                                    )}

                                    {/* Password change button for existing users */}
                                    {user && (
                                        <Button
                                            variant="outlined"
                                            startIcon={<LockIcon />}
                                            onClick={() => setPasswordDialogOpen(true)}
                                            fullWidth
                                            sx={{ borderRadius: 2 }}
                                        >
                                            パスワードを変更
                                        </Button>
                                    )}
                                </Stack>

                                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 3, fontWeight: 700 }}>権限設定</Typography>
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                    <Stack spacing={1}>
                                        <FormControlLabel
                                            control={<Switch checked={formData.is_active} onChange={handleChange} name="is_active" color="primary" size="small" />}
                                            label={<Typography variant="body2">Active Account</Typography>}
                                        />
                                        <FormControlLabel
                                            control={<Switch checked={formData.is_verified} onChange={handleChange} name="is_verified" color="success" size="small" />}
                                            label={<Typography variant="body2">Email Verified</Typography>}
                                        />
                                        <FormControlLabel
                                            control={<Switch checked={formData.is_staff} onChange={handleChange} name="is_staff" color="warning" size="small" />}
                                            label={<Typography variant="body2">Staff Status (Admin Access)</Typography>}
                                        />
                                        <FormControlLabel
                                            control={<Switch checked={formData.is_superuser} onChange={handleChange} name="is_superuser" color="error" size="small" />}
                                            label={<Typography variant="body2">Superuser Status (ROOT)</Typography>}
                                        />
                                    </Stack>
                                </Paper>
                            </Grid>

                            {/* Factory Memberships */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ fontWeight: 700 }}>工場所属管理</Typography>

                                {!user && (
                                    <Alert severity="info" sx={{ mb: 2 }}>
                                        ユーザー作成後に工場の所属を設定できます。
                                    </Alert>
                                )}

                                {user && (
                                    <Box>
                                        <Paper variant="outlined" sx={{ mb: 2, p: 2, borderRadius: 2, bgcolor: 'background.default' }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 700 }}>新しい所属を追加</Typography>
                                            <Grid container spacing={1} alignItems="center">
                                                <Grid item xs={5}>
                                                    <TextField
                                                        select
                                                        label="工場"
                                                        fullWidth
                                                        size="small"
                                                        value={newMember.factory}
                                                        onChange={(e) => setNewMember({ ...newMember, factory: e.target.value })}
                                                    >
                                                        {factories.map((f) => (
                                                            <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>
                                                        ))}
                                                    </TextField>
                                                </Grid>
                                                <Grid item xs={5}>
                                                    <TextField
                                                        select
                                                        label="ロール"
                                                        fullWidth
                                                        size="small"
                                                        value={newMember.role}
                                                        onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                                                    >
                                                        {roles.map((r) => (
                                                            <MenuItem key={r.id} value={r.id}>
                                                                {r.name} ({r.code})
                                                            </MenuItem>
                                                        ))}
                                                    </TextField>
                                                </Grid>
                                                <Grid item xs={2}>
                                                    <IconButton
                                                        color="primary"
                                                        onClick={handleAddMembership}
                                                        disabled={!newMember.factory || !newMember.role || isLoading}
                                                    >
                                                        <AddIcon />
                                                    </IconButton>
                                                </Grid>
                                            </Grid>
                                            {errors.membership && <Typography variant="caption" color="error">{errors.membership}</Typography>}
                                        </Paper>

                                        <Stack spacing={1}>
                                            {memberships.length === 0 ? (
                                                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                                                    所属している工場はありません。
                                                </Typography>
                                            ) : (
                                                memberships.map((m) => (
                                                    <Paper key={m.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <Box>
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <BusinessIcon fontSize="small" color="action" />
                                                                <Typography variant="body2" fontWeight="bold">{m.factory_name || m.factory?.name}</Typography>
                                                            </Stack>
                                                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                                                <SecurityIcon fontSize="small" color="action" />
                                                                <Chip
                                                                    label={`${m.role_name || m.role?.name}${m.role_code || m.role?.code ? ` (${m.role_code || m.role?.code})` : ''}`}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    color="primary"
                                                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                                                />
                                                            </Stack>
                                                        </Box>
                                                        <IconButton size="small" color="error" onClick={() => handleRemoveMembership(m.id)} disabled={isLoading}>
                                                            <DeleteIcon fontSize="small" />
                                                        </IconButton>
                                                    </Paper>
                                                ))
                                            )}
                                        </Stack>
                                    </Box>
                                )}
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2 }}>
                        <Button onClick={onClose} disabled={isLoading} color="inherit">キャンセル</Button>
                        <Button type="submit" variant="contained" disabled={isLoading} sx={{ borderRadius: 2, fontWeight: 700 }}>
                            {isLoading ? '保存中...' : 'ユーザー情報を保存'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Password Change Dialog */}
            <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 800 }}>パスワード変更</DialogTitle>
                <DialogContent dividers>
                    {passwordErrors.detail && <Alert severity="error" sx={{ mb: 2 }}>{passwordErrors.detail}</Alert>}
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="新しいパスワード"
                            type="password"
                            fullWidth
                            size="small"
                            value={passwordData.new_password}
                            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                            error={!!passwordErrors.new_password}
                            helperText={passwordErrors.new_password || "最低8文字"}
                        />
                        <TextField
                            label="パスワード確認"
                            type="password"
                            fullWidth
                            size="small"
                            value={passwordData.confirm_password}
                            onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                            error={!!passwordErrors.confirm_password}
                            helperText={passwordErrors.confirm_password}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setPasswordDialogOpen(false)} disabled={isLoading} color="inherit">
                        キャンセル
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handlePasswordChange}
                        disabled={isLoading || !passwordData.new_password || !passwordData.confirm_password}
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                        {isLoading ? '変更中...' : 'パスワードを変更'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default UserDialog;
