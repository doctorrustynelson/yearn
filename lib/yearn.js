/*
 * yearn Options:
 * {
 *   orgs: {
 *     "org_name": "/absolute/org/location/"
 *   },
 *   log: "NONE/DEBUG/INFO/WARN/ERROR/ALL",
 *   initialize: "LAZY/LIVELY/OCD",
 *   load_missing: true/false
 *   override: true/false/function( desired )	
 * }
 * 
 * yearn Examples:
 *   yearn( 'org/module' );
 *   yearn( 'module/version' );
 *   yearn( 'org/module/version' );
 *   yearn( 'module' );
 *   yearn( { org: 'org', module: 'module' });
 *   yearn( { module: 'module', version: 'version' });
 *   yearn( { org: 'org', module: 'module', version: 'version' });
 *   yearn( { module: 'module' });
 */

var semver = require( 'semver' );
var path = require( 'path' );
var fs = require( 'fs' );

var _yearn = null;

module.exports = function( config ){
	
	if( _yearn !== null ){
		return _yearn;
	}
	
	config = require( './utils/config' ).initialize( config );
	
	var yearn_map = { };
	var package_dependencies = {};
	var yutils = require( './utils/yearn-utils' )( config );
	
	if( typeof config.override === 'function' ){
		module.constructore.prototype.require = config.override;
		_yearn = config.override;
		return _yearn;
	}

	function determineYearningPath( desired, parent ){
		var package_json_location = yutils.findPackageJsonLocation( undefined, parent );
		
		// Determine the version from package.json if it's not provided.
		if( desired.version === undefined ){
			yutils.LOGGER.debug( 'Determining requested version from ' + path.resolve( parent.id ) + '\'s package.json' );
			
			if( package_dependencies[ package_json_location ] === undefined ){
				yutils.LOGGER.info( 'Importing dependencies from "' + package_json_location + '".' );
				var contents = JSON.parse( fs.readFileSync( package_json_location, 'utf8' ) );
				
				package_dependencies[ package_json_location ] = yutils.mergeMaps(
					contents.dependencies,
					contents.devDependencies,
					contents.optionalDependencies
				);
			}
			
			if( desired.org === '' && package_dependencies[ package_json_location ][ desired.module ] ){
				yutils.LOGGER.debug( 'Resolving version for "default"/' + desired.module + '.' );
				desired.version = package_dependencies[ package_json_location ][ desired.module ];
			} else if( desired.org !== '' && package_dependencies[ package_json_location ][ desired.org + '/' + desired.module ] ){
				yutils.LOGGER.debug( 'Resolving version for ' + desired.org + '/' + desired.module + '.' );
				desired.version = package_dependencies[ package_json_location ][ desired.org + '/' + desired.module ];
			} else {
				yutils.LOGGER.error( 'Failed to resolve version from package.json' );
				return null;
			}
		}
		
		// Check that the version is a valid semver.
		if( !yutils.isValidSemVer( desired.version )){
			yutils.LOGGER.error( 'Version must be a valid semver not "' + desired.version + '".');
			return null;
		}
		
		// Check the cache's mappings.
		if( yearn_map[ desired.org ] && yearn_map[ desired.org ][ desired.module ] && yearn_map[ desired.org ][ desired.module ][ desired.version ] ){
			yutils.LOGGER.debug( 'Found cached yearn mapping for "' +
				( desired.org === '' ? '"default"' : desired.org ) + '/' + desired.module + '@' + desired.version +
				' -> ' + yearn_map[ desired.org ][ desired.module ][ desired.version ] );
			return yearn_map[ desired.org ][ desired.module ][ desired.version ];
		}
		
		// Hunt for satisfying module.
		if( config.orgs[ desired.org ] === undefined ){
			yutils.LOGGER.error( 'Org "' + desired.org + '" is not registered with yearn.' );
			return null;
		}
		
		var module_location = yutils.findModuleLocation( 
			path.resolve( path.dirname( package_json_location ), path.join( config.orgs[ desired.org ] ) ), 
			desired.module,
			yutils.isLegacyYearning( desired )
		);
		//var module_location = path.resolve( path.dirname( package_json_location ), path.join( orgs[ desired.org ], desired.module ) );
		
		// Check if the module exists at this level
		if( !fs.existsSync( module_location ) ){
			yutils.LOGGER.error( 'Module "' + desired.module + '" was not found in org "' + desired.org + '".' );
			return null;
			
		}
			
		// Look for "org/module_name/version"
		var available_versions = fs.readdirSync( module_location ).filter( function( version ){
			// Filter out bad versions
			return yutils.isValidSemVer( version );
		}).sort( semver.rcompare );
		for( var index = 0; index < available_versions.length; ++index ){
			if( semver.satisfies( available_versions[ index ], desired.version ) ){
				var module_path = path.resolve( path.join( module_location, available_versions[ index ] ));
				if( yearn_map[ desired.org ] === undefined ){
					yearn_map[ desired.org ] = {};
				}
				
				if( yearn_map[ desired.org ][ desired.module ] === undefined ){
					yearn_map[ desired.org ][ desired.module ] = {};
				}
				
				yearn_map[ desired.org ][ desired.module ][ desired.version ] = module_path;
				
				return module_path;
			}
		}
		
		yutils.LOGGER.warn( 'Unable to find satisfactory version (assuming legacy yearning).' );
		
		// Fallback to looking for "org/module_name".
		return module_location;
	}

	function yearn( desired ){
		yutils.LOGGER.info( 'Yearning.' );
		
		switch( typeof desired ){
			case 'object':
				yutils.LOGGER.debug( 'Explicit yearning' );
			
				if( desired.module === undefined ){
					yutils.LOGGER.error( 'Modern yearn syntax was missing minimum name.' );
					return null;
				}
				
				if( desired.org === undefined ){
					desired.org = '';
				}
					
				break;
			case 'string':
				if( yutils.isNativeModule( desired ) ){
					yutils.LOGGER.debug( 'Native yearning.' );
					yutils.LOGGER.info( 'Satiating with [' + desired + '].' );
					return module.constructor._load( desired, this );
				} else if( yutils.isDirectYearning( desired ) ){
					yutils.LOGGER.debug( 'Direct yearning.' );
					yutils.LOGGER.info( 'Satiating with [' + desired + '].' );
					return module.constructor._load( desired, this );
				} else {
					yutils.LOGGER.debug( 'Implicit yearning.' );
					desired = yutils.extractYearningParts( desired );
				}
				break;
			default:
				yutils.LOGGER.error( 'Unrecognized yearn object of type: ' + typeof desired );
				return null;
		}
		
		var path = determineYearningPath( desired, this );
		
		yutils.LOGGER.info( 'Satiating with [' + path + '].' );
		return module.constructor._load( path, this );
	}
	
	if( config.override === true ){
		module.constructor.prototype.require = yearn;
	}
	
	_yearn = yearn;
	return _yearn;
};

module.exports.ynpm = require( './ynpm' );
