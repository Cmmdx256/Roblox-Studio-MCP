import { PlatformEventType, PlatformEvent, EventHandler } from './types.js';
export declare class EventBus {
    private handlers;
    private eventHistory;
    private maxHistoryLength;
    on<T = any>(type: PlatformEventType, handler: EventHandler<T>): () => void;
    emit<T = any>(type: PlatformEventType, payload: T, source?: string, metadata?: Record<string, any>): PlatformEvent<T>;
    getRecentEvents(type?: PlatformEventType, limit?: number): PlatformEvent[];
    clearHistory(): void;
}
export declare const eventBus: EventBus;
//# sourceMappingURL=EventBus.d.ts.map