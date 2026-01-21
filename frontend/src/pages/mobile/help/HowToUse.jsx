import React from 'react';
import { Box, Typography, Container, Paper, Divider, List, ListItem, ListItemText, ListItemIcon, useTheme, Button, Stack, Chip, Alert } from '@mui/material';
import {
    Login as LoginIcon,
    Search as SearchIcon,
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Download as DownloadIcon,
    Menu as MenuIcon,
    Person as PersonIcon,
    Business as BusinessIcon,
    ArrowForward as ArrowForwardIcon,
    Image as ImageIcon,
    TouchApp as TouchAppIcon,
    Home as HomeIcon,
    NavigateNext as NavigateNextIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';

import dashboardImg from '../../../assets/docs/dashboard.png';
import mobileMenuImg from '../../../assets/docs/mobile_menu.png';
import createIllustrationImg from '../../../assets/docs/create_illustration.png';
import illustrationDetailImg from '../../../assets/docs/illustration_detail.png';
import manufacturersListImg from '../../../assets/docs/manufacturers_list.png';
import enginesListImg from '../../../assets/docs/engines_list.png';
import carsListImg from '../../../assets/docs/cars_list.png';
import categoriesListImg from '../../../assets/docs/categories_list.png';
import subcategoriesListImg from '../../../assets/docs/subcategories_list.png';
import finalIllustrationsImg from '../../../assets/docs/final_illustrations.png';

const HowToUse = () => {
    const theme = useTheme();
    const navigate = useNavigate();



    const ActionButton = ({ label, path, icon }) => (
        <Button
            variant="outlined"
            size="small"
            startIcon={icon || <ArrowForwardIcon />}
            onClick={() => navigate(path)}
            sx={{ mt: 1, borderRadius: 2, textTransform: 'none' }}
        >
            {label}へ移動
        </Button>
    );

    const Step = ({ number, title, children }) => (
        <Box sx={{ mb: 3 }}>
            <Typography component="div" variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Chip
                    label={number}
                    size="small"
                    color="primary"
                    sx={{ mr: 1, height: 20, width: 20, '& .MuiChip-label': { px: 0 } }}
                />
                {title}
            </Typography>
            <Box sx={{ pl: 3.5, color: 'text.secondary', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {children}
            </Box>
        </Box>
    );

    const Section = ({ title, children, icon, id }) => (
        <Paper
            id={id}
            elevation={0}
            sx={{
                p: { xs: 2.5, sm: 4 },
                mb: 4,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
                scrollMarginTop: '100px'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Box sx={{
                    mr: 2,
                    display: 'flex',
                    p: 1.5,
                    bgcolor: theme.palette.mode === 'dark' ? 'primary.900' : 'primary.50',
                    color: 'primary.main',
                    borderRadius: 2.5
                }}>
                    {icon}
                </Box>
                <Typography variant="h6" fontWeight="800">
                    {title}
                </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box>
                {children}
            </Box>
        </Paper>
    );

    return (
        <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>

            {/* Header */}
            <Box sx={{ mb: 6, textAlign: 'center', position: 'relative' }}>
                <IconButton
                    onClick={() => navigate('/')}
                    sx={{
                        position: 'absolute',
                        top: -10,
                        right: 0,
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        zIndex: 10,
                        '&:hover': { bgcolor: 'background.default' }
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <Chip label="初心者向けガイド" color="primary" size="small" sx={{ mb: 2, fontWeight: 'bold' }} />
                <Typography variant="h4" fontWeight="900" gutterBottom sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    YAW アプリの使い方
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                    YAW（楽天検索丸）へようこそ。このガイドでは、イラストの検索から管理まで、アプリの基本的な使い方をステップバイステップで解説します。
                </Typography>
            </Box>

            {/* Quick Links */}
            <Stack direction="row" spacing={1} sx={{ mb: 5, overflowX: 'auto', pb: 1, justifyContent: 'center' }}>
                <Chip label="基本操作" onClick={() => document.getElementById('basic').scrollIntoView({ behavior: 'smooth' })} clickable />
                <Chip label="イラスト検索" onClick={() => document.getElementById('search').scrollIntoView({ behavior: 'smooth' })} clickable />
                <Chip label="新規登録" onClick={() => document.getElementById('create').scrollIntoView({ behavior: 'smooth' })} clickable />
                <Chip label="編集・削除" onClick={() => document.getElementById('edit').scrollIntoView({ behavior: 'smooth' })} clickable />
                <Chip label="メニュー" onClick={() => document.getElementById('menu').scrollIntoView({ behavior: 'smooth' })} clickable />
            </Stack>

            <Alert severity="info" sx={{ mb: 4, borderRadius: 2 }}>
                各セクションの「～へ移動」ボタンを押すと、実際の機能画面へ直接ジャンプできます。
            </Alert>

            {/* 1. Basic Operations */}
            <Section id="basic" title="基本操作（ホーム画面）" icon={<HomeIcon fontSize="large" />}>
                <Typography paragraph>
                    ログイン後に表示される「ホーム」画面は、アプリの司令塔です。ここからすべての作業を開始できます。
                </Typography>

                <Box sx={{ my: 3, textAlign: 'center' }}>
                    <img
                        src={dashboardImg}
                        alt="ホーム画面"
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, boxShadow: theme.shadows[4] }}
                    />
                </Box>

                <Step number="1" title="ダッシュボードの確認">
                    画面上部には、登録されているイラストの総数や、メーカー数などの統計情報が表示されます。
                </Step>
                <Step number="2" title="ショートカット">
                    よく使う機能へのボタンが並んでいます。「イラスト一覧」や「プロフィール」へワンタップで移動できます。
                </Step>

                <ActionButton label="ホーム" path="/" icon={<HomeIcon />} />
            </Section>

            {/* 2. Search & View */}
            <Section id="search" title="イラストを探す" icon={<SearchIcon fontSize="large" />}>
                <Typography paragraph>
                    目的のイラストを見つけるには、主に2つの方法があります。
                </Typography>

                <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>方法A：階層から探す（推奨）</Typography>
                <Typography paragraph color="text.secondary">
                    メーカー → エンジン → 車種 → カテゴリー → サブカテゴリー の順に絞り込んで、目的のイラストを探します。
                </Typography>

                <Step number="1" title="メーカーを選択">
                    ダッシュボードから「メーカー」をタップして、メーカー一覧を表示します。
                </Step>
                <Box sx={{ my: 3, textAlign: 'center' }}>
                    <img
                        src={manufacturersListImg}
                        alt="メーカー一覧"
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, boxShadow: theme.shadows[4] }}
                    />
                </Box>

                <Step number="2" title="エンジンを選択">
                    メーカーをタップすると、そのメーカーのエンジン一覧が表示されます。目的のエンジンを選択します。
                </Step>
                <Box sx={{ my: 3, textAlign: 'center' }}>
                    <img
                        src={enginesListImg}
                        alt="エンジン一覧"
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, boxShadow: theme.shadows[4] }}
                    />
                </Box>

                <Step number="3" title="車種を選択">
                    エンジンをタップすると、そのエンジンを搭載している車種一覧が表示されます。
                </Step>
                <Box sx={{ my: 3, textAlign: 'center' }}>
                    <img
                        src={carsListImg}
                        alt="車種一覧"
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, boxShadow: theme.shadows[4] }}
                    />
                </Box>

                <Step number="4" title="カテゴリーを選択">
                    車種をタップすると、パーツのカテゴリー一覧が表示されます。「エンジン本体」「ブレーキ」などから選択します。
                </Step>
                <Box sx={{ my: 3, textAlign: 'center' }}>
                    <img
                        src={categoriesListImg}
                        alt="カテゴリー一覧"
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, boxShadow: theme.shadows[4] }}
                    />
                </Box>

                <Step number="5" title="サブカテゴリーを選択">
                    カテゴリーをタップすると、さらに詳細なサブカテゴリー一覧が表示されます。
                </Step>
                <Box sx={{ my: 3, textAlign: 'center' }}>
                    <img
                        src={subcategoriesListImg}
                        alt="サブカテゴリー一覧"
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, boxShadow: theme.shadows[4] }}
                    />
                </Box>

                <Step number="6" title="イラストを表示">
                    サブカテゴリーをタップすると、最終的にイラストの一覧が表示されます。
                </Step>
                <Box sx={{ my: 3, textAlign: 'center' }}>
                    <img
                        src={finalIllustrationsImg}
                        alt="イラスト一覧"
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, boxShadow: theme.shadows[4] }}
                    />
                </Box>

                <ActionButton label="メーカー一覧" path="/manufacturers" icon={<BusinessIcon />} />

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>方法B：検索機能を使う（実例）</Typography>
                <Typography paragraph color="text.secondary">
                    イラスト一覧画面の検索機能を使って、キーワードで素早く目的のイラストを見つけることができます。
                </Typography>

                <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        検索のコツ
                    </Typography>
                    <Typography variant="body2">
                        • エンジン型式（例：QR25、6HK1）<br />
                        • 車種名（例：エルフ、フォワード）<br />
                        • パーツ名（例：エンジン、ブレーキ）<br />
                        で検索できます。日本語・英数字どちらでもOKです。
                    </Typography>
                </Alert>

                <Step number="1" title="イラスト一覧を開く">
                    ホーム画面から「イラスト」をタップするか、メニューから「イラスト」を選択します。
                </Step>
                <Step number="2" title="検索バーに入力">
                    画面上部の検索バー（「タイトル、説明で検索...」）をタップして、キーワードを入力します。
                </Step>
                <Step number="3" title="結果を確認">
                    入力すると自動的に結果が絞り込まれます。検索をクリアするには、検索バー右側の「×」ボタンをタップします。
                </Step>

                <Box sx={{ my: 3, p: 2, bgcolor: 'background.default', borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ImageIcon fontSize="small" color="primary" />
                        検索デモ動画
                    </Typography>
                    <Typography variant="caption" color="text.secondary" paragraph>
                        実際の検索操作を録画しました。QR25で検索して結果を絞り込み、クリアして全件表示に戻す流れをご覧ください。
                    </Typography>
                    <Box sx={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: 400,
                        mx: 'auto',
                        borderRadius: 2,
                        overflow: 'hidden',
                        boxShadow: theme.shadows[4]
                    }}>
                        <video
                            controls
                            loop
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        >
                            <source src="/search_demo.webm" type="video/webm" />
                            お使いのブラウザは動画タグをサポートしていません。
                        </video>
                    </Box>
                </Box>

                <ActionButton label="イラスト一覧で試す" path="/illustrations" icon={<SearchIcon />} />

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 1 }}>方法C：一覧から探す</Typography>
                <Typography paragraph color="text.secondary">
                    「イラスト一覧」画面では、すべてのイラストを新しい順に見ることができます。
                </Typography>
                <ActionButton label="イラスト一覧" path="/illustrations" icon={<ImageIcon />} />
            </Section>

            {/* 3. Create */}
            <Section id="create" title="新しいイラストを登録する" icon={<AddIcon fontSize="large" />}>
                <Typography paragraph>
                    新しいパーツリストや図面をシステムに追加する手順です。
                </Typography>

                <Box sx={{ my: 3, textAlign: 'center' }}>
                    <img
                        src={createIllustrationImg}
                        alt="イラスト作成画面"
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, boxShadow: theme.shadows[4] }}
                    />
                </Box>

                <Step number="1" title="登録画面を開く">
                    画面右下の <Box component="span" sx={{ bgcolor: 'primary.main', color: 'white', borderRadius: '50%', px: 0.8, py: 0.2, fontSize: '0.8em' }}>＋</Box> ボタン、または各一覧画面の「新規作成」ボタンをタップします。
                </Step>
                <Step number="2" title="基本情報を入力">
                    イラストのタイトルを入力し、関連するメーカー、車種、エンジンなどを選択します。
                </Step>
                <Step number="3" title="ファイルをアップロード">
                    PDFファイルや画像ファイルを選択します。
                </Step>
                <Step number="4" title="保存">
                    「保存する」ボタンを押すと登録が完了します。
                </Step>

                <ActionButton label="新規作成ページ" path="/illustrations/create" icon={<AddIcon />} />
            </Section>

            {/* 4. Edit & Delete */}
            <Section id="edit" title="編集・削除・ダウンロード" icon={<EditIcon fontSize="large" />}>
                <Typography paragraph>
                    登録済みのイラストを修正したり、削除したりする方法です。
                </Typography>

                <Box sx={{ my: 3, textAlign: 'center' }}>
                    <img
                        src={illustrationDetailImg}
                        alt="イラスト詳細編集"
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, boxShadow: theme.shadows[4] }}
                    />
                </Box>

                <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 1, color: 'primary.main' }}>
                    <EditIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1.1em' }} />
                    編集（Update）
                </Typography>
                <Typography paragraph>
                    イラストの詳細画面にある「編集ボタン（ペンのマーク）」をタップします。タイトルやファイルを変更して保存してください。
                </Typography>

                <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 1, color: 'error.main' }}>
                    <DeleteIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1.1em' }} />
                    削除（Delete）
                </Typography>
                <Typography paragraph>
                    不要になったイラストは、詳細画面の「削除ボタン（ゴミ箱のマーク）」から削除できます。
                    <br />※一度削除すると元に戻せませんのでご注意ください。
                </Typography>

                <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 3, mb: 1, color: 'success.main' }}>
                    <DownloadIcon sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1.1em' }} />
                    ダウンロード
                </Typography>
                <Typography paragraph>
                    イラストの元ファイルをダウンロードするには、詳細画面のファイル名の横にあるダウンロードアイコンをタップします。
                </Typography>
            </Section>

            {/* 5. Menu */}
            <Section id="menu" title="メニューの使い方" icon={<MenuIcon fontSize="large" />}>
                <Typography paragraph>
                    アプリ内の移動は、左上のハンバーガーメニューから行います。
                </Typography>

                <Box sx={{ my: 3, textAlign: 'center' }}>
                    <img
                        src={mobileMenuImg}
                        alt="サイドメニュー"
                        style={{ maxWidth: '100%', height: 'auto', borderRadius: 8, boxShadow: theme.shadows[4] }}
                    />
                </Box>

                <List>
                    <ListItem disablePadding sx={{ mb: 1 }}>
                        <ListItemIcon><TouchAppIcon color="primary" /></ListItemIcon>
                        <ListItemText primary="メニューを開く" secondary="画面左上の「≡」マークをタップします。" />
                    </ListItem>
                    <ListItem disablePadding sx={{ mb: 1 }}>
                        <ListItemIcon><PersonIcon color="primary" /></ListItemIcon>
                        <ListItemText primary="プロフィール" secondary="自分のアカウント情報の確認・編集ができます。" />
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemIcon><BusinessIcon color="primary" /></ListItemIcon>
                        <ListItemText primary="各種マスター管理" secondary="メーカーや車種などの基本データを管理します。" />
                    </ListItem>
                </List>
            </Section>

            {/* Footer */}
            <Box sx={{ mt: 8, mb: 4, p: 4, bgcolor: 'background.paper', borderRadius: 4, textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    使い方がわかりましたか？
                </Typography>
                <Typography color="text.secondary" paragraph>
                    さっそくアプリを使ってみましょう！
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    onClick={() => navigate('/')}
                    sx={{ borderRadius: 3, px: 4, py: 1.5, fontWeight: 'bold' }}
                >
                    ホームへ戻る
                </Button>
            </Box>

        </Container>
    );
};

export default HowToUse;
