
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

var ynpm_utils = null;
var path = require( 'path' );

module.exports.setUp = function( callback ){
	// Tests don't require npm
		
	ynpm_utils = require( '../../lib/utils/ynpm-utils' )( { 
            orgs: {
                '': './node_modules',
                '*': path.resolve( __dirname, '../test-orgs/*' ),
                'other': path.resolve( __dirname, '../test-other-org' )
            } 
        }, { /* npm */ } );
	callback( );
};

module.exports.findOrgsTests = {
    
    findOrgsNoneTest: function( unit ){
        unit.deepEqual( 
            ynpm_utils.findOrgs( 'missing', path.resolve( __dirname, '..' ) ),
            [ ]
        );
        
        unit.done( );
    },
    
    findOrgsATest: function( unit ){
        unit.deepEqual( 
            ynpm_utils.findOrgs( 'A', path.resolve( __dirname, '..' ) ),
            [ 'alphabet' ]
        );
        
        unit.done( );
    },
    
    findOrgsBTest: function( unit ){
        unit.deepEqual( 
            ynpm_utils.findOrgs( 'B', path.resolve( __dirname, '..' ) ),
            [ 'alphabet' ]
        );
        
        unit.done( );
    },
    
    findOrgsJson5Test: function( unit ){
        unit.deepEqual( 
            ynpm_utils.findOrgs( 'json5', path.resolve( __dirname, '..' ) ),
            [ 'other' ]
        );
        
        unit.done( );
    },
    
    findOrgsTestModule1Test: function( unit ){
        unit.deepEqual( 
            ynpm_utils.findOrgs( 'test-module-1', path.resolve( __dirname, '..' ) ),
            [ '' ]
        );
        
        unit.done( );
    },
    
    findOrgsTestModule3Test: function( unit ){
        unit.deepEqual( 
            ynpm_utils.findOrgs( 'test-module-3', path.resolve( __dirname, '..' ) ),
            [ '' ]
        );
        
        unit.done( );
    },
    
};


