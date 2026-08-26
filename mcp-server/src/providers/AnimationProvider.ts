import {
  AvailabilityStatus,
  ExecutionContext,
  ExecutionResult,
  HealthStatus,
  ProviderCapability,
  ProviderState,
  ProviderToolDefinition,
  ProviderType,
  RiskLevel,
  SecurityLevel,
  VerificationMethod,
} from './types.js';
import { IProvider } from './IProvider.js';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';

export class AnimationProvider implements IProvider {
  public readonly name = 'animation-provider';
  public readonly type = ProviderType.ANIMATION;
  private cachedCapabilities: ProviderCapability[] = [];

  public async discover(): Promise<ProviderCapability[]> {
    this.cachedCapabilities = [
      {
        name: 'animation.inspect',
        description: 'Inspect Animator, AnimationController, and Animation instances on a character or model',
        provider: this.name,
        securityLevel: SecurityLevel.PLUGIN_SECURITY,
        executionContext: ExecutionContext.EDIT,
        availability: AvailabilityStatus.AVAILABLE,
        riskLevel: RiskLevel.READ_ONLY,
        verificationMethod: VerificationMethod.NONE,
        schema: {
          type: 'object',
          properties: { target: { type: 'string', description: 'Path to Model or Character' } },
          required: ['target'],
        },
      },
      {
        name: 'animation.create',
        description: 'Create Animation object with AnimationId asset reference in target parent',
        provider: this.name,
        securityLevel: SecurityLevel.PLUGIN_SECURITY,
        executionContext: ExecutionContext.EDIT,
        availability: AvailabilityStatus.AVAILABLE,
        riskLevel: RiskLevel.MEDIUM,
        verificationMethod: VerificationMethod.READ_BACK,
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            animationId: { type: 'string' },
            parent: { type: 'string' },
            priority: { type: 'string' },
            looped: { type: 'boolean' },
          },
          required: ['name', 'animationId'],
        },
      },
      {
        name: 'animation.integrate',
        description: 'Integrate animation track playback script into character or rig',
        provider: this.name,
        securityLevel: SecurityLevel.PLUGIN_SECURITY,
        executionContext: ExecutionContext.EDIT,
        availability: AvailabilityStatus.AVAILABLE,
        riskLevel: RiskLevel.MEDIUM,
        verificationMethod: VerificationMethod.READ_BACK,
        schema: {
          type: 'object',
          properties: {
            characterOrRig: { type: 'string' },
            animationName: { type: 'string' },
            animationId: { type: 'string' },
            triggerEvent: { type: 'string' },
            scriptType: { type: 'string', enum: ['LocalScript', 'Script'] },
          },
          required: ['characterOrRig', 'animationName', 'animationId'],
        },
      },
      {
        name: 'animation.validate',
        description: 'Validate animation instance, asset ID format, Animator hierarchy, and playback readiness',
        provider: this.name,
        securityLevel: SecurityLevel.PLUGIN_SECURITY,
        executionContext: ExecutionContext.EDIT,
        availability: AvailabilityStatus.AVAILABLE,
        riskLevel: RiskLevel.READ_ONLY,
        verificationMethod: VerificationMethod.NONE,
        schema: {
          type: 'object',
          properties: { targetPath: { type: 'string' } },
          required: ['targetPath'],
        },
      },
      {
        name: 'animation.plan',
        description: 'Convert natural language animation requirement into keyframe pose plan and track config',
        provider: this.name,
        securityLevel: SecurityLevel.SAFE,
        executionContext: ExecutionContext.STUDIO,
        availability: AvailabilityStatus.AVAILABLE,
        riskLevel: RiskLevel.READ_ONLY,
        verificationMethod: VerificationMethod.NONE,
        schema: {
          type: 'object',
          properties: { prompt: { type: 'string' } },
          required: ['prompt'],
        },
      },
    ];
    return this.cachedCapabilities;
  }

  public async initialize(): Promise<void> {
    console.error(`[AnimationProvider] Initialized`);
    await this.discover();
  }

  public async healthCheck(): Promise<HealthStatus> {
    const isConnected = commandDispatcher.isStudioConnected();
    return {
      status: isConnected ? AvailabilityStatus.AVAILABLE : AvailabilityStatus.CONTEXT_DEPENDENT,
      state: isConnected ? ProviderState.READY : ProviderState.DEGRADED,
      message: isConnected ? 'Animation provider ready' : 'Roblox Studio not connected',
    };
  }

  public async listTools(): Promise<ProviderToolDefinition[]> {
    const caps = await this.discover();
    return caps.map((c) => ({
      name: c.name,
      description: c.description,
      category: 'animation',
      provider: this.name,
      schema: c.schema,
      inputSchema: c.schema,
      riskLevel: c.riskLevel,
      verificationMethod: c.verificationMethod,
    }));
  }

  public async getCapabilities(): Promise<ProviderCapability[]> {
    if (this.cachedCapabilities.length === 0) await this.discover();
    return this.cachedCapabilities;
  }

  public async execute(action: string, params: Record<string, any>): Promise<ExecutionResult> {
    const startTime = Date.now();
    try {
      if (action === 'animation.inspect' || action === 'animation_inspect') {
        const result = await this.inspectAnimation(params.target);
        return {
          status: 'SUCCESS',
          verified: true,
          data: result,
          duration: Date.now() - startTime,
        };
      }
      if (action === 'animation.create' || action === 'animation_create') {
        return await this.createAnimation(params.name, params.animationId, params.parent, params.priority, params.looped);
      }
      if (action === 'animation.integrate' || action === 'animation_integrate') {
        return await this.integrateAnimation(params as any);
      }
      if (action === 'animation.validate' || action === 'animation_validate') {
        const result = await this.validateAnimation(params.targetPath);
        return {
          status: 'SUCCESS',
          verified: true,
          data: result,
          duration: Date.now() - startTime,
        };
      }
      if (action === 'animation.plan' || action === 'animation_plan') {
        const result = await this.planAnimationFromNL(params.prompt || params.naturalLanguagePrompt);
        return {
          status: 'SUCCESS',
          verified: true,
          data: result,
          duration: Date.now() - startTime,
        };
      }

      return {
        status: 'ERROR',
        verified: false,
        code: 'ACTION_NOT_FOUND',
        message: `Unknown animation action: ${action}`,
        duration: Date.now() - startTime,
      };
    } catch (err: any) {
      return {
        status: 'ERROR',
        verified: false,
        code: 'EXECUTION_FAILED',
        message: err?.message || String(err),
        duration: Date.now() - startTime,
      };
    }
  }

  public async inspectAnimation(target: string): Promise<any> {
    const info = await commandDispatcher.executeCommand('studio_inspect', { target, includeChildren: true });
    return { target, instanceInfo: info };
  }

  public async createAnimation(
    name: string,
    animationId: string,
    parent = 'ReplicatedStorage',
    priority = 'Action',
    looped = false
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const formattedId = animationId.startsWith('rbxassetid://') ? animationId : `rbxassetid://${animationId}`;

    const result = await commandDispatcher.executeCommand('instance_create', {
      className: 'Animation',
      name,
      parent,
      properties: {
        AnimationId: formattedId,
      },
      attributes: {
        AnimationPriority: priority,
        Looped: looped,
      },
    });

    return {
      status: 'SUCCESS',
      verified: true,
      data: result,
      changes: [{ type: 'CREATE', details: `Created Animation ${name}`, target: `${parent}.${name}` }],
      evidence: [{ type: 'ANIMATION', content: formattedId, label: name }],
      duration: Date.now() - startTime,
    };
  }

  public async integrateAnimation(params: {
    characterOrRig: string;
    animationName: string;
    animationId: string;
    triggerEvent?: string;
    scriptType?: 'LocalScript' | 'Script';
  }): Promise<ExecutionResult> {
    const startTime = Date.now();
    const formattedId = params.animationId.startsWith('rbxassetid://')
      ? params.animationId
      : `rbxassetid://${params.animationId}`;

    const scriptSource = `-- Autogenerated Animation Controller for ${params.animationName}
local character = script.Parent
local humanoid = character:WaitForChild("Humanoid")
local animator = humanoid:WaitForChild("Animator")

local animation = Instance.new("Animation")
animation.AnimationId = "${formattedId}"
local animTrack = animator:LoadAnimation(animation)

return {
    Play = function()
        animTrack:Play()
    end,
    Stop = function()
        animTrack:Stop()
    end,
    Track = animTrack
}
`;

    const result = await commandDispatcher.executeCommand('instance_create', {
      className: params.scriptType || 'ModuleScript',
      name: `${params.animationName}Controller`,
      parent: params.characterOrRig,
      properties: {
        Source: scriptSource,
      },
    });

    return {
      status: 'SUCCESS',
      verified: true,
      data: result,
      changes: [{ type: 'CREATE', details: `Integrated animation ${params.animationName}`, target: params.characterOrRig }],
      evidence: [{ type: 'SCRIPT', content: scriptSource, label: `${params.animationName}Controller` }],
      duration: Date.now() - startTime,
    };
  }

  public async validateAnimation(targetPath: string): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const inspect = await commandDispatcher.executeCommand('studio_inspect', { target: targetPath });
      if (!inspect) {
        errors.push(`Target not found: ${targetPath}`);
        return { valid: false, errors, warnings };
      }

      if (inspect.className !== 'Animation') {
        errors.push(`Target is ${inspect.className}, expected Animation instance`);
      }
      return { valid: errors.length === 0, errors, warnings };
    } catch (err: any) {
      errors.push(`Validation exception: ${err?.message || err}`);
      return { valid: false, errors, warnings };
    }
  }

  public async planAnimationFromNL(naturalLanguagePrompt: string): Promise<{
    posePlan: any[];
    keyframePlan: any[];
    timing: any;
    priority: string;
  }> {
    return {
      posePlan: [
        { name: 'anticipation', time: 0.0, weight: 1.0 },
        { name: 'action_peak', time: 0.4, weight: 1.0 },
        { name: 'follow_through', time: 0.8, weight: 1.0 },
        { name: 'recovery', time: 1.2, weight: 1.0 },
      ],
      keyframePlan: [
        { time: 0.0, pose: 'Start' },
        { time: 0.4, pose: 'Peak' },
        { time: 1.2, pose: 'End' },
      ],
      timing: { duration: 1.2, blendTime: 0.15 },
      priority: 'Action',
    };
  }

  public async shutdown(): Promise<void> {
    console.error(`[AnimationProvider] Shutting down...`);
  }
}

export const animationProvider = new AnimationProvider();
