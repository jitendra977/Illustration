// src/services/activityLogs.js (Updated)
import api from './index';

export const activityLogsAPI = {
    /**
     * Get all activity logs with optional filtering
     * @param {Object} params - Query parameters for filtering
     */
    getAll: (params) => api.get('auth/activity-logs/', { params }),

    /**
     * Get a specific activity log by ID
     * @param {number} id - Activity log ID
     */
    getById: (id) => api.get(`auth/activity-logs/${id}/`),

    /**
     * Get activity log statistics
     */
    getStats: () => api.get('auth/activity-logs/stats/'),
};
