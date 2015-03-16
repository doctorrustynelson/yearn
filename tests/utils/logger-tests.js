
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

var logger = require( '../../lib/utils/logger' );
		
module.exports.loggerTests = {
	
	defaultLogger: function( unit ){
		unit.deepEqual( logger.getLOGGER( ), logger.getLOGGER( 'DEFAULT' ) );
		unit.deepEqual( logger.getLOGGER( '' ), logger.getLOGGER( 'DEFAULT' ) );
		unit.deepEqual( logger.getLOGGER( 'none' ), logger.getLOGGER( 'DEFAULT' ) );
		unit.deepEqual( logger.getLOGGER( 'off' ), logger.getLOGGER( 'DEFAULT' ) );
		unit.deepEqual( logger.getLOGGER( 'default' ), logger.getLOGGER( 'DEFAULT' ) );
		unit.done();
	},
	
	log4jsLogger: function( unit ){
		unit.notDeepEqual( logger.getLOGGER( 'log4js' ), logger.getLOGGER( 'DEFAULT' ) );
		unit.done();
	}
};