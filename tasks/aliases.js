module.exports = function(grunt)
{
	grunt.registerTask(
		'examples',
		'Install the example dependencies',
		['bower-install-simple']
	);
};