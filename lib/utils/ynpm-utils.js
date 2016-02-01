
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
    
    nutils.findOrgs = function( desired_module, cwd ){ 
        var orgs = [];
        
        Object.keys( config.orgs ).forEach( function( org ){
            
            // Check in wildcard orgs
            if( org === '*' ){
                var root_path = path.resolve( config.orgs[ org ] ).substring( 0, config.orgs[ org ].indexOf( '*' ) );
                
                fs.readdirSync( root_path ).forEach( function( found_org ){
                    if( fs.existsSync( path.join( config.orgs[ '*' ].replace( /\*/g, found_org ), desired_module ) ) ){
                        orgs.push( found_org );
                    }
                } );
                
                return;
            }
          
            // Check in legacy locations
            if( org === '' && config.orgs[ org ] === './node_modules' ){
                if( fs.existsSync( path.resolve( cwd, path.join( config.orgs[ org ], desired_module ) ) ) ){
                    orgs.push( org );
                }
                return;
            }
          
            // Check in direct org
            if( fs.existsSync( path.join( config.orgs[ org ], desired_module ) ) ){
                orgs.push( org );
            }
        } );
        
        return orgs;
    };

	nutils.translateLegacyDependencyStructure = function( src_root, dest_primary_root, dest_secondary_root ){

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
					dest_secondary_root, 
					dest_secondary_root
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
				nutils.LOGGER.debug( 'Copying ' + path.join( src_root, file ) + ' -> ' + path.join( dest_primary_root, name, version, file ) );
				fs.copySync( path.join( src_root, file ), path.join( dest_primary_root, name, version, file ) );
			} );
		}

		return version;
	};

	return nutils;
};
