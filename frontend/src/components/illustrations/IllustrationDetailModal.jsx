import React, { useState, useEffect } from 'react';
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
    TextField,
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
import ConfirmDialog from '../dialog/ConfirmDialog';
import FavoriteButton from './FavoriteButton';

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
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [fullIllustration, setFullIllustration] = useState(null);

    const [downloadingFileId, setDownloadingFileId] = useState(null);

    // Confirm Dialog State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);

    // Rename Dialog State
    const [renameOpen, setRenameOpen] = useState(false);
    const [fileToRename, setFileToRename] = useState(null);
    const [newTitle, setNewTitle] = useState('');

    // Fetch fresh illustration data with files when modal opens
    useEffect(() => {
        if (open && illustration?.id) {
            const fetchFullDetails = async () => {
                setLoadingDetails(true);
                setError(null);
                try {
                    const data = await illustrationAPI.getById(illustration.id);
                    console.log('✅ Fetched full illustration with files:', data);
                    setFullIllustration(data);
                } catch (err) {
                    console.error('Failed to fetch illustration details:', err);
                    setError('詳細情報の読み込みに失敗しました');
                    // Fallback to passed illustration data
                    setFullIllustration(illustration);
                } finally {
                    setLoadingDetails(false);
                }
            };
            fetchFullDetails();
        } else {
            setFullIllustration(null);
        }
    }, [open, illustration?.id]);

    const currentIllustration = fullIllustration || illustration;

    if (!currentIllustration) return null;


    const handleDelete = async () => {
        if (!window.confirm('このイラストレーションを削除してもよろしいですか？')) return;

        setDeleting(true);
        setError(null);
        try {
            await illustrationAPI.delete(currentIllustration.id);
            onDelete?.(currentIllustration.id);
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

    const handleDownload = async (file) => {
        if (!file.file) return;

        try {
            setDownloadingFileId(file.id);

            // Put a minimum delay to show feedback if download is instant
            const startTime = Date.now();

            const response = await fetch(file.file);
            const blob = await response.blob();

            // Ensure minimum 500ms spinner
            const elapsed = Date.now() - startTime;
            if (elapsed < 500) await new Promise(r => setTimeout(r, 500 - elapsed));

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = file.file_name || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback to direct link opening if fetch fails (e.g. CORS)
            window.open(file.file, '_blank');
        } finally {
            setDownloadingFileId(null);
        }
    };

    const handleFileDeleteClick = (fileId, fileName) => {
        setFileToDelete({ id: fileId, name: fileName });
        setConfirmOpen(true);
    };

    const executeFileDelete = async () => {
        if (!fileToDelete) return;

        setError(null);
        try {
            await illustrationAPI.deleteFile(currentIllustration.id, fileToDelete.id);

            // Refresh the illustration data to get updated file list
            const updatedData = await illustrationAPI.getById(currentIllustration.id);
            setFullIllustration(updatedData);

            // Notify parent to refresh list
            onUpdate?.();
        } catch (err) {
            console.error('Failed to delete file:', err);
            setError('ファイルの削除に失敗しました');
        } finally {
            setConfirmOpen(false);
            setFileToDelete(null);
        }
    };

    const handleRenameClick = (file) => {
        setFileToRename(file);
        setNewTitle(file.title || file.file_name || '');
        setRenameOpen(true);
    };

    const executeRename = async () => {
        if (!fileToRename) return;

        try {
            // We use the illustrationAPI to update the file (need to check if updateFile exists or add it)
            // Or use direct axios call if API doesn't support it yet.
            // Assuming illustrationAPI has updateFile or I can use generic update.
            // Actually, IllustrationFileViewSet is at /api/illustration-files/
            await illustrationAPI.updateFile(fileToRename.id, { title: newTitle });

            // Refresh the illustration data
            const updatedData = await illustrationAPI.getById(currentIllustration.id);
            setFullIllustration(updatedData);

            setRenameOpen(false);
            setFileToRename(null);
            setNewTitle('');
        } catch (err) {
            console.error('Failed to rename file:', err);
            setError('ファイル名の変更に失敗しました');
        }
    };

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(0)) + ' ' + sizes[i];
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FavoriteButton illustration={currentIllustration} />
                        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
                            <CloseIcon />
                        </IconButton>
                    </Box>
                </DialogTitle>

                <DialogContent dividers sx={{ p: 2 }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {loadingDetails ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {/* Metadata Section */}
                            <Grid item xs={12} md={5}>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                                            タイトル
                                        </Typography>
                                        <Typography variant="h5" fontWeight="900" sx={{ color: 'primary.main' }}>
                                            {currentIllustration.title}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800 }}>
                                            説明
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                            {currentIllustration.description || '説明なし'}
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
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>{currentIllustration.engine_model_detail?.manufacturer?.name || currentIllustration.manufacturer_name || '-'}</Typography>
                                            </Box>
                                            <Box display="flex" justifyContent="space-between">
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>エンジン型式:</Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>{currentIllustration.engine_model_name || currentIllustration.engine_model_detail?.name || '-'}</Typography>
                                            </Box>
                                            <Box display="flex" justifyContent="space-between">
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>パーツカテゴリー:</Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>{currentIllustration.part_category_name || currentIllustration.part_category_detail?.name || '-'}</Typography>
                                            </Box>
                                            {currentIllustration.part_subcategory_name && (
                                                <Box display="flex" justifyContent="space-between">
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>パーツサブカテゴリー:</Typography>
                                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>{currentIllustration.part_subcategory_name}</Typography>
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
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>{currentIllustration.user_name || '-'}</Typography>
                                            </Box>
                                            <Box display="flex" justifyContent="space-between">
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>工場:</Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>{currentIllustration.factory_name || '-'}</Typography>
                                            </Box>
                                            <Box display="flex" justifyContent="space-between">
                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>作成日:</Typography>
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                    {currentIllustration.created_at ? new Date(currentIllustration.created_at).toLocaleDateString('ja-JP') : '-'}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Grid>

                            {/* Files Section */}
                            <Grid item xs={12} md={7}>
                                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800 }} gutterBottom display="block">
                                    添付ファイル ({currentIllustration.files?.length || 0})
                                </Typography>

                                <Stack spacing={1.5}>
                                    {currentIllustration.files && currentIllustration.files.length > 0 ? (
                                        currentIllustration.files.map((file, idx) => (
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
                                                    bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[900], 0.3) : alpha(theme.palette.text.primary, 0.02),
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
                                                            {file.title || file.file_name || `ファイル ${idx + 1}`}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {file.file_type === 'image' ? '画像' : 'PDF'}
                                                            {file.file_size ? ` ${formatFileSize(file.file_size)}` : ''}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                                <Stack direction="row" spacing={0.5}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                                                        color="primary"
                                                        disabled={downloadingFileId === file.id}
                                                    >
                                                        {downloadingFileId === file.id ? (
                                                            <CircularProgress size={20} color="inherit" />
                                                        ) : (
                                                            <CloudDownloadIcon fontSize="small" />
                                                        )}
                                                    </IconButton>
                                                    {canEdit && (
                                                        <>
                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleRenameClick(file);
                                                                }}
                                                                color="info"
                                                            >
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleFileDeleteClick(file.id, file.file_name || `ファイル ${idx + 1}`);
                                                                }}
                                                                color="error"
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </>
                                                    )}
                                                </Stack>
                                            </Paper>
                                        ))
                                    ) : (
                                        <Box sx={{
                                            py: 4,
                                            textAlign: 'center',
                                            bgcolor: theme.palette.mode === 'dark' ? alpha(theme.palette.zinc[900], 0.5) : alpha(theme.palette.text.primary, 0.02),
                                            borderRadius: 2,
                                            border: `1px dashed ${theme.palette.divider}`
                                        }}>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                添付ファイルはありません
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </Grid>
                        </Grid>
                    )}
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

            <ConfirmDialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                title="ファイルの削除"
                content={<Typography>ファイル「{fileToDelete?.name}」を削除してもよろしいですか？</Typography>}
                onConfirm={executeFileDelete}
                confirmText="削除"
                cancelText="キャンセル"
            />

            <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>ファイル名の変更</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="タイトル"
                        fullWidth
                        variant="outlined"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRenameOpen(false)}>キャンセル</Button>
                    <Button onClick={executeRename} variant="contained" color="primary">保存</Button>
                </DialogActions>
            </Dialog>

            {selectedFile && (
                <PDFPreviewModal
                    open={pdfPreviewOpen}
                    onClose={() => setPdfPreviewOpen(false)}
                    fileId={selectedFile.id}
                    fileName={selectedFile.file_name || currentIllustration.title}
                />
            )}
        </>
    );
};

export default IllustrationDetailModal;
