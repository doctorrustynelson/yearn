
var fs = require( 'fs-extra' );
var path = require( 'path' );
var temp = require( 'temp' );
var JSON5 = require( 'json5' );
var semver = require( 'semver' );

var npm_utils = require( './npm-utils' );

var GIT_DEPDENDENCY_REGEXP = /^git\+.*$/;
var GIT_LOCKDOWN_DEPENDENCY_REGEXP = /git\+.*#[0-9a-f]*$/;

module.exports = function( config ){

	var ynpm_utils = {};
	
	var yutils = require( './yearn-utils' )( config );
	
	ynpm_utils.setLOGGER = function( type ){
		ynpm_utils.LOGGER = require( './logger' ).getLOGGER( type, 'ynpm' );
	};
	ynpm_utils.setLOGGER( config !== undefined ? config.logger : 'default' );
	
	ynpm_utils.createTempDirSync = function( ){
		return temp.mkdirSync( );
	};
	
	ynpm_utils.deleteRecursiveSync = function( file ){
		fs.removeSync( file );
	};

	ynpm_utils.npmInstallToDir = function( module, dest, callback ){
		npm_utils.installToDir( module, dest, config.npmconfig, callback );
	};
	
	ynpm_utils.getLatestVersionOf = function( module, callback ){		
		npm_utils.viewVersion( module, config.npmconfig, callback );
	};
    
    ynpm_utils.findOrgs = function( desired_module, cwd, callback ){ 
        var orgs = [];
        
        var available_orgs = Object.keys( config.orgs );
        var count = available_orgs.length;
        
        function done( ){
            if( --count <= 0 )
                return callback( orgs );
        }
        
        Object.keys( config.orgs ).forEach( function( org ){
            
            // Check in wildcard orgs
            if( org === '*' ){
                var root_path = path.resolve( config.orgs[ org ] );
				root_path = root_path.substr( 0, root_path.indexOf( '*' ) );
				
                fs.readdir( root_path, function( err, files ){                    
                    var count = files.length;
                    function complete( ){
                        if( --count <= 0 )
                            return done( );
                    }
                    
                    files.forEach( function( found_org ){
                        fs.access( path.join( config.orgs[ '*' ].replace( /\*/g, found_org ), desired_module ), function( err ){
                            if( !err )
                                orgs.push( found_org );
                            return complete( );
                        } );
                    } );
                } );
                
                return;
            }
          
            // Check in legacy locations
            if( org === '' && config.orgs[ org ] === './node_modules' ){
                fs.access( path.resolve( cwd, path.join( config.orgs[ org ], desired_module ) ), function ( err ){
                    if( !err )
                        orgs.push( org );
                    done( );
                } );
                
                return;
            }
          
            // Check in direct org
            fs.access( path.join( config.orgs[ org ], desired_module ), function( err ){
                if( !err )
                    orgs.push( org );
                done( );
            } );
        } );
        
        //return orgs;
    };
	
	ynpm_utils.findVersions = function( desired_org, desired_module, cwd, callback ){ 
        var module_path;
		
		// Check in legacy locations
		if( desired_org === '' && config.orgs[ desired_org ] === './node_modules' ){
			module_path = path.resolve( cwd, path.join( config.orgs[ desired_org ], desired_module ) );
		} else if( config.orgs[ desired_org ] !== undefined ){
			// Check in direct org
			module_path = path.join( config.orgs[ desired_org ], desired_module );
		} else {
			// Wildcard org
			module_path = path.join( config.orgs[ '*' ].replace( /\*/g, desired_org ), desired_module );
		}
		
		return fs.readdir( module_path, function( err, files ){
            if( err ){
                return callback( [] );
            }
            
            callback( files.filter( function( version ){
                return semver.valid( version, config.loose_semver );
		    } ).sort( semver.compareLoose ) );
        } );
    };
	
	ynpm_utils.findMatchingVersions = function( desired_org, desired_module, desired_range, cwd, callback ){ 
        ynpm_utils.findVersions( desired_org, desired_module, cwd, function( versions ){
            callback( versions.filter( function( version ){
                return semver.satisfies( version, desired_range, config.loose_semver );
		    } ) );
        } );
    };

	ynpm_utils.translateLegacyDependencyStructure = function( src_root, primary_org, primary_module, secondary_org, no_alias ){

		if( !fs.existsSync( src_root ) ) {
			ynpm_utils.LOGGER.warn( src_root + ' does not exist.' );
			return false;
		}

		var dependency_map = {};

		if( fs.existsSync( path.join( src_root, 'node_modules' ) ) ) {
			var dependencies = fs.readdirSync( path.join( src_root, 'node_modules' ) );
			dependencies.forEach( function( dependency ){
				var version;
				
				if( dependency === primary_module ){
					version = ynpm_utils.translateLegacyDependencyStructure( 
						path.join( src_root, 'node_modules', dependency ), 
						primary_org,
						dependency, 
						secondary_org,
						no_alias
					);
				} else {
					version = ynpm_utils.translateLegacyDependencyStructure( 
						path.join( src_root, 'node_modules', dependency ), 
						secondary_org,
						dependency,
						secondary_org,
						no_alias
					);
				}
				
				
				if( semver.valid( version ) )
					dependency_map[dependency] = version;
			} );
		}

		if( !fs.existsSync( path.join( src_root, 'package.json' ) ) ) {
			ynpm_utils.LOGGER.warn( src_root + ' does not contain a package.json and thus is not a module.' );
			return true;
		}

		var package_json = JSON5.parse( fs.readFileSync( path.join( src_root, 'package.json' ) ) );
		var version = package_json.version;
		var name = package_json.name;
		
		var desired = { org: primary_org, module: name, version: version };
		
		if( !no_alias )
			desired = yutils.mapDesiredViaAlias( desired );
		
		var dest_primary_root = config.orgs[ desired.org ];

		if( !fs.existsSync( path.join( dest_primary_root, desired.module ) ) ) {
			ynpm_utils.LOGGER.debug( 'No version of ' + desired.module + ' was previously installed.' );
			fs.mkdirsSync( path.join( dest_primary_root, desired.module ) );
		} else {
			ynpm_utils.LOGGER.warn( 'A version of ' + desired.module + ' was previously installed.' );
		}

		if( fs.existsSync( path.join( dest_primary_root, desired.module, desired.version ) ) ) {
			ynpm_utils.LOGGER.warn( 'Module ' + desired.module + ' v.' + desired.version + ' was already installed.' );
		} else {
			ynpm_utils.LOGGER.debug( 'Module ' + desired.module + ' v.' + desired.version + ' being installed.' );
			fs.mkdirsSync( path.join( dest_primary_root, desired.module, desired.version ) );

			// Fix dependency versions if needed
			Object.keys( package_json.dependencies ? package_json.dependencies : {} ).filter( function( m ){
				return GIT_DEPDENDENCY_REGEXP.test(package_json.dependencies[ m ]);
			} ).forEach( function( m ){
				if( GIT_LOCKDOWN_DEPENDENCY_REGEXP.test( package_json.dependencies[ m ] )){
					if( dependency_map[ m ] === undefined ){
						if( fs.existsSync( path.join( src_root, '..', m, 'package.json' ) ) ){
							var peer = JSON5.parse( fs.readFileSync( path.join( src_root, '..', m, 'package.json' ) ) );
							package_json.dependencies[ m ] = peer.version;
						}
					} else {
						package_json.dependencies[ m ] = dependency_map[ m ];
					}
				} else {
					package_json.dependencies[ m ] = '*';
				}	
			} );
			
			fs.writeFileSync( path.join( src_root, 'package.json' ), JSON.stringify(package_json, null, '\t') );

			fs.readdirSync( src_root ).filter( function( file ){
				return file !== 'node_modules';
			} ).forEach( function( file ){
				ynpm_utils.LOGGER.debug( 'Copying ' + path.join( src_root, file ) + ' -> ' + path.join( dest_primary_root, desired.module, desired.version, file ) );
				fs.copySync( path.join( src_root, file ), path.join( dest_primary_root, desired.module, desired.version, file ) );
			} );
		}

		return version;
	};

	return ynpm_utils;
};
