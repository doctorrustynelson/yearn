
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

module.exports.shrinkwrapCommandTests = {
	
	shrinkwrapDTest: function( test ){
		
		require( '../lib/ynpm' )( { 
			orgs: {
                '': './node_modules',
                '*': path.resolve( __dirname, 'test-orgs/*' ),
                'other': path.resolve( __dirname, 'test-other-org' )
            },
            loose_semver: true
        }, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			ynpm.commands.shrinkwrap( path.resolve( __dirname, './test-orgs/alphabet/D/0.1.0' ) , {}, function( err, shrinkwrap ){
				test.strictEqual( err, null, 'No errors in shrinkwrap command.' );
				test.deepEqual( shrinkwrap, {
                    "version": "0.1.0",
                    "dependencies": {
                            "alphabet:C": {
                                    "version": "0.0.1",
                                    "dependencies": {
                                            "alphabet:A": "0.1.0"
                                    },
                                    "name": "C"
                            },
                            "alphabet:B": {
                                    "version": "0.1.0",
                                    "dependencies": {
                                            "alphabet:A": "0.0.2"
                                    },
                                    "name": "B"
                            }
                    },
                    "name": "D"
                } )
				test.done();
			} );
		} );
	},
};