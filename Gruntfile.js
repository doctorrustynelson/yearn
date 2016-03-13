/**
 * Test and Validation file.
 */

'use strict';
var path = require( 'path' );

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
				'!tests/yearn*tests.js',
				'!tests/*cli-tests.js'
			],
			dependency: [
				'tests/yearn-dependency-tests.js'	
			],
			utils: [
			     'tests/utils/*utils-tests.js'           
			],
			npm: [
			     'tests/utils/npm-utils-tests.js'           
			],
			ynpm: [
			    'tests/ynpm-tests.js',
                'tests/ynpm-list-tests.js'
			],
			yearn: [
			    'tests/yearn-tests.js',
				'tests/yearn-dependency-tests.js',
				'tests/yearn-loose-semver-tests.js',
				'tests/yearn-legacy-tests.js',
			    'tests/yearn-override-tests.js',
			    'tests/yearn-override-function-tests.js',
				'tests/yearn-alias-tests.js',
			],
            config: [
                'tests/utils/config-tests.js'
            ],
            shrinkwrap: [
                'tests/ynpm-shrinkwrap-tests.js'
            ],
            list: [
                'tests/utils/ynpm-utils-find-tests.js',
                'tests/ynpm-list-tests.js'
            ],
			core: [
			    'tests/core-tests.js'
			],
			cli: [
			    'tests/*cli-tests.js'
			],
			options: {
				reporter: 'verbose'
			}
		},
        
        'ynpm-shrinkwrap': {
            test: {
                src: './tests/test-orgs/alphabet/D/0.1.0',
                dest: '.',
                options: {
                    config: {
                        orgs: {
                            '': './node_modules',
                            '*': path.resolve( __dirname, './tests/test-orgs/*' ),
                            'other': path.resolve( __dirname, './tests/test-other-org' )
                        },
                        loose_semver: true
                    }
                }
            }
        },
		
		coveralls: {
			options: {
				force: false
			},
			submit_coverage: {
				src: 'coverage/lcov.info'
			}
		}
	});
	
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-nodeunit' );
	grunt.loadNpmTasks( 'grunt-coveralls' );
    grunt.loadTasks( './tasks' );
	
	grunt.registerTask( 'test', [ 'jshint', 'nodeunit:unit', 'nodeunit:cli', 'nodeunit:yearn' ] );
	grunt.registerTask( 'default', [ 'test' ] );
};