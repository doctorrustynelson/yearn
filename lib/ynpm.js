
var path = require( 'path' );
var fs = require( 'fs' );
var semver = require( 'semver' );

module.exports = function( config ){
	
	config = require( './utils/config' )( config );
	
	var LOGGER = require( './utils/logger' )( config.log_level, 'ynpm' );
	var yutils = require( './utils/yearn-utils' )( config ); 
	var nutils = require( './utils/ynpm-utils' )( config ); 
	
	var ynpm = {
		commands: {}	
	};
	
	ynpm.commands.orgs = function( ){
		return config.orgs;
	};
	
	ynpm.commands.check = function( desired ){
		
		var parts = desired.split( /\/|@/ );
		
		if( parts.length === 1 ){
			parts.unshift( '' );
		}
		
		if( parts.length === 2 ){
			if( !yutils.isValidOrg( parts[ 0 ] ) ){
				LOGGER.error( 'Invalid org: ' + parts[ 0 ] );
				return false;
			}
			
			var latest_version = nutils.getLatestVersionOf( parts[ 1 ] );
			
			if( latest_version === null ){
				LOGGER.error( 'Module ' + parts[ 1 ] + ' is not part of npm.' );
				return false;
			}
			
			if( !fs.existsSync( path.join( config.orgs[ parts[ 0 ] ], parts[ 1 ] ) ) ){
				LOGGER.warn( 'Module '  + parts[ 1 ] + ' is not installed in org ' + parts[ 0 ] + '.' );
			}
			
			var installed_versions = fs.readdirSync( path.join( config.orgs[ parts[ 0 ] ], parts[ 1 ] ) ).sort( semver.rcompare );
			
			if( latest_version !== installed_versions[ 0 ])
				return latest_version;
			
			return true;
		}
		
		if( parts.length > 2 ){
			LOGGER.error( 'To many parts to specify an org/module.' );
			return false;
		}
		
		return false;
	};

	ynpm.commands.install = function( desired ){
		
		switch( typeof desired ){
			case 'object':
				LOGGER.debug( 'Explicit install.' );
			
				if( desired.module === undefined ){
					LOGGER.error( 'Modern yearn syntax was missing minimum name.' );
					return null;
				}
				
				if( desired.org === undefined ){
					desired.org = '';
				}
					
				break;
			case 'string':
				if( yutils.isNativeModule( desired ) ){
					LOGGER.debug( 'Can not perform a ynpm install of a native module.' );
					return false;
				} else if( yutils.isDirectYearning( desired ) ){
					LOGGER.debug( 'Can not perform a ynpm install of a file.' );
					return false;
				} else {
					LOGGER.debug( 'Implicit ynpm install.' );
					desired = yutils.extractYearningParts( desired );
				}
				break;
			default:
				LOGGER.error( 'Unrecognized ynpm install object of type: ' + typeof desired );
				return null;
		}

		var tempdir = nutils.createTempDirSync();	

		nutils.npmInstallToDirSync( 
			( desired.version !== undefined ? desired.module + '@' + desired.version : desired.module ), 
			tempdir
		);
		
		nutils.translateLegacyDependencyStructure( 
			path.join( tempdir, 'node_modules', desired.module ), 
			config.orgs[ desired.org ], 
			config.orgs[ '' ]
		);
		
		nutils.deleteRecursiveSync( tempdir );
	};
	
	return ynpm;
};

