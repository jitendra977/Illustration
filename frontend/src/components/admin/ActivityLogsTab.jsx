import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Card, CardContent, Stack, Chip,
    Avatar, IconButton, TextField, MenuItem, Select,
    FormControl, InputLabel, Grid, alpha, useTheme,
    Collapse, Divider, useMediaQuery, CircularProgress
} from '@mui/material';
import {
    Person as PersonIcon,
    ExpandMore as ExpandMoreIcon,
    FilterList as FilterIcon,
} from '@mui/icons-material';
import { activityLogsAPI } from '../../services/activityLogs';

const ActivityLogsTab = ({ isDesktop }) => {
    const theme = useTheme();
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: '',
        model: '',
        search: '',
    });
    const [showFilters, setShowFilters] = useState(false);
    const [expandedLog, setExpandedLog] = useState(null);

    useEffect(() => {
        fetchLogs();
    }, [filters]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await activityLogsAPI.getAll(filters);
            // Handle both paginated (results) and non-paginated responses
            const data = response.data || response;
            if (data && data.results && Array.isArray(data.results)) {
                setLogs(data.results);
            } else if (Array.isArray(data)) {
                setLogs(data);
            } else {
                setLogs([]);
            }
        } catch (error) {
            console.error('Failed to fetch logs:', error);
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action) => {
        const colors = {
            CREATE: theme.palette.success.main,
            UPDATE: theme.palette.info.main,
            DELETE: theme.palette.error.main,
            VIEW: theme.palette.grey[500],
            LOGIN: theme.palette.primary.main,
            LOGOUT: theme.palette.warning.main,
            DOWNLOAD: theme.palette.secondary.main,
            UPLOAD: theme.palette.secondary.main,
        };
        return colors[action] || theme.palette.grey[500];
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* Filters */}
            <Card sx={{ mb: 3, borderRadius: 3 }}>
                <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={showFilters ? 2 : 0}>
                        <Typography variant="subtitle1" fontWeight="700">
                            フィルター
                        </Typography>
                        <IconButton onClick={() => setShowFilters(!showFilters)} size="small">
                            <FilterIcon />
                        </IconButton>
                    </Stack>

                    <Collapse in={showFilters}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>アクション</InputLabel>
                                    <Select
                                        value={filters.action}
                                        onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                                        label="アクション"
                                    >
                                        <MenuItem value="">すべて</MenuItem>
                                        <MenuItem value="CREATE">作成</MenuItem>
                                        <MenuItem value="UPDATE">更新</MenuItem>
                                        <MenuItem value="DELETE">削除</MenuItem>
                                        <MenuItem value="VIEW">閲覧</MenuItem>
                                        <MenuItem value="LOGIN">ログイン</MenuItem>
                                        <MenuItem value="LOGOUT">ログアウト</MenuItem>
                                        <MenuItem value="DOWNLOAD">ダウンロード</MenuItem>
                                        <MenuItem value="UPLOAD">アップロード</MenuItem>
                                        <MenuItem value="EXPORT">エクスポート</MenuItem>
                                        <MenuItem value="IMPORT">インポート</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6} md={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>対象モデル</InputLabel>
                                    <Select
                                        value={filters.model}
                                        onChange={(e) => setFilters({ ...filters, model: e.target.value })}
                                        label="対象モデル"
                                    >
                                        <MenuItem value="">すべて</MenuItem>
                                        <MenuItem value="User">ユーザー</MenuItem>
                                        <MenuItem value="Factory">工場</MenuItem>
                                        <MenuItem value="Role">権限/ロール</MenuItem>
                                        <MenuItem value="Illustration">イラスト</MenuItem>
                                        <MenuItem value="IllustrationFile">イラストファイル</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={12} md={4}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="検索"
                                    placeholder="ユーザー名、説明を検索..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                    </Collapse>
                </CardContent>
            </Card>

            {/* Log Entries */}
            {logs.length === 0 ? (
                <Card sx={{ borderRadius: 3, textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        アクティビティログがありません
                    </Typography>
                </Card>
            ) : (
                <Stack spacing={2}>
                    {logs.map((log) => (
                        <Card
                            key={log.id}
                            sx={{
                                borderRadius: 3,
                                borderLeft: `4px solid ${getActionColor(log.action)}`,
                                transition: 'all 0.2s',
                                '&:hover': {
                                    boxShadow: `0 4px 20px ${alpha(getActionColor(log.action), 0.15)}`,
                                    transform: 'translateY(-2px)',
                                }
                            }}
                        >
                            <CardContent>
                                <Stack direction="row" spacing={2} alignItems="flex-start">
                                    {/* Timeline Dot */}
                                    <Box sx={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: '50%',
                                        bgcolor: getActionColor(log.action),
                                        mt: 0.5,
                                        flexShrink: 0
                                    }} />

                                    {/* Content */}
                                    <Box flex={1}>
                                        <Stack
                                            direction={isDesktop ? "row" : "column"}
                                            justifyContent="space-between"
                                            alignItems={isDesktop ? "center" : "flex-start"}
                                            spacing={1}
                                            mb={1}
                                        >
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Avatar sx={{
                                                    width: 32,
                                                    height: 32,
                                                    bgcolor: alpha(getActionColor(log.action), 0.1)
                                                }}>
                                                    <PersonIcon sx={{ fontSize: 18, color: getActionColor(log.action) }} />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle2" fontWeight="700">
                                                        {log.username}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(log.timestamp).toLocaleString('ja-JP', {
                                                            year: 'numeric',
                                                            month: '2-digit',
                                                            day: '2-digit',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </Typography>
                                                </Box>
                                            </Stack>

                                            <Chip
                                                label={log.action_display}
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha(getActionColor(log.action), 0.1),
                                                    color: getActionColor(log.action),
                                                    fontWeight: 700,
                                                    fontSize: '0.7rem',
                                                    height: 24
                                                }}
                                            />
                                        </Stack>

                                        <Typography variant="body2" gutterBottom>
                                            {log.description || `${log.action_display} ${log.model_name}: ${log.object_repr}`}
                                        </Typography>

                                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5} mt={1}>
                                            <Chip
                                                label={log.model_name}
                                                size="small"
                                                variant="outlined"
                                                sx={{ height: 20, fontSize: '0.65rem' }}
                                            />
                                            {log.object_repr && (
                                                <Chip
                                                    label={log.object_repr}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ height: 20, fontSize: '0.65rem' }}
                                                />
                                            )}
                                            {log.ip_address && (
                                                <Chip
                                                    label={`IP: ${log.ip_address}`}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ height: 20, fontSize: '0.65rem' }}
                                                />
                                            )}
                                            {log.factory_name && (
                                                <Chip
                                                    label={log.factory_name}
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{ height: 20, fontSize: '0.65rem' }}
                                                />
                                            )}
                                        </Stack>

                                        {/* Expandable Details */}
                                        {log.changes && (
                                            <>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                                    sx={{ mt: 1 }}
                                                >
                                                    <ExpandMoreIcon sx={{
                                                        transform: expandedLog === log.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                                        transition: 'transform 0.2s'
                                                    }} />
                                                </IconButton>

                                                <Collapse in={expandedLog === log.id}>
                                                    <Divider sx={{ my: 1 }} />
                                                    <Typography variant="caption" fontWeight="700" display="block" mb={0.5}>
                                                        変更内容:
                                                    </Typography>
                                                    <Box sx={{
                                                        bgcolor: alpha(theme.palette.background.default, 0.5),
                                                        p: 1,
                                                        borderRadius: 1,
                                                        maxHeight: 300,
                                                        overflow: 'auto'
                                                    }}>
                                                        <pre style={{
                                                            fontSize: '0.7rem',
                                                            margin: 0,
                                                            whiteSpace: 'pre-wrap',
                                                            wordBreak: 'break-word'
                                                        }}>
                                                            {JSON.stringify(log.changes, null, 2)}
                                                        </pre>
                                                    </Box>
                                                </Collapse>
                                            </>
                                        )}
                                    </Box>
                                </Stack>
                            </CardContent>
                        </Card>
                    ))}
                </Stack>
            )}
        </Box>
    );
};

export default ActivityLogsTab;
