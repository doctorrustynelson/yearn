
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
var grunt = require( 'grunt' );


module.exports.orgsCommandTests = {
	
	noProvidedConfig: function( test ){
		
		var ynpm = require( '../lib/ynpm' )( );
		
		test.deepEqual( { '': './node_modules' }, ynpm.commands.orgs() );
		test.done();
	},
	
	emptyConfig: function( test ){
		
		var ynpm = require( '../lib/ynpm' )( {} );
		
		test.deepEqual( { '': './node_modules' }, ynpm.commands.orgs() );
		test.done();
	},
	
	emptyOrgs: function( test ){
		
		var ynpm = require( '../lib/ynpm' )( { orgs: {} } );
		
		test.deepEqual( { '': './node_modules' }, ynpm.commands.orgs() );
		test.done();
	},
	
	fullySpecifiedConfig: function( test ){
		
		var ynpm = require( '../lib/ynpm' )( { orgs: { '': '/user/bin/node_modules', 'spec': '/user/bin/spec' } } );
		
		test.deepEqual( { '': '/user/bin/node_modules', 'spec': '/user/bin/spec' }, ynpm.commands.orgs() );
		test.done();
	},
	
	noDefaultInOverridenConfig: function( test ){
		
		var ynpm = require( '../lib/ynpm' )( { orgs: { 'spec': '/user/bin/spec' } } );
		
		test.deepEqual( { '': './node_modules', 'spec': '/user/bin/spec' }, ynpm.commands.orgs() );
		test.done();
	}
};

module.exports.installCommandTests = {
		
		
	installLodashToAbsoluteDefault: function( test ){
		
		var temp_dir = require( 'temp' ).mkdirSync();
		var ynpm = require( '../lib/ynpm' )( { orgs: { '': temp_dir } } );
		
		ynpm.commands.install( 'lodash@2.4.0' );
			
		test.ok( grunt.file.exists( path.join( temp_dir, 'lodash' ) ) );
		test.ok( grunt.file.exists( path.join( temp_dir, 'lodash', '2.4.0' ) ) );
		test.ok( grunt.file.exists( path.join( temp_dir, 'lodash', '2.4.0', 'package.json' ) ) );
		
		grunt.file.delete( temp_dir, { force: true } );
		test.done();
	},
	
	installLodashWithoutVersionToAbsoluteDefault: function( test ){
		
		var temp_dir = require( 'temp' ).mkdirSync();
		var ynpm = require( '../lib/ynpm' )( { orgs: { '': temp_dir } } );
		
		ynpm.commands.install( 'lodash' );
			
		test.ok( grunt.file.exists( path.join( temp_dir, 'lodash' ) ) );
		
		grunt.file.delete( temp_dir, { force: true } );
		test.done();
	},
	
	installNodeunitToAbsoluteDefault: function( test ){
		
		var temp_dir = require( 'temp' ).mkdirSync();
		var ynpm = require( '../lib/ynpm' )( { orgs: { '': temp_dir } } );
		
		ynpm.commands.install( 'nodeunit@0.9.0' );
			
		test.ok( grunt.file.exists( path.join( temp_dir, 'nodeunit' ) ) );
		test.ok( grunt.file.exists( path.join( temp_dir, 'nodeunit', '0.9.0' ) ) );
		test.ok( grunt.file.exists( path.join( temp_dir, 'nodeunit', '0.9.0', 'package.json' ) ) );
		test.ok( grunt.file.exists( path.join( temp_dir, 'tap' ) ) );
		
		grunt.file.delete( temp_dir, { force: true } );
		test.done();
	},
	
	installLodashToRelativeDefault: function( test ){
		
		var temp_dir = './temp_node_modules';
		var ynpm = require( '../lib/ynpm' )( { orgs: { '': temp_dir } } );
		
		ynpm.commands.install( 'lodash@2.4.0' );
			
		test.ok( grunt.file.exists( path.join( temp_dir, 'lodash' ) ) );
		test.ok( grunt.file.exists( path.join( temp_dir, 'lodash', '2.4.0' ) ) );
		test.ok( grunt.file.exists( path.join( temp_dir, 'lodash', '2.4.0', 'package.json' ) ) );
		
		grunt.file.delete( temp_dir, { force: true } );
		test.done();
	},
	
	installNodeunitToRelativeDefault: function( test ){
		
		var temp_dir = './temp_node_modules';
		var ynpm = require( '../lib/ynpm' )( { orgs: { '': temp_dir } } );
		
		ynpm.commands.install( 'nodeunit@0.9.0' );
			
		test.ok( grunt.file.exists( path.join( temp_dir, 'nodeunit' ) ) );
		test.ok( grunt.file.exists( path.join( temp_dir, 'nodeunit', '0.9.0' ) ) );
		test.ok( grunt.file.exists( path.join( temp_dir, 'nodeunit', '0.9.0', 'package.json' ) ) );
		test.ok( grunt.file.exists( path.join( temp_dir, 'tap' ) ) );
		
		grunt.file.delete( temp_dir, { force: true } );
		test.done();
	},
	
	installNodeunitAbsoluteWithRelativeDefault: function( test ){
		
		var temp_dir = './temp_node_modules';
		var spec_dir = require( 'temp' ).mkdirSync();
		var ynpm = require( '../lib/ynpm' )( { orgs: { '': temp_dir, 'other': spec_dir } } );
		
		ynpm.commands.install( 'other/nodeunit@0.9.0' );
			
		test.ok( grunt.file.exists( path.join( spec_dir, 'nodeunit' ) ) );
		test.ok( grunt.file.exists( path.join( spec_dir, 'nodeunit', '0.9.0' ) ) );
		test.ok( grunt.file.exists( path.join( spec_dir, 'nodeunit', '0.9.0', 'package.json' ) ) );
		test.ok( !grunt.file.exists( path.join( spec_dir, 'tap' ) ) );
		test.ok( !grunt.file.exists( path.join( temp_dir, 'nodeunit' ) ) );
		test.ok( !grunt.file.exists( path.join( temp_dir, 'nodeunit', '0.9.0' ) ) );
		test.ok( !grunt.file.exists( path.join( temp_dir, 'nodeunit', '0.9.0', 'package.json' ) ) );
		test.ok( grunt.file.exists( path.join( temp_dir, 'tap' ) ) );
		
		grunt.file.delete( temp_dir, { force: true } );
		test.done();
	}
};