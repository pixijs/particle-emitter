module.exports = {
	options: {
		base: '.',
		message: 'Auto-generated commit'
	},
	src: [
		'index.htm',
		'<%= docsPath %>/**/*',
		'dist/**/*',
		'examples/**/*'
	]
};