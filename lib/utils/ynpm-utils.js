
var fs = require( 'fs-extra' );
var path = require( 'path' );
var temp = require( 'temp' );
var JSON5 = require( 'json5' );
var semver = require( 'semver' );

var GIT_DEPDENDENCY_REGEXP = /^git\+.*$/;
var GIT_LOCKDOWN_DEPENDENCY_REGEXP = /git\+.*#[0-9a-f]*$/;

module.exports = function( config, npm ){

	npm = npm || require( 'npm' );
	var nutils = {};
	
	var yutils = require( './yearn-utils' )( config );
	
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
		//npm.commands.install( dest, [ module ], callback);
		npm.commands.install( dest, module, callback);
	};
	
	nutils.getLatestVersionOf = function( module, callback ){		
		npm.commands.view( [ module, 'version' ], true, function( err, result ){
			if( err === null)
				result = Object.keys( result )[ 0 ];
			
			callback( err, result );
		} );
	};
    
    nutils.findOrgs = function( desired_module, cwd, callback ){ 
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
	
	nutils.findVersions = function( desired_org, desired_module, cwd, callback ){ 
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
	
	nutils.findMatchingVersions = function( desired_org, desired_module, desired_range, cwd, callback ){ 
        nutils.findVersions( desired_org, desired_module, cwd, function( versions ){
            callback( versions.filter( function( version ){
                return semver.satisfies( version, desired_range, config.loose_semver );
		    } ) );
        } );
    };

	nutils.translateLegacyDependencyStructure = function( src_root, primary_org, secondary_org, no_alias ){

		if( !fs.existsSync( src_root ) ) {
			nutils.LOGGER.warn( src_root + ' does not exist.' );
			return false;
		}

		var dependency_map = {};

		if( fs.existsSync( path.join( src_root, 'node_modules' ) ) ) {
			var dependencies = fs.readdirSync( path.join( src_root, 'node_modules' ) );
			dependencies.forEach( function( dependency ){
				var version = nutils.translateLegacyDependencyStructure( 
					path.join( src_root, 'node_modules', dependency ), 
					secondary_org, 
					secondary_org,
					no_alias
				);
				
				if( semver.valid( version ) )
					dependency_map[dependency] = version;
			} );
			
		}

		if( !fs.existsSync( path.join( src_root, 'package.json' ) ) ) {
			nutils.LOGGER.warn( src_root + ' does not contain a package.json and thus is not a module.' );
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
			nutils.LOGGER.debug( 'No version of ' + desired.module + ' was previously installed.' );
			fs.mkdirsSync( path.join( dest_primary_root, desired.module ) );
		} else {
			nutils.LOGGER.warn( 'A version of ' + desired.module + ' was previously installed.' );
		}

		if( fs.existsSync( path.join( dest_primary_root, desired.module, desired.version ) ) ) {
			nutils.LOGGER.warn( 'Module ' + desired.module + ' v.' + desired.version + ' was already installed.' );
		} else {
			nutils.LOGGER.debug( 'Module ' + desired.module + ' v.' + desired.version + ' being installed.' );
			fs.mkdirsSync( path.join( dest_primary_root, desired.module, desired.version ) );

			// Fix dependency versions if needed
			Object.keys( package_json.dependencies ? package_json.dependencies : {} ).filter( function( m ){
				return GIT_DEPDENDENCY_REGEXP.test(package_json.dependencies[ m ]);
			} ).forEach( function( m ){
				if( GIT_LOCKDOWN_DEPENDENCY_REGEXP.test( package_json.dependencies[ m ] )){
					package_json.dependencies[ m ] = dependency_map[ m ];
				} else {
					package_json.dependencies[ m ] = '*';
				}	
			} );
			
			fs.writeFileSync( path.join( src_root, 'package.json' ), JSON.stringify(package_json, null, '\t') );

			fs.readdirSync( src_root ).filter( function( file ){
				return file !== 'node_modules';
			} ).forEach( function( file ){
				nutils.LOGGER.debug( 'Copying ' + path.join( src_root, file ) + ' -> ' + path.join( dest_primary_root, desired.module, desired.version, file ) );
				fs.copySync( path.join( src_root, file ), path.join( dest_primary_root, desired.module, desired.version, file ) );
			} );
		}

		return version;
	};

	return nutils;
};
