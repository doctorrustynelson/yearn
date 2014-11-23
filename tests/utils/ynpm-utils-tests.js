
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

var ynpm_utils = require( '../../lib/utils/ynpm-utils' );
var npm = require( 'npm' );
var grunt = require( 'grunt' );

module.exports.translateLegacyDependencyStructureTests = {
	
	noDependenciesStructureTest: function( unit ){
		
		if( grunt.file.exists( './tmp-src' ) )
			grunt.file.delete( './tmp-src' );
		
		if( grunt.file.exists( './tmp-dest' ) )
			grunt.file.delete( './tmp-dest' );
		
		npm.load( function( ){
			npm.commands.install( './tmp-src', 'lodash@2.4.0', function( ){
				grunt.file.mkdir( './tmp-dest' );
				ynpm_utils.translateLegacyDependencyStructure( './tmp-src/node_modules/lodash', './tmp-dest' );
				
				unit.ok( grunt.file.exists( './tmp-dest/lodash' ) );
				unit.ok( grunt.file.exists( './tmp-dest/lodash/2.4.0' ) );
				unit.ok( grunt.file.exists( './tmp-dest/lodash/2.4.0/package.json' ) );
				unit.ok( !grunt.file.exists( './tmp-dest/lodash/2.4.0/node_modules' ) );
				
				grunt.file.delete( './tmp-src' );
				grunt.file.delete( './tmp-dest' );
				unit.done();
			} );
		} );
	},
	
	smallDependenciesStructureTest: function( unit ){
		
		if( grunt.file.exists( './tmp-src' ) )
			grunt.file.delete( './tmp-src' );
		
		if( grunt.file.exists( './tmp-dest' ) )
			grunt.file.delete( './tmp-dest' );
		
		npm.load( function( ){
			npm.commands.install( './tmp-src', 'has-ansi@1.0.0', function( ){
				grunt.file.mkdir( './tmp-dest' );
				ynpm_utils.translateLegacyDependencyStructure( './tmp-src/node_modules/has-ansi', './tmp-dest' );
				
				unit.ok( grunt.file.exists( './tmp-dest/has-ansi' ) );
				unit.ok( grunt.file.exists( './tmp-dest/has-ansi/1.0.0' ) );
				unit.ok( grunt.file.exists( './tmp-dest/has-ansi/1.0.0/package.json' ) );
				unit.ok( !grunt.file.exists( './tmp-dest/has-ansi/1.0.0/node_modules' ) );
				unit.ok( grunt.file.exists( './tmp-dest/ansi-regex' ) );
				unit.ok( grunt.file.exists( './tmp-dest/ansi-regex/1.1.0' ) );
				unit.ok( grunt.file.exists( './tmp-dest/ansi-regex/1.1.0/package.json' ) );
				unit.ok( !grunt.file.exists( './tmp-dest/ansi-regex/1.1.0/node_modules' ) );
				unit.ok( grunt.file.exists( './tmp-dest/get-stdin' ) );
				unit.ok( grunt.file.exists( './tmp-dest/get-stdin/1.0.0' ) );
				unit.ok( grunt.file.exists( './tmp-dest/get-stdin/1.0.0/package.json' ) );
				unit.ok( !grunt.file.exists( './tmp-dest/get-stdin/1.0.0/node_modules' ) );
				
				grunt.file.delete( './tmp-src' );
				grunt.file.delete( './tmp-dest' );
				unit.done();
			} );
		} );
	}
	
};