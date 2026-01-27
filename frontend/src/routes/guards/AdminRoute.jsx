import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

const AdminRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    // Check for admin privileges (is_staff or is_superuser)
    if (!user.is_staff && !user.is_superuser) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="error" gutterBottom sx={{ fontWeight: 700 }}>
                    Access Denied
                </Typography>
                <Typography color="textSecondary">
                    You do not have permission to view this page.
                </Typography>
            </Box>
        );
    }

    // MANDATORY VERIFICATION: Admins MUST be verified to access management pages
    if (!user.is_verified) {
        return (
            <Box sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default', minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Box
                    sx={{
                        p: 4,
                        bgcolor: 'background.paper',
                        borderRadius: 4,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
                        maxWidth: 400,
                        mx: 'auto'
                    }}
                >
                    <Typography variant="h5" color="warning.main" gutterBottom sx={{ fontWeight: 800 }}>
                        Verification Required
                    </Typography>
                    <Typography color="textSecondary" sx={{ mb: 3 }}>
                        Your account has administrative status, but you must verify your email address before accessing management tools.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => window.location.href = '/profile'}
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                        Go to Profile
                    </Button>
                </Box>
            </Box>
        );
    }

    return children;
};

export default AdminRoute;
