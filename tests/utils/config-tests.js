
/* Node unit quick reference:
 * 
 *	ok(value, [message]) 
 *		- Tests if value is a true value.
 *	equal(actual, expected, [message]) 
 *		- Tests shallow, coercive equality with the equal comparison operator ( == ).
 *	notEqual(actual, expected, [message]) 
 *		- Tests shallow, coercive non-equality with the not equal comparison operator ( != ).
 *	deepEqual(actual, expected, [message]) 
 *		- Tests for deep equality.
 *	notDeepEqual(actual, expected, [message]) 
 *		- Tests for any deep inequality.
 *	strictEqual(actual, expected, [message]) 
 *		- Tests strict equality, as determined by the strict equality operator ( === )
 *	notStrictEqual(actual, expected, [message]) 
 *		- Tests strict non-equality, as determined by the strict not equal operator ( !== )
 *	throws(block, [error], [message]) 
 *		- Expects block to throw an error.
 *	doesNotThrow(block, [error], [message]) 
 *		- Expects block not to throw an error.
 *	ifError(value) 
 *		- Tests if value is not a false value, throws if it is a true value.
 *	
 *	expect(amount) 
 *		- Specify how many assertions are expected to run within a test. 
 *	done() 
 *		- Finish the current test function, and move on to the next. ALL tests should call this!
 */

var config = require( '../../lib/utils/config' );		
var grunt = require( 'grunt' );
var path = require( 'path' );

module.exports.configTests = {
		
	tearDown: function( callback ){
		delete process.env.YEARN_CONFIG;
		callback();
	},
		
	initializeWithOutYEARN_CONFIG: function( unit ){
		delete process.env.YEARN_CONFIG;
		
		unit.deepEqual( 
			config.initialize( ), 
			{ 
				logger: 'default',
				init_type: 'LAZY',
				load_missing: false,
				legacy: false,
				override: true,
				prompt: 'ynode> ',
				loose_semver: false,
				orgs: { '': './node_modules' },
				delimiters: { org: ':', semver: '@', file: '/' },
				npmconfig: {}
			}, 
			'Iniailizing config with out YEARN_CONFIG env variable set.'
		);
		
		unit.done();
	},
	
	initializeWithYEARN_CONFIG: function( unit ){
		
		process.env.YEARN_CONFIG = path.resolve( __dirname, 'TEST_YEARN_CONFIG.json');

		var environment_config = {
			logger: 'log4js'
		};
		
		grunt.file.write( process.env.YEARN_CONFIG, JSON.stringify( environment_config ) );
		
		unit.deepEqual( 
			config.initialize( ), 
			{ 
				logger: 'log4js',
				init_type: 'LAZY',
				load_missing: false,
				legacy: false,
				override: true,
				prompt: 'ynode> ',
				loose_semver: false,
				orgs: { '': './node_modules' },
				delimiters: { org: ':', semver: '@', file: '/' },
				npmconfig: {}
			}, 'Iniailizing config with YEARN_CONFIG env variable set.'
		);
		
		grunt.file.delete( process.env.YEARN_CONFIG );
		
		unit.done();
	},
	
	initializeWithBadYEARN_CONFIG: function( unit ){
		process.env.YEARN_CONFIG = '/bad/loc';
		
		unit.deepEqual( 
			config.initialize( ), 
			{ 
				logger: 'default',
				init_type: 'LAZY',
				load_missing: false,
				legacy: false,
				override: true,
				prompt: 'ynode> ',
				loose_semver: false,
				orgs: { '': './node_modules' },
				delimiters: { org: ':', semver: '@', file: '/' },
				npmconfig: {}
			}, 
			'Iniailizing config with YEARN_CONFIG env variable set to bad path.'
		);
		
		unit.done();
	}
};