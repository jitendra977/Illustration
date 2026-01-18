import { useState, useCallback } from 'react';
import { favoriteAPI } from '../api/illustrations';

export const useFavorites = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Toggle favorite status for an illustration
     * Returns the new favorite status
     */
    const toggleFavorite = useCallback(async (illustration, currentStatus) => {
        if (!illustration?.id) return currentStatus;

        // Optimistic update
        const newStatus = !currentStatus;

        try {
            // Don't set global loading state to avoid UI flicker, just handle background
            await favoriteAPI.toggle(illustration.id);
            return newStatus;
        } catch (err) {
            console.error('Failed to toggle favorite:', err);
            setError(err);
            // Revert if failed
            return currentStatus;
        }
    }, []);

    /**
     * Check if an illustration is favorited
     */
    const checkFavoriteStatus = useCallback(async (illustrationId) => {
        if (!illustrationId) return false;

        try {
            const result = await favoriteAPI.check(illustrationId);
            return result.is_favorited;
        } catch (err) {
            console.error('Failed to check favorite status:', err);
            return false;
        }
    }, []);

    return {
        loading,
        error,
        toggleFavorite,
        checkFavoriteStatus
    };
};

export default useFavorites;
