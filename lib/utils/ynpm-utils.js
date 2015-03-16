
var fs = require( 'fs-extra' );
var path = require( 'path' );
var temp = require( 'temp' );

module.exports = function( config, npm ){

	npm = npm || require( 'npm' );
	var nutils = {};
	
	nutils.setLOGGER = function( type ){
		nutils.LOGGER = require( './logger' ).getLOGGER( type, 'ynpm' );
	};
	nutils.setLOGGER( config !== undefined ? config.logger : 'default' );
	
	nutils.createTempDirSync = function( ){
		return temp.mkdirSync( );
	};
	
	nutils.deleteRecursiveSync = function( file ){
		fs.removeSync( file );
	};

	nutils.npmInstallToDir = function( module, dest, callback ){
		npm.commands.install( dest, module, callback );
	};
	
	nutils.getLatestVersionOf = function( module, callback ){		
		npm.commands.view( [ module, 'version' ], true, function( err, result ){
			if( err === null)
				result = Object.keys( result )[ 0 ];
			
			callback( err, result );
		} );
	};

	nutils.translateLegacyDependencyStructure = function( src_root, dest_primary_root, dest_secondary_root ){

		if( !fs.existsSync( src_root ) ) {
			nutils.LOGGER.warn( src_root + ' does not exist.' );
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
			nutils.LOGGER.warn( src_root + ' does not contain a package.json and thus is not a module.' );
			return true;
		}

		var package_json = JSON.parse( fs.readFileSync( path.join( src_root, 'package.json' ) ) );
		var version = package_json.version;
		var name = package_json.name;

		if( !fs.existsSync( path.join( dest_primary_root, name ) ) ) {
			nutils.LOGGER.debug( 'No version of ' + name + ' was previously installed.' );
			fs.mkdirsSync( path.join( dest_primary_root, name ) );
		} else {
			nutils.LOGGER.warn( 'A version of ' + name + ' was previously installed.' );
		}

		if( fs.existsSync( path.join( dest_primary_root, name, version ) ) ) {
			nutils.LOGGER.warn( 'Module ' + name + ' v.' + version + ' was already installed.' );
		} else {
			nutils.LOGGER.debug( 'Module ' + name + ' v.' + version + ' being installed.' );
			fs.mkdirsSync( path.join( dest_primary_root, name, version ) );

			fs.readdirSync( src_root ).filter( function( file ){
				return file !== 'node_modules';
			} ).forEach( function( file ){
				nutils.LOGGER.debug( 'Copying ' + path.join( src_root, file ) + ' -> ' + path.join( dest_primary_root, name, version, file ) );
				fs.copySync( path.join( src_root, file ), path.join( dest_primary_root, name, version, file ) );
			} );
		}

		return true;
	};

	return nutils;
};
