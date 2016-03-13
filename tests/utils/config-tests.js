
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
        delete process.env.YEARN_OVERRIDE_ORGS;
		delete process.env.YEARN_OVERRIDE_ALIASES;
		callback();
	},
		
	initializeWithOutYEARN_CONFIG: function( unit ){
		delete process.env.YEARN_CONFIG;
		
		unit.deepEqual( 
			config.initialize( ), 
			{ 
				init_type: 'LAZY',
				load_missing: false,
				legacy: false,
				override: true,
				prompt: 'ynode> ',
				loose_semver: false,
				orgs: { '': './node_modules' },
				delimiters: { org: ':', semver: '@', file: '/' },
				aliases: [],
				npmconfig: { loglevel: 'silent' }
			}, 
			'Iniailizing config with out YEARN_CONFIG env variable set.'
		);
		
		unit.done();
	},
    
    initializeWithUserConfig: function( unit ){
		
		unit.deepEqual( 
			config.initialize( {
                override: false,
                legacy: undefined,
                orgs: {
                    'other': 'something'
                }
            } ), 
			{ 
				init_type: 'LAZY',
				load_missing: false,
				legacy: false,
				override: false,
				prompt: 'ynode> ',
				loose_semver: false,
				orgs: { '': './node_modules', 'other': 'something' },
				delimiters: { org: ':', semver: '@', file: '/' },
				aliases: [],
				npmconfig: { loglevel: 'silent' }
			}, 
			'Iniailizing config with out YEARN_CONFIG env variable set.'
		);
		
		unit.done();
	},
	
	initializeWithYEARN_CONFIG: function( unit ){
		
		process.env.YEARN_CONFIG = path.resolve( __dirname, 'TEST_YEARN_CONFIG.json');

		var environment_config = {
			init_type: 'ACTIVE'
		};
		
		grunt.file.write( process.env.YEARN_CONFIG, JSON.stringify( environment_config ) );
		
		unit.deepEqual( 
			config.initialize( ), 
			{ 
				init_type: 'ACTIVE',
				load_missing: false,
				legacy: false,
				override: true,
				prompt: 'ynode> ',
				loose_semver: false,
				orgs: { '': './node_modules' },
				delimiters: { org: ':', semver: '@', file: '/' },
				aliases: [],
				npmconfig: { loglevel: 'silent' }
			}, 'Iniailizing config with YEARN_CONFIG env variable set.'
		);
		
		grunt.file.delete( process.env.YEARN_CONFIG );
		
		unit.done();
	},
	
	initializeWithMultipleYEARN_CONFIG: function( unit ){
		
		process.env.YEARN_CONFIG = path.resolve( __dirname, 'TEST_YEARN_CONFIG_1.json') + path.delimiter + path.resolve( __dirname, 'TEST_YEARN_CONFIG_2.json');

		var environment_config_1 = {
			init_type: 'ACTIVE',
			aliases: [
				{ from: { module: 'module1' }, to: { module: 'module2' } }
			]
		};

		var environment_config_2 = {
			init_type: 'other'
		};
		
		grunt.file.write( path.resolve( __dirname, 'TEST_YEARN_CONFIG_1.json'), JSON.stringify( environment_config_1 ) );
		grunt.file.write( path.resolve( __dirname, 'TEST_YEARN_CONFIG_2.json'), JSON.stringify( environment_config_2 ) );
		
		unit.deepEqual( 
			config.initialize( ), 
			{
				init_type: 'other',
				load_missing: false,
				legacy: false,
				override: true,
				prompt: 'ynode> ',
				loose_semver: false,
				orgs: { '': './node_modules' },
				delimiters: { org: ':', semver: '@', file: '/' },
				aliases: [
					{ from: { module: 'module1' }, to: { module: 'module2' } }
				],
				npmconfig: { loglevel: 'silent' }
			}, 'Iniailizing config with YEARN_CONFIG env variable set.'
		);
		
		grunt.file.delete( path.resolve( __dirname, 'TEST_YEARN_CONFIG_1.json') );
		grunt.file.delete( path.resolve( __dirname, 'TEST_YEARN_CONFIG_2.json') );
		
		unit.done();
	},
	
	initializeWithBadYEARN_CONFIG: function( unit ){
		process.env.YEARN_CONFIG = '/bad/loc';
		
		unit.deepEqual( 
			config.initialize( ), 
			{ 
				init_type: 'LAZY',
				load_missing: false,
				legacy: false,
				override: true,
				prompt: 'ynode> ',
				loose_semver: false,
				orgs: { '': './node_modules' },
				delimiters: { org: ':', semver: '@', file: '/' },
				aliases: [],
				npmconfig: { loglevel: 'silent' }
			}, 
			'Iniailizing config with YEARN_CONFIG env variable set to bad path.'
		);
		
		unit.done();
	},
    
    initializeWithSimpleYEARN_OVERRIDE_ORGS: function( unit ){
		process.env.YEARN_OVERRIDE_ORGS = '{ "other": "something" }';
		
		unit.deepEqual( 
			config.initialize( ), 
			{ 
				init_type: 'LAZY',
				load_missing: false,
				legacy: false,
				override: true,
				prompt: 'ynode> ',
				loose_semver: false,
				orgs: { '': './node_modules', 'other': 'something' },
				delimiters: { org: ':', semver: '@', file: '/' },
				aliases: [],
				npmconfig: { loglevel: 'silent' }
			}, 
			'Iniailizing config with simple YEARN_OVERRIDE_ORGS env variable set.'
		);
		
		unit.done();
	},
    
    initializeWithDefaultYEARN_OVERRIDE_ORGS: function( unit ){
		process.env.YEARN_OVERRIDE_ORGS = '{ "": "new" }';
		
		unit.deepEqual( 
			config.initialize( ), 
			{ 
				init_type: 'LAZY',
				load_missing: false,
				legacy: false,
				override: true,
				prompt: 'ynode> ',
				loose_semver: false,
				orgs: { '': 'new' },
				delimiters: { org: ':', semver: '@', file: '/' },
				aliases: [],
				npmconfig: { loglevel: 'silent' }
			}, 
			'Iniailizing config with default YEARN_OVERRIDE_ORGS env variable set.'
		);
		
		unit.done();
	},
    
    initializeWithBadYEARN_OVERRIDE_ORGS: function( unit ){
		process.env.YEARN_OVERRIDE_ORGS = 'not a json5 object';
		
		unit.deepEqual( 
			config.initialize( ), 
			{ 
				init_type: 'LAZY',
				load_missing: false,
				legacy: false,
				override: true,
				prompt: 'ynode> ',
				loose_semver: false,
				orgs: { '': './node_modules' },
				delimiters: { org: ':', semver: '@', file: '/' },
				aliases: [],
				npmconfig: { loglevel: 'silent' }
			}, 
			'Iniailizing config with bad YEARN_OVERRIDE_ORGS env variable set.'
		);
		
		unit.done();
	},
	
	initializeWithSimpleYEARN_OVERRIDE_ALIASES: function( unit ){
		process.env.YEARN_OVERRIDE_ALIASES = '[ { "from": { "module": "other" }, "to": { "module": "something" } } ]';
		
		unit.deepEqual( 
			config.initialize( ), 
			{ 
				init_type: 'LAZY',
				load_missing: false,
				legacy: false,
				override: true,
				prompt: 'ynode> ',
				loose_semver: false,
				orgs: { '': './node_modules' },
				delimiters: { org: ':', semver: '@', file: '/' },
				aliases: [ { from: { module: 'other' }, to: { module: 'something' } } ],
				npmconfig: { loglevel: 'silent' }
			}, 
			'Iniailizing config with simple YEARN_OVERRIDE_ORGS env variable set.'
		);
		
		unit.done();
	},
	
	initializeWithBadYEARN_OVERRIDE_ALIASES: function( unit ){
		process.env.YEARN_OVERRIDE_ALIASES = 'not a json5 object';
		
		unit.deepEqual( 
			config.initialize( ), 
			{ 
				init_type: 'LAZY',
				load_missing: false,
				legacy: false,
				override: true,
				prompt: 'ynode> ',
				loose_semver: false,
				orgs: { '': './node_modules' },
				delimiters: { org: ':', semver: '@', file: '/' },
				aliases: [],
				npmconfig: { loglevel: 'silent' }
			}, 
			'Iniailizing config with bad YEARN_OVERRIDE_ORGS env variable set.'
		);
		
		unit.done();
	},
};