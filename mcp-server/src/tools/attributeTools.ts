import { z } from 'zod';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';

export const attributeTools = [
  {
    name: 'attribute_get',
    description: 'Get the value of a specific attribute on an Instance.',
    inputSchema: z.object({
      target: z.string().describe('Full path or UUID of the Instance.'),
      attributeName: z.string().describe('Name of the attribute.'),
    }),
    handler: async (args: { target: string; attributeName: string }) => {
      return await commandDispatcher.executeCommand('attribute_get', args);
    },
  },
  {
    name: 'attribute_set',
    description: 'Set or update an attribute on an Instance (supports string, number, boolean, Vector3, Color3, etc.).',
    inputSchema: z.object({
      target: z.string().describe('Full path or UUID of the Instance.'),
      attributeName: z.string().describe('Name of the attribute.'),
      value: z.any().describe('Value to store in the attribute.'),
    }),
    handler: async (args: { target: string; attributeName: string; value: any }) => {
      return await commandDispatcher.executeCommand('attribute_set', args);
    },
  },
  {
    name: 'attribute_delete',
    description: 'Remove an attribute from an Instance.',
    inputSchema: z.object({
      target: z.string().describe('Full path or UUID of the Instance.'),
      attributeName: z.string().describe('Name of the attribute to delete.'),
    }),
    handler: async (args: { target: string; attributeName: string }) => {
      return await commandDispatcher.executeCommand('attribute_delete', args);
    },
  },
  {
    name: 'attribute_get_all',
    description: 'Get all attributes of an Instance as a key-value dictionary.',
    inputSchema: z.object({
      target: z.string().describe('Full path or UUID of the Instance.'),
    }),
    handler: async (args: { target: string }) => {
      return await commandDispatcher.executeCommand('attribute_get_all', args);
    },
  },
];
