/**
 * New node file
 */

var fs = require( 'fs-extra' );
var path = require( 'path' );
var npm = require( 'npm' );
var deasync = require( 'deasync' );
var temp = require( 'temp' );
var LOGGER = require( './logger' )( 'ALL', 'ynpm' );

var ynpm_utils = module.exports = {

	createTempDirSync: function(){
		return temp.mkdirSync( );
	},

	npmInstallToDir: function( module, dest_root, callback ){
		npm.load( function( ){
			npm.commands.install( dest_root, module, callback );
		});
	},
	
	npmInstallToDirSync: function( module, dest_root ){
		var done = false;
		var error = false;
		
		npm.load( function( ){
			npm.commands.install( dest_root, module, function( err ){
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
	},

	translateLegacyDependencyStructure: function( src_root, dest_root ){

		if( !fs.existsSync( src_root ) ) {
			LOGGER.warn( src_root + ' does not exist.' );
			return false;
		}

		if( fs.existsSync( path.join( src_root, 'node_modules' ) ) ) {
			var dependencies = fs.readdirSync( path.join( src_root, 'node_modules' ) );
			dependencies.forEach( function( dependency ){
				if( !ynpm_utils.translateLegacyDependencyStructure( path.join( src_root, 'node_modules', dependency ), dest_root ) )
					return false;
			} );
		}

		if( !fs.existsSync( path.join( src_root, 'package.json' ) ) ) {
			LOGGER.warn( src_root + ' does not contain a package.json and thus is not a module.' );
			return true;
		}

		var package_json = JSON.parse( fs.readFileSync( path.join( src_root, 'package.json' ) ) );
		var version = package_json.version;
		var name = package_json.name;

		if( !fs.existsSync( path.join( dest_root, name ) ) ) {
			LOGGER.debug( 'No version of ' + name + ' was previously installed.' );
			fs.mkdirSync( path.join( dest_root, name ) );
		} else {
			LOGGER.warn( 'A version of ' + name + ' was previously installed.' );
		}

		if( fs.existsSync( path.join( dest_root, name, version ) ) ) {
			LOGGER.warn( 'Module ' + name + ' v.' + version + ' was already installed.' );
		} else {
			LOGGER.debug( 'Module ' + name + ' v.' + version + ' being installed.' );
			fs.mkdirSync( path.join( dest_root, name, version ) );

			fs.readdirSync( src_root ).filter( function( file ){
				return file !== 'node_modules';
			} ).forEach( function( file ){
				LOGGER.debug( 'Copying ' + path.join( src_root, file ) + ' -> ' + path.join( dest_root, name, version, file ) );
				fs.copySync( path.join( src_root, file ), path.join( dest_root, name, version, file ) );
			} );
		}

		return true;
	}

};
