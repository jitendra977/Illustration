import React, { useState, useEffect } from 'react';
import api from '../../services/index';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  CircularProgress,
  Alert,
  Stack,
  Typography,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  Fullscreen as FullscreenIcon,
} from '@mui/icons-material';

const PDFPreviewModal = ({ open, onClose, fileId, fileName }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    if (open && fileId) {
      loadPDF();
    }

    // Cleanup
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [open, fileId]);

  const loadPDF = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/illustration-files/${fileId}/preview/`, {
        responseType: 'blob',
      });

      // Get blob and create object URL
      const blob = response.data;
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load PDF:', err);
      // Handle axios error object properly
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load preview';
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = fileName || 'document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleOpenNewTab = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh',
        }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: 1,
        borderColor: 'divider',
        py: 1.5,
      }}>
        <Typography variant="h6" component="div" noWrap sx={{ flex: 1 }}>
          {fileName || 'PDFプレビュー'}
        </Typography>

        <Stack direction="row" spacing={1}>
          <IconButton
            size="small"
            onClick={handleDownload}
            title="ダウンロード"
            disabled={!pdfUrl}
          >
            <DownloadIcon />
          </IconButton>

          <IconButton
            size="small"
            onClick={handleOpenNewTab}
            title="新しいタブで開く"
            disabled={!pdfUrl}
          >
            <FullscreenIcon />
          </IconButton>

          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: 'hidden', bgcolor: '#525659' }}>
        {loading && (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Box p={3}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button variant="contained" onClick={loadPDF}>
              再試行
            </Button>
          </Box>
        )}

        {!loading && !error && pdfUrl && (
          <iframe
            src={pdfUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title="PDF Preview"
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PDFPreviewModal;