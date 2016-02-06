
var path = require( 'path' );
var fs = require( 'fs' );
var semver = require( 'semver' );
var npm = require( 'npm' );
var JSON5 = require( 'json5' );
var _ = require( 'lodash' );

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
				var installed_versions = fs.readdirSync( path.join( config.orgs[ desired.org ], desired.module ) )
					.sort( function( a, b ){ return semver.rcompare( a, b, config.loose_semver ); } );
			
				if( latest_version !== installed_versions[ 0 ])
					return callback( null, latest_version );
				
				return callback( null, true );
			}
		} );
	};
	
	ynpm.commands.list = function( desired, cwd, callback ){
		desired = yutils.extractYearningParts( desired );
		
		var orgs;
		if( desired.org !== undefined ){
			orgs = [ desired.org ];
		} else {
			orgs = nutils.findOrgs( desired.module, cwd );
		}
		
		var list = [];
		orgs.forEach( function( org ){
			var versions;
			
			if( desired.version === undefined ){
				versions = nutils.findVersions( org, desired.module, cwd );
			} else {
				versions = nutils.findMatchingVersions( org, desired.module, desired.version, cwd );
			}
			
			versions.forEach( function( version ){
				list.push( yutils.constructYearningString( { org: ( org === '' ? undefined : org ), module: desired.module, version: version } ) );
			} );
		} );
		
		callback( null, list );
	};
    
    ynpm.commands.shrinkwrap = function( cwd, dependencies_seed, callback ){
        
        function shrinkwrap( cwd, depenencies_seed, callback ){      
            var package_location = path.join( cwd, 'package.json' );
            var shrinkwrap_location = path.join( cwd, 'ynpm-shrinkwrap.json' );
            var pkg, local_shrinkwrap;
            
            function execute( ){		
                var merged_dependencies = _.merge( 
                    {},
                    pkg.dependencies,
                    local_shrinkwrap.dependencies,
                    ( dependencies_seed === undefined ? {} : dependencies_seed )
                );
                
                var dependencies = Object.keys( merged_dependencies );
                if( dependencies.length === 0 ){
                    return callback( null, pkg.version );
                }
                
                var shrinkwrap = {
                    version: pkg.version,
                    dependencies: {}
                };
                
                var count = dependencies.length;
                function done( ){
                    if( --count <= 0 )
                        return callback( null, shrinkwrap );
                }
                
                dependencies.forEach( function( dependency ){
                    var object_semver = ( typeof merged_dependencies[ dependency ] === 'object' );
                    var desired = yutils.extractYearningParts( dependency );
                    desired.org = ( desired.org === undefined ? '' : desired.org );
                    desired.version = ( object_semver ? merged_dependencies[ dependency ].version : merged_dependencies[ dependency ] );
                    
                    desired.version = nutils.findMatchingVersions( desired.org, desired.module, desired.version, cwd )[ 0 ];
                    
                    var dependency_root = yutils.findModuleLocation( package_location, desired );
                    
                    ynpm.commands.shrinkwrap( dependency_root, merged_dependencies[ dependency ].dependencies, function( error, dep_shrinkwrap ){
                        shrinkwrap.dependencies[ dependency ] = dep_shrinkwrap;
                        return done();
                    } );
                } );
            }
            
            function fileRead( ){
                if( local_shrinkwrap !== undefined && pkg !== undefined )
                    execute( );
            }
            
            fs.readFile( package_location, function( error, contents ){
                pkg = JSON5.parse( contents );
                fileRead( );
            } );
            
            fs.exists( shrinkwrap_location, function( exists ){
                if( exists ){
                    fs.readFile( shrinkwrap_location, function( error, contents ){
                        local_shrinkwrap = JSON5.parse( contents );
                        fileRead( );
                    } );
                } else {
                    local_shrinkwrap = { dependencies: {} };
                    fileRead( );
                }
            } );
        }
        
        shrinkwrap( cwd, dependencies_seed, function( err, shrinwkrap ){
            if( typeof shrinwkrap === 'object' )
                shrinwkrap.name = JSON5.parse( fs.readFileSync( path.join( cwd, 'package.json' ) ) ).name;
            
            callback( err, shrinwkrap );
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

