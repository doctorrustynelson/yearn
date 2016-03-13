
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

var core = require( '../lib/yearn-core' );
var path = require( 'path' );

module.exports.determineYearningPathTests = {
	
	setUp: function( callback ){
		core.init( require( '../lib/utils/config' )( { orgs: { '': path.resolve( __dirname, 'node_modules' ), 'test': path.resolve( __dirname, 'node_modules' ) } } ) );	
		callback( );
	},
	
	simpleYearning: function( test ){
	
		var result = core.determineYearningPath( { module: 'test-module-0' }, { id: path.resolve( __dirname, 'test-package.jsons', 'package.json' ) } );
		test.equal( result, path.resolve( __dirname, 'node_modules', 'test-module-0', '1.1.0' ) );
		
		test.done(  );
	},
	
	otherOrgYearning: function( test ){
		
		var result = core.determineYearningPath( { module: 'test-module-2' }, { id: path.resolve( __dirname, 'test-package.jsons', 'package.json' ) } );
		test.equal( result, path.resolve( __dirname, 'node_modules', 'test-module-2', '1.0.0' ) );
		
		test.done(  );
	},
	
	fileYearning: function( test ){
		
		var result = core.determineYearningPath( { module: 'test-module-0', file: 'package.json' }, { id: path.resolve( __dirname, 'test-package.jsons', 'package.json' ) } );
		test.equal( result, path.resolve( __dirname, 'node_modules', 'test-module-0', '1.1.0', 'package.json' ) );
		
		test.done(  );
	},
	
	legacyFileYearning: function( test ){
		
		core.init( require( '../lib/utils/config' )( { orgs: { '': path.resolve( __dirname, 'node_modules' ), 'test': path.resolve( __dirname, 'node_modules' ) }, legacy: true } ) );	
		var result = core.determineYearningPath( { module: 'npm', file: 'package.json' }, { id: path.resolve( __dirname, '..', 'package.json' ) } );
		test.equal( result, path.resolve( __dirname, '..', 'node_modules', 'npm', 'package.json' ) );
		
		test.done(  );
	},
	
	cachedModuleFileYearning: function( test ){
		
		var result1 = core.determineYearningPath( { module: 'test-module-0' }, { id: path.resolve( __dirname, 'test-package.jsons', 'package.json' ) } );
		test.equal( result1, path.resolve( __dirname, 'node_modules', 'test-module-0', '1.1.0' ) );
		
		var result2 = core.determineYearningPath( { module: 'test-module-0', file: 'package.json' }, { id: path.resolve( __dirname, 'test-package.jsons', 'package.json' ) } );
		test.equal( result2, path.resolve( __dirname, 'node_modules', 'test-module-0', '1.1.0', 'package.json' ) );
		
		test.done(  );
	},
	
	noPackage: function( test ){
		
		var result = core.determineYearningPath( { module: 'test-module-2' }, { id: path.resolve( '/' ) } );
		test.equal( result, path.resolve( __dirname, 'node_modules', 'test-module-2', '2.0.0' ) );
		
		test.done(  );
	},
	
	noKnowOrg: function( test ){
		
		var result = core.determineYearningPath( { module: 'test-module-3', version: '1.x.x' }, { id: path.resolve( __dirname, 'test-package.jsons', 'package.json' ) } );
		test.equal( result, path.resolve( __dirname, 'node_modules', 'test-module-3', '1.1.0' ) );
		
		test.done(  );
	},
	
	badOrg: function( test ){
		
		test.throws( function( ){
			core.determineYearningPath( { org: 'bad', module: 'test-module-3', version: '1.x.x' }, { id: path.resolve( __dirname, 'test-package.jsons', 'package.json' ) } );
		} );
		
		test.done(  );
	},
	
	moduleDoesNotExist: function( test ){
		
		test.throws( function( ){
			core.determineYearningPath( { org: '', module: 'test-module-4', version: '1.x.x' }, { id: path.resolve( __dirname, 'test-package.jsons', 'package.json' ) } );
		} );
		
		test.done(  );
	},
	
	noKnowVersion: function( test ){
		
		var result = core.determineYearningPath( { module: 'test-module-3' }, { id: path.resolve( __dirname, 'test-package.jsons', 'package.json' ) } );
		test.equal( result, path.resolve( __dirname, 'node_modules', 'test-module-3', '1.1.0' ) );
		
		test.done(  );
	}
};
