module.exports = function(grunt)
{
	grunt.registerTask(
		'docs-live',
		'Generate documentation and push to gh-pages branch', [
			'clean:docs',
			'file-creator:redirect',
			'yuidoc',
			'gh-pages',
			'clean:redirect'
		]
	);
};