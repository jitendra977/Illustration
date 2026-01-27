import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/auth';
import { usersAPI } from '../services/users';

export const AuthContext = createContext();

// Enhanced useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch and update user profile
  const fetchUserProfile = async () => {
    try {
      const profile = await usersAPI.getProfile();
      console.log('Fetched user profile:', profile);

      // Update user state with complete profile data
      setUser(prevUser => ({
        ...prevUser,
        ...profile,
        token: prevUser?.token || localStorage.getItem('access_token')
      }));

      // Update localStorage with complete profile
      localStorage.setItem('user_data', JSON.stringify({
        ...profile,
        token: user?.token || localStorage.getItem('access_token')
      }));

      return profile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const storedUser = localStorage.getItem('user_data');

        if (token && storedUser) {
          try {
            // Parse stored user data
            const userData = JSON.parse(storedUser);
            setUser({ ...userData, token });
            console.log('Restored user from localStorage:', userData);

            // Fetch fresh profile data
            await fetchUserProfile();
          } catch (parseError) {
            console.error('Error parsing stored user data:', parseError);
            // Clear invalid data
            localStorage.removeItem('user_data');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
        } else if (token && refreshToken) {
          // We have tokens but no user data, try to refresh token to validate
          try {
            const refreshResponse = await authAPI.refreshToken(refreshToken);
            localStorage.setItem('access_token', refreshResponse.access);

            // Fetch complete user profile
            const profile = await fetchUserProfile();
            if (!profile) {
              throw new Error('Failed to fetch user profile');
            }

            console.log('Token refreshed and profile fetched successfully');
          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            // Clear invalid tokens
            authAPI.logout();
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        authAPI.logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      const data = await authAPI.login(credentials);

      console.log('Login response:', data);

      // Store tokens
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);

      // Create initial user object from login response
      const initialUserData = {
        ...data.user,
        token: data.access,
        loginTime: new Date().toISOString()
      };

      console.log('Setting initial user data:', initialUserData);

      setUser(initialUserData);
      localStorage.setItem('user_data', JSON.stringify(initialUserData));

      // Fetch complete user profile after login
      const completeProfile = await fetchUserProfile();
      if (completeProfile) {
        console.log('Complete profile loaded:', completeProfile);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Login error details:', error);

      return {
        success: false,
        error: error.details || error.message || 'Login failed',
        originalError: error
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      console.log('Registration response:', response);
      return { success: true, data: response };
    } catch (error) {
      console.error('Registration error:', error);

      return {
        success: false,
        error: error.details || error.message || 'Registration failed',
        originalError: error
      };
    }
  };

  const logout = () => {
    console.log('Logging out user');
    authAPI.logout();
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    console.log('Updating user data:', updatedUser);

    // Ensure profile_image includes timestamp to prevent caching issues
    if (newUserData.profile_image) {
      const timestamp = new Date().getTime();
      updatedUser.profile_image = `${newUserData.profile_image}${newUserData.profile_image.includes('?') ? '&' : '?'}_t=${timestamp}`;
    }

    setUser(updatedUser);
    localStorage.setItem('user_data', JSON.stringify(updatedUser));
  };

  // Function to refresh user profile
  const refreshProfile = async () => {
    try {
      const profile = await fetchUserProfile();
      return { success: true, profile };
    } catch (error) {
      console.error('Error refreshing profile:', error);
      return { success: false, error: 'Failed to refresh profile' };
    }
  };

  // Function to refresh access token
  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await authAPI.refreshToken(refreshToken);
      localStorage.setItem('access_token', response.access);

      // Update user object with new token
      if (user) {
        const updatedUser = { ...user, token: response.access };
        setUser(updatedUser);
        localStorage.setItem('user_data', JSON.stringify(updatedUser));
      }

      return response.access;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };

  // Function to check if token is expired
  const isTokenExpired = () => {
    const token = localStorage.getItem('access_token');
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  };

  // Function to validate current authentication state
  const validateAuth = async () => {
    if (!user) return false;

    if (isTokenExpired()) {
      try {
        await refreshAccessToken();
        return true;
      } catch (error) {
        logout();
        return false;
      }
    }

    return true;
  };

  // Function to get user permissions
  const hasPermission = (permission, factoryId = null) => {
    if (!user) return false;

    // Staff/Superuser always have broad permissions
    if (user.is_superuser) return true;
    if (user.is_staff && (permission === 'admin' || permission === 'active')) return true;

    // Factory-specific permissions
    if (factoryId && user.factory_memberships) {
      const membership = user.factory_memberships.find(m => m.factory.id === factoryId && m.is_active);
      if (membership && membership.role) {
        const role = membership.role;
        const roleCode = role.code;

        // VERIFICATION GATE: High-tier roles must be verified to exercise their privileges
        const highTierRoles = [
          'SUPER_ADMIN',
          'FACTORY_MANAGER',
          'ILLUSTRATION_ADMIN',
          'ILLUSTRATION_EDITOR',
          'ILLUSTRATION_VIEWER'
        ];
        const isHighTier = highTierRoles.includes(roleCode);

        // If unverified, they are restricted to 'OWN ONLY' visibility for illustrations.
        // Backend strictly requires verification for most operations.
        if (isHighTier && !user.is_verified) {
          if (permission === 'active') return true;
          if (permission === 'verified') return false;
          return false;
        }

        switch (permission) {
          case 'manage_users': return role.can_manage_users;
          case 'manage_jobs': return role.can_manage_jobs;
          case 'view_finance': return role.can_view_finance;
          case 'edit_finance': return role.can_edit_finance;
          case 'create_illustrations':
            // ILLUSTRATION_CONTRIBUTOR can create if active, even if unverified (per backend)
            if (roleCode === 'ILLUSTRATION_CONTRIBUTOR') return role.can_create_illustration;
            return role.can_create_illustration && user.is_verified;
          case 'view_illustrations': return role.can_view_illustration;
          case 'edit_illustrations': return role.can_edit_illustration;
          case 'delete_illustrations': return role.can_delete_illustration;
          case 'view_all_illustrations': return role.can_view_all_factory_illustrations;
          case 'manage_factory': return role.can_manage_factory;
          case 'manage_all_systems': return role.can_manage_all_systems;
          case 'manage_catalog': return role.can_manage_catalog && user.is_verified;
          default: break;
        }
      }
    }

    // Check system-wide permissions across all memberships
    // Use the pre-aggregated permissions from the backend if available
    if (permission === 'manage_all_systems') {
      if (user.permissions?.can_manage_all_systems) return user.is_verified;
      const hasSystemRole = user.factory_memberships?.some(m => m.is_active && (m.role?.can_manage_all_systems || m.role_code === 'SUPER_ADMIN'));
      return user.is_superuser || (hasSystemRole && user.is_verified);
    }

    if (permission === 'manage_users') {
      if (user.permissions?.can_manage_users) return user.is_verified;
      const hasPrivilege = user.factory_memberships?.some(m => m.is_active && (m.role?.can_manage_users || m.role_code === 'FACTORY_MANAGER' || m.role_code === 'SUPER_ADMIN'));
      return user.is_superuser || (hasPrivilege && user.is_verified);
    }

    if (permission === 'manage_factory') {
      if (user.permissions?.can_manage_factory) return user.is_verified;
      const hasPrivilege = user.factory_memberships?.some(m => m.is_active && (m.role?.can_manage_factory || m.role_code === 'FACTORY_MANAGER' || m.role_code === 'SUPER_ADMIN'));
      return user.is_superuser || (hasPrivilege && user.is_verified);
    }

    if (permission === 'create_illustrations') {
      if (user.permissions?.can_create_illustration) return true; // Contributor can create if active (even unverified per backend)
      const hasPrivilege = user.factory_memberships?.some(m => m.is_active && (m.role?.can_create_illustration || ['SUPER_ADMIN', 'FACTORY_MANAGER', 'ILLUSTRATION_ADMIN', 'ILLUSTRATION_EDITOR', 'ILLUSTRATION_CONTRIBUTOR'].includes(m.role_code)));
      return user.is_superuser || hasPrivilege;
    }

    if (permission === 'view_illustrations' || permission === 'view_all_illustrations') {
      if (user.permissions?.can_view_illustration || user.permissions?.can_view_all_factory_illustrations) return user.is_verified;
      const hasPrivilege = user.factory_memberships?.some(m => m.is_active && (m.role?.can_view_illustration || m.role?.can_view_all_factory_illustrations || ['SUPER_ADMIN', 'FACTORY_MANAGER', 'ILLUSTRATION_ADMIN', 'ILLUSTRATION_EDITOR', 'ILLUSTRATION_VIEWER'].includes(m.role_code)));
      return user.is_superuser || (hasPrivilege && user.is_verified);
    }

    // Catalog permissions (Reference data like Manufacturers, Engines, etc.)
    // Backend AdminOrReadOnly strictly requires is_verified for SAFE_METHODS too.
    const catalogPermissions = ['view_catalog', 'manage_catalog', 'browse_catalog'];
    if (catalogPermissions.includes(permission)) {
      if (!user.is_verified) return false;
      if (permission === 'manage_catalog') {
        return user.is_superuser || user.factory_memberships?.some(m => m.is_active && m.role?.can_manage_catalog);
      }
      return true; // Verified users can view/browse catalog
    }

    switch (permission) {
      case 'admin':
        return (user.is_staff || user.is_superuser) && user.is_verified;
      case 'superuser':
        return user.is_superuser && user.is_verified;
      case 'verified':
        return user.is_verified;
      case 'active':
        return user.is_active;
      default:
        return false;
    }
  };

  // Helper methods
  const getFactories = () => {
    if (!user || !user.factory_memberships) return [];
    return user.factory_memberships
      .filter(m => m.is_active)
      .map(m => m.factory);
  };

  const getRoleInFactory = (factoryId) => {
    if (!user || !user.factory_memberships) return null;
    const membership = user.factory_memberships.find(m => m.factory.id === factoryId && m.is_active);
    return membership ? membership.role : null;
  };

  // Function to update user profile
  const updateProfile = async (profileData) => {
    try {
      const updatedProfile = await usersAPI.updateProfile(profileData);
      updateUser(updatedProfile);
      return { success: true, profile: updatedProfile };
    } catch (error) {
      console.error('Profile update error:', error);
      return {
        success: false,
        error: error.details || error.message || 'Profile update failed'
      };
    }
  };

  // Function to change password
  const changePassword = async (passwordData) => {
    try {
      const result = await usersAPI.changePassword(passwordData);
      return { success: true, message: 'Password changed successfully' };
    } catch (error) {
      console.error('Password change error:', error);
      return {
        success: false,
        error: error.details || error.message || 'Password change failed'
      };
    }
  };

  // Function to check if user is authenticated and token is valid
  const isAuthenticated = () => {
    return !!user && !isTokenExpired();
  };

  // Function to get authentication headers for API calls
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const contextValue = {
    user,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    changePassword,
    refreshAccessToken,
    refreshProfile,
    validateAuth,
    hasPermission,
    getFactories,
    getRoleInFactory,
    isAuthenticated: isAuthenticated(),
    isTokenExpired,
    getAuthHeaders,
    loading
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};