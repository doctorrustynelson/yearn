/**
 * New node file
 */

var fs = require( 'fs-extra' );
var path = require( 'path' );
var npm = require( 'npm' );
var deasync = require( 'deasync' );
var temp = require( 'temp' );

module.exports = function( config ){

	var LOGGER = require( './logger' )( config.log_level || 'WARN', 'ynpm' );
	var nutils = {};
	
	nutils.createTempDirSync = function( ){
		return temp.mkdirSync( );
	};
	
	nutils.deleteRecursiveSync = function( file ){
		fs.removeSync( file );
	};

	nutils.npmInstallToDir = function( module, dest, callback ){
		npm.load( function( ){
			npm.commands.install( dest, module, callback );
		});
	};
	
	nutils.getLatestVersionOf = function( module ){
		var done = false;
		var latest_version = null;
		
		npm.load( function( ){
			npm.commands.view( [ module, 'version' ], true, function( err, result ){
				if( err !== null)
					latest_version = null;
				else
					latest_version = Object.keys( result )[ 0 ];
				done = true;
			} );
		} );
		
		while( !done ){
			deasync.runLoopOnce();
		}
		
		return latest_version;
	};
	
	nutils.npmInstallToDirSync = function( module, dest ){
		var done = false;
		var error = false;
		
		npm.load( function( ){
			npm.commands.install( dest, module, function( err ){
				if( err ){
					error = true;
				}
				done = true;
			});
		});
		
		while( done === false ){
			deasync.runLoopOnce();
		}
		
		if( error ){
			throw new Error( 'Failed to download module ' + module + '.' );
		}
	};

	nutils.translateLegacyDependencyStructure = function( src_root, dest_primary_root, dest_secondary_root ){

		if( !fs.existsSync( src_root ) ) {
			LOGGER.warn( src_root + ' does not exist.' );
			return false;
		}

		if( fs.existsSync( path.join( src_root, 'node_modules' ) ) ) {
			var dependencies = fs.readdirSync( path.join( src_root, 'node_modules' ) );
			dependencies.forEach( function( dependency ){
				nutils.translateLegacyDependencyStructure( 
					path.join( src_root, 'node_modules', dependency ), 
					dest_secondary_root, 
					dest_secondary_root
				);
			} );
		}

		if( !fs.existsSync( path.join( src_root, 'package.json' ) ) ) {
			LOGGER.warn( src_root + ' does not contain a package.json and thus is not a module.' );
			return true;
		}

		var package_json = JSON.parse( fs.readFileSync( path.join( src_root, 'package.json' ) ) );
		var version = package_json.version;
		var name = package_json.name;

		if( !fs.existsSync( path.join( dest_primary_root, name ) ) ) {
			LOGGER.debug( 'No version of ' + name + ' was previously installed.' );
			fs.mkdirsSync( path.join( dest_primary_root, name ) );
		} else {
			LOGGER.warn( 'A version of ' + name + ' was previously installed.' );
		}

		if( fs.existsSync( path.join( dest_primary_root, name, version ) ) ) {
			LOGGER.warn( 'Module ' + name + ' v.' + version + ' was already installed.' );
		} else {
			LOGGER.debug( 'Module ' + name + ' v.' + version + ' being installed.' );
			fs.mkdirsSync( path.join( dest_primary_root, name, version ) );

			fs.readdirSync( src_root ).filter( function( file ){
				return file !== 'node_modules';
			} ).forEach( function( file ){
				LOGGER.debug( 'Copying ' + path.join( src_root, file ) + ' -> ' + path.join( dest_primary_root, name, version, file ) );
				fs.copySync( path.join( src_root, file ), path.join( dest_primary_root, name, version, file ) );
			} );
		}

		return true;
	};

	return nutils;
};
