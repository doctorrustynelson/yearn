
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
var yearn = null;

module.exports.tearDown = function( callback ){
	process.env.LOG4JS_CONFIG = undefined;
	if( yearn !== null )
		yearn.revert( );
	
	//wipe the cache of all yearn test node_modules
	Object.keys( require.cache ).forEach( function( item ){
		if( item.indexOf( path.resolve( __dirname, './node_modules' ) ) === 0){
			delete require.cache[ item ];
		}
	});
	
	callback( );
};

module.exports.simpleResolveTests = {
		
	fullyQualifiedYearning: function( test ){
		
		test.doesNotThrow( function( ){
			yearn = require( '../lib/yearn' )({ 
				orgs: { 
					'': './node_modules',
					'test_modules': path.join( __dirname, 'node_modules' ) 
				},
				logger: 'test_modules:test-logger',
				override: true,
			} );
		} );
		
		var result = yearn.resolve( { org: 'test_modules', module: 'test-module-0', version: '0.0.1' } );
		
		test.equal( path.join( 'node_modules', 'test-module-0', '0.0.1', 'test_module_0.js' ), path.relative( __dirname, result ) );
		test.done();
	},
	
};
