module.exports = function(grunt)
{
	var path = require('path'),
        _ = grunt.util._;

    grunt.initConfig(_.extend(

        // Setup the default library tasks
        require('grunt-library-builder')(grunt, { autoInit: false }), 

        // Setup the current project tasks
        require('load-grunt-config')(grunt, {
            // The path for the tasks
            configPath: path.join(process.cwd(), 'tasks'),
            autoInit: false, 

            // We don't want to reload builder
            loadGruntTasks: { pattern: [
                'grunt-*', 
                '!grunt-library-builder'
            ]}
        })
    ));
};