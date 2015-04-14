
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
var path_resolved = require.resolve( 'path' );
var raw_yearn = null;
var yearn = null;

module.exports.setUp = function( callback ){
	var original_resolver = module.constructor._resolveFilename;
	raw_yearn = require( '../lib/yearn' );
	yearn = require( '../lib/yearn' )({ 
		orgs: { 
			'': './node_modules',
			'test_modules': path.join( __dirname, 'node_modules' )
		},
		override: function( desired, parent ){
			console.log( 'Ignored require for ' + desired + ' and subsituting path.' );
			return original_resolver( 'path', parent );
		}
	} );
	callback( );
};

module.exports.tearDown = function( callback ){
	yearn.revert( );
	
	//wipe the cache of all yearn test node_modules
	Object.keys( require.cache ).forEach( function( item ){
		if( item.indexOf( path.resolve( __dirname, './node_modules' ) ) === 0){
			delete require.cache[ item ];
		}
	});
	
	callback( );
};

/*
module.exports.forceTest = function( test ){
	
	test.notStrictEqual( yearn._originalResolver, undefined, 'yearn._originalResolver is undefined when not overriding' );

	var new_yearn = raw_yearn({ 
		orgs: { 
			'': './node_modules',
			'test_modules': path.join( __dirname, 'node_modules' ) 
		},
		override: false
	}, true );
	
	test.strictEqual( new_yearn._originalResolver, undefined, 'yearn._originalResolver is undefined when not overriding' );
	test.notStrictEqual( new_yearn, yearn, 'Cached yearn returned on second require.' );
	
	test.done();
};
*/

module.exports.nativeRequireTests = {
		
	fullyQualifiedYearning: function( test ){
		
		var result = require( { org: 'test_modules', module: 'test-module-0', version: '0.0.1' } );
		
		test.strictEqual( path, result );
		test.done();
	},
	
	fullyQualifiedYearningWithSubYearning: function( test ){
		
		var result = require( { org: 'test_modules', module: 'test-module-1', version: '1.0.0' } );
		
		test.strictEqual( path, result );
		test.done();
	},
	
	fullyQualifiedYearningWithSubLegacyYearningWithSubLegacyYearningFallback: function( test ){
		
		var result = require( { org: 'test_modules', module: 'test-module-3', version: '1.1.0' } );
		
		test.strictEqual( path, result );
		test.done();
	},
	
	fullyQualifiedYearningWithNonRootSubYearning: function( test ){
		
		var result = require( { org: 'test_modules', module: 'test-module-2', version: '1.0.0' } );
		
		test.strictEqual( path, result );
		test.done();
	},
	
	fullyQualifiedYearningWithNonRootSubYearningAndProxy: function( test ){
		
		var result = require( { org: 'test_modules', module: 'test-module-2', version: '2.0.0' } );
		
		test.strictEqual( path, result );
		test.done();
	},
	
	nativeYearning: function( test ){
		
		var result = require( 'path' );
		
		test.strictEqual( path, result );
		test.done();
	},
	
	yearnYearning: function( test ){
		
		var result = require( 'yearn' );
		
		test.strictEqual( path, result );
		test.done();
	}
	
};

module.exports.nativeResolveTests = {
	
	fullyQualifiedYearning: function( test ){
		
		var result = require.resolve( { org: 'test_modules', module: 'test-module-0', version: '0.0.1' } );
		
		test.equal( path_resolved, result );
		test.done();
	},
	
	fullyQualifiedYearningWithSubYearning: function( test ){
		
		var result = require.resolve( { org: 'test_modules', module: 'test-module-1', version: '1.0.0' } );
		
		test.equal( path_resolved, result );
		test.done();
	},
	
	nativeYearning: function( test ){
		
		var result = require.resolve( 'path' );
		
		test.equal( path_resolved, result );
		test.done();
	}
	
};