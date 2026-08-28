import { UIComponentType, UITheme } from './types.js';
import { hexToColor3 } from './UIDesignTokens.js';

export interface ComponentTemplate {
    type: UIComponentType;
    defaultSize: [number, number, number, number];
    defaultAnchorPoint: [number, number];
    buildInstances: (id: string, theme: UITheme, options?: any) => any[];
}

export class UIComponentLibrary {
    private templates = new Map<UIComponentType, ComponentTemplate>();

    constructor() {
        this.registerDefaultTemplates();
    }

    private registerDefaultTemplates(): void {
        // 1. Button
        this.templates.set('Button', {
            type: 'Button',
            defaultSize: [0, 160, 0, 44],
            defaultAnchorPoint: [0.5, 0.5],
            buildInstances: (id: string, theme: UITheme, options: any = {}) => [
                {
                    className: 'TextButton',
                    name: id,
                    properties: {
                        Text: options.label || 'Click Here',
                        Size: { _type: 'UDim2', scaleX: 0, offsetX: options.width || 160, scaleY: 0, offsetY: options.height || 44 },
                        BackgroundColor3: hexToColor3(theme.palette.primary),
                        TextColor3: hexToColor3(theme.palette.textPrimary),
                        Font: theme.typography.fontFamily,
                        TextSize: theme.typography.subheadingSize,
                        AutoButtonColor: true,
                    },
                    children: [
                        { className: 'UICorner', name: 'Corner', properties: { CornerRadius: { _type: 'UDim', scale: 0, offset: theme.radius.md } } },
                        { className: 'UIStroke', name: 'Stroke', properties: { Color: hexToColor3(theme.palette.border), Thickness: theme.strokes.medium, ApplyStrokeMode: 'Border' } }
                    ]
                }
            ]
        });

        // 2. IconButton
        this.templates.set('IconButton', {
            type: 'IconButton',
            defaultSize: [0, 44, 0, 44],
            defaultAnchorPoint: [0.5, 0.5],
            buildInstances: (id: string, theme: UITheme, options: any = {}) => [
                {
                    className: 'ImageButton',
                    name: id,
                    properties: {
                        Size: { _type: 'UDim2', scaleX: 0, offsetX: 44, scaleY: 0, offsetY: 44 },
                        BackgroundColor3: hexToColor3(theme.palette.surface),
                        Image: options.icon || 'rbxassetid://6031075938',
                    },
                    children: [
                        { className: 'UICorner', name: 'Corner', properties: { CornerRadius: { _type: 'UDim', scale: 0, offset: theme.radius.sm } } }
                    ]
                }
            ]
        });

        // 3. Panel
        this.templates.set('Panel', {
            type: 'Panel',
            defaultSize: [0, 480, 0, 360],
            defaultAnchorPoint: [0.5, 0.5],
            buildInstances: (id: string, theme: UITheme, options: any = {}) => [
                {
                    className: 'Frame',
                    name: id,
                    properties: {
                        Size: { _type: 'UDim2', scaleX: 0, offsetX: options.width || 480, scaleY: 0, offsetY: options.height || 360 },
                        BackgroundColor3: hexToColor3(theme.palette.surface),
                        BackgroundTransparency: theme.backgroundTransparency,
                    },
                    children: [
                        { className: 'UICorner', name: 'Corner', properties: { CornerRadius: { _type: 'UDim', scale: 0, offset: theme.radius.lg } } },
                        { className: 'UIStroke', name: 'Stroke', properties: { Color: hexToColor3(theme.palette.border), Thickness: theme.strokes.medium, ApplyStrokeMode: 'Border' } },
                        { className: 'UIPadding', name: 'Padding', properties: { PaddingTop: { _type: 'UDim', scale: 0, offset: theme.spacing.lg }, PaddingBottom: { _type: 'UDim', scale: 0, offset: theme.spacing.lg }, PaddingLeft: { _type: 'UDim', scale: 0, offset: theme.spacing.lg }, PaddingRight: { _type: 'UDim', scale: 0, offset: theme.spacing.lg } } }
                    ]
                }
            ]
        });

        // 4. ItemCard
        this.templates.set('ItemCard', {
            type: 'ItemCard',
            defaultSize: [0, 100, 0, 120],
            defaultAnchorPoint: [0, 0],
            buildInstances: (id: string, theme: UITheme, options: any = {}) => [
                {
                    className: 'Frame',
                    name: id,
                    properties: {
                        Size: { _type: 'UDim2', scaleX: 0, offsetX: 100, scaleY: 0, offsetY: 120 },
                        BackgroundColor3: hexToColor3(theme.palette.surfaceElevated),
                    },
                    children: [
                        { className: 'UICorner', name: 'Corner', properties: { CornerRadius: { _type: 'UDim', scale: 0, offset: theme.radius.sm } } },
                        { className: 'UIStroke', name: 'Stroke', properties: { Color: hexToColor3(theme.palette.border), Thickness: 1 } },
                        { className: 'ImageLabel', name: 'ItemIcon', properties: { Size: { _type: 'UDim2', scaleX: 0.7, offsetX: 0, scaleY: 0.6, offsetY: 0 }, Position: { _type: 'UDim2', scaleX: 0.15, offsetX: 0, scaleY: 0.05, offsetY: 0 }, BackgroundTransparency: 1, Image: options.icon || 'rbxassetid://6031075938' } },
                        { className: 'TextLabel', name: 'ItemName', properties: { Text: options.title || 'Item', Size: { _type: 'UDim2', scaleX: 1, offsetX: 0, scaleY: 0.25, offsetY: 0 }, Position: { _type: 'UDim2', scaleX: 0, offsetX: 0, scaleY: 0.7, offsetY: 0 }, BackgroundTransparency: 1, TextColor3: hexToColor3(theme.palette.textPrimary), Font: theme.typography.fontFamily, TextSize: theme.typography.captionSize } }
                    ]
                }
            ]
        });

        // 5. ProgressBar
        this.templates.set('ProgressBar', {
            type: 'ProgressBar',
            defaultSize: [0, 240, 0, 20],
            defaultAnchorPoint: [0.5, 0.5],
            buildInstances: (id: string, theme: UITheme, options: any = {}) => [
                {
                    className: 'Frame',
                    name: id,
                    properties: {
                        Size: { _type: 'UDim2', scaleX: 0, offsetX: options.width || 240, scaleY: 0, offsetY: 20 },
                        BackgroundColor3: hexToColor3(theme.palette.surface),
                    },
                    children: [
                        { className: 'UICorner', name: 'Corner', properties: { CornerRadius: { _type: 'UDim', scale: 0, offset: theme.radius.full } } },
                        {
                            className: 'Frame',
                            name: 'Fill',
                            properties: {
                                Size: { _type: 'UDim2', scaleX: options.progress || 0.6, offsetX: 0, scaleY: 1, offsetY: 0 },
                                BackgroundColor3: hexToColor3(options.fillColor || theme.palette.accent),
                            },
                            children: [{ className: 'UICorner', name: 'Corner', properties: { CornerRadius: { _type: 'UDim', scale: 0, offset: theme.radius.full } } }]
                        }
                    ]
                }
            ]
        });

        // 6. Header
        this.templates.set('Header', {
            type: 'Header',
            defaultSize: [1, 0, 0, 48],
            defaultAnchorPoint: [0, 0],
            buildInstances: (id: string, theme: UITheme, options: any = {}) => [
                {
                    className: 'TextLabel',
                    name: id,
                    properties: {
                        Text: options.title || 'Header Title',
                        Size: { _type: 'UDim2', scaleX: 1, offsetX: 0, scaleY: 0, offsetY: 48 },
                        BackgroundTransparency: 1,
                        TextColor3: hexToColor3(theme.palette.textPrimary),
                        Font: theme.typography.fontFamily,
                        TextSize: theme.typography.headingSize,
                        TextXAlignment: 'Left'
                    }
                }
            ]
        });

        // 7. Label
        this.templates.set('Label', {
            type: 'Label',
            defaultSize: [0, 200, 0, 30],
            defaultAnchorPoint: [0, 0],
            buildInstances: (id: string, theme: UITheme, options: any = {}) => [
                {
                    className: 'TextLabel',
                    name: id,
                    properties: {
                        Text: options.text || 'Label Text',
                        Size: { _type: 'UDim2', scaleX: 0, offsetX: 200, scaleY: 0, offsetY: 30 },
                        BackgroundTransparency: 1,
                        TextColor3: hexToColor3(theme.palette.textSecondary),
                        Font: theme.typography.fontFamily,
                        TextSize: theme.typography.bodySize
                    }
                }
            ]
        });

        // 8. CurrencyPill
        this.templates.set('CurrencyPill', {
            type: 'CurrencyPill',
            defaultSize: [0, 140, 0, 36],
            defaultAnchorPoint: [1, 0],
            buildInstances: (id: string, theme: UITheme, options: any = {}) => [
                {
                    className: 'Frame',
                    name: id,
                    properties: {
                        Size: { _type: 'UDim2', scaleX: 0, offsetX: 140, scaleY: 0, offsetY: 36 },
                        BackgroundColor3: hexToColor3(theme.palette.surfaceElevated),
                    },
                    children: [
                        { className: 'UICorner', name: 'Corner', properties: { CornerRadius: { _type: 'UDim', scale: 0, offset: theme.radius.full } } },
                        { className: 'UIStroke', name: 'Stroke', properties: { Color: hexToColor3(theme.palette.border), Thickness: 1 } },
                        { className: 'TextLabel', name: 'Amount', properties: { Text: options.amount ? `${options.symbol || '🪙'} ${options.amount}` : '🪙 0', Size: { _type: 'UDim2', scaleX: 1, offsetX: 0, scaleY: 1, offsetY: 0 }, BackgroundTransparency: 1, TextColor3: hexToColor3(theme.palette.textPrimary), Font: theme.typography.fontFamily, TextSize: theme.typography.subheadingSize } }
                    ]
                }
            ]
        });

        // 9. SlotGrid
        this.templates.set('SlotGrid', {
            type: 'SlotGrid',
            defaultSize: [1, 0, 1, -60],
            defaultAnchorPoint: [0, 0],
            buildInstances: (id: string, theme: UITheme, options: any = {}) => [
                {
                    className: 'ScrollingFrame',
                    name: id,
                    properties: {
                        Size: { _type: 'UDim2', scaleX: 1, offsetX: 0, scaleY: 1, offsetY: -60 },
                        BackgroundTransparency: 1,
                        ScrollBarThickness: 6,
                        ScrollBarImageColor3: hexToColor3(theme.palette.border)
                    },
                    children: [
                        {
                            className: 'UIGridLayout',
                            name: 'GridLayout',
                            properties: {
                                CellSize: { _type: 'UDim2', scaleX: 0, offsetX: 90, scaleY: 0, offsetY: 100 },
                                CellPadding: { _type: 'UDim2', scaleX: 0, offsetX: 8, scaleY: 0, offsetY: 8 }
                            }
                        }
                    ]
                }
            ]
        });

        // 10. NotificationToast
        this.templates.set('NotificationToast', {
            type: 'NotificationToast',
            defaultSize: [0, 320, 0, 60],
            defaultAnchorPoint: [0.5, 0],
            buildInstances: (id: string, theme: UITheme, options: any = {}) => [
                {
                    className: 'Frame',
                    name: id,
                    properties: {
                        Size: { _type: 'UDim2', scaleX: 0, offsetX: 320, scaleY: 0, offsetY: 60 },
                        BackgroundColor3: hexToColor3(theme.palette.surfaceElevated),
                    },
                    children: [
                        { className: 'UICorner', name: 'Corner', properties: { CornerRadius: { _type: 'UDim', scale: 0, offset: theme.radius.md } } },
                        { className: 'UIStroke', name: 'Stroke', properties: { Color: hexToColor3(theme.palette.accent), Thickness: 2 } },
                        { className: 'TextLabel', name: 'Message', properties: { Text: options.message || 'Notification', Size: { _type: 'UDim2', scaleX: 1, offsetX: -20, scaleY: 1, offsetY: 0 }, Position: { _type: 'UDim2', scaleX: 0, offsetX: 10, scaleY: 0, offsetY: 0 }, BackgroundTransparency: 1, TextColor3: hexToColor3(theme.palette.textPrimary), Font: theme.typography.fontFamily, TextSize: theme.typography.bodySize } }
                    ]
                }
            ]
        });

        // 11. Modal
        this.templates.set('Modal', {
            type: 'Modal',
            defaultSize: [0, 520, 0, 400],
            defaultAnchorPoint: [0.5, 0.5],
            buildInstances: (id: string, theme: UITheme, options: any = {}) => [
                {
                    className: 'Frame',
                    name: id,
                    properties: {
                        Size: { _type: 'UDim2', scaleX: 0, offsetX: 520, scaleY: 0, offsetY: 400 },
                        BackgroundColor3: hexToColor3(theme.palette.surface),
                    },
                    children: [
                        { className: 'UICorner', name: 'Corner', properties: { CornerRadius: { _type: 'UDim', scale: 0, offset: theme.radius.lg } } },
                        { className: 'UIStroke', name: 'Stroke', properties: { Color: hexToColor3(theme.palette.border), Thickness: 2 } }
                    ]
                }
            ]
        });

        // 12. HealthBar
        this.templates.set('HealthBar', {
            type: 'HealthBar',
            defaultSize: [0, 200, 0, 16],
            defaultAnchorPoint: [0, 0],
            buildInstances: (id: string, theme: UITheme, options: any = {}) => [
                {
                    className: 'Frame',
                    name: id,
                    properties: { Size: { _type: 'UDim2', scaleX: 0, offsetX: 200, scaleY: 0, offsetY: 16 }, BackgroundColor3: hexToColor3('#1E1E1E') },
                    children: [
                        { className: 'UICorner', name: 'Corner', properties: { CornerRadius: { _type: 'UDim', scale: 0, offset: theme.radius.sm } } },
                        { className: 'Frame', name: 'HealthFill', properties: { Size: { _type: 'UDim2', scaleX: 1, offsetX: 0, scaleY: 1, offsetY: 0 }, BackgroundColor3: hexToColor3('#4CAF50') }, children: [{ className: 'UICorner', name: 'Corner', properties: { CornerRadius: { _type: 'UDim', scale: 0, offset: theme.radius.sm } } }] }
                    ]
                }
            ]
        });

        // 13. DialogBox
        this.templates.set('DialogBox', {
            type: 'DialogBox',
            defaultSize: [0.8, 0, 0, 140],
            defaultAnchorPoint: [0.5, 1],
            buildInstances: (id: string, theme: UITheme, options: any = {}) => [
                {
                    className: 'Frame',
                    name: id,
                    properties: { Size: { _type: 'UDim2', scaleX: 0.8, offsetX: 0, scaleY: 0, offsetY: 140 }, BackgroundColor3: hexToColor3(theme.palette.surface) },
                    children: [
                        { className: 'UICorner', name: 'Corner', properties: { CornerRadius: { _type: 'UDim', scale: 0, offset: theme.radius.md } } },
                        { className: 'TextLabel', name: 'Speaker', properties: { Text: options.speaker || 'NPC', Size: { _type: 'UDim2', scaleX: 1, offsetX: -20, scaleY: 0, offsetY: 30 }, Position: { _type: 'UDim2', scaleX: 0, offsetX: 10, scaleY: 0, offsetY: 5 }, BackgroundTransparency: 1, TextColor3: hexToColor3(theme.palette.accent), Font: theme.typography.fontFamily, TextSize: theme.typography.subheadingSize } }
                    ]
                }
            ]
        });
    }

    public getTemplate(type: UIComponentType): ComponentTemplate | undefined {
        return this.templates.get(type);
    }

    public listTemplates(): UIComponentType[] {
        return Array.from(this.templates.keys());
    }
}

export const uiComponentLibrary = new UIComponentLibrary();

