
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
var grunt = require( 'grunt' );
var fs = require( 'fs' );

var npm_utils = require( '../../lib/utils/npm-utils' );

module.exports.getLatestVersionTests = {
	
	nodeunit: function( unit ){
		ynpm_utils = require( '../../lib/utils/ynpm-utils' )( require( '../../lib/utils/config')( {} ) );
		
		ynpm_utils.getLatestVersionOf( 'nodeunit', function( err, version ){
			unit.equal( err, null, 'No error on callback.' );
			unit.notEqual( version, undefined, 'Version defined.' );
			unit.done();
		} );
		
	},

	yearn: function( unit ){
		ynpm_utils = require( '../../lib/utils/ynpm-utils' )( require( '../../lib/utils/config')( {} ) );
		
		ynpm_utils.getLatestVersionOf( 'yearn', function( err, version ){
			unit.equal( err, null, 'No error on callback.' );
			unit.notEqual( version, undefined, 'Version defined.' );
			unit.done();
		} );
	},
	
	moduleThatShouldNeverExist: function( unit ){
		ynpm_utils = require( '../../lib/utils/ynpm-utils' )( require( '../../lib/utils/config')( {} ) );
		
		ynpm_utils.getLatestVersionOf( 'modulethatshouldneverexist', function( err, version ){
			unit.notEqual( err, null, 'Error on callback' );
			unit.equal( version, undefined, 'No version when error.' );
			unit.done();
		} );
	}	
};


module.exports.translateLegacyDependencyStructureTests = {
		
	badPathTest: function( unit ){
		var temp_src_dir = '/one/bad/path';
		var temp_dest_dir = '/another/bad/path';
		
		ynpm_utils = require( '../../lib/utils/ynpm-utils' )( require( '../../lib/utils/config')( { orgs: { '': temp_dest_dir } } ) );
		
		unit.ok( !ynpm_utils.translateLegacyDependencyStructure( temp_src_dir, '', '', '' ), 'Failed with bad path.' );
		unit.done();
	},
	
	noDependenciesStructureTest: function( unit ){
		var temp_src_dir = ynpm_utils.createTempDirSync();
		var temp_dest_dir = ynpm_utils.createTempDirSync();
		
		ynpm_utils = require( '../../lib/utils/ynpm-utils' )( require( '../../lib/utils/config')( { orgs: { '': temp_dest_dir } } ) );
		
		npm_utils.installToDir( 'lodash@2.4.0', temp_src_dir, {}, ( err ) => {
			unit.equal( err, null, 'No error on setup callback' );

			ynpm_utils.translateLegacyDependencyStructure( temp_src_dir, '', 'lodash', '' );
			
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'lodash' ) ), 'Found lodash@2.4.0 module directory.' );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'lodash/2.4.0' ) ), 'Found lodash@2.4.0 version directory.' );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'lodash/2.4.0/package.json' ) ), 'Found lodash@2.4.0 package.json.' );
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'lodash/2.4.0/node_modules' ) ), 'Did not find node_modules folder under lodash@2.4.0.' );
			
			grunt.file.delete( temp_src_dir, { force: true } );
			grunt.file.delete( temp_dest_dir, { force: true } );
			unit.done();
		} );
	},
	
	
	smallDependenciesStructureTest: function( unit ){
		var temp_src_dir = ynpm_utils.createTempDirSync();
		var temp_dest_dir = ynpm_utils.createTempDirSync();
		
		ynpm_utils = require( '../../lib/utils/ynpm-utils' )( require( '../../lib/utils/config')( { orgs: { '': temp_dest_dir } } ) );
		
		npm_utils.installToDir( 'has-ansi@1.0.0', temp_src_dir, {}, ( err ) => {
			unit.equal( err, null, 'No error on setup callback' );

			ynpm_utils.translateLegacyDependencyStructure( temp_src_dir, '', 'has-ansi', '' );
			
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'has-ansi' ) ), 'Found has-ansi@1.0.0 module directory.' );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'has-ansi/1.0.0' ) ), 'Found has-ansi@1.0.0 version directory.' );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'has-ansi/1.0.0/package.json' ) ), 'Found has-ansi@1.0.0 package.json.' );
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'has-ansi/1.0.0/node_modules' ) ), 'Did not find node_modules folder under has-ansi@1.0.0.' );
			
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'ansi-regex' ) ), 'Found has-ansi module directory.' );
			
			var ansi_regex_versions = fs.readdirSync( path.join( temp_dest_dir, 'ansi-regex' ) );
			unit.ok( ansi_regex_versions.length === 1, 'One version of ansi-regex is installed.' );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'ansi-regex', ansi_regex_versions[0] ) ), 'Found ansi-regex@X version directory.' );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'ansi-regex', ansi_regex_versions[0], 'package.json' ) ), 'Found ansi-regex@X package.json directory.' );
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'ansi-regex', ansi_regex_versions[0], 'node_modules' ) ), 'Did not find node_modules folder under ansi-regex@X.' );
			
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'get-stdin' ) ), 'Found get-stdin@1.0.0 module directory.' );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'get-stdin/1.0.0' ) ), 'Found get-stdin@1.0.0 version directory.' );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'get-stdin/1.0.0/package.json' ) ), 'Found get-stdin@1.0.0 package.json.' );
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'get-stdin/1.0.0/node_modules' ) ), 'Did not find node_modules folder under get-stdin@1.0.0.' );
			
			grunt.file.delete( temp_src_dir, { force: true } );
			grunt.file.delete( temp_dest_dir, { force: true } );
			unit.done();
		} );
	},
	
	alreadyInstalledDependenciesStructureTest: function( unit ){
		var temp_src_dir = ynpm_utils.createTempDirSync();
		var temp_dest_dir = ynpm_utils.createTempDirSync();
		
		ynpm_utils = require( '../../lib/utils/ynpm-utils' )( require( '../../lib/utils/config')( { orgs: { '': temp_dest_dir } } ) );
		
		npm_utils.installToDir( 'has-ansi@1.0.0', temp_src_dir, {}, ( err ) => {
			unit.equal( err, null, 'No error on setup callback' );
			npm_utils.installToDir( 'get-stdin@1.0.0', temp_src_dir, {}, ( err ) => {
				unit.equal( err, null, 'No error on setup callback' );

				ynpm_utils.translateLegacyDependencyStructure( temp_src_dir, '', 'has-ansi', '' );
				
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'has-ansi' ) ), 'Found has-ansi@1.0.0 module directory.' );
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'has-ansi/1.0.0' ) ), 'Found has-ansi@1.0.0 version directory.' );
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'has-ansi/1.0.0/package.json' ) ), 'Found has-ansi@1.0.0 package.json.' );
				unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'has-ansi/1.0.0/node_modules' ) ), 'Did not find node_modules folder under has-ansi@1.0.0.' );
				
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'ansi-regex' ) ), 'Found has-ansi module directory.' );
				
				var ansi_regex_versions = fs.readdirSync( path.join( temp_dest_dir, 'ansi-regex' ) );
				unit.ok( ansi_regex_versions.length === 1, 'One version of ansi-regex is installed.' );
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'ansi-regex', ansi_regex_versions[0] ) ), 'Found ansi-regex@X version directory.' );
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'ansi-regex', ansi_regex_versions[0], 'package.json' ) ), 'Found ansi-regex@X package.json directory.' );
				unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'ansi-regex', ansi_regex_versions[0], 'node_modules' ) ), 'Did not find node_modules folder under ansi-regex@X.' );
				
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'get-stdin' ) ), 'Found get-stdin@1.0.0 module directory.' );
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'get-stdin/1.0.0' ) ), 'Found get-stdin@1.0.0 version directory.' );
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'get-stdin/1.0.0/package.json' ) ), 'Found get-stdin@1.0.0 package.json.' );
				unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'get-stdin/1.0.0/node_modules' ) ), 'Did not find node_modules folder under get-stdin@1.0.0.' );
				
				grunt.file.delete( temp_src_dir, { force: true } );
				grunt.file.delete( temp_dest_dir, { force: true } );
				unit.done();
			} );
		} );
	},
	
	alternatePrimeDestinationTest: function( unit ){
		
		var temp_src_dir = ynpm_utils.createTempDirSync();
		var temp_dest_dir = ynpm_utils.createTempDirSync();
		var alt_dest_dir = ynpm_utils.createTempDirSync();
		
		ynpm_utils = require( '../../lib/utils/ynpm-utils' )( require( '../../lib/utils/config')( { orgs: { '': temp_dest_dir, 'alt': alt_dest_dir } } ) );
		
		npm_utils.installToDir( 'has-ansi@1.0.0', temp_src_dir, {}, ( err ) => {
			unit.equal( err, null, 'No error on setup callback' );

			ynpm_utils.translateLegacyDependencyStructure( temp_src_dir , 'alt', 'has-ansi', '' );
			
			unit.ok( grunt.file.exists( path.join( alt_dest_dir, 'has-ansi' ) ), 'Found has-ansi@1.0.0 module directory under alt org.' );
			unit.ok( grunt.file.exists( path.join( alt_dest_dir, 'has-ansi/1.0.0' ) ), 'Found has-ansi@1.0.0 version directory under alt org.' );
			unit.ok( grunt.file.exists( path.join( alt_dest_dir, 'has-ansi/1.0.0/package.json' ) ), 'Found has-ansi@1.0.0 package.json under alt org.' );
			unit.ok( !grunt.file.exists( path.join( alt_dest_dir, 'has-ansi/1.0.0/node_modules' ) ), 'Did not find node_modules folder under alt:has-ansi@1.0.0.' );
				
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'has-ansi' ) ), 'Did not find has-ansi@1.0.0 module directory under default org.' );
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'has-ansi/1.0.0' ) ), 'Did not find has-ansi@1.0.0 version directory under default org.' );
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'has-ansi/1.0.0/package.json' ) ), 'Did not find has-ansi@1.0.0 package.json under default org.' );
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'has-ansi/1.0.0/node_modules' ) ), 'Did not find has-ansi@1.0.0 node_modules directory under default org.' );
			
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'ansi-regex' ) ), 'Found has-ansi@1.0.0 module directory under default org.' );

			var ansi_regex_versions = fs.readdirSync( path.join( temp_dest_dir, 'ansi-regex' ) );
			unit.ok( ansi_regex_versions.length === 1, 'One version of ansi-regex is installed under default org.' );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'ansi-regex', ansi_regex_versions[0] ) ), 'Found ansi-regex@X version directory under default org.' );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'ansi-regex', ansi_regex_versions[0], 'package.json' ) ), 'Found ansi-regex@X package.json directory under default org.' );
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'ansi-regex', ansi_regex_versions[0], 'node_modules' ) ), 'Did not find node_modules folder under ansi-regex@X under default org.' );
			
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'get-stdin' ) ), 'Found get-stdin@1.0.0 module directory under default org.' );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'get-stdin/1.0.0' ) ), 'Found get-stdin@1.0.0 version directory under default org.' );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'get-stdin/1.0.0/package.json' ) ), 'Found get-stdin@1.0.0 package.json under default org.' );
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'get-stdin/1.0.0/node_modules' ) ), 'Did not find node_modules folder under get-stdin@1.0.0 under default org.' );
				
			grunt.file.delete( temp_src_dir, { force: true } );
			grunt.file.delete( temp_dest_dir, { force: true } );
			unit.done();
		} );
	}
	
};


module.exports.translateLegacyDependencyStructureWithAliasesTests = {
		
	badPathTest: function( unit ){
		var temp_src_dir = '/one/bad/path';
		var temp_dest_dir = '/another/bad/path';
		
		var config = require( '../../lib/utils/config')( { 
			orgs: { '': temp_dest_dir }, 
			aliases: [{
				from: { module: 'lodash' },
				to: { module: 'lodown' }
			}]
		} );
		
		ynpm_utils = require( '../../lib/utils/ynpm-utils' )( config  );
		
		unit.ok( !ynpm_utils.translateLegacyDependencyStructure( temp_src_dir, '', '', '' ), 'Failed with bad path.' );
		unit.done();
	},
	
	noDependenciesStructureTest: function( unit ){
		var temp_src_dir = ynpm_utils.createTempDirSync();
		var temp_dest_dir = ynpm_utils.createTempDirSync();
		
		var config = require( '../../lib/utils/config')( { 
			orgs: { '': temp_dest_dir }, 
			aliases: [{
				from: { module: 'lodash' },
				to: { module: 'lodown' }
			}]
		} );
		
		ynpm_utils = require( '../../lib/utils/ynpm-utils' )( config );
		
		npm_utils.installToDir( 'lodash@2.4.0', temp_src_dir, {}, ( err ) => {
			unit.equal( err, null, 'No error on setup callback' );

			ynpm_utils.translateLegacyDependencyStructure( temp_src_dir, '', 'lodash', '' );
			
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'lodash' ) ) );
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'lodash/2.4.0' ) ) );
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'lodash/2.4.0/package.json' ) ) );
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'lodash/2.4.0/node_modules' ) ) );
			
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'lodown' ) ) );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'lodown/2.4.0' ) ) );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'lodown/2.4.0/package.json' ) ) );
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'lodown/2.4.0/node_modules' ) ) );
			
			grunt.file.delete( temp_src_dir, { force: true } );
			grunt.file.delete( temp_dest_dir, { force: true } );
			unit.done();
		} );
	},
	
	smallDependenciesStructureTest: function( unit ){
		var temp_src_dir = ynpm_utils.createTempDirSync();
		var temp_dest_dir = ynpm_utils.createTempDirSync();
		
		var config = require( '../../lib/utils/config')( { 
			orgs: { '': temp_dest_dir }, 
			aliases: [{
				from: { module: 'ansi-regex' },
				to: { module: 'ansi-regularexpression' }
			}]
		} );
		
		ynpm_utils = require( '../../lib/utils/ynpm-utils' )( config );
		
		npm_utils.installToDir( 'has-ansi@1.0.0', temp_src_dir, {}, ( err ) => {
			unit.equal( err, null, 'No error on setup callback' );

			ynpm_utils.translateLegacyDependencyStructure( temp_src_dir, '', 'has-ansi', '' );
			
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'has-ansi' ) ) );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'has-ansi/1.0.0' ) ) );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'has-ansi/1.0.0/package.json' ) ) );
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'has-ansi/1.0.0/node_modules' ) ) );
			
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'ansi-regex' ) ) );
			
			var ansi_regex_versions = fs.readdirSync( path.join( temp_dest_dir, 'ansi-regularexpression' ) );
			unit.ok( ansi_regex_versions.length === 1 );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'ansi-regularexpression' ) ) );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'ansi-regularexpression', ansi_regex_versions[0] ) ) );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'ansi-regularexpression', ansi_regex_versions[0], 'package.json' ) ) );
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'ansi-regularexpression', ansi_regex_versions[0], 'node_modules' ) ) );
			
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'get-stdin' ) ) );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'get-stdin/1.0.0' ) ) );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'get-stdin/1.0.0/package.json' ) ) );
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'get-stdin/1.0.0/node_modules' ) ) );
			
			grunt.file.delete( temp_src_dir, { force: true } );
			grunt.file.delete( temp_dest_dir, { force: true } );
			unit.done();
		} );

	},
	
	alreadyInstalledDependenciesStructureTest: function( unit ){
		var temp_src_dir = ynpm_utils.createTempDirSync();
		var temp_dest_dir = ynpm_utils.createTempDirSync();
		
		var config = require( '../../lib/utils/config')( { 
			orgs: { '': temp_dest_dir }, 
			aliases: [{
				from: { module: 'ansi-regex' },
				to: { module: 'ansi-regularexpression' }
			}]
		} );
		
		ynpm_utils = require( '../../lib/utils/ynpm-utils' )( config );
		
		npm_utils.installToDir( 'has-ansi@1.0.0', temp_src_dir, {}, ( err ) => {
			unit.equal( err, null, 'No error on setup callback' );
			npm_utils.installToDir( 'get-stdin@1.0.0', temp_src_dir, {}, ( err ) => {
				unit.equal( err, null, 'No error on setup callback' );

				ynpm_utils.translateLegacyDependencyStructure( temp_src_dir, '', 'has-ansi', '' );
				
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'has-ansi' ) ) );
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'has-ansi/1.0.0' ) ) );
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'has-ansi/1.0.0/package.json' ) ) );
				unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'has-ansi/1.0.0/node_modules' ) ) );
				
				unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'ansi-regex' ) ) );
			
				var ansi_regex_versions = fs.readdirSync( path.join( temp_dest_dir, 'ansi-regularexpression' ) );
				unit.ok( ansi_regex_versions.length === 1 );
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'ansi-regularexpression' ) ) );
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'ansi-regularexpression', ansi_regex_versions[0] ) ) );
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'ansi-regularexpression', ansi_regex_versions[0], 'package.json' ) ) );
				unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'ansi-regularexpression', ansi_regex_versions[0], 'node_modules' ) ) );
				
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'get-stdin' ) ) );
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'get-stdin/1.0.0' ) ) );
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'get-stdin/1.0.0/package.json' ) ) );
				unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'get-stdin/1.0.0/node_modules' ) ) );
				
				grunt.file.delete( temp_src_dir, { force: true } );
				grunt.file.delete( temp_dest_dir, { force: true } );
				unit.done();
			} );
		} );
	},
	
	alternatePrimeDestinationTest: function( unit ){
		
		var temp_src_dir = ynpm_utils.createTempDirSync();
		var temp_dest_dir = ynpm_utils.createTempDirSync();
		var alt_dest_dir = ynpm_utils.createTempDirSync();
		
		var config = require( '../../lib/utils/config')( { 
			orgs: { '': temp_dest_dir, 'alt': alt_dest_dir }, 
			aliases: [{
				from: { module: 'ansi-regex' },
				to: { module: 'ansi-regularexpression' }
			}]
		} );
		
		ynpm_utils = require( '../../lib/utils/ynpm-utils' )( config );
		
		npm_utils.installToDir( 'has-ansi@1.0.0', temp_src_dir, {}, ( err ) => {
			unit.equal( err, null, 'No error on setup callback' );

			ynpm_utils.translateLegacyDependencyStructure( temp_src_dir, 'alt', 'has-ansi', '' );
				
			unit.ok( grunt.file.exists( path.join( alt_dest_dir, 'has-ansi' ) ) );
			unit.ok( grunt.file.exists( path.join( alt_dest_dir, 'has-ansi/1.0.0' ) ) );
			unit.ok( grunt.file.exists( path.join( alt_dest_dir, 'has-ansi/1.0.0/package.json' ) ) );
			unit.ok( !grunt.file.exists( path.join( alt_dest_dir, 'has-ansi/1.0.0/node_modules' ) ) );
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'has-ansi' ) ) );
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'has-ansi/1.0.0' ) ) );
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'has-ansi/1.0.0/package.json' ) ) );
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'has-ansi/1.0.0/node_modules' ) ) );
			
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'ansi-regex' ) ) );
			
			var ansi_regex_versions = fs.readdirSync( path.join( temp_dest_dir, 'ansi-regularexpression' ) );
			unit.ok( ansi_regex_versions.length === 1 );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'ansi-regularexpression' ) ) );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'ansi-regularexpression', ansi_regex_versions[0] ) ) );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'ansi-regularexpression', ansi_regex_versions[0], 'package.json' ) ) );
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'ansi-regularexpression', ansi_regex_versions[0], 'node_modules' ) ) );
				
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'get-stdin' ) ) );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'get-stdin/1.0.0' ) ) );
			unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'get-stdin/1.0.0/package.json' ) ) );
			unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'get-stdin/1.0.0/node_modules' ) ) );
				
			grunt.file.delete( temp_src_dir, { force: true } );
			grunt.file.delete( temp_dest_dir, { force: true } );
			unit.done();
		} );
	}
};

module.exports.npmInstallToDirTests = {
	
	installBadModule: function( unit ){
		
		ynpm_utils = require( '../../lib/utils/ynpm-utils' )( require( '../../lib/utils/config')( { } ) );
		
		var tempdir = ynpm_utils.createTempDirSync();
		
		ynpm_utils.npmInstallToDir( 'thismodulehadbetternoteverexist', tempdir, function( err ){
			unit.notEqual( err, null, 'Error on callback.' );
			
			grunt.file.delete( tempdir, { force: true } );
			unit.done();
		} );
	},
		
	installAnyLodash: function( unit ){
		
		ynpm_utils = require( '../../lib/utils/ynpm-utils' )( require( '../../lib/utils/config')( { } ) );
		
		var tempdir = ynpm_utils.createTempDirSync();
		
		ynpm_utils.npmInstallToDir( 'lodash', tempdir, function( err ){
			unit.equal( err, null, 'No error on callback.' );
			unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash' ) ), 'lodash folder found.' );
			unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash/package.json' ) ), 'lodash package.json found.' );
			
			grunt.file.delete( tempdir, { force: true } );
			unit.done();
		} );
	},

	installSpecificLodash: function( unit ){
		
		ynpm_utils = require( '../../lib/utils/ynpm-utils' )( require( '../../lib/utils/config')( { } ) );
		
		var tempdir = ynpm_utils.createTempDirSync();
		
		ynpm_utils.npmInstallToDir( 'lodash@2.4.0', tempdir, function( err ){
			unit.equal( err, null, 'No error on callback.' );
			unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash' ) ), 'lodash folder found.' );
			unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash/package.json' ) ), 'lodash package.json found.' );
			
			grunt.file.delete( tempdir, { force: true } );
			unit.done();
		} );
	},
	
	installFuzzyLodash: function( unit ){
		
		ynpm_utils = require( '../../lib/utils/ynpm-utils' )( require( '../../lib/utils/config')( { } ) );
		
		var tempdir = ynpm_utils.createTempDirSync();
		
		ynpm_utils.npmInstallToDir( 'lodash@~2.4.0', tempdir, function( err ){
			unit.equal( err, null, 'No error on callback.' );
			unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash' ) ), 'lodash folder found.' );
			unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash/package.json' ) ), 'lodash package.json found.' );
			
			grunt.file.delete( tempdir, { force: true } );
			unit.done();
		} );
	},
	
	installRangeLodash: function( unit ){
		
		ynpm_utils = require( '../../lib/utils/ynpm-utils' )( require( '../../lib/utils/config')( { } ) );
		
		var tempdir = ynpm_utils.createTempDirSync();
		
		ynpm_utils.npmInstallToDir( 'lodash@2.0.0 - 2.4.0', tempdir, function( err ){
			unit.equal( err, null, 'No error on callback.' );
			unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash' ) ), 'lodash folder found.' );
			unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash/package.json' ) ), 'lodash package.json found.' );
			
			grunt.file.delete( tempdir, { force: true } );
			unit.done();
		} );
	}
};

