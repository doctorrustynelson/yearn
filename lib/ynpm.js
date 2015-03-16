
var path = require( 'path' );
var fs = require( 'fs' );
var semver = require( 'semver' );
var npm = require( 'npm' );

module.exports = function( config, callback ){
	
	config = require( './utils/config' )( config );
	
	var yutils = require( './utils/yearn-utils' )( config ); 
	var nutils = null;
	
	var ynpm = {
		commands: {}	
	};
		
	npm.load( config.npmconfig, function( err, initialized_npm ){
		if( err === null ){
			nutils = require( './utils/ynpm-utils' )( config, npm ); 
			nutils.LOGGER.debug( 'Correctly Initialized npm.' );
			npm = initialized_npm;
		}
		
		callback( err, ynpm );
	} );
	
	
	
	ynpm.commands.orgs = function( ){
		return config.orgs;
	};
	
	ynpm.commands.check = function( desired, callback ){
		
		desired = yutils.extractYearningParts( desired );
		
		if( desired.org === undefined ){
			desired.org = '';
		}
		
		if( !yutils.isValidOrg( desired.org ) ){
			nutils.LOGGER.error( 'Invalid org: ' + desired.org );
			return callback( 1 );
		}
			
		nutils.getLatestVersionOf( desired.module, function( err, latest_version ){
		
			if( err !== null ){
				nutils.LOGGER.error( 'Failed to determine latest version of ' + yutils.constructYearningString( desired ) + '.' );
				return callback( err );
			}
			
			if( !fs.existsSync( path.join( config.orgs[ desired.org ], desired.module ) ) ){
				nutils.LOGGER.warn( 'Module '  + desired.module + ' is not installed in org ' + desired.org + '.' );
				return callback( err, latest_version );
			} else {
				var installed_versions = fs.readdirSync( path.join( config.orgs[ desired.org ], desired.module ) ).sort( semver.rcompare );
			
				if( latest_version !== installed_versions[ 0 ])
					return callback( null, latest_version );
				
				return callback( null, true );
			}
		} );
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
						config.orgs[ ( desired.org === undefined ? '' : desired.org ) ], 
						config.orgs[ '' ]
					);
					
					nutils.deleteRecursiveSync( tempdir );
				}
				
				return callback( err );
			}
		);
	};
};

