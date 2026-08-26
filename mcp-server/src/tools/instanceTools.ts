import { z } from 'zod';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';

export const instanceTools = [
  {
    name: 'instance_create',
    description: 'Create a new Instance of any valid Roblox ClassName under a specified parent with initial properties and attributes.',
    inputSchema: z.object({
      className: z.string().describe('The Roblox ClassName to create (e.g. "Part", "Model", "Folder", "RemoteEvent", "ModuleScript", "Highlight", "Sound", "Attachment").'),
      parent: z.string().describe('Full path or UUID of the parent Instance (e.g. "Workspace", "ReplicatedStorage.Remotes", "ServerScriptService").'),
      name: z.string().optional().describe('Optional name for the new Instance. Defaults to the ClassName.'),
      properties: z.record(z.any()).optional().describe('Dictionary of initial properties to assign (e.g. {"Size": [4, 1, 2], "Anchored": true, "Color": [1, 0, 0]}).'),
      attributes: z.record(z.any()).optional().describe('Dictionary of initial attributes to assign.'),
      tags: z.array(z.string()).optional().describe('List of CollectionService tags to add to the instance.'),
    }),
    handler: async (args: any) => {
      return await commandDispatcher.executeCommand('instance_create', args);
    },
  },
  {
    name: 'instance_delete',
    description: 'Safely destroy/delete an Instance from the Roblox DataModel by its path or session UUID.',
    inputSchema: z.object({
      target: z.string().describe('Full path or UUID of the target Instance to destroy (e.g. "Workspace.Map.OldHouse", "id://xyz123").'),
    }),
    handler: async (args: { target: string }) => {
      return await commandDispatcher.executeCommand('instance_delete', args);
    },
  },
  {
    name: 'instance_clone',
    description: 'Clone an existing Instance (and all its descendants) and place it under a target parent.',
    inputSchema: z.object({
      target: z.string().describe('Full path or UUID of the Instance to clone.'),
      parent: z.string().optional().describe('Target parent where the cloned instance will be placed. Defaults to same parent as target.'),
      newName: z.string().optional().describe('Optional new name for the cloned Instance.'),
      properties: z.record(z.any()).optional().describe('Optional property overrides to apply to the cloned instance.'),
    }),
    handler: async (args: any) => {
      return await commandDispatcher.executeCommand('instance_clone', args);
    },
  },
  {
    name: 'instance_reparent',
    description: 'Move an Instance to a new parent in the hierarchy.',
    inputSchema: z.object({
      target: z.string().describe('Full path or UUID of the Instance to move.'),
      newParent: z.string().describe('Full path or UUID of the new parent Instance.'),
    }),
    handler: async (args: { target: string; newParent: string }) => {
      return await commandDispatcher.executeCommand('instance_reparent', args);
    },
  },
  {
    name: 'instance_rename',
    description: 'Rename an Instance in the DataModel.',
    inputSchema: z.object({
      target: z.string().describe('Full path or UUID of the Instance to rename.'),
      newName: z.string().describe('The new name for the Instance.'),
    }),
    handler: async (args: { target: string; newName: string }) => {
      return await commandDispatcher.executeCommand('instance_rename', args);
    },
  },
  {
    name: 'instance_move',
    description: 'Move a 3D Instance (Part or Model) to a new Position, CFrame, or relative Vector offset.',
    inputSchema: z.object({
      target: z.string().describe('Full path or UUID of the 3D Part or Model to move.'),
      position: z.array(z.number()).length(3).optional().describe('[X, Y, Z] world position to move to.'),
      cframe: z.array(z.number()).optional().describe('[X, Y, Z, R00, R01, ...] CFrame components or [X, Y, Z] position.'),
      pivot: z.boolean().default(true).describe('If target is a Model, whether to move via PivotTo (recommended). Default true.'),
    }),
    handler: async (args: any) => {
      return await commandDispatcher.executeCommand('instance_move', args);
    },
  },
];
