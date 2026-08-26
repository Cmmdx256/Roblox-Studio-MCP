import { z } from 'zod';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';

export const propertyTools = [
  {
    name: 'property_get',
    description: 'Read the value of a specific property on an Instance. Returns normalized representation with data type info.',
    inputSchema: z.object({
      target: z.string().describe('Full path or UUID of the Instance.'),
      property: z.string().describe('Name of the property (e.g. "Size", "Position", "Anchored", "Transparency", "Color", "Material").'),
    }),
    handler: async (args: { target: string; property: string }) => {
      return await commandDispatcher.executeCommand('property_get', args);
    },
  },
  {
    name: 'property_set',
    description: 'Set the value of a property on an Instance. Supports automatic type coercion for Vector3, CFrame, Color3, BrickColor, UDim2, NumberRange, Enums, etc.',
    inputSchema: z.object({
      target: z.string().describe('Full path or UUID of the Instance.'),
      property: z.string().describe('Name of the property to set (e.g. "Size", "Anchored", "Color", "Material", "CanCollide").'),
      value: z.any().describe('The new property value. For Vector3: [X,Y,Z]. For Color3: [R,G,B] (0-1) or "#RRGGBB". For Enum: "Enum.Material.Neon" or "Neon". For boolean/number/string: direct value.'),
    }),
    handler: async (args: { target: string; property: string; value: any }) => {
      return await commandDispatcher.executeCommand('property_set', args);
    },
  },
  {
    name: 'property_get_all',
    description: 'Read all common and accessible properties of an Instance.',
    inputSchema: z.object({
      target: z.string().describe('Full path or UUID of the Instance.'),
    }),
    handler: async (args: { target: string }) => {
      return await commandDispatcher.executeCommand('property_get_all', args);
    },
  },
];
