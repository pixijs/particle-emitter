const fs = require('fs');
const path = require('path');

const moduleTypes = fs.readFileSync(path.resolve('./index.d.ts'), 'utf8');

const pixiImports = moduleTypes.match(/(?<=^import {).*(?=} from '@pixi\/.*';$)/gm);
const pixiImportTypes = pixiImports.join(',').split(',').map(token => token.trim());

let ambientTypes = moduleTypes.replace(/^import .*$/m, 'declare namespace PIXI.particles {') + '\n}';
ambientTypes = ambientTypes.replace(/^import .*\n/gm, '');

for (const classImport of pixiImportTypes) {
	ambientTypes = ambientTypes.replace(new RegExp(`\\b${classImport}\\b`, 'g'), 'PIXI.' + classImport);
}

ambientTypes = ambientTypes.replace(/export declare/g, 'export');

fs.writeFileSync(path.resolve('./ambient.d.ts'), ambientTypes);
