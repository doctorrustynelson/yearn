
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
var temp = require( 'temp' );

var npm_utils = require( '../../lib/utils/npm-utils' );

module.exports.getLatestVersionTests = {
	
	nodeunit: function( unit ){
		
		npm_utils.viewVersion( 'nodeunit', {}, function( err, version ){
			unit.equal( err, null, 'No error on callback.' );
			unit.notEqual( version, undefined, 'Found version not undefined.' );
			unit.done();
		} );
		
	},

	yearn: function( unit ){
		npm_utils.viewVersion( 'yearn', {}, function( err, version ){
			unit.equal( err, null, 'No error on callback.' );
			unit.notEqual( version, undefined, 'Found version not undefined.' );
			unit.done();
		} );
	},
	
	moduleThatShouldNeverExist: function( unit ){
		npm_utils.viewVersion( 'modulethatshouldneverexist', {}, function( err, version ){
			unit.notEqual( err, null, 'Error on callback.' );
			unit.equal( version, undefined, 'No version returned when error occurs.' );
			unit.done();
		} );
	}	
};

module.exports.installToDirTests = {
	
	installBadModule: function( unit ){
		
		var tempdir = temp.mkdirSync( );
		
		npm_utils.installToDir( 'thismodulehadbetternoteverexist', tempdir, {}, function( err ){
			unit.notEqual( err, null, 'Error on callback.' );
			
			grunt.file.delete( tempdir, { force: true } );
			unit.done();
		} );
	},
	
	installBadDir: function( unit ){
		
		var tempdir = '/a/bad/dir';
		
		npm_utils.installToDir( 'lodash', tempdir, {}, function( err ){
			unit.notEqual( err, null, 'Error on callback.' );
			unit.done();
		} );
	},
		
	installAnyLodash: function( unit ){
		
		var tempdir = temp.mkdirSync( );
		
		npm_utils.installToDir( 'lodash', tempdir, {}, function( err ){
			unit.equal( err, null, 'No error on callback.' );
			unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash' ) ), 'lodash folder found.' );
			unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash/package.json' ) ), 'lodash package.json found.' );
			
			grunt.file.delete( tempdir, { force: true } );
			unit.done();
		} );
	},

	installSpecificLodash: function( unit ){
		
		var tempdir = temp.mkdirSync( );
		
		npm_utils.installToDir( 'lodash@2.4.0', tempdir, {}, function( err ){
			unit.equal( err, null, 'No error on callback.' );
			unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash' ) ), 'lodash folder found.' );
			unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash/package.json' ) ), 'lodash package.json found.' );
			
			grunt.file.delete( tempdir, { force: true } );
			unit.done();
		} );
	},
	
	installFuzzyLodash: function( unit ){
		
		var tempdir = temp.mkdirSync( );
		
		npm_utils.installToDir( 'lodash@~2.4.0', tempdir, {}, function( err ){
			unit.equal( err, null, 'No error on callback.' );
			unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash' ) ), 'lodash folder found.' );
			unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash/package.json' ) ), 'lodash package.json found.' );
			
			grunt.file.delete( tempdir, { force: true } );
			unit.done();
		} );
	},
	
	installRangeLodash: function( unit ){
		
		var tempdir = temp.mkdirSync( );
		
		npm_utils.installToDir( 'lodash@2.0.0 - 2.4.0', tempdir, {}, function( err ){
			unit.equal( err, null, 'No error on callback.' );
			unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash' ) ), 'lodash folder found.' );
			unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash/package.json' ) ), 'lodash package.json found.' );
			
			grunt.file.delete( tempdir, { force: true } );
			unit.done();
		} );
	}
};

