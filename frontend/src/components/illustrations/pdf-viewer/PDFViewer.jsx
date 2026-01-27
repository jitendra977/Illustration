import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
    Box,
    CircularProgress,
    Alert,
    Stack,
    IconButton,
    Typography,
    Paper,
    Button,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    ToggleButton,
    Divider
} from '@mui/material';
import {
    NavigateBefore as PrevIcon,
    NavigateNext as NextIcon,
    ZoomIn as ZoomInIcon,
    ZoomOut as ZoomOutIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Email as EmailIcon,
    Close as CloseIcon,
    Brush as BrushIcon
} from '@mui/icons-material';
import api from '../../../services/index';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

const PDFViewer = ({ fileId, fileName, illustrationTitle, illustrationDescription, onClose }) => {
    // --- State ---
    const [pdfBlob, setPdfBlob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [scale, setScale] = useState(1.0);

    // Drawing
    const [isDrawingMode, setIsDrawingMode] = useState(false);
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [pageDimensions, setPageDimensions] = useState(null);

    // Email Dialog
    const [emailOpen, setEmailOpen] = useState(false);
    // Auto-fill email as requested
    const [email, setEmail] = useState('jitendrakhadka4@gmail.com');
    const [subject, setSubject] = useState(illustrationTitle ? `Illustration: ${illustrationTitle}` : (fileName ? `Illustration: ${fileName}` : ''));
    const [body, setBody] = useState(illustrationDescription || '');
    const [sending, setSending] = useState(false);

    // Update effect to sync props if they receive updates (optional but good practice)
    useEffect(() => {
        if (illustrationTitle && !subject) setSubject(`Illustration: ${illustrationTitle}`);
        if (illustrationDescription && !body) setBody(illustrationDescription);
    }, [illustrationTitle, illustrationDescription]);

    // Fetch PDF
    useEffect(() => {
        const loadPDF = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/illustration-files/${fileId}/preview/`, {
                    responseType: 'blob',
                });
                const url = URL.createObjectURL(response.data);
                setPdfBlob(url);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setError('PDFの読み込みに失敗しました');
                setLoading(false);
            }
        };
        if (fileId) loadPDF();
        return () => pdfBlob && URL.revokeObjectURL(pdfBlob);
    }, [fileId]);

    // --- Drawing Logic ---
    // --- Cart State ---
    // dictionary: { [pageNumber]: { blob: Blob, preview: string } }
    const [savedPages, setSavedPages] = useState({});

    // --- Drawing Logic ---
    const startDrawing = (e) => {
        if (!isDrawingMode || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        ctx.beginPath();
        // Adjust for scale? No, canvas size should match visual size for simplicity in this implementation
        // But for high-res output, we want canvas to match PDF internal size.
        // Let's rely on internal coordinate mapping.

        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        // Map visual coordinates to internal canvas size
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        ctx.moveTo(x * scaleX, y * scaleY);
        ctx.lineWidth = 3 * scale; // Scale brush
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'red';

        canvas.isDrawing = true;
    };

    const draw = (e) => {
        if (!isDrawingMode || !canvasRef.current || !canvasRef.current.isDrawing) return;
        e.preventDefault();
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();

        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        ctx.lineTo(x * scaleX, y * scaleY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (canvasRef.current) canvasRef.current.isDrawing = false;
    };

    const clearCanvas = () => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    // --- Cart Actions ---
    const handleSavePage = async () => {
        if (!canvasRef.current) return;

        try {
            const blob = await new Promise(resolve => canvasRef.current.toBlob(resolve, 'image/png'));
            if (!blob) throw new Error("Failed to capture canvas");

            setSavedPages(prev => ({
                ...prev,
                [pageNumber]: { blob, timestamp: Date.now() }
            }));

            // Visual feedback could be added here (snackbar)
            alert(`ページ ${pageNumber} をカートに保存しました！`);
        } catch (err) {
            console.error(err);
            alert("保存に失敗しました");
        }
    };

    const handleClearCart = () => {
        if (window.confirm("カートを空にしますか？")) {
            setSavedPages({});
        }
    };


    // --- Text Interaction ---
    useEffect(() => {
        const handleTextClick = (event) => {
            const target = event.target;
            const textLayer = target.closest('.react-pdf__Page__textContent');
            if (textLayer && target.tagName === 'SPAN') {
                const textContent = target.textContent;
                console.log('Clicked PDF Text:', textContent);
                // Alert for user feedback as requested ("triggering actions")
                if (textContent && textContent.trim().length > 0) {
                    // alert(`Text: ${textContent}`);
                }
            }
        };

        document.addEventListener('click', handleTextClick);
        return () => {
            document.removeEventListener('click', handleTextClick);
        };
    }, []);


    // --- Preview Action ---
    const handlePreview = async () => {
        const pagesToSend = Object.keys(savedPages);
        if (pagesToSend.length === 0) return;

        // Open window immediately to bypass popup blocker
        const previewWindow = window.open('', '_blank');
        if (previewWindow) {
            previewWindow.document.write('<html><body><div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;"><h3>Preparing your preview... / プレビューを作成中...</h3></div></body></html>');
        }

        try {
            const formData = new FormData();
            // Basic sorting
            const sortedPageNumbers = pagesToSend.map(Number).sort((a, b) => a - b);

            sortedPageNumbers.forEach(pageNum => {
                const item = savedPages[pageNum];
                formData.append('page_numbers', pageNum);
                formData.append('images', item.blob, `page_${pageNum}.png`);
            });

            // Stage PDF
            const response = await api.post(`/illustration-files/${fileId}/stage_edited_pdf/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { token } = response.data;

            // Construct Query Params for pre-filling
            const params = new URLSearchParams();
            if (email) params.append('email', email);
            if (subject) params.append('subject', subject);
            if (body) params.append('body', body);

            const url = `/preview-send/${token}?${params.toString()}`;

            if (previewWindow) {
                previewWindow.location.href = url;
            } else {
                window.open(url, '_blank');
            }

            // Optionally close the email dialog or keep it open?
            // User flow: Preview opens in new tab, so maybe keep dialog open so they can click send if they want? 
            // Or close it because the new tab also has send button. Let's close it to avoid confusion.
            setEmailOpen(false);

        } catch (err) {
            console.error(err);
            if (previewWindow) previewWindow.close();
            alert("プレビューの作成に失敗しました");
        }
    };



    // --- Email Actions ---
    const handleEmailSend = async () => {
        if (!email) return;

        const pagesToSend = Object.keys(savedPages);
        if (pagesToSend.length === 0) {
            alert("カートが空です。まずはページを保存してください。");
            return;
        }

        setSending(true);

        try {
            const formData = new FormData();
            formData.append('recipient_email', email);
            formData.append('subject', subject || `Illustration: ${fileName}`);
            formData.append('body', body || '');

            // Append each page
            // Notes: Django request.FILES.getlist requires consistent ordering if lists are separate.
            // Be safer to append pairs or rely on index order.
            // We'll append simple parallel lists.

            const sortedPageNumbers = pagesToSend.map(Number).sort((a, b) => a - b);

            sortedPageNumbers.forEach(pageNum => {
                const item = savedPages[pageNum];
                formData.append('page_numbers', pageNum);
                formData.append('images', item.blob, `page_${pageNum}.png`);
            });

            // 3. Send
            await api.post(`/illustration-files/${fileId}/send_edited_email/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            alert('メールを送信しました！');
            setEmailOpen(false);
            setSavedPages({}); // Clear cart after success
        } catch (err) {
            console.error(err);
            alert('送信に失敗しました: ' + (err.response?.data?.error || err.message));
        } finally {
            setSending(false);
        }
    };

    const cartCount = Object.keys(savedPages).length;

    return (
        <React.Fragment>
            <Stack sx={{ height: '100%' }}>
                {/* Toolbar */}
                <Paper square elevation={0} sx={{
                    p: 1.5,
                    borderBottom: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography fontWeight="800" sx={{ maxWidth: 200 }} noWrap>{fileName}</Typography>

                        <Paper variant="outlined" sx={{ borderRadius: 10, display: 'flex', alignItems: 'center', px: 1 }}>
                            <IconButton size="small" onClick={() => setPageNumber(p => Math.max(1, p - 1))} disabled={pageNumber <= 1}>
                                <PrevIcon />
                            </IconButton>
                            <Typography variant="body2" sx={{ mx: 1, fontWeight: 'bold' }}>
                                {numPages ? `${pageNumber} / ${numPages}` : '--'}
                            </Typography>
                            <IconButton size="small" onClick={() => setPageNumber(p => Math.min(numPages, p + 1))} disabled={pageNumber >= numPages}>
                                <NextIcon />
                            </IconButton>
                        </Paper>

                        <Paper variant="outlined" sx={{ borderRadius: 10, display: 'flex', alignItems: 'center', px: 1 }}>
                            <IconButton size="small" onClick={() => setScale(s => Math.max(0.2, s - 0.1))}><ZoomOutIcon /></IconButton>
                            <Typography variant="body2" sx={{ mx: 1, fontWeight: 'bold' }}>{Math.round(scale * 100)}%</Typography>
                            <IconButton size="small" onClick={() => setScale(s => Math.min(5, s + 0.1))}><ZoomInIcon /></IconButton>
                        </Paper>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                        <ToggleButton
                            value="draw"
                            selected={isDrawingMode}
                            onChange={() => setIsDrawingMode(!isDrawingMode)}
                            size="small"
                        >
                            <BrushIcon sx={{ mr: 0.5 }} /> お絵かき
                        </ToggleButton>

                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={clearCanvas}
                            disabled={!isDrawingMode}
                            startIcon={<DeleteIcon />}
                        >
                            クリア
                        </Button>

                        <Divider orientation="vertical" flexItem />

                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={handleSavePage}
                            startIcon={<EditIcon />}
                        >
                            このページを保存
                        </Button>

                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<EmailIcon />}
                            onClick={() => setEmailOpen(true)}
                        >
                            メール送信 ({cartCount})
                        </Button>

                        <Divider orientation="vertical" flexItem />

                        <IconButton onClick={onClose}><CloseIcon /></IconButton>
                    </Stack>
                </Paper>

                {/* PDF Content */}
                <Box sx={{
                    flex: 1,
                    bgcolor: 'grey.100',
                    overflow: 'auto',
                    display: 'flex',
                    justifyContent: 'center',
                    p: 3,
                    position: 'relative'
                }}>
                    {loading && <CircularProgress sx={{ alignSelf: 'center' }} />}
                    {error && <Alert severity="error">{error}</Alert>}

                    {pdfBlob && (
                        <div style={{ position: 'relative', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                            <Document
                                file={pdfBlob}
                                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                loading={null}
                            >
                                <Page
                                    pageNumber={pageNumber}
                                    scale={scale}
                                    renderTextLayer={!isDrawingMode} // Disable text selection when drawing
                                    renderAnnotationLayer={!isDrawingMode}
                                    loading={null}
                                    onRenderSuccess={() => {
                                        // Sync canvas size with page
                                        if (containerRef.current) {
                                            const canvas = containerRef.current.querySelector('.react-pdf__Page__canvas');
                                            if (canvas) {
                                                setPageDimensions({
                                                    width: canvas.width,
                                                    height: canvas.height,
                                                    styleWidth: canvas.style.width,
                                                    styleHeight: canvas.style.height
                                                });
                                                // Clear drawing on page change/resize
                                                // Ideally we should persist drawings per page but user 
                                                // "think new idea first delete all last created" implies simple start.
                                                // We will clear for now or keep if dimensions match (e.g. zoom).
                                                // Let's keep it simple: clear if page changes.
                                                // Actually handled by key or manual clear.
                                            }
                                        }
                                    }}
                                    inputRef={containerRef}
                                />
                            </Document>

                            {/* Drawing Canvas Overlay */}
                            {pageDimensions && (
                                <canvas
                                    ref={canvasRef}
                                    width={pageDimensions.width}
                                    height={pageDimensions.height}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: pageDimensions.styleWidth,
                                        height: pageDimensions.styleHeight,
                                        zIndex: isDrawingMode ? 100 : 10,
                                        cursor: isDrawingMode ? 'crosshair' : 'default',
                                        pointerEvents: isDrawingMode ? 'auto' : 'none',
                                        touchAction: 'none'
                                    }}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                />
                            )}
                        </div>
                    )}
                </Box>
            </Stack>

            {/* Email Dialog */}
            <Dialog open={emailOpen} onClose={() => setEmailOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>編集したページを送信</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {cartCount === 0 && (
                            <Alert severity="warning">カートが空です。ページを保存してください。</Alert>
                        )}
                        {cartCount > 0 && (
                            <Alert severity="info">
                                保存されたページ: {Object.keys(savedPages).join(', ')} (計 {cartCount} ページ)
                            </Alert>
                        )}

                        <TextField
                            label="送信元メール"
                            fullWidth
                            value="jitendrakhadka444@gmail.com"
                            disabled
                            variant="filled"
                        />
                        <TextField
                            label="送信先メール"
                            fullWidth
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="example@company.com"
                        />
                        <TextField
                            label="件名 (任意)"
                            fullWidth
                            value={subject}
                            onChange={e => setSubject(e.target.value)}
                        />
                        <TextField
                            label="本文 (任意)"
                            fullWidth
                            multiline
                            rows={3}
                            value={body}
                            onChange={e => setBody(e.target.value)}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEmailOpen(false)}>キャンセル</Button>
                    <Button
                        onClick={handlePreview}
                        variant="outlined"
                        color="primary"
                        disabled={cartCount === 0}
                    >
                        プレビュー
                    </Button>
                    <Button
                        onClick={handleEmailSend}
                        variant="contained"
                        disabled={!email || sending || cartCount === 0}
                    >
                        {sending ? '送信中...' : `送信 (${cartCount} ページ)`}
                    </Button>
                </DialogActions>
            </Dialog>

        </React.Fragment>
    );
};

export default PDFViewer;
