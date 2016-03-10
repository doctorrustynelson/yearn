
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

var path = require( 'path' );
var fs = require( 'fs' );
var grunt = require( 'grunt' );
var exec = require( 'child_process' ).exec;
var JSON5 = require( 'json5' );
var npm = require( 'npm' );

module.exports.setUp = function( callback ){
	npm.load( function( ){
		callback();
	} );
};

module.exports.checkTests = {
	
	lodashInDefaultOrgAndCorrect: function( test ){
		var env = JSON.parse( JSON.stringify( process.env ) );
		env.YEARN_CONFIG = path.join( __dirname, 'test-configs', 'default-test-config.json5' );
		require( '../lib/ynpm' )( JSON5.parse( fs.readFileSync( env.YEARN_CONFIG ) ), function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			ynpm.commands.install( 'lodash', false, function( ){
				exec( 'node bin/ynpm-cli.js check lodash', {
					cwd: path.join( __dirname, '..' ),
					env: env
				}, function( err, stdout, stderr ){
					
					test.equal( null, err );
					test.deepEqual( [
					], stderr.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ));     			
					test.deepEqual( [
					], stdout.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ));
					
					grunt.file.delete( path.join( __dirname, '..', 'test_node_modules' ), { force: true } );
					grunt.file.delete( path.join( __dirname, '..', 'spec_node_modules' ), { force: true } );
					test.done();
				} );	
			} );
		} );
	},
	
	lodashInDefaultOrgAndIncorrect: function( test ){
		var env = JSON.parse( JSON.stringify( process.env ) );
		env.YEARN_CONFIG = path.join( __dirname, 'test-configs', 'default-test-config.json5' );
		require( '../lib/ynpm' )( JSON5.parse( fs.readFileSync( env.YEARN_CONFIG ) ), function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			ynpm.commands.install( 'lodash@2.4.0', false, function( ){
				exec( 'node bin/ynpm-cli.js check lodash', {
					cwd: path.join( __dirname, '..' ),
					env: env
				}, function( err, stdout, stderr ){
					
					test.equal( null, err );
					test.deepEqual( [
					], stderr.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ));     			
					test.notDeepEqual( [
					], stdout.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ));
					
					grunt.file.delete( path.join( __dirname, '..', 'test_node_modules' ), { force: true } );
					grunt.file.delete( path.join( __dirname, '..', 'spec_node_modules' ), { force: true } );
					test.done();
				} );	
			} );
		} );
	},
	
	allAndLodashIncorrect: function( test ){
		var env = JSON.parse( JSON.stringify( process.env ) );
		env.YEARN_CONFIG = path.join( __dirname, 'test-configs', 'default-test-config.json5' );
		require( '../lib/ynpm' )( JSON5.parse( fs.readFileSync( env.YEARN_CONFIG ) ), function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			ynpm.commands.install( 'lodash@2.4.0', false, function( ){
				ynpm.commands.install( 'spec:lodash@2.4.0', false, function( ){
					exec( 'node bin/ynpm-cli.js check', {
						cwd: path.join( __dirname, '..' ),
						env: env
					}, function( err, stdout, stderr ){
						
						test.equal( null, err );
						test.deepEqual( [
						], stderr.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ));     			
						test.notDeepEqual( [
						], stdout.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ));
						
						grunt.file.delete( path.join( __dirname, '..', 'test_node_modules' ), { force: true } );
						grunt.file.delete( path.join( __dirname, '..', 'spec_node_modules' ), { force: true } );
						test.done();
					} );	
				} );
			} );
		} );
	},
		
};

module.exports.orgsTests = {
	
	noProvidedConfig: function( test ){
		
		exec( 'node ../bin/ynpm-cli.js orgs', {
			cwd: __dirname
		}, function( err, stdout, stderr ){
			test.equal( null, err );
			test.deepEqual( [
			    'YEARN_CONFIG is not defined.'
			], stderr.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ));
			test.deepEqual( [
 			    '"" -> ./node_modules' 
 			], stdout.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ));
			test.done();
		} );
	},
	
	falseConfig: function( test ){
		
		var env = JSON.parse( JSON.stringify( process.env ) );
		env.YEARN_CONFIG = 'false';
		
		exec( 'node ../bin/ynpm-cli.js orgs', {
			cwd: __dirname,
			env: env
		}, function( err, stdout, stderr ){
			test.equal( null, err );
			test.deepEqual( [
			    'YEARN_CONFIG is not defined.'
			], stderr.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ));
			test.deepEqual( [
 			    '"" -> ./node_modules' 
 			], stdout.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ));
			test.done();
		} );
	},
	
	emptyConfig: function( test ){
		
		var env = JSON.parse( JSON.stringify( process.env ) );
		env.YEARN_CONFIG = '';
		
		exec( 'node ../bin/ynpm-cli.js orgs', {
			cwd: __dirname,
			env: env
		}, function( err, stdout, stderr ){
			test.equal( null, err );
			test.deepEqual( [
			    'YEARN_CONFIG is not defined.'
			], stderr.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ));
			test.deepEqual( [
 			    '"" -> ./node_modules' 
 			], stdout.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ));
			test.done();
		} );
	},
	
	badConfigLocation: function( test ){
		
		var env = JSON.parse( JSON.stringify( process.env ) );
		env.YEARN_CONFIG = path.join( __dirname, 'test-configs', 'non-existant-config.json5' );
		
		exec( 'node ../bin/ynpm-cli.js orgs', {
			cwd: __dirname,
			env: env
		}, function( err, stdout, stderr ){
			test.equal( null, err );
			test.deepEqual( [
			    'YEARN_CONFIG was not found at ' + env.YEARN_CONFIG + '.'
			], stderr.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ));
			test.deepEqual( [
 			    '"" -> ./node_modules' 
 			], stdout.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ));
			test.done();
		} );
	},
	
	fullyOverridingConfig: function( test ){
		
		var env = JSON.parse( JSON.stringify( process.env ) );
		env.YEARN_CONFIG = path.join( __dirname, 'test-configs', 'fully-overriding-test-config.json5' );
		
		exec( 'node ../bin/ynpm-cli.js orgs', {
			cwd: __dirname,
			env: env
		}, function( err, stdout, stderr ){
			test.equal( null, err );
			test.deepEqual( [
			], stderr.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ));
			test.deepEqual( [
 			    '"" -> /user/bin/node_modules',
 			    'spec -> /user/bin/spec'
 			], stdout.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ).sort());
			test.done();
		} );
	},
	
	partiallyOverridingConfig: function( test ){
		
		var env = JSON.parse( JSON.stringify( process.env ) );
		env.YEARN_CONFIG = path.join( __dirname, 'test-configs', 'partially-overriding-test-config.json5' );
		
		exec( 'node ../bin/ynpm-cli.js orgs', {
			cwd: __dirname,
			env: env
		}, function( err, stdout, stderr ){
			test.equal( null, err );
			test.deepEqual( [
			], stderr.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ));
			test.deepEqual( [
 			    '"" -> ./node_modules',
 			    'spec -> /user/bin/spec'
 			], stdout.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ).sort());
			test.done();
		} );
	}
};

module.exports.installTests = {
	
	installLodashToDefault: function( test ){
		
		var env = JSON.parse( JSON.stringify( process.env ) );
		env.YEARN_CONFIG = path.join( __dirname, 'test-configs', 'default-test-config.json5' );
		
		exec( 'node ../bin/ynpm-cli.js install lodash@2.4.0', {
			cwd: __dirname,
			env: env
		}, function( err /*stdout, stderr*/ ){
			test.equal( null, err );
			
			test.ok( grunt.file.exists( path.join( __dirname, 'test_node_modules', 'lodash' ) ) );
			test.ok( grunt.file.exists( path.join( __dirname, 'test_node_modules', 'lodash', '2.4.0' ) ) );
			test.ok( grunt.file.exists( path.join( __dirname, 'test_node_modules', 'lodash', '2.4.0', 'package.json' ) ) );
			
			grunt.file.delete( path.join( __dirname, 'test_node_modules' ), { force: true } );
			test.done();
		} );
	},
	
	installLodashWithoutVersionToDefault: function( test ){
		
		var env = JSON.parse( JSON.stringify( process.env ) );
		env.YEARN_CONFIG = path.join( __dirname, 'test-configs', 'default-test-config.json5' );
		
		exec( 'node ../bin/ynpm-cli.js install lodash', {
			cwd: __dirname,
			env: env
		}, function( err /*stdout, stderr*/ ){
			test.equal( null, err );
			
			test.ok( grunt.file.exists( path.join( __dirname, 'test_node_modules', 'lodash' ) ) );
			
			grunt.file.delete( path.join( __dirname, 'test_node_modules' ), { force: true } );
			test.done();
		} );
	},
	
	installNodeunitToDefault: function( test ){
		
		var env = JSON.parse( JSON.stringify( process.env ) );
		env.YEARN_CONFIG = path.join( __dirname, 'test-configs', 'default-test-config.json5' );
		
		exec( 'node ../bin/ynpm-cli.js install nodeunit@0.9.0', {
			cwd: __dirname,
			env: env
		}, function( err /*stdout, stderr*/ ){
			test.equal( null, err );
			
			test.ok( grunt.file.exists( path.join( __dirname, 'test_node_modules', 'nodeunit' ) ) );
			test.ok( grunt.file.exists( path.join( __dirname, 'test_node_modules', 'nodeunit', '0.9.0' ) ) );
			test.ok( grunt.file.exists( path.join( __dirname, 'test_node_modules', 'nodeunit', '0.9.0', 'package.json' ) ) );
			test.ok( grunt.file.exists( path.join( __dirname, 'test_node_modules', 'tap' ) ) );
			
			grunt.file.delete( path.join( __dirname, 'test_node_modules' ), { force: true } );
			test.done();
		} );
	},
	
	installNodeunitToSpeicalAndDependenciesToDefault: function( test ){
		
		var env = JSON.parse( JSON.stringify( process.env ) );
		env.YEARN_CONFIG = path.join( __dirname, 'test-configs', 'default-test-config.json5' );
		
		exec( 'node ../bin/ynpm-cli.js install spec:nodeunit@0.9.0', {
			cwd: __dirname,
			env: env
		}, function( err /*stdout, stderr*/ ){
			test.equal( null, err );
			
			test.ok( grunt.file.exists( path.join( __dirname, 'spec_node_modules', 'nodeunit' ) ) );
			test.ok( grunt.file.exists( path.join( __dirname, 'spec_node_modules', 'nodeunit', '0.9.0' ) ) );
			test.ok( grunt.file.exists( path.join( __dirname, 'spec_node_modules', 'nodeunit', '0.9.0', 'package.json' ) ) );
			test.ok( !grunt.file.exists( path.join( __dirname, 'spec_node_modules', 'tap' ) ) );
			test.ok( !grunt.file.exists( path.join( __dirname, 'test_node_modules', 'nodeunit' ) ) );
			test.ok( !grunt.file.exists( path.join( __dirname, 'test_node_modules', 'nodeunit', '0.9.0' ) ) );
			test.ok( !grunt.file.exists( path.join( __dirname, 'test_node_modules', 'nodeunit', '0.9.0', 'package.json' ) ) );
			test.ok( grunt.file.exists( path.join( __dirname, 'test_node_modules', 'tap' ) ) );
			
			grunt.file.delete( path.join( __dirname, 'test_node_modules' ), { force: true } );
			grunt.file.delete( path.join( __dirname, 'spec_node_modules' ), { force: true } );
			test.done();
		} );
	},
};