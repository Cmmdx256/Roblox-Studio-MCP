import { z } from 'zod';
import { commandDispatcher } from '../dispatcher/commandDispatcher.js';
export const terrainTools = [
    {
        name: 'terrain_fill_block',
        description: 'Fill a block-shaped region in Roblox voxel Terrain with a specified material (e.g. Grass, Water, Rock, Sand, Brick).',
        inputSchema: z.object({
            cframe: z.array(z.number()).describe('CFrame [X, Y, Z] or [X, Y, Z, R00, ...] of the block center.'),
            size: z.array(z.number()).length(3).describe('Size [X, Y, Z] in studs.'),
            material: z.string().describe('Material name (e.g. "Grass", "Sand", "Water", "Rock", "Concrete", "Ground", "Snow", "Mud").'),
        }),
        handler: async (args) => {
            return await commandDispatcher.executeCommand('terrain_fill_block', args);
        },
    },
    {
        name: 'terrain_fill_ball',
        description: 'Fill a spherical region in Roblox voxel Terrain with a specified material.',
        inputSchema: z.object({
            center: z.array(z.number()).length(3).describe('Center [X, Y, Z] position.'),
            radius: z.number().positive().describe('Radius in studs.'),
            material: z.string().describe('Material name (e.g. "Grass", "Sand", "Water", "Rock", "Mud").'),
        }),
        handler: async (args) => {
            return await commandDispatcher.executeCommand('terrain_fill_ball', args);
        },
    },
    {
        name: 'terrain_clear',
        description: 'Clear all terrain or clear a specific region of terrain.',
        inputSchema: z.object({
            region: z.object({
                min: z.array(z.number()).length(3),
                max: z.array(z.number()).length(3),
            }).optional().describe('Optional bounding box region [min, max] to clear. If omitted, clears entire terrain.'),
        }),
        handler: async (args) => {
            return await commandDispatcher.executeCommand('terrain_clear', args);
        },
    },
];
//# sourceMappingURL=terrainTools.js.map