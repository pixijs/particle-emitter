module.exports = function(grunt)
{
	grunt.registerTask(
		'examples',
		'Install the example depencencies',
		['bower-install-simple']
	);
};