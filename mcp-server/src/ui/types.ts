export interface ColorPalette {
    background: string;       // Hex e.g. '#12131C'
    surface: string;          // Hex e.g. '#1E202E'
    surfaceElevated: string;  // Hex e.g. '#2A2D40'
    primary: string;          // Hex e.g. '#6366F1'
    primaryHover: string;     // Hex e.g. '#4F46E5'
    secondary: string;        // Hex e.g. '#EC4899'
    accent: string;           // Hex e.g. '#10B981'
    textPrimary: string;      // Hex e.g. '#FFFFFF'
    textSecondary: string;    // Hex e.g. '#9CA3AF'
    border: string;           // Hex e.g. '#374151'
    danger: string;           // Hex e.g. '#EF4444'
    warning: string;          // Hex e.g. '#F59E0B'
    success: string;          // Hex e.g. '#10B981'
}

export interface TypographyTokens {
    fontFamily: string;       // e.g. 'FredokaOne', 'GothamBold', 'SourceSansBold'
    headingSize: number;      // e.g. 24
    subheadingSize: number;   // e.g. 18
    bodySize: number;         // e.g. 14
    captionSize: number;      // e.g. 11
}

export interface SpacingTokens {
    xs: number;  // e.g. 4
    sm: number;  // e.g. 8
    md: number;  // e.g. 12
    lg: number;  // e.g. 16
    xl: number;  // e.g. 24
}

export interface RadiusTokens {
    sm: number;   // e.g. 4
    md: number;   // e.g. 8
    lg: number;   // e.g. 12
    full: number; // e.g. 999
}

export interface StrokeTokens {
    thin: number;   // e.g. 1
    medium: number; // e.g. 2
    thick: number;  // e.g. 3
}

export interface UITheme {
    id: string;
    name: string;
    description: string;
    palette: ColorPalette;
    typography: TypographyTokens;
    spacing: SpacingTokens;
    radius: RadiusTokens;
    strokes: StrokeTokens;
    backgroundTransparency: number;
    defaultEasingDirection: string;
    defaultEasingStyle: string;
}

export type UIComponentType =
    | 'ScreenGui'
    | 'Panel'
    | 'Card'
    | 'ItemCard'
    | 'Button'
    | 'IconButton'
    | 'Inventory'
    | 'Shop'
    | 'Modal'
    | 'Tooltip'
    | 'Notification'
    | 'NotificationToast'
    | 'QuestPanel'
    | 'SettingsPanel'
    | 'CurrencyDisplay'
    | 'CurrencyPill'
    | 'ProgressBar'
    | 'HealthBar'
    | 'TabBar'
    | 'Dropdown'
    | 'ConfirmationDialog'
    | 'DialogBox'
    | 'Header'
    | 'Label'
    | 'SlotGrid';

export interface UIComponentSpec {
    type: UIComponentType;
    id: string;
    parentId?: string;
    title?: string;
    label?: string;
    icon?: string;
    position?: [number, number, number, number]; // [ScaleX, OffsetX, ScaleY, OffsetY]
    size?: [number, number, number, number];     // [ScaleX, OffsetX, ScaleY, OffsetY]
    anchorPoint?: [number, number];              // [X, Y]
    props?: Record<string, any>;
    themeOverride?: Partial<UITheme>;
    events?: Array<{ event: string; action: string; target?: string }>;
    animations?: Array<{ trigger: string; type: string; duration?: number }>;
    children?: UIComponentSpec[];
}

export interface UIScreenSpec {
    screenName: string;
    targetParent?: string; // e.g. 'StarterGui' or 'PlayerGui'
    theme: string;         // theme id e.g. 'dark_fantasy'
    layout: 'centered' | 'dock_left' | 'dock_right' | 'fullscreen' | 'hud_overlay';
    components: UIComponentSpec[];
}

export interface CompiledUIInstance {
    className: string;
    name: string;
    parentPath: string;
    properties: Record<string, any>;
    attributes?: Record<string, any>;
    tags?: string[];
    children?: CompiledUIInstance[];
}
