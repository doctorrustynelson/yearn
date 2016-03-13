
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
		
	ynpm_utils = require( '../../lib/utils/ynpm-utils' )( require( '../../lib/utils/config' )( { 
            orgs: {
                '': './node_modules',
                '*': path.resolve( __dirname, '../test-orgs/*' ),
                'other': path.resolve( __dirname, '../test-other-org' )
            },
            loose_semver: true
        } ) );
	callback( );
};

module.exports.findOrgsTests = {
    
    findOrgsNoneTest: function( unit ){
        ynpm_utils.findOrgs( 'missing', path.resolve( __dirname, '..' ), function( orgs ){
            unit.deepEqual( orgs, [ ] );
            unit.done( );
        } );
    },
    
    findOrgsATest: function( unit ){
        ynpm_utils.findOrgs( 'A', path.resolve( __dirname, '..' ), function( orgs ){
            unit.deepEqual( orgs, [ 'alphabet' ] );
            unit.done( );
        } );
    },
    
    findOrgsBTest: function( unit ){
        ynpm_utils.findOrgs( 'B', path.resolve( __dirname, '..' ), function( orgs ){
            unit.deepEqual( orgs, [ 'alphabet' ] );
            unit.done( );
        } );
    },
    
    findOrgsJson5Test: function( unit ){
        ynpm_utils.findOrgs( 'json5', path.resolve( __dirname, '..' ), function( orgs ){
            unit.deepEqual( orgs, [ 'other' ] );
            unit.done( );
        } );
    },
    
    findOrgsTestModule1Test: function( unit ){
        ynpm_utils.findOrgs( 'test-module-1', path.resolve( __dirname, '..' ), function( orgs ){
            unit.deepEqual( orgs, [ '' ] );
            unit.done( );
        } );
    },
    
    findOrgsTestModule3Test: function( unit ){
        ynpm_utils.findOrgs( 'test-module-3', path.resolve( __dirname, '..' ), function( orgs ){
            unit.deepEqual( orgs, [ '' ] );
            unit.done( );
        } );
    }
    
};

module.exports.findVersionsTests = {
    
    findVersionsNoneTest: function( unit ){
        ynpm_utils.findVersions( 'alphabet', 'missing', path.resolve( __dirname, '..' ), function( versions ){
            unit.deepEqual( versions, [ ] );
            unit.done( );
        } );
    },
    
    findVersionsATest: function( unit ){
        ynpm_utils.findVersions( 'alphabet', 'A', path.resolve( __dirname, '..' ), function( versions ){
            unit.deepEqual( versions, [ '0.0.1', '0.0.2', '0.1.0' ] );
            unit.done( );
        } );
    },
    
    findVersionsBTest: function( unit ){
        ynpm_utils.findVersions( 'alphabet', 'B', path.resolve( __dirname, '..' ), function( versions ){
            unit.deepEqual( versions, [ '0.0.1', '0.0.2', '0.1.0' ] );
            unit.done( );
        } );
    },
    
    findVersionsJson5Test: function( unit ){
        ynpm_utils.findVersions( 'other', 'json5', path.resolve( __dirname, '..' ), function( versions ){
            unit.deepEqual( versions, [ '0.0.1' ] );
            unit.done( );
        } );
    },
    
    findVersionsTestModule1Test: function( unit ){
        ynpm_utils.findVersions( '', 'test-module-1', path.resolve( __dirname, '..' ), function( versions ){
            unit.deepEqual( versions, [ '1.0.0' ] );
            unit.done( );
        } );
    },
    
    findVersionsTestModule3Test: function( unit ){
        ynpm_utils.findVersions( '', 'test-module-3', path.resolve( __dirname, '..' ), function( versions ){
            unit.deepEqual( versions, [ '1.1.0', '2015.01.01-1' ] );
            unit.done( );
        } );
    }
};

module.exports.findMatchingVersionsTests = {
    
    findMatchingVersionsNoneTest: function( unit ){
        ynpm_utils.findMatchingVersions( 'alphabet', 'missing', '*', path.resolve( __dirname, '..' ), function( versions ){
            unit.deepEqual( versions, [ ] );
            unit.done( );
        } );
    },
    
    findMatchingVersionsATest: function( unit ){
        ynpm_utils.findMatchingVersions( 'alphabet', 'A', '*', path.resolve( __dirname, '..' ), function( versions ){
            unit.deepEqual( versions, [ '0.0.1', '0.0.2', '0.1.0' ] );
            unit.done( );
        } );
    },
    
    findMatchingVersionsBTest: function( unit ){
        ynpm_utils.findMatchingVersions( 'alphabet', 'B', '>=0.1.0', path.resolve( __dirname, '..' ), function( versions ){
            unit.deepEqual( versions, [ '0.1.0' ] );
            unit.done( );
        } );
    },
    
    findMatchingVersionsJson5Test: function( unit ){
        ynpm_utils.findMatchingVersions( 'other', 'json5', '0.1.x', path.resolve( __dirname, '..' ), function( versions ){
            unit.deepEqual( versions, [ ] );
            unit.done( );
        } );
    },
    
    findMatchingVersionsTestModule1Test: function( unit ){
        ynpm_utils.findMatchingVersions( '', 'test-module-1', '*', path.resolve( __dirname, '..' ), function( versions ){
            unit.deepEqual( versions, [ '1.0.0' ] );
            unit.done( );
        } );
    },
    
    findMatchingVersionsTestModule3Test: function( unit ){
        ynpm_utils.findMatchingVersions( '', 'test-module-3', '*', path.resolve( __dirname, '..' ), function( versions ){
            unit.deepEqual( versions,  [ '1.1.0' /*, '2015.01.01-1' // Doesn't find this because of semver validation of prerelease tags */ ] );
            unit.done( );
        } );
    }
};