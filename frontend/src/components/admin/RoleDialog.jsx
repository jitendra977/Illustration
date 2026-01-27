import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Alert,
    Stack,
    TextField,
    CircularProgress,
    Grid,
    Typography,
    Paper,
    FormControlLabel,
    Switch,
    Box,
    Divider,
    Autocomplete,
    useTheme,
    alpha
} from '@mui/material';
import { PERMISSION_MAP } from './roleConstants';

const RoleDialog = ({
    open,
    onClose,
    form,
    setForm,
    errors,
    onSave,
    loading,
    isEdit
}) => {
    const theme = useTheme();

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogTitle sx={{ fontWeight: 800, p: 3 }}>
                {isEdit ? 'ロールの編集' : '新しいロールの作成'}
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
                {errors.detail && <Alert severity="error" sx={{ mb: 2 }}>{errors.detail}</Alert>}
                <Grid container spacing={3} sx={{ mt: 0 }}>
                    <Grid item xs={12} md={6}>
                        <Stack spacing={3}>
                            <TextField
                                label="ロール名"
                                fullWidth
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                error={!!errors.name}
                                helperText={errors.name}
                            />
                            <Autocomplete
                                freeSolo
                                options={[
                                    'SUPER_ADMIN',
                                    'FACTORY_MANAGER',
                                    'ILLUSTRATION_ADMIN',
                                    'ILLUSTRATION_EDITOR',
                                    'ILLUSTRATION_CONTRIBUTOR',
                                    'ILLUSTRATION_VIEWER',
                                    'FEEDBACK_MANAGER'
                                ]}
                                value={form.code}
                                onInputChange={(event, newValue) => {
                                    setForm({ ...form, code: newValue.toUpperCase() });
                                }}
                                disabled={isEdit}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="コード (英字)"
                                        required
                                        error={!!errors.code}
                                        helperText={errors.code || (isEdit ? "" : "システムが識別するための短縮コード（一意）")}
                                    />
                                )}
                            />
                        </Stack>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 700 }}>権限設定</Typography>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.default, 0.5) }}>
                            <Grid container spacing={1}>
                                {Object.keys(form).filter(k => k.startsWith('can_')).map(key => (
                                    <Grid item xs={12} key={key}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={form[key]}
                                                    onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                                                    size="small"
                                                    color="success"
                                                />
                                            }
                                            label={
                                                <Box>
                                                    <Typography variant="body2" fontWeight="600">
                                                        {PERMISSION_MAP[key] || key.replace('can_', '').replace(/_/g, ' ')}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {key}
                                                    </Typography>
                                                </Box>
                                            }
                                            sx={{ alignItems: 'flex-start', ml: 0 }}
                                        />
                                        <Divider sx={{ my: 0.5, opacity: 0.5 }} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} color="inherit" disabled={loading} sx={{ borderRadius: 2 }}>
                    キャンセル
                </Button>
                <Button
                    variant="contained"
                    onClick={onSave}
                    disabled={!form.name || !form.code || loading}
                    sx={{ borderRadius: 2, px: 4 }}
                >
                    {loading ? <CircularProgress size={20} /> : '保存'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RoleDialog;
