import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    CircularProgress,
    Alert,
    Stack
} from '@mui/material';
import {
    Download as DownloadIcon,
    Visibility as VisibilityIcon,
    Email as EmailIcon
} from '@mui/icons-material';
import api from '../../services/index';

const SubmittedListPage = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/submitted-illustrations/');
            setSubmissions(response.data.results || response.data);
        } catch (err) {
            console.error('Failed to fetch submissions:', err);
            setError('提出済みファイルの読み込みに失敗しました');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (id) => {
        try {
            const response = await api.get(`/submitted-illustrations/${id}/download/`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `submission_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
            alert('ダウンロードに失敗しました');
        }
    };

    const handleView = async (id) => {
        try {
            const response = await api.get(`/submitted-illustrations/${id}/download/`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
            window.open(url, '_blank');
        } catch (err) {
            console.error('View failed:', err);
            alert('表示に失敗しました');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
                提出済みファイル
            </Typography>

            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            )}

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {!loading && !error && submissions.length === 0 && (
                <Alert severity="info">
                    提出済みファイルがありません
                </Alert>
            )}

            {!loading && !error && submissions.length > 0 && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>提出日時</TableCell>
                                <TableCell>送信先</TableCell>
                                <TableCell>件名</TableCell>
                                <TableCell>ステータス</TableCell>
                                <TableCell align="right">操作</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {submissions.map((submission) => (
                                <TableRow key={submission.id} hover>
                                    <TableCell>
                                        {formatDate(submission.created_at)}
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <EmailIcon fontSize="small" color="action" />
                                            <Typography variant="body2">
                                                {submission.recipient_email || '未設定'}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        {submission.subject || '(件名なし)'}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={submission.status_display}
                                            color={submission.status === 'email_sent' ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleView(submission.id)}
                                            title="表示"
                                        >
                                            <VisibilityIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDownload(submission.id)}
                                            title="ダウンロード"
                                        >
                                            <DownloadIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
};

export default SubmittedListPage;
