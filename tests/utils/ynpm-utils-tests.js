
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

var ynpm_utils = require( '../../lib/utils/ynpm-utils' );
var path = require( 'path' );
var npm = require( 'npm' );
var grunt = require( 'grunt' );

module.exports.translateLegacyDependencyStructureTests = {
	
	noDependenciesStructureTest: function( unit ){
		
		var temp_src_dir = ynpm_utils.createTempDirSync();
		var temp_dest_dir = ynpm_utils.createTempDirSync();
		
		npm.load( function( ){
			npm.commands.install( temp_src_dir, 'lodash@2.4.0', function( ){

				ynpm_utils.translateLegacyDependencyStructure( temp_src_dir, temp_dest_dir );
				
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'lodash' ) ) );
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'lodash/2.4.0' ) ) );
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'lodash/2.4.0/package.json' ) ) );
				unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'lodash/2.4.0/node_modules' ) ) );
				
				grunt.file.delete( temp_src_dir, { force: true } );
				grunt.file.delete( temp_dest_dir, { force: true } );
				unit.done();
			} );
		} );
	},
	
	smallDependenciesStructureTest: function( unit ){
		
		var temp_src_dir = ynpm_utils.createTempDirSync();
		var temp_dest_dir = ynpm_utils.createTempDirSync();
		
		npm.load( function( ){
			npm.commands.install( temp_src_dir, 'has-ansi@1.0.0', function( ){

				ynpm_utils.translateLegacyDependencyStructure( temp_src_dir, temp_dest_dir );
				
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'has-ansi' ) ) );
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'has-ansi/1.0.0' ) ) );
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'has-ansi/1.0.0/package.json' ) ) );
				unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'has-ansi/1.0.0/node_modules' ) ) );
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'ansi-regex' ) ) );
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'ansi-regex/1.1.0' ) ) );
				unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'ansi-regex/1.1.0/package.json' ) ) );
				unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'ansi-regex/1.1.0/node_modules' ) ) );
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
	
	alreadyInstalledDependenciesStructureTest: function( unit ){
		
		var temp_src_dir = ynpm_utils.createTempDirSync();
		var temp_dest_dir = ynpm_utils.createTempDirSync();
		
		npm.load( function( ){
			npm.commands.install( temp_src_dir, 'has-ansi@1.0.0', function( ){
				npm.commands.install( temp_src_dir, 'get-stdin@1.0.0', function( ){

					ynpm_utils.translateLegacyDependencyStructure( temp_src_dir, temp_dest_dir );
					
					unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'has-ansi' ) ) );
					unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'has-ansi/1.0.0' ) ) );
					unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'has-ansi/1.0.0/package.json' ) ) );
					unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'has-ansi/1.0.0/node_modules' ) ) );
					unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'ansi-regex' ) ) );
					unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'ansi-regex/1.1.0' ) ) );
					unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'ansi-regex/1.1.0/package.json' ) ) );
					unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'ansi-regex/1.1.0/node_modules' ) ) );
					unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'get-stdin' ) ) );
					unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'get-stdin/1.0.0' ) ) );
					unit.ok( grunt.file.exists( path.join( temp_dest_dir, 'get-stdin/1.0.0/package.json' ) ) );
					unit.ok( !grunt.file.exists( path.join( temp_dest_dir, 'get-stdin/1.0.0/node_modules' ) ) );
					
					grunt.file.delete( temp_src_dir, { force: true } );
					grunt.file.delete( temp_dest_dir, { force: true } );
					unit.done();
				} );
			} );
		} );
	}
};

module.exports.npmInstallToDirTests = {
	
	installBadModule: function( unit ){
		
		var tempdir = ynpm_utils.createTempDirSync();
		
		ynpm_utils.npmInstallToDir( 'thismodulehadbetternoteverexist', tempdir, function( err ){
			unit.notEqual( err, null );
			
			grunt.file.delete( tempdir, { force: true } );
			unit.done();
		} );
	},
		
	installAnyLodash: function( unit ){
		
		var tempdir = ynpm_utils.createTempDirSync();
		
		ynpm_utils.npmInstallToDir( 'lodash', tempdir, function( err ){
			unit.equal( err, null );
			unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash' ) ) );
			unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash/package.json' ) ) );
			
			grunt.file.delete( tempdir, { force: true } );
			unit.done();
		} );
	},

	installSpecificLodash: function( unit ){
		
		var tempdir = ynpm_utils.createTempDirSync();
		
		ynpm_utils.npmInstallToDir( 'lodash@2.4.0', tempdir, function( err ){
			unit.equal( err, null );
			unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash' ) ) );
			unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash/package.json' ) ) );
			
			grunt.file.delete( tempdir, { force: true } );
			unit.done();
		} );
	},
	
	installFuzzyLodash: function( unit ){
		
		var tempdir = ynpm_utils.createTempDirSync();
		
		ynpm_utils.npmInstallToDir( 'lodash@~2.4.0', tempdir, function( err ){
			unit.equal( err, null );
			unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash' ) ) );
			unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash/package.json' ) ) );
			
			grunt.file.delete( tempdir, { force: true } );
			unit.done();
		} );
	},
	
	installRangeLodash: function( unit ){
		
		var tempdir = ynpm_utils.createTempDirSync();
		
		ynpm_utils.npmInstallToDir( 'lodash@2.0.0 - 2.4.0', tempdir, function( err ){
			unit.equal( err, null );
			unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash' ) ) );
			unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash/package.json' ) ) );
			
			grunt.file.delete( tempdir, { force: true } );
			unit.done();
		} );
	}
};

module.exports.npmInstallToDirSyncTests = {
	
	installBadModule: function( unit ){
		
		var tempdir = ynpm_utils.createTempDirSync();
		
		unit.throws( function(){
			ynpm_utils.npmInstallToDirSync( 'thismodulehadbetternoteverexist', tempdir );
		});
		
		grunt.file.delete( tempdir, { force: true } );
		unit.done();
	},
		
	installAnyLodash: function( unit ){
		
		var tempdir = ynpm_utils.createTempDirSync();
		
		ynpm_utils.npmInstallToDirSync( 'lodash', tempdir );
		
		unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash' ) ) );
		unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash/package.json' ) ) );
		
		grunt.file.delete( tempdir, { force: true } );
		unit.done();
	},

	installSpecificLodash: function( unit ){
		
		var tempdir = ynpm_utils.createTempDirSync();
		
		ynpm_utils.npmInstallToDirSync( 'lodash@2.4.0', tempdir );
		
		unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash' ) ) );
		unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash/package.json' ) ) );
		
		grunt.file.delete( tempdir, { force: true } );
		unit.done();
	},
	
	installFuzzyLodash: function( unit ){
		
		var tempdir = ynpm_utils.createTempDirSync();
		
		ynpm_utils.npmInstallToDirSync( 'lodash@~2.4.0', tempdir );
		
		unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash' ) ) );
		unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash/package.json' ) ) );
		
		grunt.file.delete( tempdir, { force: true } );
		unit.done();
	},
	
	installRangeLodash: function( unit ){
		
		var tempdir = ynpm_utils.createTempDirSync();
		
		ynpm_utils.npmInstallToDirSync( 'lodash@2.0.0 - 2.4.0', tempdir );
		
		unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash' ) ) );
		unit.ok( grunt.file.exists( path.join( tempdir, 'node_modules/lodash/package.json' ) ) );
		
		grunt.file.delete( tempdir, { force: true } );
		unit.done();
	}
};

