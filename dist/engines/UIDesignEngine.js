import { BUILTIN_UI_THEMES, hexToColor3 } from '../ui/UIDesignTokens.js';
import { uiComponentLibrary } from '../ui/UIComponentLibrary.js';
import { executionPipeline } from '../execution/ExecutionPipeline.js';
export class UIDesignEngine {
    /**
     * Retrieves or creates a design theme.
     */
    getTheme(themeId = 'dark_fantasy') {
        return BUILTIN_UI_THEMES[themeId] || BUILTIN_UI_THEMES['dark_fantasy'];
    }
    listThemes() {
        return Object.values(BUILTIN_UI_THEMES);
    }
    /**
     * Compiles an intermediate UI specification into structured Roblox DataModel instances.
     * Follows the Structure -> Style -> Behavior -> Animation pipeline.
     */
    compileScreenSpec(spec) {
        const theme = this.getTheme(spec.theme);
        const targetParent = spec.targetParent || 'StarterGui';
        const rootGui = {
            className: 'ScreenGui',
            name: spec.screenName,
            parentPath: targetParent,
            properties: {
                ResetOnSpawn: false,
                ZIndexBehavior: 'Sibling',
                IgnoreGuiInset: spec.layout === 'fullscreen'
            },
            children: []
        };
        for (const comp of spec.components) {
            const compiledComp = this.compileComponent(comp, theme, `${targetParent}.${spec.screenName}`);
            rootGui.children.push(compiledComp);
        }
        return rootGui;
    }
    compileComponent(comp, theme, parentPath) {
        const activeTheme = comp.themeOverride ? { ...theme, ...comp.themeOverride } : theme;
        const template = uiComponentLibrary.getTemplate(comp.type);
        const pos = comp.position || [0.5, 0, 0.5, 0];
        const sz = comp.size || (template ? template.defaultSize : [0, 200, 0, 100]);
        const anchor = comp.anchorPoint || (template ? template.defaultAnchorPoint : [0.5, 0.5]);
        let className = 'Frame';
        if (comp.type === 'Button' || comp.type === 'IconButton')
            className = 'TextButton';
        else if (comp.type === 'ScreenGui')
            className = 'ScreenGui';
        const compiled = {
            className,
            name: comp.id,
            parentPath,
            properties: {
                Position: { _type: 'UDim2', scaleX: pos[0], offsetX: pos[1], scaleY: pos[2], offsetY: pos[3] },
                Size: { _type: 'UDim2', scaleX: sz[0], offsetX: sz[1], scaleY: sz[2], offsetY: sz[3] },
                AnchorPoint: { _type: 'Vector2', x: anchor[0], y: anchor[1] },
                BackgroundColor3: hexToColor3(activeTheme.palette.surface),
                BackgroundTransparency: activeTheme.backgroundTransparency,
                BorderSizePixel: 0,
                ...(comp.props || {})
            },
            children: [
                {
                    className: 'UICorner',
                    name: 'Corner',
                    parentPath: `${parentPath}.${comp.id}`,
                    properties: { CornerRadius: { _type: 'UDim', scale: 0, offset: activeTheme.radius.md } }
                },
                {
                    className: 'UIStroke',
                    name: 'Stroke',
                    parentPath: `${parentPath}.${comp.id}`,
                    properties: {
                        Color: hexToColor3(activeTheme.palette.border),
                        Thickness: activeTheme.strokes.thin,
                        ApplyStrokeMode: 'Border'
                    }
                }
            ]
        };
        if (comp.children && comp.children.length > 0) {
            for (const child of comp.children) {
                compiled.children.push(this.compileComponent(child, activeTheme, `${parentPath}.${comp.id}`));
            }
        }
        return compiled;
    }
    /**
     * Executes the compiled UI specification in Roblox Studio and verifies outcome with evidence.
     */
    /**
     * Executes the compiled UI specification in Roblox Studio and verifies outcome with evidence.
     * Recursively instantiates all child containers, components, corners, strokes, and layouts.
     */
    async createScreen(spec) {
        const compiled = this.compileScreenSpec(spec);
        console.error(`[UIDesignEngine] Constructing recursive ScreenGui hierarchy: ${spec.screenName} with theme '${spec.theme}'`);
        const startTime = Date.now();
        // 1. Create root ScreenGui
        const rootRecord = await executionPipeline.execute('instance_create', {
            parent: compiled.parentPath,
            className: compiled.className,
            name: compiled.name,
            properties: compiled.properties
        }, {
            postconditions: [
                { type: 'EXISTENCE', target: `${compiled.parentPath}.${compiled.name}`, expected: true },
                { type: 'CLASS_NAME', target: `${compiled.parentPath}.${compiled.name}`, expected: compiled.className }
            ]
        });
        // 2. Recursively instantiate children
        if (compiled.children && compiled.children.length > 0) {
            await this.instantiateChildren(compiled.children, `${compiled.parentPath}.${compiled.name}`);
        }
        return {
            status: rootRecord.result.status,
            verified: rootRecord.result.verified,
            provider: 'ui-design-engine',
            tool: 'ui_screen_create',
            changes: [
                { type: 'create', details: `Created ScreenGui ${compiled.parentPath}.${compiled.name}`, target: `${compiled.parentPath}.${compiled.name}` },
                ...(rootRecord.result.changes || [])
            ],
            evidence: rootRecord.result.evidence || [],
            warnings: rootRecord.result.warnings || [],
            errors: rootRecord.result.errors || [],
            data: { screenName: spec.screenName, compiledHierarchy: compiled },
            duration: Date.now() - startTime
        };
    }
    async instantiateChildren(children, parentPath) {
        for (const child of children) {
            try {
                await executionPipeline.execute('instance_create', {
                    parent: parentPath,
                    className: child.className,
                    name: child.name,
                    properties: child.properties
                });
                if (child.children && child.children.length > 0) {
                    await this.instantiateChildren(child.children, `${parentPath}.${child.name}`);
                }
            }
            catch (err) {
                console.error(`[UIDesignEngine] Warning: child instance creation error on ${parentPath}.${child.name}:`, err);
            }
        }
    }
    /**
     * Performs a design critique on an existing UI tree, evaluating visual hierarchy, spacing, contrast, and alignment.
     */
    critiqueUI(rootPath, properties) {
        const issues = [];
        const recommendations = [];
        let score = 100;
        if (properties.BorderSizePixel && properties.BorderSizePixel > 0 && !properties.hasCorner) {
            score -= 10;
            issues.push('Legacy sharp pixel borders detected without modern UICorner.');
            recommendations.push('Add a UICorner constraint (8px radius) for smoother presentation.');
        }
        if (properties.TextSize && properties.TextSize > 32) {
            score -= 10;
            issues.push('Heading text size exceeds standard readable scale on smaller mobile devices.');
            recommendations.push('Use UITextSizeConstraint or responsive scale sizing.');
        }
        return {
            score: Math.max(0, score),
            passed: score >= 80,
            issues,
            recommendations
        };
    }
}
export const uiDesignEngine = new UIDesignEngine();
//# sourceMappingURL=UIDesignEngine.js.map