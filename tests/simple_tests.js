
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
var yearn = require( '../lib/yearn' )({ 
	orgs: { 
		'': './node_modules',
		'test_modules': path.join( __dirname, 'node_modules' ) 
	},
	override: true,
	log: 'ALL' 
});

module.exports.simpleIntigrationTests = {
	
	fullyQualifiedYearning: function( test ){
		
		var result = yearn( { org: 'test_modules', module: 'test-module-0', version: '0.0.1' } );
		
		test.equal( 'Secret string for test-module-0 v.0.0.1 in default org.', result );
		test.done();
	},
	
	fullyQualifiedYearningWithSubYearning: function( test ){
		
		var result = yearn( { org: 'test_modules', module: 'test-module-1', version: '1.0.0' } );
		
		test.equal( 'Secret string for test-module-1 v.1.0.0 in default org with test-submodule-0 v.0.1.0.', result );
		test.done();
	},
	
	fullyQualifiedYearningWithSubLegacyYearningWithSubLegacyYearningFallback: function( test ){
		
		var result = yearn( { org: 'test_modules', module: 'test-module-3', version: '1.1.0' } );
		
		test.equal( 'Secret string for test-module-3 v.1.1.0 in default org with test-submodule-1 v.0.0.1 with test-submodule-2 v.0.1.0.', result );
		test.done();
	},
	
	fullyQualifiedYearningWithNonRootSubYearning: function( test ){
		
		var result = yearn( { org: 'test_modules', module: 'test-module-2', version: '1.0.0' } );
		
		test.equal( 'Secret string for test-module-2 v.1.0.0 in default org with test-submodule-0 v.0.1.0.', result );
		test.done();
	},
	
	fullyQualifiedYearningWithNonRootSubYearningAndProxy: function( test ){
		
		var result = yearn( { org: 'test_modules', module: 'test-module-2', version: '2.0.0' } );
		
		test.equal( 'Secret string for test-module-2 (proxy) v.2.0.0 in default org with test-submodule-0 v.0.1.0.', result );
		test.done();
	},
	
	nativeYearning: function( test ){
		
		var result = yearn( 'path' );
		
		test.equal( 'function', typeof result.resolve );
		test.done();
	}
	
};