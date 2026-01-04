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
    Alert
} from '@mui/material';
// We'll update services/users.js later to export this or add it to api
import { usersAPI } from '../../services/users';

const UserDialog = ({ open, onClose, user, onSave }) => {
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
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                email: user.email || '',
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                password: '', // Blank for edit
                is_active: user.is_active ?? true,
                is_staff: user.is_staff ?? false,
                is_superuser: user.is_superuser ?? false,
                is_verified: user.is_verified ?? false,
            });
        } else {
            // Reset for create
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
        }
        setErrors({});
    }, [user, open]);

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        try {
            await onSave(user?.id, formData);
            onClose();
        } catch (error) {
            console.error("Save error:", error);
            setErrors(error.response?.data || { detail: "Failed to save user" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <form onSubmit={handleSubmit}>
                <DialogTitle>{user ? 'Edit User' : 'Create New User'}</DialogTitle>
                <DialogContent dividers>
                    {errors.detail && <Alert severity="error" sx={{ mb: 2 }}>{errors.detail}</Alert>}

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="username"
                                label="Username"
                                fullWidth
                                required
                                value={formData.username}
                                onChange={handleChange}
                                error={!!errors.username}
                                helperText={errors.username}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="email"
                                label="Email"
                                type="email"
                                fullWidth
                                required
                                value={formData.email}
                                onChange={handleChange}
                                error={!!errors.email}
                                helperText={errors.email}
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="first_name"
                                label="First Name"
                                fullWidth
                                value={formData.first_name}
                                onChange={handleChange}
                                error={!!errors.first_name}
                                helperText={errors.first_name}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                name="last_name"
                                label="Last Name"
                                fullWidth
                                value={formData.last_name}
                                onChange={handleChange}
                                error={!!errors.last_name}
                                helperText={errors.last_name}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                name="password"
                                label={user ? "Password (leave blank to keep current)" : "Password"}
                                type="password"
                                fullWidth
                                required={!user}
                                value={formData.password}
                                onChange={handleChange}
                                error={!!errors.password}
                                helperText={errors.password}
                            />
                        </Grid>

                        {/* Permissions */}
                        <Grid item xs={12}>
                            <Stack spacing={1} sx={{ mt: 1, p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                                <FormControlLabel
                                    control={<Switch checked={formData.is_active} onChange={handleChange} name="is_active" color="primary" />}
                                    label="Active Account"
                                />
                                <FormControlLabel
                                    control={<Switch checked={formData.is_verified} onChange={handleChange} name="is_verified" color="success" />}
                                    label="Email Verified"
                                />
                                <FormControlLabel
                                    control={<Switch checked={formData.is_staff} onChange={handleChange} name="is_staff" color="warning" />}
                                    label="Staff Status (Can access Admin)"
                                />
                                <FormControlLabel
                                    control={<Switch checked={formData.is_superuser} onChange={handleChange} name="is_superuser" color="error" />}
                                    label="Superuser Status (Full Permissions)"
                                />
                            </Stack>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} disabled={loading}>Cancel</Button>
                    <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Saving...' : 'Save User'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default UserDialog;
