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
    TextField
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Search as SearchIcon,
    Security as SecurityIcon,
    VerifiedUser as VerifiedUserIcon,
    PersonOff as PersonOffIcon
} from '@mui/icons-material';
import { usersAPI } from '../../../services/users';
import UserDialog from '../../admin/UserDialog';
import axiosInstance from '../../../services/index';

const MobileUserManagement = () => {
    const theme = useTheme();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('auth/users/');
            setUsers(response.data.results || response.data);
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = () => {
        setSelectedUser(null);
        setOpenDialog(true);
    };

    const handleEdit = (user) => {
        setSelectedUser(user);
        setOpenDialog(true);
    };

    const handleDelete = async (user) => {
        if (window.confirm(`Are you sure you want to delete ${user.username}?`)) {
            try {
                await axiosInstance.delete(`auth/users/${user.id}/`);
                fetchUsers();
            } catch (error) {
                console.error("Failed to delete user:", error);
                alert(error.response?.data?.detail || "Failed to delete user");
            }
        }
    };

    const handleSave = async (id, userData) => {
        if (id) {
            await axiosInstance.put(`auth/users/${id}/`, userData);
        } else {
            await axiosInstance.post('auth/users/', userData);
        }
        fetchUsers();
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <Box sx={{ pb: 10, bgcolor: 'background.default', minHeight: '100vh' }}>
            {/* Header */}
            <Box sx={{ p: 2, bgcolor: 'background.paper', position: 'sticky', top: 0, zIndex: 10, boxShadow: 1 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    User Management
                </Typography>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {/* User List */}
            <Container sx={{ pt: 2 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Stack spacing={2}>
                        {filteredUsers.map((user) => (
                            <Card key={user.id} elevation={2} sx={{ borderRadius: 2 }}>
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Avatar
                                            src={user.profile_image}
                                            sx={{ width: 50, height: 50 }}
                                        >
                                            {user.username[0].toUpperCase()}
                                        </Avatar>

                                        <Box flex={1} minWidth={0}>
                                            <Typography variant="subtitle1" fontWeight="bold" noWrap>
                                                {user.username}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                {user.email}
                                            </Typography>

                                            {/* Chips */}
                                            <Stack direction="row" spacing={0.5} mt={1} flexWrap="wrap" gap={0.5}>
                                                {/* Role Chips */}
                                                {user.is_superuser && <Chip size="small" label="ROOT" color="error" icon={<SecurityIcon />} sx={{ height: 24 }} />}
                                                {user.is_staff && !user.is_superuser && <Chip size="small" label="STAFF" color="warning" icon={<SecurityIcon />} sx={{ height: 24 }} />}

                                                {/* Status Chips */}
                                                {user.is_active ? (
                                                    <Chip label="Active" color="success" size="small" sx={{ height: 24 }} />
                                                ) : (
                                                    <Chip label="Inactive" color="default" size="small" sx={{ height: 24 }} />
                                                )}
                                            </Stack>
                                        </Box>

                                        {/* Actions */}
                                        <Box display="flex" flexDirection="column">
                                            <IconButton size="small" color="primary" onClick={() => handleEdit(user)}>
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleDelete(user)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}

                        {filteredUsers.length === 0 && (
                            <Typography textAlign="center" color="text.secondary" py={4}>
                                No users found.
                            </Typography>
                        )}
                    </Stack>
                )}
            </Container>

            {/* FAB */}
            <Fab
                color="primary"
                aria-label="add"
                sx={{ position: 'fixed', bottom: 80, right: 16 }}
                onClick={handleCreate}
            >
                <AddIcon />
            </Fab>

            {/* Dialog */}
            <UserDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                user={selectedUser}
                onSave={handleSave}
            />
        </Box>
    );
};

export default MobileUserManagement;
