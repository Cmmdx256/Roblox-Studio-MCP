export interface MechanicCard {
    id: string;
    name: string;
    category: 'Gameplay' | 'Interactions' | 'Economy' | 'Movement' | 'Environment';
    description: string;
    prerequisites: string[];
    requiredServices: string[];
    customizationParams: Record<string, {
        type: string;
        default: any;
        description: string;
    }>;
    structure: {
        instances: Array<{
            className: string;
            parent: string;
            name: string;
            properties?: Record<string, any>;
        }>;
        scripts: Array<{
            name: string;
            parent: string;
            type: 'Script' | 'LocalScript' | 'ModuleScript';
            sourceTemplate: string;
        }>;
        remotes: Array<{
            name: string;
            parent: string;
            type: 'RemoteEvent' | 'RemoteFunction';
        }>;
    };
}
export declare const BUILTIN_MECHANIC_CARDS: MechanicCard[];
export declare class MechanicCardRegistry {
    private cards;
    constructor();
    getCard(id: string): MechanicCard | undefined;
    listCards(category?: string): MechanicCard[];
    /**
     * Instantiates a mechanic card into executable instance creation and script payloads.
     */
    instantiateCard(cardId: string, customParams?: Record<string, any>): {
        instances: any[];
        scripts: any[];
        remotes: any[];
    };
}
export declare const mechanicCardRegistry: MechanicCardRegistry;
//# sourceMappingURL=MechanicCardRegistry.d.ts.map