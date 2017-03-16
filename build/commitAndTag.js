var path = require('path');
var pkg = require(path.resolve('./package.json'));
var exec = require('child_process').exec;

exec('git commit -a -m "' + pkg.version + '"', {
	env: process.env,
	cwd: process.cwd()
}, function(err, stdOut, stdErr) {
	if (err)
	{
		console.error(stdErr);
		process.exit(err.code);
		return;
	}
	console.log(stdOut);
	exec('git tag ' + pkg.version, {
		env: process.env,
		cwd: process.cwd()
	}, function(err, stdOut, stdErr) {
		if (err)
		{
			console.error(stdErr);
			process.exit(err.code);
			return;
		}
		console.log(stdOut);
		process.exit(0);
	});
});