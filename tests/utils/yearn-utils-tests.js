
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
var yearn_utils = require( '../../lib/utils/yearn-utils' )( require( '../../lib/utils/config' )( {} ) );

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

module.exports.constructYearningStringTests = {
	
	testLegacyYearning: function( unit ){
		unit.equal( yearn_utils.constructYearningString( { module: 'yearn' } ), 'yearn' );
		unit.done();
	},
	
	testDefaultOrgedYearning: function( unit ){
		unit.equal( yearn_utils.constructYearningString( { org: '', module: 'yearn' } ), '"default":yearn' );
		unit.done();
	},
	
	testNonDefaultOrgedYearning: function( unit ){
		unit.equal( yearn_utils.constructYearningString( { org: 'other', module: 'yearn' } ), 'other:yearn' );
		unit.done();
	},
	
	testVersionedYearning: function( unit ){
		unit.equal( yearn_utils.constructYearningString( { module: 'yearn', version: '0.4.0' } ), 'yearn@0.4.0' );
		unit.done();
	},
	
	testSemVersionedYearning: function( unit ){
		unit.equal( yearn_utils.constructYearningString( { module: 'yearn', version: '*' } ), 'yearn@*' );
		unit.done();
	},
	
	testFileYearning: function( unit ){
		unit.equal( yearn_utils.constructYearningString( { module: 'yearn', file: 'lib/yearn' } ), 'yearn/lib/yearn' );
		unit.done();
	},
	
	testFileAndVersionedYearning: function( unit ){
		unit.equal( yearn_utils.constructYearningString( { module: 'yearn', version: '0.4.0', file: 'lib/yearn' } ), 'yearn@0.4.0/lib/yearn' );
		unit.done();
	},
	
	testComplexYearning: function( unit ){
		unit.equal( yearn_utils.constructYearningString( { org: '', module: 'yearn', version: '0.4.0', file: 'lib/yearn' } ), '"default":yearn@0.4.0/lib/yearn' );
		unit.done();
	}
};

module.exports.extractYearningPartsTests = {
	testLegacyYearning: function( unit ){
		unit.deepEqual( yearn_utils.extractYearningParts( 'yearn' ), { org: undefined, module: 'yearn', version: undefined, file: undefined } );
		unit.done();
	},
	
	testNonDefaultOrgedYearning: function( unit ){
		unit.deepEqual( yearn_utils.extractYearningParts( 'other:yearn' ), { org: 'other', module: 'yearn', version: undefined, file: undefined } );
		unit.done();
	},
	
	testVersionedYearning: function( unit ){
		unit.deepEqual( yearn_utils.extractYearningParts( 'yearn@0.4.0' ), { org: undefined, module: 'yearn', version: '0.4.0', file: undefined } );
		unit.done();
	},
	
	testSemVersionedYearning: function( unit ){
		unit.deepEqual( yearn_utils.extractYearningParts( 'yearn@*' ), { org: undefined, module: 'yearn', version: '*', file: undefined } );
		unit.done();
	},
	
	testFileYearning: function( unit ){
		unit.deepEqual( yearn_utils.extractYearningParts( 'yearn/lib/yearn' ), { org: undefined, module: 'yearn', version: undefined, file: 'lib/yearn' } );
		unit.done();
	},
	
	testFileAndVersionedYearning: function( unit ){
		unit.deepEqual( yearn_utils.extractYearningParts( 'yearn@0.4.0/lib/yearn' ), { org: undefined, module: 'yearn', version: '0.4.0', file: 'lib/yearn' } );
		unit.done();
	},
	
	testComplexYearning: function( unit ){
		unit.deepEqual( yearn_utils.extractYearningParts( 'other:yearn@0.4.0/lib/yearn' ), { org: 'other', module: 'yearn', version: '0.4.0', file: 'lib/yearn' } );
		unit.done();
	}
};

module.exports.findPackageJsonLocationTests = {
	
	testCorrectDirectory: function( unit ){
		unit.equal( 
			yearn_utils.findPackageJsonLocation( path.resolve( __dirname, '../node_modules/test-module-2/1.0.0' ) ), 
			path.resolve( __dirname, '../node_modules/test-module-2/1.0.0/package.json' ) 
		);
		unit.done();
	},
	
	testChildDirectory: function( unit ){
		unit.equal( 
			yearn_utils.findPackageJsonLocation( path.resolve( __dirname, '../node_modules/test-module-2/1.0.0/lib' ) ), 
			path.resolve( __dirname, '../node_modules/test-module-2/1.0.0/package.json' ) 
		);
		unit.done();
	},
	
	testCorrectDirectory: function( unit ){
		unit.equal( 
			yearn_utils.findPackageJsonLocation( path.resolve( __dirname, '../node_modules/test-module-2/1.0.0' ) ), 
			path.resolve( __dirname, '../node_modules/test-module-2/1.0.0/package.json' ) 
		);
		unit.done();
	},
	
	testNoPackageJsonInNode_ModulesDirectory: function( unit ){
		unit.equal( 
			yearn_utils.findPackageJsonLocation( path.resolve( __dirname, '../node_modules' ) ), 
			null
		);
		unit.done();
	},
	
	testNoPackageJsonChildOfNode_ModulesDirectory: function( unit ){
		unit.equal( 
			yearn_utils.findPackageJsonLocation( path.resolve( __dirname, '../node_modules/test-module-2' ) ), 
			null 
		);
		unit.done();
	},
	
	testNoPackageJsonRootDirectory: function( unit ){
		unit.equal( 
			yearn_utils.findPackageJsonLocation( path.resolve( '/' ) ), 
			null
		);
		unit.done();
	},
	
	testNoPackageJsonChildOfRootDirectory: function( unit ){
		unit.equal( 
			yearn_utils.findPackageJsonLocation( path.resolve( require('os').tmpdir() ) ), 
			null
		);
		unit.done();
	},
};
