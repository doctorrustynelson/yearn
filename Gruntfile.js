/**
 * Test and Validation file.
 */

'use strict';

module.exports = function( grunt ){

	grunt.initConfig({
		jshint: {
			all: [
				'Gruntfile.js',
				'bin/**/*.js',
				'lib/**/*.js',
				'tests/**/*.js'
			],
			options: {
				jshintrc: '.jshintrc'
			}
		},
		nodeunit: {
			tests: [
				'tests/**/*tests.js',
				'tests/**/*tests.js'
			],
			options: {
				reporter: 'verbose'
			}
		}
	});
	
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-nodeunit' );
	grunt.loadNpmTasks( 'grunt-travis-lint' );
	
	grunt.registerTask( 'test', [ 'jshint', 'travis-lint', 'nodeunit' ] );
	grunt.registerTask( 'default', [ 'test' ] );
};