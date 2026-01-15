import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    IconButton,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Stack,
    Alert,
    FormControlLabel,
    Checkbox,
    Grid,
    Tooltip
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Edit, Delete, InfoOutlined } from '@mui/icons-material';
import { rolesAPI } from '../../services/users';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const [formData, setFormData] = useState({
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
    const [error, setError] = useState(null);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const data = await rolesAPI.getAll();
            setRoles(data.results || data);
        } catch (err) {
            console.error("Failed to fetch roles:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleOpenDialog = (role = null) => {
        if (role) {
            setSelectedRole(role);
            setFormData({ ...role });
        } else {
            setSelectedRole(null);
            setFormData({
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
        }
        setError(null);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSave = async () => {
        try {
            if (selectedRole) {
                await rolesAPI.update(selectedRole.id, formData);
            } else {
                await rolesAPI.create(formData);
            }
            fetchRoles();
            handleCloseDialog();
        } catch (err) {
            setError(err.response?.data || { detail: "Failed to save role" });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this role?')) {
            try {
                await rolesAPI.delete(id);
                fetchRoles();
            } catch (err) {
                alert("Failed to delete role");
            }
        }
    };

    const columns = [
        { field: 'name', headerName: 'Role Name', width: 180 },
        { field: 'code', headerName: 'Code', width: 150 },
        {
            field: 'permissions',
            headerName: 'Permissions Summary',
            width: 400,
            renderCell: (params) => {
                const perms = [];
                if (params.row.can_manage_users) perms.push('Users');
                if (params.row.can_create_illustrations) perms.push('Create');
                if (params.row.can_edit_illustrations) perms.push('Edit');
                if (params.row.can_delete_illustrations) perms.push('Delete');
                return (
                    <Typography variant="caption" color="text.secondary">
                        {perms.join(', ') || 'None'}
                    </Typography>
                );
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            renderCell: (params) => (
                <Box>
                    <IconButton size="small" color="primary" onClick={() => handleOpenDialog(params.row)}>
                        <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
                        <Delete fontSize="small" />
                    </IconButton>
                </Box>
            )
        },
    ];

    const permissionFields = [
        { key: 'can_manage_users', label: 'Manage Users', desc: 'Can add/remove members from factory' },
        { key: 'can_create_illustrations', label: 'Create Illustrations', desc: 'Can upload and create new illustrations' },
        { key: 'can_edit_illustrations', label: 'Edit Illustrations', desc: 'Can modify existing illustrations' },
        { key: 'can_delete_illustrations', label: 'Delete Illustrations', desc: 'Can remove illustrations' },
        { key: 'can_view_all_factory_illustrations', label: 'View All Factory Data', desc: 'Can see all illustrations in the factory' },
        { key: 'can_manage_jobs', label: 'Manage Jobs', desc: 'Workflow management' },
        { key: 'can_view_finance', label: 'View Finance', desc: 'Financial data access' },
        { key: 'can_edit_finance', label: 'Edit Finance', desc: 'Modify financial records' },
    ];

    return (
        <Box>
            <Box display="flex" justifyItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h5" fontWeight="bold">
                    Roles & Permissions
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                    sx={{ borderRadius: 2 }}
                >
                    Create Role
                </Button>
            </Box>

            <Paper elevation={0} sx={{ height: 600, width: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                <DataGrid
                    rows={roles}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    disableSelectionOnClick
                    loading={loading}
                    sx={{ border: 'none' }}
                />
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>{selectedRole ? 'Edit Role' : 'Create New Role'}</DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={3} sx={{ mt: 0 }}>
                        {error?.detail && <Grid item xs={12}><Alert severity="error">{error.detail}</Alert></Grid>}
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Role Name"
                                fullWidth
                                placeholder="e.g. Factory Manager"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                error={!!error?.name}
                                helperText={error?.name}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                label="Role Code"
                                fullWidth
                                placeholder="e.g. MANAGER"
                                disabled={!!selectedRole}
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                error={!!error?.code}
                                helperText={error?.code || "Unique identifier for backend logic"}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                Permissions
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={1}>
                                {permissionFields.map((field) => (
                                    <Grid item xs={12} sm={6} key={field.key}>
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    checked={formData[field.key]}
                                                    onChange={(e) => setFormData({ ...formData, [field.key]: e.target.checked })}
                                                />
                                            }
                                            label={
                                                <Box display="flex" alignItems="center">
                                                    <Typography variant="body2">{field.label}</Typography>
                                                    <Tooltip title={field.desc}>
                                                        <IconButton size="small">
                                                            <InfoOutlined fontSize="inherit" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            }
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save Role</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

const Divider = ({ sx }) => <Box sx={{ height: '1px', bgcolor: 'divider', ...sx }} />;

export default RoleManagement;
