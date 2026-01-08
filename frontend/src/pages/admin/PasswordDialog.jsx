import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Alert
} from '@mui/material';
import { usersAPI } from '../../services/users';

const PasswordDialog = ({ open, onClose, user }) => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleReset = async () => {
        if (!password) return;
        setLoading(true);
        setError(null);
        try {
            await usersAPI.patchUser(user.id, { password });
            setPassword('');
            onClose(true); // pass true to indicate success
        } catch (err) {
            setError(err.response?.data?.password || "Failed to update password");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={() => onClose()} maxWidth="xs" fullWidth>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogContent dividers>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Enter a new password for user <strong>{user?.username}</strong>.
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                <TextField
                    label="New Password"
                    type="password"
                    fullWidth
                    size="small"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => onClose()} disabled={loading}>Cancel</Button>
                <Button
                    variant="contained"
                    color="warning"
                    onClick={handleReset}
                    disabled={!password || loading}
                >
                    {loading ? 'Updating...' : 'Update Password'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PasswordDialog;
