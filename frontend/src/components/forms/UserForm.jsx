// src/components/forms/UserForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Box,
  Avatar,
  Typography,
  FormControlLabel,
  Checkbox,
  Divider,
  IconButton,
  InputAdornment,
  FormHelperText
} from '@mui/material';
import {
  CloudUpload,
  Close,
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  Phone,
  Home
} from '@mui/icons-material';

const UserForm = ({ 
  open, 
  onClose, 
  onSubmit, 
  user = null, 
  loading = false, 
  errors = {},
  embedded = false,
  isRegistration = false 
}) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    address: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    password: '',
    password_confirm: '',
    profile_image: null,
    is_active: true,
    is_staff: false,
    is_superuser: false
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  useEffect(() => {
    if (user) {
      // Editing existing user
      setFormData({
        username: user.username || '',
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone_number: user.phone_number || '',
        address: user.address || '',
        password: '',
        password_confirm: '',
        profile_image: null,
        is_active: user.is_active ?? true,
        is_staff: user.is_staff ?? false,
        is_superuser: user.is_superuser ?? false
      });
      
      if (user.profile_image) {
        setImagePreview(user.profile_image);
      }
      setShowPasswordFields(false);
    } else {
      // Creating new user or registration
      setFormData({
        username: '',
        email: '',
        address: '',
        first_name: '',
        last_name: '',
        phone_number: '',
        password: '',
        password_confirm: '',
        profile_image: null,
        is_active: true,
        is_staff: false,
        is_superuser: false
      });
      setImagePreview(null);
      setShowPasswordFields(true);
    }
  }, [user, open]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file too large (max 5MB)');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setFormData({ ...formData, profile_image: file });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({ ...formData, profile_image: null });
    setImagePreview(user?.profile_image || null);
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation (only if creating new user or changing password)
    if (!user || showPasswordFields) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (!formData.password_confirm) {
        newErrors.password_confirm = 'Please confirm your password';
      } else if (formData.password !== formData.password_confirm) {
        newErrors.password_confirm = 'Passwords do not match';
      }
    }

    // If editing and password fields are shown but empty, that's ok
    if (user && showPasswordFields) {
      if (!formData.password && !formData.password_confirm) {
        // Both empty is ok for edit
        delete newErrors.password;
        delete newErrors.password_confirm;
      }
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      console.log('Validation errors:', validationErrors);
      return;
    }

    // Prepare data
    const data = new FormData();

    // Add all form fields
    Object.keys(formData).forEach((key) => {
      if (key === 'password_confirm') return; // Don't send password_confirm

      if (key === 'profile_image') {
        // Only add image if a new file was selected
        if (formData[key] instanceof File) {
          data.append(key, formData[key]);
        }
      } else if (key === 'password') {
        // Only add password if:
        // 1. Creating new user and password is not empty
        // 2. Editing user and showPasswordFields is true and password is not empty
        if (!user && formData[key]) {
          data.append(key, formData[key]);
        } else if (user && showPasswordFields && formData[key].trim() !== '') {
          data.append(key, formData[key]);
        }
      } else if (typeof formData[key] === 'boolean') {
        data.append(key, formData[key]);
      } else if (formData[key] !== null && formData[key] !== '') {
        data.append(key, formData[key]);
      }
    });

    onSubmit(data);
  };

  const handleClose = () => {
    setImagePreview(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowPasswordFields(false);
    onClose();
  };

  // If embedded mode (for registration page), render without Dialog
  const formContent = (
    <>
      <Grid container spacing={3}>
        {/* Profile Image Section */}
        {!isRegistration && (
          <>
            <Grid item xs={12}>
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <Avatar
                  src={imagePreview}
                  sx={{ width: 100, height: 100 }}
                >
                  {formData.username?.charAt(0).toUpperCase() || <Person />}
                </Avatar>

                <Box display="flex" gap={1}>
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<CloudUpload />}
                    size="small"
                  >
                    Upload Image
                    <input
                      type="file"
                      name="profile_image"
                      onChange={handleImageChange}
                      accept="image/*"
                      hidden
                    />
                  </Button>

                  {imagePreview && (
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={removeImage}
                      size="small"
                    >
                      Remove
                    </Button>
                  )}
                </Box>

                {errors.profile_image && (
                  <FormHelperText error>
                    {Array.isArray(errors.profile_image) 
                      ? errors.profile_image[0] 
                      : errors.profile_image}
                  </FormHelperText>
                )}
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>
          </>
        )}

        {/* Basic Information */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            error={!!errors.username}
            helperText={Array.isArray(errors.username) 
              ? errors.username[0] 
              : errors.username}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            error={!!errors.email}
            helperText={Array.isArray(errors.email) 
              ? errors.email[0] 
              : errors.email}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            error={!!errors.first_name}
            helperText={Array.isArray(errors.first_name) 
              ? errors.first_name[0] 
              : errors.first_name}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            error={!!errors.last_name}
            helperText={Array.isArray(errors.last_name) 
              ? errors.last_name[0] 
              : errors.last_name}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Phone Number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            error={!!errors.phone_number}
            helperText={Array.isArray(errors.phone_number) 
              ? errors.phone_number[0] 
              : errors.phone_number}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Phone />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            error={!!errors.address}
            helperText={Array.isArray(errors.address) 
              ? errors.address[0] 
              : errors.address}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Home />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* Password Section */}
        {!isRegistration && (
          <>
            <Grid item xs={12}>
              <Divider />
              <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} mb={1}>
                <Typography variant="subtitle2" color="textSecondary">
                  Password Settings
                </Typography>
                {user && (
                  <Button
                    size="small"
                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                  >
                    {showPasswordFields ? 'Hide' : 'Change Password'}
                  </Button>
                )}
              </Box>
            </Grid>
          </>
        )}

        {(showPasswordFields || !user) && (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required={!user}
                error={!!errors.password}
                helperText={Array.isArray(errors.password) 
                  ? errors.password[0] 
                  : errors.password || (isRegistration ? 'Minimum 8 characters' : '')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirm Password"
                name="password_confirm"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.password_confirm}
                onChange={handleChange}
                required={!user}
                error={!!errors.password_confirm || 
                  (formData.password !== formData.password_confirm && 
                   formData.password_confirm !== '')}
                helperText={
                  Array.isArray(errors.password_confirm) 
                    ? errors.password_confirm[0]
                    : errors.password_confirm ||
                      (formData.password !== formData.password_confirm && 
                       formData.password_confirm !== '' 
                        ? 'Passwords do not match' 
                        : '')
                }
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </>
        )}

        {/* Permissions Section - Only for admin forms, not for registration */}
        {!isRegistration && (
          <>
            <Grid item xs={12}>
              <Divider />
              <Typography variant="subtitle2" color="textSecondary" sx={{ mt: 2, mb: 1 }}>
                Permissions
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                }
                label="Active"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="is_staff"
                    checked={formData.is_staff}
                    onChange={handleChange}
                  />
                }
                label="Staff"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="is_superuser"
                    checked={formData.is_superuser}
                    onChange={handleChange}
                  />
                }
                label="Superuser"
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* General Errors */}
      {(errors.general || errors.non_field_errors) && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errors.general || errors.non_field_errors}
        </Alert>
      )}
    </>
  );

  // Return embedded version (without Dialog) for registration
  if (embedded) {
    return (
      <form onSubmit={handleSubmit}>
        {formContent}
        <Box sx={{ mt: 3 }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading || 
              (formData.password !== formData.password_confirm && 
               (showPasswordFields || !user))}
            startIcon={loading ? <CircularProgress size={20} /> : null}
            sx={{ py: 1.5 }}
          >
            {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
          </Button>
        </Box>
      </form>
    );
  }

  // Return Dialog version for admin panel
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {user ? 'Edit User' : 'Create New User'}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent>
          {formContent}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || 
              (formData.password !== formData.password_confirm && 
               (showPasswordFields || !user))}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Saving...' : user ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default UserForm;