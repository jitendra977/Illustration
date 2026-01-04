import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    Container,
    Typography,
    IconButton,
    Chip,
    Avatar,
    Paper
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Edit, Delete, Security, VerifiedUser, PersonOff } from '@mui/icons-material';
import { usersAPI } from '../../services/users';
import UserDialog from './UserDialog';

// Import api instance to make direct calls if needed, or update usersAPI
import { usersAPI as api } from '../../services/users';
import axios from 'axios';

// We need to extend usersAPI in the actual file, or just make direct calls here for now.
// For robust implementation, let's assume we'll use a mix or we can create a temporary helper here.
import axiosInstance from '../../services/index'; // Assuming you have a base axios instance exported

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            try {
                await axiosInstance.delete(`auth/users/${id}/`);
                fetchUsers();
            } catch (error) {
                console.error("Failed to delete user:", error);
                alert(error.response?.data?.detail || "Failed to delete user");
            }
        }
    };

    const handleSave = async (id, userData) => {
        if (id) {
            // Edit
            await axiosInstance.put(`auth/users/${id}/`, userData);
        } else {
            // Create
            await axiosInstance.post('auth/users/', userData);
        }
        fetchUsers();
    };

    const columns = [
        {
            field: 'id',
            headerName: 'ID',
            width: 70
        },
        {
            field: 'profile_image',
            headerName: '',
            width: 60,
            renderCell: (params) => (
                <Avatar src={params.value} sx={{ width: 30, height: 30 }} />
            )
        },
        {
            field: 'username',
            headerName: 'Username',
            width: 150
        },
        {
            field: 'email',
            headerName: 'Email',
            width: 200
        },
        {
            field: 'roles',
            headerName: 'Roles',
            width: 150,
            renderCell: (params) => {
                const { is_superuser, is_staff } = params.row;
                return (
                    <Box display="flex" gap={0.5}>
                        {is_superuser && <Chip size="small" label="ROOT" color="error" icon={<Security />} />}
                        {is_staff && !is_superuser && <Chip size="small" label="STAFF" color="warning" icon={<Security />} />}
                        {!is_staff && !is_superuser && <Chip size="small" label="USER" variant="outlined" />}
                    </Box>
                );
            }
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 180,
            renderCell: (params) => (
                <Box display="flex" gap={0.5}>
                    {params.row.is_active ? <Chip label="Active" color="success" size="small" /> : <Chip label="Inactive" color="default" size="small" />}
                    {params.row.is_verified ? <Chip label="Verified" color="primary" size="small" icon={<VerifiedUser />} /> : <Chip label="Unverified" color="default" size="small" variant="outlined" />}
                </Box>
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            renderCell: (params) => (
                <Box>
                    <IconButton size="small" color="primary" onClick={() => handleEdit(params.row)}>
                        <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
                        <Delete fontSize="small" />
                    </IconButton>
                </Box>
            )
        },
    ];

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h4" fontWeight="bold">
                    User Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleCreate}
                >
                    Add User
                </Button>
            </Box>

            <Paper elevation={2} sx={{ height: 600, width: '100%' }}>
                <DataGrid
                    rows={users}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    checkboxSelection={false}
                    disableSelectionOnClick
                    loading={loading}
                />
            </Paper>

            <UserDialog
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                user={selectedUser}
                onSave={handleSave}
            />
        </Container>
    );
};

export default UserManagement;
