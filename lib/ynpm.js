
var path = require( 'path' );
var fs = require( 'fs' );
var semver = require( 'semver' );
var npm = require( 'npm' );

module.exports = function( config ){
	
	config = require( './utils/config' )( config );
	
	var yutils = require( './utils/yearn-utils' )( config ); 
	var nutils = require( './utils/ynpm-utils' )( config ); 
	
	var ynpm = {
		commands: {}	
	};
	
	ynpm.init = function( npm_config, callback ){
		npm.load( npm_config, function( err, initialized_npm ){
			if( err === null ){
				nutils.LOGGER.debug( 'Initialized npm.' );
				npm = initialized_npm;
			} else {
				nutils.LOGGER.error( 'Failed to initialize npm.' );
			}
			
			callback( err );
		} );
	};
	
	ynpm.commands.orgs = function( ){
		return config.orgs;
	};
	
	ynpm.commands.check = function( desired, callback ){
		
		var parts = desired.split( /\/|@/ );
		
		if( parts.length === 1 ){
			parts.unshift( '' );
		}
		
		if( parts.length === 2 ){
			if( !yutils.isValidOrg( parts[ 0 ] ) ){
				nutils.LOGGER.error( 'Invalid org: ' + parts[ 0 ] );
				return callback( 1 );
			}
			
			nutils.getLatestVersionOf( parts[ 1 ], function( err, latest_version ){
			
				if( err !== null ){
					nutils.LOGGER.error( 'Failed to determine latest version of ' + parts + '.' );
					return callback( err );
				}
				
				if( latest_version === null ){
					nutils.LOGGER.error( 'Module ' + parts[ 1 ] + ' is not part of npm.' );
					return callback( '1' );
				}
				
				if( !fs.existsSync( path.join( config.orgs[ parts[ 0 ] ], parts[ 1 ] ) ) ){
					nutils.LOGGER.warn( 'Module '  + parts[ 1 ] + ' is not installed in org ' + parts[ 0 ] + '.' );
					return callback( err, latest_version );
				} else {
					var installed_versions = fs.readdirSync( path.join( config.orgs[ parts[ 0 ] ], parts[ 1 ] ) ).sort( semver.rcompare );
				
					if( latest_version !== installed_versions[ 0 ])
						return callback( null, latest_version );
					
					return callback( null, true );
				}
			} );
		} else {
			nutils.LOGGER.error( 'Incorrect number of parts to specify an org/module.' );
			return callback( 1 );
		}
	};
	
	ynpm.commands.npmConfig = function( args, callback ){
		nutils.LOGGER.debug( 'npm config ' + args );
		npm.commands.config( args, callback );
	};

	ynpm.commands.install = function( desired, callback ){
		
		switch( typeof desired ){
			case 'object':
				nutils.LOGGER.debug( 'Explicit install.' );
			
				if( desired.module === undefined ){
					nutils.LOGGER.error( 'Modern yearn syntax was missing minimum name.' );
					return callback( 1 );
				}
				
				if( desired.org === undefined ){
					desired.org = '';
				}
					
				break;
			case 'string':
				if( yutils.isNativeModule( desired ) ){
					nutils.LOGGER.debug( 'Can not perform a ynpm install of a native module.' );
					return callback( 1 );
				} else if( yutils.isDirectYearning( desired ) ){
					nutils.LOGGER.debug( 'Can not perform a ynpm install of a file.' );
					return callback( 1 );
				} else {
					nutils.LOGGER.debug( 'Implicit ynpm install.' );
					desired = yutils.extractYearningParts( desired );
				}
				break;
			default:
				nutils.LOGGER.error( 'Unrecognized ynpm install object of type: ' + typeof desired );
				return callback( 1 );
		}

		var tempdir = nutils.createTempDirSync();	

		nutils.LOGGER.debug( 'Installing ' + desired.module + ' -> ' + tempdir + '.' );
		nutils.npmInstallToDir( 
			( desired.version !== undefined && desired.version !== '' ? desired.module + '@' + desired.version : desired.module ), 
			tempdir,
			function( err ){
				if( err === null ){
					nutils.translateLegacyDependencyStructure( 
						path.join( tempdir, 'node_modules', desired.module ), 
						config.orgs[ desired.org ], 
						config.orgs[ '' ]
					);
					
					nutils.deleteRecursiveSync( tempdir );
				}
				
				return callback( err );
			}
		);
	};
	
	return ynpm;
};

