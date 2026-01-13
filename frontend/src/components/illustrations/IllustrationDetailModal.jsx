import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Stack,
    Chip,
    IconButton,
    Divider,
    CircularProgress,
    Alert,
    useTheme,
    alpha,
    Grid,
    Paper,
} from '@mui/material';
import {
    Close as CloseIcon,
    Download as DownloadIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    InsertDriveFile as FileIcon,
    CloudDownload as CloudDownloadIcon,
    Share as ShareIcon,
} from '@mui/icons-material';
import { illustrationAPI } from '../../api/illustrations';
import PDFPreviewModal from './PDFPreviewModal';

import { useAuth } from '../../context/AuthContext';

const IllustrationDetailModal = ({
    open,
    onClose,
    illustration,
    onUpdate,
    onDelete,
    onEdit
}) => {
    const { user } = useAuth();
    const canEdit = user?.is_staff || user?.is_superuser;
    const theme = useTheme();
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState(null);
    const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    if (!illustration) return null;

    const handleDelete = async () => {
        if (!window.confirm('このイラストレーションを削除してもよろしいですか？')) return;

        setDeleting(true);
        setError(null);
        try {
            await illustrationAPI.delete(illustration.id);
            onDelete?.(illustration.id);
            onClose();
        } catch (err) {
            console.error('Failed to delete illustration:', err);
            setError('削除に失敗しました');
        } finally {
            setDeleting(false);
        }
    };

    const handleFilePreview = (file) => {
        if (file.file_type === 'pdf' || (file.file && file.file.toLowerCase().endsWith('.pdf'))) {
            setSelectedFile(file);
            setPdfPreviewOpen(true);
        } else if (file.file) {
            window.open(file.file, '_blank');
        }
    };

    const handleDownload = (file) => {
        if (!file.file) return;
        const link = document.createElement('a');
        link.href = file.file;
        link.download = file.file_name || 'download';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={onClose}
                maxWidth="md"
                fullWidth
                scroll="paper"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        bgcolor: 'background.default',
                        backgroundImage: 'none'
                    }
                }}
            >
                <DialogTitle sx={{
                    m: 0,
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: 1,
                    borderColor: 'divider',
                    bgcolor: 'background.paper'
                }}>
                    <Typography variant="h6" fontWeight="800">
                        イラストレーション詳細
                    </Typography>
                    <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers sx={{ p: 2 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Grid container spacing={3}>
                        {/* Metadata Section */}
                        <Grid item xs={12} md={5}>
                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                                        タイトル
                                    </Typography>
                                    <Typography variant="h5" fontWeight="900" sx={{ color: 'primary.main' }}>
                                        {illustration.title}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                                        説明
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                        {illustration.description || '説明なし'}
                                    </Typography>
                                </Box>

                                <Divider sx={{ borderColor: 'divider' }} />

                                <Box>
                                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                                        基本情報
                                    </Typography>
                                    <Stack spacing={1} mt={1}>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>メーカー:</Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>{illustration.engine_model_detail?.manufacturer?.name || illustration.manufacturer_name || '-'}</Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>エンジン型式:</Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>{illustration.engine_model_name || illustration.engine_model_detail?.name || '-'}</Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>パーツカテゴリー:</Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>{illustration.part_category_name || illustration.part_category_detail?.name || '-'}</Typography>
                                        </Box>
                                        {illustration.part_subcategory_name && (
                                            <Box display="flex" justifyContent="space-between">
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>パーツサブカテゴリー:</Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>{illustration.part_subcategory_name}</Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                </Box>

                                <Box>
                                    <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                                        作成情報
                                    </Typography>
                                    <Stack spacing={1} mt={1}>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>作成者:</Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>{illustration.user_name || '-'}</Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>工場:</Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>{illustration.factory_name || '-'}</Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>作成日:</Typography>
                                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                {illustration.created_at ? new Date(illustration.created_at).toLocaleDateString('ja-JP') : '-'}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Stack>
                        </Grid>

                        {/* Files Section */}
                        <Grid item xs={12} md={7}>
                            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800 }} gutterBottom display="block">
                                添付ファイル ({illustration.files?.length || 0})
                            </Typography>

                            <Stack spacing={1.5}>
                                {illustration.files && illustration.files.length > 0 ? (
                                    illustration.files.map((file, idx) => (
                                        <Paper
                                            key={file.id || idx}
                                            variant="outlined"
                                            sx={{
                                                p: 1.5,
                                                borderRadius: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                bgcolor: alpha(theme.palette.zinc[900], 0.3),
                                                borderColor: 'divider',
                                                '&:hover': {
                                                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                    borderColor: theme.palette.primary.main,
                                                    transform: 'translateX(4px)'
                                                }
                                            }}
                                            onClick={() => handleFilePreview(file)}
                                        >
                                            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ overflow: 'hidden' }}>
                                                <Box
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 1,
                                                        bgcolor: file.file_type === 'pdf' ? alpha(theme.palette.error.main, 0.1) : alpha(theme.palette.primary.main, 0.1),
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    {file.file_type === 'pdf' ? (
                                                        <FileIcon sx={{ color: theme.palette.error.main }} />
                                                    ) : (
                                                        <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <Typography variant="caption" fontWeight="bold" color="primary.main">
                                                                IMG
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                                <Box sx={{ overflow: 'hidden' }}>
                                                    <Typography variant="body2" fontWeight="bold" noWrap>
                                                        {file.file_name || `ファイル ${idx + 1}`}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {file.file_type === 'image' ? '画像' : 'PDF'}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                            <Stack direction="row" spacing={0.5}>
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                                                    color="primary"
                                                >
                                                    <CloudDownloadIcon fontSize="small" />
                                                </IconButton>
                                            </Stack>
                                        </Paper>
                                    ))
                                ) : (
                                    <Box sx={{ py: 4, textAlign: 'center', bgcolor: alpha(theme.palette.zinc[900], 0.5), borderRadius: 2, border: `1px dashed ${theme.palette.divider}` }}>
                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                            添付ファイルはありません
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
                    <Stack direction="row" spacing={1}>
                        {canEdit && (
                            <>
                                <Button
                                    startIcon={<DeleteIcon />}
                                    color="error"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    size="small"
                                    sx={{ fontWeight: 700, textTransform: 'none' }}
                                >
                                    削除
                                </Button>
                                <Button
                                    startIcon={<EditIcon />}
                                    onClick={onEdit}
                                    disabled={deleting}
                                    size="small"
                                    sx={{ fontWeight: 700, textTransform: 'none', color: 'text.secondary' }}
                                >
                                    編集
                                </Button>
                            </>
                        )}
                    </Stack>
                    <Button
                        variant="contained"
                        onClick={onClose}
                        sx={{
                            borderRadius: 2,
                            fontWeight: 700,
                            px: 3,
                            textTransform: 'none',
                            bgcolor: 'primary.main',
                            '&:hover': { bgcolor: 'primary.dark' }
                        }}
                    >
                        閉じる
                    </Button>
                </DialogActions>
            </Dialog>

            {selectedFile && (
                <PDFPreviewModal
                    open={pdfPreviewOpen}
                    onClose={() => setPdfPreviewOpen(false)}
                    fileId={selectedFile.id}
                    fileName={selectedFile.file_name || illustration.title}
                />
            )}
        </>
    );
};

export default IllustrationDetailModal;
