
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

var yearn_utils = require( '../../lib/utils/yearn-utils' );

module.exports.isDirectYearningTests = {
	
	testUpPathYearning: function( unit ){
		unit.ok( yearn_utils.isDirectYearning( '../example/dir' ) );
		unit.ok( yearn_utils.isDirectYearning( '../../../example/dir' ) );
		unit.ok( yearn_utils.isDirectYearning( '../example/file.js' ) );
		unit.ok( yearn_utils.isDirectYearning( '../../../example/file.js' ) );
		unit.ok( yearn_utils.isDirectYearning( '../' ) );
		unit.done();
	},
	
	testPeerPathYearning: function( unit ){
		unit.ok( yearn_utils.isDirectYearning( './example/dir' ) );
		unit.ok( yearn_utils.isDirectYearning( './example/file.js' ) );
		unit.ok( yearn_utils.isDirectYearning( './file.js' ) );
		unit.done();
	},
	
	testAbsolutePathYearning: function( unit ){
		unit.ok( yearn_utils.isDirectYearning( '/example/dir' ) );
		unit.ok( yearn_utils.isDirectYearning( '/example/file.js' ) );
		unit.ok( yearn_utils.isDirectYearning( '/file.js' ) );
		unit.done();
	},
	
	testModuleYearning: function( unit ){
		unit.ok( !yearn_utils.isDirectYearning( 'example/dir' ) );
		unit.ok( !yearn_utils.isDirectYearning( 'example/file.js' ) );
		unit.ok( !yearn_utils.isDirectYearning( 'file.js' ) );
		unit.ok( !yearn_utils.isDirectYearning( 'dir' ) );
		unit.done();
	}
};

module.exports.isValidSemVerTests = {
	
	testValidSemvers: function( unit ){
		unit.ok( yearn_utils.isValidSemVer( '0.1.2' ) );
		unit.ok( yearn_utils.isValidSemVer( '>0.1.2' ) );
		unit.ok( yearn_utils.isValidSemVer( '>=0.1.2' ) );
		unit.ok( yearn_utils.isValidSemVer( '<0.1.2' ) );
		unit.ok( yearn_utils.isValidSemVer( '<=0.1.2' ) );
		unit.ok( yearn_utils.isValidSemVer( '~0.1.2' ) );
		unit.ok( yearn_utils.isValidSemVer( '^0.1.2' ) );
		unit.ok( yearn_utils.isValidSemVer( '0.1.x' ) );
		unit.ok( yearn_utils.isValidSemVer( '*' ) );
		unit.ok( yearn_utils.isValidSemVer( '' ) );
		unit.done();
	},
	
	testValidRanges: function( unit ){
		unit.ok( yearn_utils.isValidSemVer( '0.1.2 - 0.2.1' ) );
		unit.ok( yearn_utils.isValidSemVer( '>=0.1.2 <=0.2.1' ) );
		unit.ok( yearn_utils.isValidSemVer( '0.1.2 - 0.2.1 || >=0.3.0' ) );
		unit.ok( yearn_utils.isValidSemVer( '<1.0.0 || >=2.3.1 <2.4.5 || >=2.5.2 <3.0.0' ) );
		unit.done();
	},
	
	testInvalidSemvers: function( unit ){
		unit.ok( !yearn_utils.isValidSemVer( 'a.b.c' ) );
		unit.ok( !yearn_utils.isValidSemVer( 'latest' ) );
		unit.ok( !yearn_utils.isValidSemVer( 'hello-world' ) );
		unit.done();
	}
};

module.exports.isNativeModuleTests = {
		
	testNativeModules: function( unit ){
		unit.ok( yearn_utils.isNativeModule( 'path' ) );
		unit.ok( yearn_utils.isNativeModule( 'fs' ) );
		unit.ok( yearn_utils.isNativeModule( 'os' ) );
		unit.ok( yearn_utils.isNativeModule( 'http' ) );
		unit.ok( yearn_utils.isNativeModule( 'url' ) );
		unit.done();
	},
	
	testNonNativeModules: function( unit ){
		unit.ok( !yearn_utils.isNativeModule( 'grunt' ) );
		unit.ok( !yearn_utils.isNativeModule( 'semver' ) );
		unit.ok( !yearn_utils.isNativeModule( 'npm' ) );
		unit.done();
	}
};

module.exports.mergeMapsTests = {
		
	testTwoDifferentMaps: function( unit ){
		var result = yearn_utils.mergeMaps( {
			'a': 1,
			'b': 2
		}, {
			'c': 3,
			'd': 4
		} );
		
		unit.deepEqual( result, {
			'a': 1,
			'b': 2,
			'c': 3,
			'd': 4
		} );
		unit.done();
	},
	
	testTwoOverlappingMaps: function( unit ){
		var result = yearn_utils.mergeMaps( {
			'a': 1,
			'b': 2
		}, {
			'b': -1,
			'c': 3,
			'd': 4
		} );
		
		unit.deepEqual( result, {
			'a': 1,
			'b': -1,
			'c': 3,
			'd': 4
		} );
		unit.done();
	},
	
	testThreeOverlappingMaps: function( unit ){
		var result = yearn_utils.mergeMaps( {
			'a': 1,
			'b': 2
		}, {
			'b': -1,
			'c': 3,
			'd': 4
		}, {
			'b': -2,
			'd': 5
		} );
		
		unit.deepEqual( result, {
			'a': 1,
			'b': -2,
			'c': 3,
			'd': 5
		} );
		unit.done();
	},
	
};