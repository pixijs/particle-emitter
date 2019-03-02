//bump the version without making a tag, so that we can make a build of that version, then make a tag
var semver = require('semver');
var fs = require('fs');
var path = require('path');
var pkg = require(path.resolve('./package.json'));
var prevVersion = pkg.version;
pkg.version = semver.inc(pkg.version, process.argv[2]);
//if version was incremented correctly, then rewrite the file (and others)
if (pkg.version)
{
	fs.writeFileSync(path.resolve('./package.json'), JSON.stringify(pkg, null, '  '));
	//ambient.d.ts
	var file = fs.readFileSync(path.resolve('./ambient.d.ts'), 'utf8');
	file = file.replace(prevVersion, pkg.version);
	fs.writeFileSync(path.resolve('./ambient.d.ts'), file);
	//index.d.ts
	file = fs.readFileSync(path.resolve('./index.d.ts'), 'utf8');
	file = file.replace(prevVersion, pkg.version);
	fs.writeFileSync(path.resolve('./index.d.ts'), file);
}