const fs = require('fs');
const path = require('path');

const moduleTypes = fs.readFileSync(path.resolve('./index.d.ts'), 'utf8');

const importStatement = /import {([^}]*)} from 'pixi.js';/.exec(moduleTypes);

let ambientTypes = moduleTypes.replace(importStatement[0], 'declare namespace PIXI.particles {') + '\n}';

const importedTypes = importStatement[1].trim().split(', ');
for (let i = 0; i < importedTypes.length; ++i) {
	const classImport = importedTypes[i];
	ambientTypes = ambientTypes.replace(new RegExp(`\\b${classImport}\\b`, 'g'), 'PIXI.' + classImport);
}
ambientTypes = ambientTypes.replace(/export declare/g, 'export');

fs.writeFileSync(path.resolve('./ambient.d.ts'), ambientTypes);