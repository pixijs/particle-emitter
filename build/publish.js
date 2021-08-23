const path = require('path');
const fs = require('fs');
const pkg = require(path.resolve('./package.json'));
const exec = require('child_process').exec;

// remove private flag that yarn requires for workspace root
pkg.private = false;
fs.writeFileSync(path.resolve('./package.json'), JSON.stringify(pkg, null, 2) + '\n');
exec('npm publish --access public', {
	env: process.env,
	cwd: process.cwd()
}, function(err, stdOut, stdErr) {
	// restore private flag
	pkg.private = true;
	try {
		fs.writeFileSync(path.resolve('./package.json'), JSON.stringify(pkg, null, 2) + '\n');
	}
	catch (err) {
		console.error(err);
		process.exit(1);
		return;
	}
	if (err)
	{
		console.error(stdErr);
		process.exit(err.code);
		return;
	}
	console.log(stdOut);
	process.exit(0);
});