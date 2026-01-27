import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Fab, CircularProgress, Alert, Snackbar, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { Send as SendIcon, Email as EmailIcon } from '@mui/icons-material';
import api from '../../services/index';

const PreviewSendPage = () => {
    const { token } = useParams();
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [emailOpen, setEmailOpen] = useState(false);
    const [sending, setSending] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Fields for confirm dialog
    const [email, setEmail] = useState('');
    const [subject, setSubject] = useState('');
    const [body, setBody] = useState('');

    useEffect(() => {
        // Construct the URL directly. 
        // Note: In real app, we might get the preview URL from a call, but here we know the pattern.
        // Actually, we need to pass the base URL if api.defaults.baseURL is relative.
        // Assuming api.defaults.baseURL is set properly. 
        // For Iframe, we need absolute URL or relative to root.
        // Let's rely on the API URL.
        const apiUrl = api.defaults.baseURL || '/api';
        setPdfUrl(`${apiUrl}/illustration-files/staged_pdf/${token}/`);
        setLoading(false);

        // Retrieve initial email from localStorage if we saved it before opening tab?
        // Or just ask user again? 
        // Let's try to get initial params from query string if passed? 
        // URLSearchParams is better.
        const params = new URLSearchParams(window.location.search);
        if (params.get('email')) setEmail(params.get('email'));
        if (params.get('subject')) setSubject(params.get('subject'));
        if (params.get('body')) setBody(params.get('body'));

    }, [token]);

    const handleSend = async () => {
        setSending(true);
        let emailSent = false;

        try {
            // First, send the email
            await api.post(`/illustration-files/staged_email/${token}/`, {
                recipient_email: email,
                subject,
                body
            });
            emailSent = true;
            console.log('Email sent successfully');

        } catch (err) {
            console.error('Email send error:', err);
            setSnackbar({ open: true, message: 'メール送信に失敗しました: ' + (err.response?.data?.error || err.message), severity: 'error' });
            setSending(false);
            return;
        }

        // Then, save to database as a submitted illustration
        try {
            console.log('Fetching PDF from cache...');
            const pdfResponse = await api.get(`/illustration-files/staged_pdf/${token}/`, {
                responseType: 'blob'
            });
            console.log('PDF fetched, size:', pdfResponse.data.size);

            const formData = new FormData();
            formData.append('edited_file', pdfResponse.data, 'edited.pdf');
            formData.append('recipient_email', email);
            formData.append('subject', subject || '');
            formData.append('body', body || '');
            formData.append('status', 'email_sent');

            console.log('Saving to database...');
            const saveResponse = await api.post('/submitted-illustrations/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log('Save response:', saveResponse.data);

            setSnackbar({ open: true, message: 'メールを送信し、データベースに保存しました！', severity: 'success' });
            setEmailOpen(false);

            // Redirect to submitted list after delay
            setTimeout(() => {
                window.location.href = '/submitted';
            }, 1500);

        } catch (saveErr) {
            console.error('Database save error:', saveErr);
            console.error('Save error response:', saveErr.response);
            console.error('Save error data:', saveErr.response?.data);

            let errorMessage = 'データベース保存に失敗しました: ';
            if (saveErr.response?.data) {
                if (typeof saveErr.response.data === 'object') {
                    errorMessage += JSON.stringify(saveErr.response.data);
                } else {
                    errorMessage += saveErr.response.data.error || saveErr.response.data;
                }
            } else {
                errorMessage += saveErr.message;
            }

            // Email was sent but save failed
            setSnackbar({
                open: true,
                message: `メールは送信されましたが、${errorMessage}`,
                severity: 'warning'
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <Box sx={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                </Box>
            )}

            {!loading && pdfUrl && (
                <iframe
                    src={pdfUrl}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    title="PDF Preview"
                />
            )}

            {/* Floating Action Button */}
            <Tooltip title="このPDFをメールで送信">
                <Fab
                    color="primary"
                    variant="extended"
                    sx={{
                        position: 'fixed',
                        bottom: 32,
                        right: 32,
                        zIndex: 1000,
                        px: 4
                    }}
                    onClick={() => setEmailOpen(true)}
                >
                    <EmailIcon sx={{ mr: 1 }} />
                    メール送信
                </Fab>
            </Tooltip>

            {/* Email Confirm Dialog */}
            <Dialog open={emailOpen} onClose={() => setEmailOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>メール送信確認</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="送信先メール"
                        type="email"
                        fullWidth
                        variant="standard"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="件名"
                        fullWidth
                        variant="standard"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEmailOpen(false)}>キャンセル</Button>
                    <Button onClick={handleSend} variant="contained" disabled={!email || sending}>
                        {sending ? '送信中...' : '送信'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default PreviewSendPage;
