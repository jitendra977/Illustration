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
    CircularProgress
} from '@mui/material';

const FactoryDialog = ({
    open,
    onClose,
    form,
    setForm,
    errors,
    onSave,
    loading,
    isEdit
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogTitle sx={{ fontWeight: 800, p: 3 }}>
                {isEdit ? '工場の編集' : '新しい工場の作成'}
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}>
                {errors.detail && <Alert severity="error" sx={{ mb: 2 }}>{errors.detail}</Alert>}
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="工場名"
                        fullWidth
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        error={!!errors.name}
                        helperText={errors.name}
                    />
                    <TextField
                        label="住所"
                        fullWidth
                        required
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        error={!!errors.address}
                        helperText={errors.address}
                    />
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
                <Button onClick={onClose} color="inherit" disabled={loading} sx={{ borderRadius: 2 }}>
                    キャンセル
                </Button>
                <Button
                    variant="contained"
                    onClick={onSave}
                    disabled={!form.name || !form.address || loading}
                    sx={{ borderRadius: 2, px: 4 }}
                >
                    {loading ? <CircularProgress size={20} /> : '保存'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FactoryDialog;
