import { CompiledCapability } from './types.js';

export interface WorkflowTemplate {
    id: string;
    name: string;
    category: 'world_building' | 'scripting' | 'animation' | 'assets' | 'ui' | 'testing' | 'debugging' | 'optimization' | 'publishing';
    description: string;
    parametersSchema: Record<string, any>;
    compiledWorkflow: CompiledCapability;
    verified: boolean;
    usageCount: number;
}

export class WorkflowLibrary {
    private templates = new Map<string, WorkflowTemplate>();

    constructor() {
        this.initializeDefaultTemplates();
    }

    public registerTemplate(template: WorkflowTemplate): void {
        this.templates.set(template.id, template);
        console.error(`[WorkflowLibrary] Registered workflow template: ${template.name} (${template.category})`);
    }

    public getTemplate(id: string): WorkflowTemplate | undefined {
        return this.templates.get(id);
    }

    public listTemplates(category?: string): WorkflowTemplate[] {
        const all = Array.from(this.templates.values());
        if (category) {
            return all.filter(t => t.category === category);
        }
        return all;
    }

    public findBestMatch(intent: string): WorkflowTemplate | undefined {
        const lower = intent.toLowerCase();
        for (const t of this.templates.values()) {
            if (lower.includes(t.name.toLowerCase()) || lower.includes(t.category)) {
                return t;
            }
        }
        return undefined;
    }

    private initializeDefaultTemplates(): void {
        this.registerTemplate({
            id: 'workflow:day_night_cycle',
            name: 'Day Night Cycle Setup',
            category: 'scripting',
            description: 'Sets up a continuous 24-hour day/night cycle with smooth Lighting interpolation',
            parametersSchema: { minutesPerCycle: { type: 'number', default: 12 } },
            compiledWorkflow: {
                id: 'compiled:day_night',
                name: 'Day Night Cycle',
                intent: 'setup day night cycle',
                description: 'Day night cycle lighting script',
                steps: [],
                confidence: 1.0,
                verified: true,
                reusable: true,
                createdAt: Date.now()
            },
            verified: true,
            usageCount: 0
        });

        this.registerTemplate({
            id: 'workflow:leaderstats_setup',
            name: 'Player Leaderstats Setup',
            category: 'scripting',
            description: 'Creates leaderstats folder with Gold/Coins and Level values for joining players',
            parametersSchema: { initialGold: { type: 'number', default: 0 } },
            compiledWorkflow: {
                id: 'compiled:leaderstats',
                name: 'Leaderstats Setup',
                intent: 'setup leaderstats',
                description: 'Leaderstats script in ServerScriptService',
                steps: [],
                confidence: 1.0,
                verified: true,
                reusable: true,
                createdAt: Date.now()
            },
            verified: true,
            usageCount: 0
        });

        this.registerTemplate({
            id: 'workflow:terrain_island_generator',
            name: 'Procedural Island Generator',
            category: 'world_building',
            description: 'Generates a natural island with central hill, sand shore, and surrounding water',
            parametersSchema: { radius: { type: 'number', default: 150 } },
            compiledWorkflow: {
                id: 'compiled:island_gen',
                name: 'Island Generator',
                intent: 'generate island',
                description: 'Voxel terrain island generation',
                steps: [],
                confidence: 1.0,
                verified: true,
                reusable: true,
                createdAt: Date.now()
            },
            verified: true,
            usageCount: 0
        });
    }
}

export const workflowLibrary = new WorkflowLibrary();
