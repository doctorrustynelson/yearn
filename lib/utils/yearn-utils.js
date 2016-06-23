
var semver = require( 'semver' );
var fs = require( 'fs' );
var path = require( 'path' );
var JSON5 = require( 'json5' );
var native_modules = Object.keys( process.binding('natives') );

var DIRECT_CRAVING_REGEXP = /^(?:\.\.|\.\/|\/|\\\\|[A-Za-z]:\\|[A-Za-z]:\/)/;

module.exports = function( config ){

	var yutils = {};
	
	yutils.isLegacyYearning = function( desired ){
		return ( desired.org === '' && config.orgs[''] === './node_modules' );
	};
	
	yutils.isValidOrg = function( org ){
		return config.orgs[ org ] !== undefined;
	};
	
	yutils.isDirectYearning = function( path ){
		return DIRECT_CRAVING_REGEXP.test( path );
	};
	
	yutils.isValidSemVer = function( version ){
		return ( semver.valid( version, config.loose_semver ) !== null ) || ( semver.validRange( version, config.loose_semver ) !== null );
	};
	
	yutils.isNativeModule = function( module ){
		return native_modules.indexOf( module ) !== -1;
	};
	
	yutils.constructYearningString = function( desired ){
		return ( desired.org === undefined ? '' : ( desired.org === '' ? '"default"' : desired.org ) + config.delimiters.org.split('|')[0] ) +
			( desired.module ) +
			( desired.version === undefined ? '' : config.delimiters.semver.split('|')[0] + desired.version ) +
			( desired.file === undefined ? '' : config.delimiters.file.split('|')[0] + desired.file );
	};

	var YEARNING_PARTS_REGEXP = new RegExp( 
		'^((?:[^' + config.delimiters.org + ']*(?=[' + config.delimiters.org + ']))|)[' + config.delimiters.org + ']?' +
		'([^' + config.delimiters.semver + '' + config.delimiters.file + ']*)' +
		'[' + config.delimiters.semver + ']?([^' + config.delimiters.file + ']*)' + 
		'[' + config.delimiters.file + ']?(.*)$' 
	);
	
	yutils.extractYearningParts = function( desired ){
		
        if( yutils.isNativeModule( desired ) )
			return {
				module: desired,
				native: true
			};
		
		if( yutils.isDirectYearning( desired ) )
			return {
				file: desired,
				direct: true
			};
        
		var result = YEARNING_PARTS_REGEXP.exec( desired );
		
		return{
			org: ( result[ 1 ] === '' ? undefined : result[ 1 ] ),
			module: ( result[ 2 ] ),
			version: ( result[ 3 ] === '' ? undefined : result[ 3 ] ),
			file: ( result[ 4 ] === '' ? undefined : result[ 4 ] )
		};
	};
    
    yutils.parseDesired = function( desired ){
        
        switch( typeof desired ){
            case 'object':
            
                if( desired.module === undefined ){
                    throw new Error( 'Modern yearn syntax was missing minimum name: ' + JSON5.stringify( desired ) + '.' );
                }
                
                if( desired.org === undefined ){
                    
                    if( yutils.isNativeModule( desired.module ) ){
                        desired.native = true;
                    }
                    
                    if( yutils.isDirectYearning( desired.file ) ){
                        desired.direct = true;
                    }
                    
                    desired.org = '';
                }
                    
                break;
            case 'string':
                desired = yutils.extractYearningParts( desired );
                
                break;
            default:
                throw new Error( 'Unrecognized yearn object of type: ' + typeof desired );
        }
        
        return desired;
    };
	
	yutils.findPackageJsonLocation = function( parent_location, parent ){
		
		if( parent_location === undefined ){
			parent_location = path.resolve( 
				fs.existsSync( parent.id ) && fs.statSync( parent.id ).isDirectory() ? parent.id : path.dirname( parent.id )
			);
		}
		
		var package_json_location = path.join( parent_location, 'package.json' );
		
		if( fs.existsSync( package_json_location ) ){
			return package_json_location;
		} else if ( path.basename( parent_location ) === 'node_modules' || parent_location.length <= path.resolve( '/' ).length ){
			return null;
		} else {
			return yutils.findPackageJsonLocation( path.dirname( parent_location ) );
		}
	};
	
    yutils.findModuleLocation = function( package_location, desired ){
		var module_location;
		var root_dir = ( package_location === null ? '.' : path.dirname( package_location ) );
		
		// Check if allowing legacy yearning
		if( yutils.isLegacyYearning( desired ) || config.legacy ){
			module_location = yutils.findLegacyModuleLocation( root_dir, desired.module );
			if( module_location !== null )
				return module_location;
		}
		
		// Hunt for satisfying module.
		module_location = yutils.findModernModuleLocation( 
			root_dir, 
			( config.orgs[ desired.org ] !== undefined ? config.orgs[ desired.org ] : config.orgs[ '*' ].replace( /\*/g, desired.org ) ),
			desired.module
		);
		
		if( fs.existsSync( module_location ) ){
			// Look for "org/module_name/version"
			var available_versions = fs.readdirSync( module_location ).filter( function( version ){
				// Filter out bad versions
				return yutils.isValidSemVer( version );
			}).sort( function( a, b ){ return semver.rcompare( a, b, config.loose_semver ); } );
			
			for( var index = 0; index < available_versions.length; ++index ){
				if( semver.satisfies( available_versions[ index ], desired.version, config.loose_semver ) ){
					return path.resolve( path.join( module_location, available_versions[ index ] ));
				}
			}
		}
		
		return null;
	};
    
    yutils.findModuleLocationAsync = function( package_location, desired, callback ){
		var root_dir = ( package_location === null ? '.' : path.dirname( package_location ) );

		// Check if allowing legacy yearning
		if( yutils.isLegacyYearning( desired ) || config.legacy ){
			yutils.findLegacyModuleLocationAsync( root_dir, desired.module, function( module_location ){
                if( module_location !== null )
				    return callback( null );
                    
                processModernYearning( );
            } );
		} else {
            processModernYearning( );
        }
        
        function processModernYearning( ){
            // Hunt for satisfying module.
            yutils.findModernModuleLocationAsync( 
                root_dir, 
                ( config.orgs[ desired.org ] !== undefined ? config.orgs[ desired.org ] : config.orgs[ '*' ].replace( /\*/g, desired.org ) ),
                desired.module,
                function( module_location ){
                    fs.access( module_location, function( err ){
                        if( err ){
                            return callback( null );
                        }
                        
                        // Look for "org/module_name/version"
                        fs.readdir( module_location, function( err,  versions ){
                            var available_versions = versions.filter( function( version ){
                                // Filter out bad versions
                                return yutils.isValidSemVer( version );
                            }).sort( function( a, b ){ return semver.rcompare( a, b, config.loose_semver ); } );
                            
                            for( var index = 0; index < available_versions.length; ++index ){
                                if( semver.satisfies( available_versions[ index ], desired.version, config.loose_semver ) ){
                                    return callback( path.resolve( path.join( module_location, available_versions[ index ] ) ) );
                                }
                            }
                            
                            return callback( null );
                        } );
                    } );
                }
            );       
        }
	};
    
	yutils.findModernModuleLocation = function( package_location, org_location, module ){
		var root_location = path.resolve( package_location, org_location );

		if( fs.existsSync( path.join( root_location, module ) ) ){
			return path.join( root_location, module );
		}
		
		return null;
	};
    
    yutils.findModernModuleLocationAsync = function( package_location, org_location, module, callback ){
		var root_location = path.resolve( package_location, org_location );
		
		fs.access( path.join( root_location, module ), function( err ){
            if( err ){
                return callback( null );
            }
            
            callback( path.join( root_location, module ) );
        } );
	};
	
	yutils.findLegacyModuleLocation = function( package_location, module ){
		var root_location = path.resolve( package_location, './node_modules' );
		var old_root_location = root_location;
		
		var system_root_length = path.resolve( '/' ).length;
		while( path.dirname( root_location ).length > system_root_length ){
			
			if( fs.existsSync( path.join( root_location, module ) ) ){
				return path.join( root_location, module );
			}
			
			old_root_location = root_location;
			root_location = path.resolve( root_location, '../../node_modules' );
			if( root_location === old_root_location )
				break;
		}
		
		return null;
	};
	
	yutils.findLegacyModuleLocationAsync = function( package_location, module, callback ){
		var root_location = path.resolve( package_location, './node_modules' );
		var old_root_location = root_location;
		
		var system_root_length = path.resolve( '/' ).length;
		while( path.dirname( root_location ).length > system_root_length ){
			
			if( fs.existsSync( path.join( root_location, module ) ) ){
				return callback( path.join( root_location, module ) );
			}
			
			old_root_location = root_location;
			root_location = path.resolve( root_location, '../../node_modules' );
			if( root_location === old_root_location )
				break;
		}
		
		return callback( null );
	};
	
	yutils.mapDesiredViaAlias = function( desired ){
		
		var terminal;
		do {
			terminal = true;
			
			for( var alias of config.aliases ){
				
                var org_result;
				if( alias.from.org )
					if( !( org_result = new RegExp(alias.from.org).exec( desired.org ) ) )
						continue;
                        
				var module_result;
				if( alias.from.module )
					if( !( module_result = new RegExp(alias.from.module).exec( desired.module ) ) )
						continue;
				
                var version_result;
				if( alias.from.version )
					if( !( version_result =  new RegExp(alias.from.version).exec( desired.version ) ) )
						continue;
				
				if( alias.to.org ){ 
                    if( org_result && org_result.length > 1 ){
                        desired.org = desired.org.replace( new RegExp( alias.from.org ), alias.to.org );
                    } else {
                        desired.org = alias.to.org;
                    }
                }
				
                if( alias.to.module ){ 
                    if( module_result && module_result.length > 1 ){
                        desired.module = desired.module.replace( new RegExp( alias.from.module ), alias.to.module );
                    } else {
                        desired.module = alias.to.module;
                    }
                }
                
				if( alias.to.version ){ 
                    if( version_result && version_result.length > 1 ){
                        desired.version = desired.version.replace( new RegExp( alias.from.version ), alias.to.version );
                    } else {
                        desired.version = alias.to.version;
                    }
                }
				
				if( !alias.stop )
					terminal = false;
				break;		
			}
		} while( !terminal );
		
		return desired;	
	};
	
	return yutils;
};
