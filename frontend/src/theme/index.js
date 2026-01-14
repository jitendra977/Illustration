import { createTheme, alpha } from '@mui/material/styles';

/**
 * Premium Zinc Palette
 * 
 * Dark Mode:
 * Background: 950 (#09090b)
 * Paper: 900 (#18181b)
 * Text: White
 * 
 * Light Mode:
 * Background: 50 (#fafafa) or White
 * Paper: White or 100 (#f4f4f5)
 * Text: Zinc 900
 */
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

export const getTheme = (mode) => {
    const isDark = mode === 'dark';

    return createTheme({
        palette: {
            mode,
            background: {
                default: isDark ? zinc[950] : zinc[50],
                paper: isDark ? zinc[900] : '#ffffff',
            },
            primary: {
                main: '#3b82f6', // Bright blue works for both
                light: '#60a5fa',
                dark: '#2563eb',
                contrastText: '#ffffff',
            },
            secondary: {
                main: '#10b981', // Emerald
                light: '#34d399',
                dark: '#059669',
                contrastText: '#ffffff',
            },
            text: {
                primary: isDark ? '#ffffff' : zinc[900],
                secondary: isDark ? zinc[400] : zinc[500],
                disabled: isDark ? zinc[600] : zinc[300],
            },
            divider: isDark ? alpha('#ffffff', 0.05) : alpha(zinc[200], 0.8),
            action: {
                hover: isDark ? alpha(zinc[800], 0.5) : alpha(zinc[100], 0.8),
                selected: alpha('#3b82f6', 0.1),
                disabled: isDark ? zinc[700] : zinc[300],
                disabledBackground: isDark ? zinc[800] : zinc[50],
            },
            zinc: zinc,
        },
        shape: {
            borderRadius: 12,
        },
        typography: {
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            h1: { fontSize: '2.5rem', fontWeight: 700, lineHeight: 1.2 },
            h2: { fontSize: '2rem', fontWeight: 700, lineHeight: 1.3 },
            h3: { fontSize: '1.75rem', fontWeight: 600, lineHeight: 1.3 },
            h4: { fontSize: '1.5rem', fontWeight: 600, lineHeight: 1.4 },
            h5: { fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.4 },
            h6: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 },
            body1: { fontSize: '1rem', lineHeight: 1.5 },
            body2: { fontSize: '0.875rem', lineHeight: 1.5 },
            caption: { fontSize: '0.75rem', color: isDark ? zinc[500] : zinc[400] },
            button: { textTransform: 'none', fontWeight: 600 },
            overline: { fontWeight: 800, letterSpacing: '0.05em', fontSize: '0.65rem' },
        },
        components: {
            MuiCssBaseline: {
                styleOverrides: {
                    body: {
                        backgroundColor: isDark ? zinc[950] : '#ffffff',
                        scrollbarColor: isDark ? `${zinc[700]} ${zinc[950]}` : `${zinc[300]} #ffffff`,
                        '&::-webkit-scrollbar': {
                            width: '8px',
                            height: '8px',
                        },
                        '&::-webkit-scrollbar-track': {
                            background: isDark ? zinc[950] : '#ffffff',
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: isDark ? zinc[700] : zinc[300],
                            borderRadius: '4px',
                            '&:hover': {
                                backgroundColor: isDark ? zinc[600] : zinc[400],
                            },
                        },
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        backgroundColor: isDark ? zinc[900] : '#ffffff',
                        border: `1px solid ${isDark ? alpha('#ffffff', 0.05) : alpha(zinc[200], 0.6)}`,
                        boxShadow: isDark ? 'none' : '0 1px 2px 0 rgb(0 0 0 / 0.05)',
                    },
                    // Light mode shadows need to be softer
                    elevation1: { boxShadow: isDark ? '0 4px 6px -1px rgb(0 0 0 / 0.1)' : '0 2px 4px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.03)' },
                    elevation2: { boxShadow: isDark ? '0 10px 15px -3px rgb(0 0 0 / 0.1)' : '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03)' },
                },
            },
            MuiCard: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                        backgroundColor: isDark ? alpha(zinc[900], 0.6) : '#ffffff',
                        backdropFilter: isDark ? 'blur(16px)' : 'none',
                        border: `1px solid ${isDark ? alpha('#ffffff', 0.1) : alpha(zinc[200], 0.6)}`,
                        borderRadius: 16,
                        boxShadow: isDark ? '0 10px 15px -3px rgb(0 0 0 / 0.1)' : '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                            boxShadow: isDark ? '0 20px 25px -5px rgb(0 0 0 / 0.1)' : '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                            borderColor: isDark ? alpha('#ffffff', 0.15) : alpha(zinc[300], 0.6),
                        }
                    },
                },
            },
            MuiButton: {
                styleOverrides: {
                    root: {
                        borderRadius: 10,
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: 'none',
                        },
                    },
                    outlined: {
                        borderColor: isDark ? alpha('#ffffff', 0.1) : alpha('#000000', 0.1),
                        color: isDark ? zinc[300] : zinc[700],
                        '&:hover': {
                            borderColor: isDark ? alpha('#ffffff', 0.2) : alpha('#000000', 0.2),
                            backgroundColor: isDark ? alpha('#ffffff', 0.05) : alpha(zinc[100], 0.5),
                            color: isDark ? '#ffffff' : zinc[900],
                        },
                    },
                },
            },
            MuiAppBar: {
                styleOverrides: {
                    root: {
                        backgroundColor: isDark ? alpha(zinc[950], 0.8) : alpha('#ffffff', 0.8),
                        backdropFilter: 'blur(12px)',
                        borderBottom: `1px solid ${isDark ? alpha('#ffffff', 0.05) : alpha('#000000', 0.05)}`,
                        boxShadow: 'none',
                        color: isDark ? '#ffffff' : zinc[950],
                    },
                },
            },
            MuiDrawer: {
                styleOverrides: {
                    paper: {
                        backgroundColor: isDark ? zinc[950] : '#ffffff',
                        borderRight: `1px solid ${isDark ? alpha('#ffffff', 0.05) : alpha(zinc[200], 0.5)}`,
                    },
                },
            },
            MuiTextField: {
                styleOverrides: {
                    root: {
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: isDark ? alpha(zinc[900], 0.4) : alpha('#ffffff', 0.5),
                            '& fieldset': {
                                borderColor: isDark ? alpha('#ffffff', 0.05) : alpha(zinc[200], 0.8),
                            },
                            '&:hover fieldset': {
                                borderColor: isDark ? alpha('#ffffff', 0.1) : alpha(zinc[300], 0.8),
                            },
                            '&.Mui-focused fieldset': {
                                borderColor: '#3b82f6',
                            },
                        },
                    },
                },
            },
            MuiChip: {
                styleOverrides: {
                    root: {
                        fontWeight: 500,
                    },
                    filled: {
                        backgroundColor: isDark ? zinc[800] : zinc[100],
                        color: isDark ? zinc[300] : zinc[700],
                    },
                    outlined: {
                        borderColor: isDark ? alpha('#ffffff', 0.1) : alpha('#000000', 0.1),
                    },
                },
            },
        },
    });
};
