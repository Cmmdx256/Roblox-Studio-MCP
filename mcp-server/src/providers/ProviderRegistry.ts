import { IProvider } from './IProvider.js';
import { AvailabilityStatus, HealthStatus, ProviderCapability, ProviderState, ProviderType } from './types.js';
import { capabilityRouter } from '../capabilities/CapabilityRouter.js';

export class ProviderRegistry {
  private providers = new Map<string, IProvider>();
  private providerStates = new Map<string, ProviderState>();

  public register(provider: IProvider): void {
    this.providers.set(provider.name, provider);
    this.providerStates.set(provider.name, ProviderState.STARTING);
    capabilityRouter.registerProvider(provider);
    console.error(`[ProviderRegistry] Registered provider: ${provider.name} (${provider.type})`);
  }

  public unregister(name: string): boolean {
    const provider = this.providers.get(name);
    if (provider) {
      this.providers.delete(name);
      this.providerStates.delete(name);
      console.error(`[ProviderRegistry] Unregistered provider: ${name}`);
      return true;
    }
    return false;
  }

  public get(name: string): IProvider | undefined {
    return this.providers.get(name);
  }

  public getAll(): IProvider[] {
    return Array.from(this.providers.values());
  }

  public getByType(type: ProviderType): IProvider[] {
    return this.getAll().filter((p) => p.type === type);
  }

  public async initializeAll(): Promise<void> {
    console.error(`[ProviderRegistry] Initializing ${this.providers.size} providers...`);
    for (const [name, provider] of this.providers.entries()) {
      try {
        this.providerStates.set(name, ProviderState.STARTING);
        await provider.initialize();
        this.providerStates.set(name, ProviderState.READY);
        console.error(`[ProviderRegistry] Provider '${name}' initialized successfully.`);
      } catch (err: any) {
        this.providerStates.set(name, ProviderState.DEGRADED);
        console.error(`[ProviderRegistry] Provider '${name}' failed to initialize (running degraded):`, err?.message || err);
      }
    }
  }

  public async healthCheckAll(): Promise<Map<string, HealthStatus>> {
    const statuses = new Map<string, HealthStatus>();
    for (const [name, provider] of this.providers.entries()) {
      try {
        const status = await provider.healthCheck();
        statuses.set(name, status);
        if (status.state) {
          this.providerStates.set(name, status.state);
        }
      } catch (err: any) {
        const degradedStatus: HealthStatus = {
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

  public async getAllCapabilities(): Promise<ProviderCapability[]> {
    const allCaps: ProviderCapability[] = [];
    for (const provider of this.providers.values()) {
      try {
        const caps = await provider.discover();
        allCaps.push(...caps);
      } catch (err: any) {
        console.error(`[ProviderRegistry] Error discovering capabilities for provider '${provider.name}':`, err?.message || err);
      }
    }
    return allCaps;
  }

  public async shutdownAll(): Promise<void> {
    console.error(`[ProviderRegistry] Shutting down all providers...`);
    for (const [name, provider] of this.providers.entries()) {
      try {
        this.providerStates.set(name, ProviderState.STOPPING);
        await provider.shutdown();
        this.providerStates.set(name, ProviderState.FAILED);
      } catch (err: any) {
        console.error(`[ProviderRegistry] Error shutting down provider '${name}':`, err?.message || err);
      }
    }
    this.providers.clear();
    this.providerStates.clear();
  }
}

export const providerRegistry = new ProviderRegistry();
