module.exports = {
	compile: {
		name: '<%= build.name %>',
		description: '<%= build.description %>',
		version: '<%= build.version %>',
		url: '<%= build.url %>',
		logo: 'https://raw.githubusercontent.com/pixijs/pixi-particles-editor/master/deploy/assets/images/icon.png',
		options: {
			linkNatives: true,
			attributesEmit: true,
			helpers: ["<%= themePath %>/helpers/helpers.js"],
			paths: '<%= sourcePath %>',
			themedir: '<%= themePath %>',
			outdir: '<%= docsPath %>'
		}
	}
};