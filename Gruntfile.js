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
			unit: [
				'tests/**/*tests.js',
				'!tests/yearn-tests.js',
				'!tests/*cli-tests.js'
			],
			integration: [
			    'tests/yearn-tests.js'
			],
			cli: [
			    'tests/*cli-tests.js'
			],
			options: {
				reporter: 'verbose'
			}
		},
		
		coveralls: {
			submit_coverage: {
				src: 'coverage/lcov.info'
			}
		}
	});
	
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-nodeunit' );
	grunt.loadNpmTasks( 'grunt-coveralls' );
	
	grunt.registerTask( 'test', [ 'jshint', 'nodeunit:unit', 'nodeunit:cli', 'nodeunit:integration' ] );
	grunt.registerTask( 'default', [ 'test' ] );
};