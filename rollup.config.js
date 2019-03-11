import path from 'path';
import sourcemaps from 'rollup-plugin-sourcemaps';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import typescript from 'rollup-plugin-typescript';
import jscc from 'rollup-plugin-jscc';

async function main()
{
	const plugins = [
		sourcemaps(),
		typescript(),
		resolve({
			browser: true,
			preferBuiltins: false,
		}),
		commonjs({extensions: ['.js', '.ts']}),
	];

	const compiled = (new Date()).toUTCString().replace(/GMT/g, 'UTC');
	const sourcemap = true;
	const results = [];

	const pkg = require('./package.json');
	const banner = [
		`/*!`,
		` * ${pkg.name} - v${pkg.version}`,
		` * Compiled ${compiled}`,
		` *`,
		` * ${pkg.name} is licensed under the MIT License.`,
		` * http://www.opensource.org/licenses/mit-license`,
		` */`,
	].join('\n');

	// Check for bundle folder
	const basePath = __dirname;
	const input = path.join(basePath, 'src/index.ts');
	const freeze = false;

	results.push({
		input,
		output: [
			{
				banner,
				file: path.join(basePath, pkg.main),
				format: 'cjs',
				freeze,
				sourcemap,
			},
			{
				banner,
				file: path.join(basePath, pkg.module),
				format: 'es',
				freeze,
				sourcemap,
			},
		],
		external: ['pixi.js'],
		plugins: [jscc({values:{_IIFE:false}})].concat(plugins)
	});

	// The package.json file has a bundle field
	// we'll use this to generate the bundle file
	// this will package all dependencies
	if (pkg.bundle)
	{
		results.push({
			input,
			output: {
				banner,
				file: path.join(basePath, pkg.bundle),
				format: 'iife',
				freeze,
				name: 'PIXI.particles',
				sourcemap,
				extend: true,
				globals: {
					'pixi.js': 'PIXI'
				}
			},
			treeshake: false,
			external: ['pixi.js'],
			plugins: [jscc({values:{_IIFE:true}})].concat(plugins),
		});
	}

	return results;
}

export default main();