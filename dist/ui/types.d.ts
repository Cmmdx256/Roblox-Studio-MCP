export interface ColorPalette {
    background: string;
    surface: string;
    surfaceElevated: string;
    primary: string;
    primaryHover: string;
    secondary: string;
    accent: string;
    textPrimary: string;
    textSecondary: string;
    border: string;
    danger: string;
    warning: string;
    success: string;
}
export interface TypographyTokens {
    fontFamily: string;
    headingSize: number;
    subheadingSize: number;
    bodySize: number;
    captionSize: number;
}
export interface SpacingTokens {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
}
export interface RadiusTokens {
    sm: number;
    md: number;
    lg: number;
    full: number;
}
export interface StrokeTokens {
    thin: number;
    medium: number;
    thick: number;
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
export type UIComponentType = 'ScreenGui' | 'Panel' | 'Card' | 'ItemCard' | 'Button' | 'IconButton' | 'Inventory' | 'Shop' | 'Modal' | 'Tooltip' | 'Notification' | 'NotificationToast' | 'QuestPanel' | 'SettingsPanel' | 'CurrencyDisplay' | 'CurrencyPill' | 'ProgressBar' | 'HealthBar' | 'TabBar' | 'Dropdown' | 'ConfirmationDialog' | 'DialogBox' | 'Header' | 'Label' | 'SlotGrid';
export interface UIComponentSpec {
    type: UIComponentType;
    id: string;
    parentId?: string;
    title?: string;
    label?: string;
    icon?: string;
    position?: [number, number, number, number];
    size?: [number, number, number, number];
    anchorPoint?: [number, number];
    props?: Record<string, any>;
    themeOverride?: Partial<UITheme>;
    events?: Array<{
        event: string;
        action: string;
        target?: string;
    }>;
    animations?: Array<{
        trigger: string;
        type: string;
        duration?: number;
    }>;
    children?: UIComponentSpec[];
}
export interface UIScreenSpec {
    screenName: string;
    targetParent?: string;
    theme: string;
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
//# sourceMappingURL=types.d.ts.map