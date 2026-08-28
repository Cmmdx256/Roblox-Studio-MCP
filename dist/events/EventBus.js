import { v4 as uuidv4 } from 'uuid';
export class EventBus {
    handlers = new Map();
    eventHistory = [];
    maxHistoryLength = 200;
    on(type, handler) {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, new Set());
        }
        this.handlers.get(type).add(handler);
        return () => {
            this.handlers.get(type)?.delete(handler);
        };
    }
    emit(type, payload, source = 'system', metadata) {
        const event = {
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
                }
                catch (err) {
                    console.error(`[EventBus] Error executing handler for event '${type}':`, err);
                }
            }
        }
        return event;
    }
    getRecentEvents(type, limit = 50) {
        if (type) {
            return this.eventHistory.filter(e => e.type === type).slice(-limit);
        }
        return this.eventHistory.slice(-limit);
    }
    clearHistory() {
        this.eventHistory = [];
    }
}
export const eventBus = new EventBus();
//# sourceMappingURL=EventBus.js.map