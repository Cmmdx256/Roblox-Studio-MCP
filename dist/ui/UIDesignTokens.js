export const BUILTIN_UI_THEMES = {
    dark_fantasy: {
        id: 'dark_fantasy',
        name: 'Dark Fantasy RPG',
        description: 'Atmospheric, medieval-fantasy UI with deep obsidian tones, golden accents, and ornate borders.',
        palette: {
            background: '#0F0E17',
            surface: '#1A1829',
            surfaceElevated: '#28253E',
            primary: '#E5A93C', // Antique Gold
            primaryHover: '#F6C15B',
            secondary: '#8B263E', // Royal Crimson
            accent: '#D4AF37', // Gold leaf
            textPrimary: '#F7E7CE', // Champagne
            textSecondary: '#A29BA8',
            border: '#4A3B32', // Bronze/Iron
            danger: '#DC2626',
            warning: '#F59E0B',
            success: '#10B981'
        },
        typography: {
            fontFamily: 'GothamBold',
            headingSize: 22,
            subheadingSize: 16,
            bodySize: 13,
            captionSize: 11
        },
        spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
        radius: { sm: 4, md: 8, lg: 12, full: 999 },
        strokes: { thin: 1, medium: 2, thick: 3 },
        backgroundTransparency: 0.1,
        defaultEasingDirection: 'Out',
        defaultEasingStyle: 'Quad'
    },
    modern_minimal: {
        id: 'modern_minimal',
        name: 'Modern Minimal Glass',
        description: 'Clean, contemporary UI with frosted translucent panels, clean geometry, and high contrast typography.',
        palette: {
            background: '#0B0F19',
            surface: '#111827',
            surfaceElevated: '#1F2937',
            primary: '#3B82F6', // Electric Blue
            primaryHover: '#60A5FA',
            secondary: '#6366F1', // Indigo
            accent: '#06B6D4', // Cyan
            textPrimary: '#FFFFFF',
            textSecondary: '#9CA3AF',
            border: '#374151',
            danger: '#EF4444',
            warning: '#F59E0B',
            success: '#10B981'
        },
        typography: {
            fontFamily: 'Gotham',
            headingSize: 20,
            subheadingSize: 15,
            bodySize: 13,
            captionSize: 10
        },
        spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
        radius: { sm: 6, md: 10, lg: 16, full: 999 },
        strokes: { thin: 1, medium: 1, thick: 2 },
        backgroundTransparency: 0.15,
        defaultEasingDirection: 'Out',
        defaultEasingStyle: 'Quint'
    },
    cartoon: {
        id: 'cartoon',
        name: 'Vibrant Cartoon / Simulator',
        description: 'Bouncy, colorful, and friendly UI with thick strokes, bubbly pill buttons, and cheerful saturated colors.',
        palette: {
            background: '#1E1B4B',
            surface: '#312E81',
            surfaceElevated: '#4338CA',
            primary: '#FBBF24', // Sunlight Yellow
            primaryHover: '#FCD34D',
            secondary: '#F43F5E', // Punch Pink
            accent: '#34D399', // Mint Green
            textPrimary: '#FFFFFF',
            textSecondary: '#E0E7FF',
            border: '#1E1B4B', // Thick cartoon border
            danger: '#EF4444',
            warning: '#F59E0B',
            success: '#10B981'
        },
        typography: {
            fontFamily: 'FredokaOne',
            headingSize: 24,
            subheadingSize: 18,
            bodySize: 14,
            captionSize: 11
        },
        spacing: { xs: 6, sm: 10, md: 14, lg: 20, xl: 28 },
        radius: { sm: 8, md: 14, lg: 20, full: 999 },
        strokes: { thin: 2, medium: 3, thick: 4 },
        backgroundTransparency: 0.05,
        defaultEasingDirection: 'Out',
        defaultEasingStyle: 'Back' // Bouncy animation
    },
    fishing_casual: {
        id: 'fishing_casual',
        name: 'Coastal Fishing / Nature',
        description: 'Relaxing aquatic and weathered timber theme with seafoam greens, ocean blues, and warm beach tones.',
        palette: {
            background: '#0C2333', // Deep Marine
            surface: '#153A52',
            surfaceElevated: '#1D4F6F',
            primary: '#38BDF8', // Ocean Blue
            primaryHover: '#7DD3FC',
            secondary: '#F59E0B', // Sandy Amber
            accent: '#2DD4BF', // Aquamarine
            textPrimary: '#F0F9FF',
            textSecondary: '#BAE6FD',
            border: '#075985',
            danger: '#F43F5E',
            warning: '#FBBF24',
            success: '#34D399'
        },
        typography: {
            fontFamily: 'GothamBold',
            headingSize: 21,
            subheadingSize: 16,
            bodySize: 13,
            captionSize: 11
        },
        spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
        radius: { sm: 6, md: 10, lg: 14, full: 999 },
        strokes: { thin: 1, medium: 2, thick: 3 },
        backgroundTransparency: 0.1,
        defaultEasingDirection: 'Out',
        defaultEasingStyle: 'Quad'
    },
    sci_fi: {
        id: 'sci_fi',
        name: 'Cyberpunk / Sci-Fi HUD',
        description: 'Futuristic holographic HUD with neon teal accents, dark carbon surfaces, and sharp angular borders.',
        palette: {
            background: '#050811',
            surface: '#0B1120',
            surfaceElevated: '#141F36',
            primary: '#00F0FF', // Cyber Neon Cyan
            primaryHover: '#5EFFFF',
            secondary: '#FF0055', // Neon Magenta
            accent: '#FFE600', // Hazard Yellow
            textPrimary: '#E2F1FF',
            textSecondary: '#7390B2',
            border: '#00F0FF',
            danger: '#FF0055',
            warning: '#FFE600',
            success: '#00FF66'
        },
        typography: {
            fontFamily: 'GothamMedium',
            headingSize: 20,
            subheadingSize: 15,
            bodySize: 12,
            captionSize: 10
        },
        spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
        radius: { sm: 2, md: 4, lg: 6, full: 999 },
        strokes: { thin: 1, medium: 2, thick: 2 },
        backgroundTransparency: 0.2,
        defaultEasingDirection: 'Out',
        defaultEasingStyle: 'Linear'
    }
};
export function hexToColor3(hex) {
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
        clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    return {
        r: ((num >> 16) & 255) / 255,
        g: ((num >> 8) & 255) / 255,
        b: (num & 255) / 255
    };
}
//# sourceMappingURL=UIDesignTokens.js.map