import React, { useState } from 'react';
import { IconButton, Badge } from '@mui/material';
import { Comment as CommentIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import CommentFormModal from './CommentFormModal';

const CommentButton = () => {
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <>
            <IconButton
                onClick={handleOpen}
                sx={{
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.08)',
                    backdropFilter: 'blur(8px)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' }
                }}
                aria-label="フィードバック"
            >
                <CommentIcon sx={{ fontSize: 20 }} />
            </IconButton>

            <CommentFormModal open={open} onClose={handleClose} />
        </>
    );
};

export default CommentButton;
