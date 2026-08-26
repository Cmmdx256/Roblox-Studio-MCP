import { studioTools } from './studioTools.js';
import { instanceTools } from './instanceTools.js';
import { propertyTools } from './propertyTools.js';
import { attributeTools } from './attributeTools.js';
import { scriptTools } from './scriptTools.js';
import { selectionTools } from './selectionTools.js';
import { playtestTools } from './playtestTools.js';
import { outputTools } from './outputTools.js';
import { contextTools } from './contextTools.js';
import { terrainTools } from './terrainTools.js';
import { batchTools } from './batchTools.js';
import { workflowTools } from './workflowTools.js';
import { officialTools } from './officialTools.js';
import { componentTools } from './componentTools.js';

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: any;
  handler: (args: any) => Promise<any>;
}

export const allTools: MCPToolDefinition[] = [
  ...studioTools,
  ...instanceTools,
  ...propertyTools,
  ...attributeTools,
  ...scriptTools,
  ...selectionTools,
  ...playtestTools,
  ...outputTools,
  ...contextTools,
  ...terrainTools,
  ...batchTools,
  ...workflowTools,
  ...officialTools,
  ...componentTools,
];

export const toolMap = new Map<string, MCPToolDefinition>();
for (const tool of allTools) {
  toolMap.set(tool.name, tool);
}
