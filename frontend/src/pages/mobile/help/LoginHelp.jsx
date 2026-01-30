import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Paper,
    Typography,
    Button,
    Stack,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    ArrowBack,
    HelpOutline,
    Lock,
    Email,
    Refresh,
    ContactSupport,
    ExpandMore,
    Warning,
    CheckCircle,
    Info,
} from '@mui/icons-material';

const LoginHelp = () => {
    const navigate = useNavigate();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(to bottom right, #0f172a, #1e1b4b, #312e81)',
                py: 4,
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: '500px',
                    height: '500px',
                    background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%)',
                    top: '-250px',
                    right: '-250px',
                    animation: 'pulse 8s ease-in-out infinite',
                },
                '@keyframes pulse': {
                    '0%, 100%': { transform: 'scale(1)', opacity: 0.3 },
                    '50%': { transform: 'scale(1.1)', opacity: 0.5 },
                },
            }}
        >
            <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <Paper
                    elevation={24}
                    sx={{
                        p: 4,
                        mb: 3,
                        borderRadius: 4,
                        background: 'rgba(15, 23, 42, 0.7)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(99, 102, 241, 0.1)',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                mr: 2,
                            }}
                        >
                            <HelpOutline sx={{ fontSize: 28, color: 'white' }} />
                        </Box>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 900,
                                color: 'white',
                                letterSpacing: '-0.5px',
                            }}
                        >
                            ログインヘルプ
                        </Typography>
                    </Box>
                    <Typography sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        ログインできない場合の対処方法をご案内します
                    </Typography>
                </Paper>

                {/* Common Issues */}
                <Paper
                    elevation={24}
                    sx={{
                        p: 4,
                        mb: 3,
                        borderRadius: 4,
                        background: 'rgba(15, 23, 42, 0.7)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(99, 102, 241, 0.1)',
                    }}
                >
                    <Typography
                        variant="h6"
                        sx={{ color: 'white', fontWeight: 700, mb: 3 }}
                    >
                        よくある問題と解決方法
                    </Typography>

                    <Stack spacing={2}>
                        {/* Issue 1: Wrong Credentials */}
                        <Accordion
                            sx={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'white',
                                '&:before': { display: 'none' },
                                borderRadius: 2,
                                overflow: 'hidden',
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMore sx={{ color: 'white' }} />}
                                sx={{
                                    '&:hover': { background: 'rgba(255, 255, 255, 0.08)' },
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Lock sx={{ color: '#818cf8' }} />
                                    <Typography fontWeight={600}>
                                        ユーザー名/メールアドレスまたはパスワードが正しくない
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <List dense>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle sx={{ color: '#86efac', fontSize: 20 }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="入力内容を確認してください"
                                            secondary="スペースや大文字・小文字の違いに注意"
                                            secondaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.5)' } }}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle sx={{ color: '#86efac', fontSize: 20 }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Caps Lockがオンになっていないか確認"
                                            secondaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.5)' } }}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle sx={{ color: '#86efac', fontSize: 20 }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="パスワードをお忘れの場合は管理者にお問い合わせください"
                                            secondaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.5)' } }}
                                        />
                                    </ListItem>
                                </List>
                            </AccordionDetails>
                        </Accordion>

                        {/* Issue 2: Network Error */}
                        <Accordion
                            sx={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'white',
                                '&:before': { display: 'none' },
                                borderRadius: 2,
                                overflow: 'hidden',
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMore sx={{ color: 'white' }} />}
                                sx={{
                                    '&:hover': { background: 'rgba(255, 255, 255, 0.08)' },
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Warning sx={{ color: '#fbbf24' }} />
                                    <Typography fontWeight={600}>
                                        「サーバーに接続できません」と表示される
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <List dense>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle sx={{ color: '#86efac', fontSize: 20 }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="インターネット接続を確認してください"
                                            secondary="Wi-Fiまたはモバイルデータが有効か確認"
                                            secondaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.5)' } }}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle sx={{ color: '#86efac', fontSize: 20 }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="サーバーがメンテナンス中の可能性があります"
                                            secondary="しばらく待ってから再度お試しください"
                                            secondaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.5)' } }}
                                        />
                                    </ListItem>
                                </List>
                            </AccordionDetails>
                        </Accordion>

                        {/* Issue 3: Browser Issues */}
                        <Accordion
                            sx={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'white',
                                '&:before': { display: 'none' },
                                borderRadius: 2,
                                overflow: 'hidden',
                            }}
                        >
                            <AccordionSummary
                                expandIcon={<ExpandMore sx={{ color: 'white' }} />}
                                sx={{
                                    '&:hover': { background: 'rgba(255, 255, 255, 0.08)' },
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Refresh sx={{ color: '#818cf8' }} />
                                    <Typography fontWeight={600}>
                                        ページが正しく表示されない
                                    </Typography>
                                </Box>
                            </AccordionSummary>
                            <AccordionDetails>
                                <List dense>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle sx={{ color: '#86efac', fontSize: 20 }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="ブラウザのキャッシュをクリアしてください"
                                            secondary="Ctrl+Shift+Delete (Windows) または Cmd+Shift+Delete (Mac)"
                                            secondaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.5)' } }}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle sx={{ color: '#86efac', fontSize: 20 }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="ページを再読み込みしてください"
                                            secondary="F5キーまたはブラウザの更新ボタンを押す"
                                            secondaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.5)' } }}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle sx={{ color: '#86efac', fontSize: 20 }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="別のブラウザで試してください"
                                            secondary="Chrome、Firefox、Safari、Edgeなど"
                                            secondaryTypographyProps={{ sx: { color: 'rgba(255, 255, 255, 0.5)' } }}
                                        />
                                    </ListItem>
                                </List>
                            </AccordionDetails>
                        </Accordion>
                    </Stack>
                </Paper>

                {/* Contact Support */}
                <Paper
                    elevation={24}
                    sx={{
                        p: 4,
                        mb: 3,
                        borderRadius: 4,
                        background: 'rgba(15, 23, 42, 0.7)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(99, 102, 241, 0.1)',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <ContactSupport sx={{ color: '#818cf8', mr: 1 }} />
                        <Typography
                            variant="h6"
                            sx={{ color: 'white', fontWeight: 700 }}
                        >
                            それでも解決しない場合
                        </Typography>
                    </Box>
                    <Divider sx={{ mb: 2, borderColor: 'rgba(255, 255, 255, 0.1)' }} />
                    <Alert
                        severity="info"
                        sx={{
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            color: '#a5b4fc',
                            '& .MuiAlert-icon': { color: '#a5b4fc' },
                        }}
                    >
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            上記の方法で解決しない場合は、システム管理者にお問い合わせください。
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                            お問い合わせの際は、以下の情報をお伝えください：
                        </Typography>
                        <List dense sx={{ mt: 1 }}>
                            <ListItem sx={{ py: 0 }}>
                                <ListItemText
                                    primary="• 使用しているブラウザ（Chrome、Safari など）"
                                    primaryTypographyProps={{ variant: 'body2' }}
                                />
                            </ListItem>
                            <ListItem sx={{ py: 0 }}>
                                <ListItemText
                                    primary="• エラーメッセージの内容"
                                    primaryTypographyProps={{ variant: 'body2' }}
                                />
                            </ListItem>
                            <ListItem sx={{ py: 0 }}>
                                <ListItemText
                                    primary="• 問題が発生した日時"
                                    primaryTypographyProps={{ variant: 'body2' }}
                                />
                            </ListItem>
                        </List>
                    </Alert>
                </Paper>

                {/* Back to Login Button */}
                <Box sx={{ textAlign: 'center' }}>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/login')}
                        sx={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            color: 'white',
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            fontWeight: 600,
                            fontSize: '1rem',
                            boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                boxShadow: '0 12px 32px rgba(99, 102, 241, 0.4)',
                                transform: 'translateY(-2px)',
                            },
                        }}
                    >
                        ログインページに戻る
                    </Button>
                </Box>
            </Container>
        </Box>
    );
};

export default LoginHelp;
