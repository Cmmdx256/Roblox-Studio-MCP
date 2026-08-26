import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'roblox-plugin', 'src');
const outDir = path.join(rootDir, 'plugin-build');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

let refId = 0;
function getNextRef() {
  refId++;
  return `RBX_${refId}`;
}

function escapeXmlCData(str) {
  return str.replace(/]]>/g, ']]]]><![CDATA[>');
}

function buildXmlForDir(dirPath, isRoot = false) {
  let xml = '';
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      const ref = getNextRef();
      xml += `\t\t<Item class="Folder" referent="${ref}">\n`;
      xml += `\t\t\t<Properties>\n`;
      xml += `\t\t\t\t<string name="Name">${entry.name}</string>\n`;
      xml += `\t\t\t</Properties>\n`;
      xml += buildXmlForDir(fullPath, false);
      xml += `\t\t</Item>\n`;
    } else if (entry.name.endsWith('.luau') || entry.name.endsWith('.lua')) {
      // Skip the main root server script because it's rendered as the root Item
      if (isRoot && entry.name === 'PluginMain.server.luau') {
        continue;
      }

      let scriptName = entry.name
        .replace(/\.server\.(luau|lua)$/, '')
        .replace(/\.client\.(luau|lua)$/, '')
        .replace(/\.(luau|lua)$/, '');

      const isServerScript = entry.name.includes('.server.');
      const className = isServerScript ? 'Script' : 'ModuleScript';
      const content = fs.readFileSync(fullPath, 'utf8');
      const itemRef = getNextRef();

      xml += `\t\t<Item class="${className}" referent="${itemRef}">\n`;
      xml += `\t\t\t<Properties>\n`;
      xml += `\t\t\t\t<string name="Name">${scriptName}</string>\n`;
      if (isServerScript) {
        xml += `\t\t\t\t<token name="RunContext">0</token>\n`;
      }
      xml += `\t\t\t\t<ProtectedString name="Source"><![CDATA[${escapeXmlCData(content)}]]></ProtectedString>\n`;
      xml += `\t\t\t</Properties>\n`;
      xml += `\t\t</Item>\n`;
    }
  }

  return xml;
}

console.log('[RBXMX Builder] Building native Roblox Studio Plugin Script (.rbxmx)...');

const mainScriptPath = path.join(srcDir, 'PluginMain.server.luau');
const mainContent = fs.existsSync(mainScriptPath)
  ? fs.readFileSync(mainScriptPath, 'utf8')
  : '-- Main Entry Point\n';

let rbxmx = `<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">\n`;
rbxmx += `\t<Meta name="ExplicitAutoJoints">true</Meta>\n`;
rbxmx += `\t<External>null</External>\n`;
rbxmx += `\t<External>nil</External>\n`;

// Top-level item is the Plugin Script
const rootRef = getNextRef();
rbxmx += `\t<Item class="Script" referent="${rootRef}">\n`;
rbxmx += `\t\t<Properties>\n`;
rbxmx += `\t\t\t<string name="Name">UniversalMCP</string>\n`;
rbxmx += `\t\t\t<token name="RunContext">0</token>\n`;
rbxmx += `\t\t\t<ProtectedString name="Source"><![CDATA[${escapeXmlCData(mainContent)}]]></ProtectedString>\n`;
rbxmx += `\t\t</Properties>\n`;

// Append all child modules and folders inside this Script
rbxmx += buildXmlForDir(srcDir, true);

rbxmx += `\t</Item>\n`;
rbxmx += `</roblox>`;

const targetRbxmx = path.join(outDir, 'RobloxUniversalMCP.rbxmx');
fs.writeFileSync(targetRbxmx, rbxmx, 'utf8');

console.log(`[RBXMX Builder] Successfully generated real Plugin at: ${targetRbxmx}`);
