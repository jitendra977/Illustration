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
    Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add, Edit, Delete } from '@mui/icons-material';
import { factoriesAPI } from '../../services/users';

const FactoryManagement = () => {
    const [factories, setFactories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedFactory, setSelectedFactory] = useState(null);
    const [formData, setFormData] = useState({ name: '', address: '' });
    const [error, setError] = useState(null);

    const fetchFactories = async () => {
        setLoading(true);
        try {
            const data = await factoriesAPI.getAll();
            setFactories(data.results || data);
        } catch (err) {
            console.error("Failed to fetch factories:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFactories();
    }, []);

    const handleOpenDialog = (factory = null) => {
        if (factory) {
            setSelectedFactory(factory);
            setFormData({ name: factory.name, address: factory.address });
        } else {
            setSelectedFactory(null);
            setFormData({ name: '', address: '' });
        }
        setError(null);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSave = async () => {
        try {
            if (selectedFactory) {
                await factoriesAPI.update(selectedFactory.id, formData);
            } else {
                await factoriesAPI.create(formData);
            }
            fetchFactories();
            handleCloseDialog();
        } catch (err) {
            setError(err.response?.data || { detail: "Failed to save factory" });
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this factory?')) {
            try {
                await factoriesAPI.delete(id);
                fetchFactories();
            } catch (err) {
                alert("Failed to delete factory");
            }
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 70 },
        { field: 'name', headerName: 'Factory Name', width: 250 },
        { field: 'address', headerName: 'Address', width: 400 },
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

    return (
        <Box>
            <Box display="flex" justifyItems="center" justifyContent="space-between" mb={3}>
                <Typography variant="h5" fontWeight="bold">
                    Factories
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenDialog()}
                    sx={{ borderRadius: 2 }}
                >
                    Add Factory
                </Button>
            </Box>

            <Paper elevation={0} sx={{ height: 600, width: '100%', border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                <DataGrid
                    rows={factories}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    disableSelectionOnClick
                    loading={loading}
                    sx={{ border: 'none' }}
                />
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
                <DialogTitle>{selectedFactory ? 'Edit Factory' : 'Add New Factory'}</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {error?.detail && <Alert severity="error">{error.detail}</Alert>}
                        <TextField
                            label="Factory Name"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            error={!!error?.name}
                            helperText={error?.name}
                        />
                        <TextField
                            label="Address"
                            fullWidth
                            multiline
                            rows={3}
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            error={!!error?.address}
                            helperText={error?.address}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave}>Save</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FactoryManagement;
