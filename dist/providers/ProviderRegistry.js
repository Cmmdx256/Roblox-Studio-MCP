import { AvailabilityStatus, ProviderState } from './types.js';
import { capabilityRouter } from '../capabilities/CapabilityRouter.js';
export class ProviderRegistry {
    providers = new Map();
    providerStates = new Map();
    register(provider) {
        this.providers.set(provider.name, provider);
        this.providerStates.set(provider.name, ProviderState.STARTING);
        capabilityRouter.registerProvider(provider);
        console.error(`[ProviderRegistry] Registered provider: ${provider.name} (${provider.type})`);
    }
    unregister(name) {
        const provider = this.providers.get(name);
        if (provider) {
            this.providers.delete(name);
            this.providerStates.delete(name);
            console.error(`[ProviderRegistry] Unregistered provider: ${name}`);
            return true;
        }
        return false;
    }
    get(name) {
        return this.providers.get(name);
    }
    getAll() {
        return Array.from(this.providers.values());
    }
    getByType(type) {
        return this.getAll().filter((p) => p.type === type);
    }
    async initializeAll() {
        console.error(`[ProviderRegistry] Initializing ${this.providers.size} providers...`);
        for (const [name, provider] of this.providers.entries()) {
            try {
                this.providerStates.set(name, ProviderState.STARTING);
                await provider.initialize();
                this.providerStates.set(name, ProviderState.READY);
                console.error(`[ProviderRegistry] Provider '${name}' initialized successfully.`);
            }
            catch (err) {
                this.providerStates.set(name, ProviderState.DEGRADED);
                console.error(`[ProviderRegistry] Provider '${name}' failed to initialize (running degraded):`, err?.message || err);
            }
        }
    }
    async healthCheckAll() {
        const statuses = new Map();
        for (const [name, provider] of this.providers.entries()) {
            try {
                const status = await provider.healthCheck();
                statuses.set(name, status);
                if (status.state) {
                    this.providerStates.set(name, status.state);
                }
            }
            catch (err) {
                const degradedStatus = {
                    status: AvailabilityStatus.UNAVAILABLE,
                    state: ProviderState.UNHEALTHY,
                    message: `Health check threw error: ${err?.message || String(err)}`,
                };
                statuses.set(name, degradedStatus);
                this.providerStates.set(name, ProviderState.UNHEALTHY);
            }
        }
        return statuses;
    }
    async getAllCapabilities() {
        const allCaps = [];
        for (const provider of this.providers.values()) {
            try {
                const caps = await provider.discover();
                allCaps.push(...caps);
            }
            catch (err) {
                console.error(`[ProviderRegistry] Error discovering capabilities for provider '${provider.name}':`, err?.message || err);
            }
        }
        return allCaps;
    }
    async shutdownAll() {
        console.error(`[ProviderRegistry] Shutting down all providers...`);
        for (const [name, provider] of this.providers.entries()) {
            try {
                this.providerStates.set(name, ProviderState.STOPPING);
                await provider.shutdown();
                this.providerStates.set(name, ProviderState.FAILED);
            }
            catch (err) {
                console.error(`[ProviderRegistry] Error shutting down provider '${name}':`, err?.message || err);
            }
        }
        this.providers.clear();
        this.providerStates.clear();
    }
}
export const providerRegistry = new ProviderRegistry();
//# sourceMappingURL=ProviderRegistry.js.map