module.exports = function(grunt)
{
	require('library-grunt')(grunt, {
		themePath: 'node_modules/yuidoc-bootstrap-theme',
		bowerPath: 'examples/libs'
	});
};