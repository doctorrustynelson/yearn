
var path = require( 'path' );
var fs = require( 'fs-extra' );
var semver = require( 'semver' );
var JSON5 = require( 'json5' );
var _ = require( 'lodash' );
var async = require( 'async' );

module.exports = function( config ){
	
	config = require( './utils/config' )( config );
	
	var yutils = require( './utils/yearn-utils' )( config ); 
	var nutils = require( './utils/ynpm-utils' )( config ); 
	
	var ynpm = {
		commands: {}	
	};
	
	ynpm.commands.orgs = function( ){
		return config.orgs;
	};
	
	ynpm.commands.check = function( desired, no_alias, callback ){
		desired = yutils.extractYearningParts( desired );
		
		if( desired.org === undefined ){
			desired.org = '';
		}
		
		if( !no_alias )
			desired = yutils.mapDesiredViaAlias( desired );
		
		if( !yutils.isValidOrg( desired.org ) ){
			console.error( 'Invalid org: ' + desired.org );
			return callback( 1 );
		}
			
		nutils.getLatestVersionOf( desired.module, function( err, latest_version ){
		
			if( err !== null ){
				console.error( 'Failed to determine latest version of ' + yutils.constructYearningString( desired ) + '.' );
				return callback( err );
			}
			
			if( !fs.existsSync( path.join( config.orgs[ desired.org ], desired.module ) ) ){
				console.warn( 'Module '  + desired.module + ' is not installed in org ' + desired.org + '.' );
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
	
	ynpm.commands.list = function( _desired, cwd, no_alias, callback ){
		var desired = yutils.extractYearningParts( _desired );
		
		if( !no_alias )
			desired = yutils.mapDesiredViaAlias( desired );
		
		if( desired.org !== undefined ){
			resolveVersions( [ desired.org ] );
		} else {
			nutils.findOrgs( desired.module, cwd, resolveVersions );
		}
        
        function resolveVersions( orgs ){
            var list = [];
            
            var count = orgs.length;
            function done( ){
                if( --count <= 0 )           
                    callback( null, list );
            }
            
            orgs.forEach( function( org ){
                
                if( desired.version === undefined ){
                    nutils.findVersions( org, desired.module, cwd, processVersions );
                } else {
                    nutils.findMatchingVersions( org, desired.module, desired.version, cwd, processVersions );
                }
                
                function processVersions( versions ){
                    versions.forEach( function( version ){
                        list.push( yutils.constructYearningString( { org: ( org === '' ? undefined : org ), module: desired.module, version: version } ) );
                    } );
                    done( );
                }
            } );
        }
	};
    
    ynpm.commands.shrinkwrap = function( _cwd, _dependencies_seed, unsafe, _callback ){
        
        var queue = async.queue( function( task, callback ){
            nutils.findMatchingVersions( task.desired.org, task.desired.module, task.desired.version, task.cwd, function( versions ){
                callback( null, versions );
            } );
        }, 8 );
        
        function shrinkwrap_fn( cwd, dependencies_seed, dependency_chain, callback ){  
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
                    
                    queue.push( { desired: desired, cwd: cwd }, function( err, versions ){
                        if( versions.length === 0 ){
                            var message = 'Failed to find an acceptable version for ' + yutils.constructYearningString( desired ) + '.';
                            
                            if( unsafe ){
                                console.error( message );
                                return done( );
                            } else {
                                throw new Error( message );
                            }
                        }
                        
                        desired.version = versions[ 0 ];
                        var name = yutils.constructYearningString( desired );
						
                        if( dependency_chain.indexOf( name ) !== -1 ){
                            shrinkwrap.dependencies[ dependency ] = desired.version;
                            return done( );
                        }
                        
						desired = yutils.mapDesiredViaAlias( desired );
						
                        yutils.findModuleLocationAsync( package_location, desired, function( dependency_root ){
                            shrinkwrap_fn( dependency_root, merged_dependencies[ dependency ].dependencies, dependency_chain.concat( name ), function( error, dep_shrinkwrap ){
                                shrinkwrap.dependencies[ dependency ] = dep_shrinkwrap;
                                return done();
                            } );
                        } );
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
        
        shrinkwrap_fn( _cwd, _dependencies_seed, [], function( err, shrinkwrap ){
            if( typeof shrinkwrap === 'object' )
                shrinkwrap.name = JSON5.parse( fs.readFileSync( path.join( _cwd, 'package.json' ) ) ).name;
            
            _callback( err, shrinkwrap );
        } );
	};
	
	ynpm.commands.installLegacy = function( desired, cwd, callback ){
		nutils.npmInstallToDir( desired, cwd, callback );
	};

	ynpm.commands.install = function( desired, no_alias, callback ){
		
		switch( typeof desired ){
			case 'object':
			
				if( desired.module === undefined ){
					console.error( 'Modern yearn syntax was missing minimum name.' );
					return callback( 1 );
				}
				
				if( desired.org === undefined ){
					desired.org = '';
				}
					
				break;
			case 'string':
				if( yutils.isNativeModule( desired ) ){
					console.warn( 'Can not perform a ynpm install of a native module.' );
					return callback( 1 );
				} else if( yutils.isDirectYearning( desired ) ){
					console.warn( 'Can not perform a ynpm install of a file.' );
					return callback( 1 );
				} else {
					desired = yutils.extractYearningParts( desired );
				}
				break;
			default:
				console.error( 'Unrecognized ynpm install object of type: ' + typeof desired );
				return callback( 1 );
		}

		var tempdir = nutils.createTempDirSync();	

		nutils.npmInstallToDir( 
			( desired.version !== undefined && desired.version !== '' ? desired.module + '@' + desired.version : desired.module ), 
			tempdir,
			function( err ){
				if( err === null ){
					nutils.translateLegacyDependencyStructure( 
						tempdir, 
						( desired.org === undefined ? '' : desired.org ), 
						desired.module,
						'',
						no_alias
					);
					
					nutils.deleteRecursiveSync( tempdir );
				}
				
				return callback( err );
			}
		);
	};
	
	return ynpm;
};

