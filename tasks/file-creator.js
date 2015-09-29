module.exports = {
	"redirect": {
		"index.htm": function(fs, fd, done) {
			fs.writeSync(fd, '<meta http-equiv="refresh" content="0; url=http://cloudkidstudio.github.io/PixiParticles/docs/" />');
			done();
		}
	}
};