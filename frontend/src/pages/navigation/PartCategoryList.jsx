import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Grid,
    Typography,
    CircularProgress,
    alpha,
    IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { partCategoryAPI } from '../../api/illustrations';
import {
    Search,
    Folder,
    Image as ImageIcon,
    ChevronRight,
    ArrowLeft,
    Layers
} from 'lucide-react';

// Zinc color palette
const zinc = {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    300: '#d4d4d8',
    400: '#a1a1aa',
    500: '#71717a',
    600: '#52525b',
    700: '#3f3f46',
    800: '#27272a',
    900: '#18181b',
    950: '#09090b',
};

const Badge = ({ children, sx = {}, ...props }) => (
    <Box
        component="span"
        sx={{
            px: 1,
            py: 0.5,
            borderRadius: '9999px',
            fontSize: '10px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'inline-block',
            ...sx
        }}
        {...props}
    >
        {children}
    </Box>
);

const CategoryCard = ({ category, onClick }) => {
    return (
        <Box
            onClick={() => onClick(category)}
            sx={{
                position: 'relative',
                bgcolor: alpha(zinc[900], 0.4),
                border: `1px solid ${alpha('#fff', 0.05)}`,
                borderRadius: 3,
                p: 1.5,
                cursor: 'pointer',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'row',
                gap: 1.5,
                transition: 'all 0.2s',
                '&:active': { transform: 'scale(0.98)' },
                '&:hover': {
                    borderColor: alpha('#fff', 0.2)
                }
            }}
        >
            {/* Icon Box */}
            <Box sx={{ flexShrink: 0 }}>
                <Box sx={{
                    p: 1.5,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${zinc[800]}, ${zinc[900]})`,
                    border: `1px solid ${alpha('#fff', 0.1)}`,
                    color: zinc[400],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s',
                    '.MuiBox-root:hover &': { color: '#f59e0b' }
                }}>
                    <Folder size={18} />
                </Box>
            </Box>

            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, color: '#fff', lineHeight: 1.2, mb: 0.5 }} noWrap>
                    {category.name}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 0.75,
                        px: 1, py: 0.5,
                        borderRadius: 1.5,
                        bgcolor: alpha('#fff', 0.05),
                        border: `1px solid ${alpha('#fff', 0.05)}`
                    }}>
                        <Layers size={12} color={zinc[500]} />
                        <Typography component="span" sx={{ fontSize: '11px', color: zinc[300], fontWeight: 600 }}>
                            {category.subcategory_count || 0} <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, color: zinc[500], fontWeight: 400 }}>サブ</Box>
                        </Typography>
                    </Box>
                    <Box sx={{
                        display: 'flex', alignItems: 'center', gap: 0.75,
                        px: 1, py: 0.5,
                        borderRadius: 1.5,
                        bgcolor: alpha('#fff', 0.05),
                        border: `1px solid ${alpha('#fff', 0.05)}`
                    }}>
                        <ImageIcon size={12} color={zinc[500]} />
                        <Typography component="span" sx={{ fontSize: '11px', color: zinc[300], fontWeight: 600 }}>
                            {category.illustration_count || 0} <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' }, color: zinc[500], fontWeight: 400 }}>イラスト</Box>
                        </Typography>
                    </Box>
                </Box>
            </Box>

            <Box sx={{
                display: 'flex', alignItems: 'center',
                opacity: 0.4,
                transition: 'all 0.2s',
                '.MuiBox-root:hover &': {
                    opacity: 1
                }
            }}>
                <ChevronRight size={18} color={zinc[400]} />
            </Box>
        </Box>
    );
};

const PartCategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        const fetchCategories = async () => {
            try {
                setLoading(true);
                const data = await partCategoryAPI.getAll();
                const results = data.results || data;
                setCategories(results);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const filteredCategories = useMemo(() => {
        return categories.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [categories, searchTerm]);

    const handleCategoryClick = (category) => {
        navigate(`/part-categories/${category.id}/subcategories`, {
            state: { categoryName: category.name, categoryId: category.id }
        });
    };

    const handleBack = () => navigate(-1);

    // Calculate total stats
    const totalStats = useMemo(() => {
        return categories.reduce((acc, curr) => ({
            subcategories: acc.subcategories + (curr.subcategory_count || 0),
            illustrations: acc.illustrations + (curr.illustration_count || 0)
        }), { subcategories: 0, illustrations: 0 });
    }, [categories]);

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: zinc[950], color: zinc[100], fontFamily: 'Inter, sans-serif', pb: { xs: 12, md: 5 } }}>
            {/* Sticky Header */}
            <Box component="nav" sx={{
                position: 'sticky',
                top: 0,
                zIndex: 50,
                transition: 'all 0.3s',
                px: { xs: 1.5, md: 3 },
                py: isScrolled ? 1.5 : 2,
                bgcolor: isScrolled ? alpha(zinc[950], 0.9) : 'transparent',
                backdropFilter: isScrolled ? 'blur(24px)' : 'none',
                borderBottom: isScrolled ? `1px solid ${alpha('#fff', 0.1)}` : 'none',
            }}>
                <Box sx={{ maxWidth: '1280px', mx: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <IconButton onClick={handleBack} sx={{ color: zinc[400], '&:hover': { bgcolor: alpha('#fff', 0.05), color: '#fff' } }}>
                        <ArrowLeft size={20} />
                    </IconButton>

                    <Typography sx={{
                        position: 'absolute',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        fontWeight: 700,
                        fontSize: { xs: '1.125rem', md: '1.25rem' },
                        opacity: isScrolled ? 1 : 0,
                        transition: 'all 0.3s',
                        transform: isScrolled ? 'translate(-50%, 0)' : 'translate(-50%, -10px)',
                        pointerEvents: 'none'
                    }}>
                        カテゴリー
                    </Typography>
                </Box>
            </Box>

            <Box component="main" sx={{ maxWidth: '1280px', mx: 'auto', px: { xs: 1.5, md: 3 }, pt: 1 }}>
                {/* Hero Section */}
                <Box component="header" sx={{ mb: { xs: 4, md: 6 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                        <Badge sx={{ bgcolor: alpha('#f59e0b', 0.2), color: '#f59e0b', border: `1px solid ${alpha('#f59e0b', 0.3)}` }}>パーツ</Badge>
                    </Box>
                    <Typography variant="h1" sx={{
                        fontSize: { xs: '2.5rem', md: '4rem' },
                        fontWeight: 900,
                        letterSpacing: '-0.025em',
                        color: '#fff',
                        mb: 2,
                        lineHeight: 1
                    }}>
                        カテゴリー選択
                    </Typography>
                    <Typography sx={{ color: zinc[400], maxWidth: '600px', fontSize: { xs: '1rem', md: '1.125rem' }, lineHeight: 1.6 }}>
                        イラストを検索するカテゴリーを選択してください。
                    </Typography>

                    {/* Quick Stats Pill */}
                    <Box sx={{
                        display: 'flex',
                        mt: 3,
                        p: 0.75,
                        bgcolor: alpha(zinc[900], 0.5),
                        border: `1px solid ${alpha('#fff', 0.05)}`,
                        borderRadius: 3,
                        width: { xs: '100%', sm: 'max-content' }
                    }}>
                        <Box sx={{ flex: 1, px: 2.5, py: 1, textAlign: 'center', borderRight: `1px solid ${alpha('#fff', 0.05)}` }}>
                            <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>
                                {categories.length}
                            </Typography>
                            <Typography sx={{ fontSize: '9px', color: zinc[500], textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em', mt: 0.5 }}>
                                カテゴリー
                            </Typography>
                        </Box>
                        <Box sx={{ flex: 1, px: 2.5, py: 1, textAlign: 'center' }}>
                            <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#fff', lineHeight: 1.1 }}>
                                {totalStats.illustrations}
                            </Typography>
                            <Typography sx={{ fontSize: '9px', color: zinc[500], textTransform: 'uppercase', fontWeight: 900, letterSpacing: '0.1em', mt: 0.5 }}>
                                イラスト
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                {/* Search Bar */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, mb: 4 }}>
                    <Box sx={{ position: 'relative', flex: 1, '&:focus-within svg': { color: '#3b82f6' } }}>
                        <Box sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: zinc[500], transition: 'color 0.2s', display: 'flex' }}>
                            <Search size={18} />
                        </Box>
                        <Box
                            component="input"
                            placeholder="カテゴリーを検索..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            sx={{
                                width: '100%',
                                bgcolor: alpha(zinc[900], 0.8),
                                border: `1px solid ${alpha('#fff', 0.05)}`,
                                borderRadius: 3,
                                py: 1.75,
                                pl: 6,
                                pr: 2,
                                color: '#fff',
                                outline: 'none',
                                transition: 'all 0.2s',
                                fontSize: '0.875rem',
                                '::placeholder': { color: zinc[600] },
                                '&:focus': {
                                    boxShadow: `0 0 0 2px ${alpha('#3b82f6', 0.2)}`,
                                    borderColor: alpha('#3b82f6', 0.5)
                                }
                            }}
                        />
                    </Box>
                </Box>

                {/* Content Area */}
                {loading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 12, gap: 2 }}>
                        <CircularProgress sx={{ color: '#3b82f6' }} />
                    </Box>
                ) : filteredCategories.length > 0 ? (
                    <Grid container spacing={{ xs: 1, md: 2 }}>
                        {filteredCategories.map((category, idx) => (
                            <Grid item xs={12} sm={6} key={category.id}>
                                <CategoryCard category={category} onClick={handleCategoryClick} />
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Box sx={{
                        bgcolor: alpha(zinc[900], 0.2),
                        border: `1px dashed ${alpha('#fff', 0.1)}`,
                        borderRadius: 4,
                        py: 10,
                        textAlign: 'center'
                    }}>
                        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, mb: 0.5 }}>
                            「{searchTerm}」の検索結果はありません
                        </Typography>
                        <Typography variant="body2" sx={{ color: zinc[500] }}>
                            別の検索語句を試してください。
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Footer */}
            <Box component="footer" sx={{ display: { xs: 'none', md: 'block' }, maxWidth: '1280px', mx: 'auto', px: 3, mt: 10, pt: 5, borderTop: `1px solid ${alpha('#fff', 0.05)}` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: zinc[600], fontSize: '0.75rem', fontWeight: 500 }}>
                    <Typography variant="caption">© 2024 エンジンイラストレーション本部</Typography>
                </Box>
            </Box>
        </Box>
    );
};

export default PartCategoryList;
