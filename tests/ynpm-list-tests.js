
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

var ynpm = require( '../lib/ynpm' )( { 
	orgs: {
		'': './node_modules',
		'*': path.resolve( __dirname, 'test-orgs/*' ),
		'other': path.resolve( __dirname, 'test-other-org' )
	},
	loose_semver: true
} );

module.exports.listCommandTests = {
	
	listJson5Test: function( test ){
	
		ynpm.commands.list( 'json5', __dirname, false, function( err, list ){
			test.strictEqual( err, null, 'No errors in list command.' );
			test.deepEqual( list, [ 'other:json5@0.0.1' ] );
			test.done();
		} );
	},
	
	listTestModule3Test: function( test ){
		
		ynpm.commands.list( 'test-module-3', __dirname, false, function( err, list ){
			test.strictEqual( err, null, 'No errors in list command.' );
			test.deepEqual( list, [ 'test-module-3@1.1.0', 'test-module-3@2015.01.01-1' ] );
			test.done();
		} );
	},
	
	listATest: function( test ){
		
		ynpm.commands.list( 'A', __dirname, false, function( err, list ){
			test.strictEqual( err, null, 'No errors in list command.' );
			test.deepEqual( list, [ 'alphabet:A@0.0.1', 'alphabet:A@0.0.2', 'alphabet:A@0.1.0' ] );
			test.done();
		} );
	},
    
    listAWithRangeTest: function( test ){
		
		ynpm.commands.list( 'A@>=0.0.5', __dirname, false, function( err, list ){
			test.strictEqual( err, null, 'No errors in list command.' );
			test.deepEqual( list, [ 'alphabet:A@0.1.0' ] );
			test.done();
		} );
	},
    
    listBWithOrgTest: function( test ){
		
		ynpm.commands.list( 'alphabet:B', __dirname, false, function( err, list ){
			test.strictEqual( err, null, 'No errors in list command.' );
			test.deepEqual( list, [ 'alphabet:B@0.0.1', 'alphabet:B@0.0.2', 'alphabet:B@0.1.0' ] );
			test.done();
		} );
	},
};