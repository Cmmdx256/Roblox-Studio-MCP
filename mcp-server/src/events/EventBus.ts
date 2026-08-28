import { v4 as uuidv4 } from 'uuid';
import { PlatformEventType, PlatformEvent, EventHandler } from './types.js';

export class EventBus {
    private handlers = new Map<PlatformEventType, Set<EventHandler>>();
    private eventHistory: PlatformEvent[] = [];
    private maxHistoryLength = 200;

    public on<T = any>(type: PlatformEventType, handler: EventHandler<T>): () => void {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, new Set());
        }
        this.handlers.get(type)!.add(handler);

        return () => {
            this.handlers.get(type)?.delete(handler);
        };
    }

    public emit<T = any>(type: PlatformEventType, payload: T, source = 'system', metadata?: Record<string, any>): PlatformEvent<T> {
        const event: PlatformEvent<T> = {
            id: uuidv4(),
            type,
            timestamp: Date.now(),
            source,
            payload,
            metadata
        };

        this.eventHistory.push(event);
        if (this.eventHistory.length > this.maxHistoryLength) {
            this.eventHistory.shift();
        }

        const registered = this.handlers.get(type);
        if (registered) {
            for (const handler of registered) {
                try {
                    handler(event);
                } catch (err) {
                    console.error(`[EventBus] Error executing handler for event '${type}':`, err);
                }
            }
        }

        return event;
    }

    public getRecentEvents(type?: PlatformEventType, limit = 50): PlatformEvent[] {
        if (type) {
            return this.eventHistory.filter(e => e.type === type).slice(-limit);
        }
        return this.eventHistory.slice(-limit);
    }

    public clearHistory(): void {
        this.eventHistory = [];
    }
}

export const eventBus = new EventBus();
