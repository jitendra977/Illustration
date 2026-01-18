import React, { useState, useEffect } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import {
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon
} from '@mui/icons-material';
import { useFavorites } from '../../hooks/useFavorites';
import { toast } from 'react-hot-toast';

const FavoriteButton = ({ illustration, size = 'small', color = 'default', sx = {} }) => {
    const { toggleFavorite, checkFavoriteStatus } = useFavorites();
    const [isFavorited, setIsFavorited] = useState(false);
    const [loading, setLoading] = useState(false);
    const [initialCheckDone, setInitialCheckDone] = useState(false);

    // Check initial status
    useEffect(() => {
        let mounted = true;

        // If illustration object already has is_favorited (e.g. from list API), use it
        if (illustration && 'is_favorited' in illustration) {
            if (mounted) {
                setIsFavorited(illustration.is_favorited);
                setInitialCheckDone(true);
            }
            return;
        }

        // Otherwise check via API
        if (illustration?.id) {
            checkFavoriteStatus(illustration.id).then(status => {
                if (mounted) {
                    setIsFavorited(status);
                    setInitialCheckDone(true);
                }
            });
        }

        return () => { mounted = false; };
    }, [illustration, checkFavoriteStatus]);

    const handleClick = async (e) => {
        e.stopPropagation(); // Prevent card click
        e.preventDefault();

        if (!illustration?.id || loading) return;

        // Optimistic update
        const previousState = isFavorited;
        setIsFavorited(!previousState);
        setLoading(true);

        try {
            const newStatus = await toggleFavorite(illustration, previousState);
            setIsFavorited(newStatus);

            if (newStatus) {
                toast.success('お気に入りに追加しました');
            } else {
                toast.success('お気に入りから削除しました');
            }
        } catch (error) {
            // Revert on error
            setIsFavorited(previousState);
            toast.error('操作に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    // Logic to determine display color
    const getIconColor = () => {
        if (isFavorited) return 'error'; // Red when favorited
        if (color && color !== 'default') return color;
        return 'action'; // Default gray
    };

    return (
        <Tooltip title={isFavorited ? "お気に入りから削除" : "お気に入りに追加"}>
            <IconButton
                onClick={handleClick}
                size={size}
                color={getIconColor()}
                disabled={loading}
                sx={{
                    ...sx,
                    transition: 'all 0.2s ease-in-out',
                    '&:active': { transform: 'scale(0.9)' },
                    '&:hover': { transform: 'scale(1.1)' }
                }}
                aria-label={isFavorited ? "remove from favorites" : "add to favorites"}
            >
                {isFavorited ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
        </Tooltip>
    );
};

export default FavoriteButton;
