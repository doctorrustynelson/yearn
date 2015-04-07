/*
 * yearn Options:
 * {
 *   orgs: {
 *     "org_name": "/absolute/org/location/"
 *   },
 *   logger: "default/log4js",
 *   initialize: "LAZY/LIVELY/OCD",
 *   load_missing: true/false
 *   override: true/false/function( desired )	
 * }
 * 
 * yearn Examples:
 *   yearn( 'org:module' );
 *   yearn( 'module@version' );
 *   yearn( 'org:module@version' );
 *   yearn( 'module' );
 *   yearn( 'org:module/file' );
 *   yearn( 'module@version/file' );
 *   yearn( 'org:module@version/file' );
 *   yearn( 'module/file' );
 *   yearn( { org: 'org', module: 'module' });
 *   yearn( { module: 'module', version: 'version' });
 *   yearn( { org: 'org', module: 'module', version: 'version' });
 *   yearn( { module: 'module' });
 *   yearn( { org: 'org', module: 'module', file: 'file' });
 *   yearn( { module: 'module', version: 'version', file: 'file' });
 *   yearn( { org: 'org', module: 'module', version: 'version', file: 'file' });
 *   yearn( { module: 'module', file: 'file' });
 */

var semver = require( 'semver' );
var path = require( 'path' );
var fs = require( 'fs' );
var merge = require( 'merge' ).recursive;
var CONFIG = require( './utils/config' );
var YUTILS = require( './utils/yearn-utils' );

var _yearn = null;
var original_resolver = module.constructor._resolveFilename;
var original_require = module.constructor.prototype.require;
var yearn_id = module.id;

function revert( ){
	module.constructor.prototype.require = original_require;
	module.constructor._resolveFilename = original_resolver;
	_yearn = null;
}

module.exports = function( config, force ){
		
	if( force === true ){
		revert();
	}
		
	if( _yearn !== null ){
		return _yearn;
	}
	
	config = CONFIG.initialize( config );
	
	if( typeof config.override === 'function' ){
		module.constructor.prototype.require = function( desired ){
			return module.constructor._load( desired, this );
		};
		
		module.constructor._resolveFilename = config.override;
		
		_yearn = require;
		_yearn.config = config;
		_yearn.revert = revert;
		_yearn.resolve = require.resolve;
		_yearn._originalResolver = original_resolver;
		return _yearn;
	}
	
	var yearn_map = { };
	var package_dependencies = {};
	var yutils = YUTILS( config );
	
	function populatePackageCache( package_json_location, parent ){
		if( package_dependencies[ package_json_location ] === undefined ){
			yutils.LOGGER.info( 'Importing dependencies from "' + package_json_location + '".' );
			var contents = JSON.parse( fs.readFileSync( package_json_location, 'utf8' ));
			
			package_dependencies[ package_json_location ] = merge( 
				contents.dependencies,
				contents.devDependencies,
				contents.optionalDependencies
			);
			
			// Creating mapping of module to org
			var reverseOrgs = {};
			Object.keys( package_dependencies[ package_json_location ] ).forEach( function( dependency ){
				dependency = yutils.extractYearningParts( dependency );
				
				if( dependency.org === undefined )
					dependency.org = '';
				
				if( reverseOrgs[ dependency.module ] !== undefined && reverseOrgs[ dependency.module ] !== dependency.org ){
					var error = new Error( 'Dependency ' + dependency.module + ' can not exist in multiple orgs [ ' + reverseOrgs[ dependency.module ] + ', ' +  dependency.org + ' ].' );
					yutils.LOGGER.error( error.message );
					throw error;
				}
				
				reverseOrgs[ dependency.module ] = dependency.org;
			});
			
			package_dependencies[ package_json_location ].__reverseOrgs = reverseOrgs;
		} else {
			yutils.LOGGER.trace( 'Found cached dependencies of ' + parent.id + '.' );
		}
	}

	function determineYearningPath( desired, parent ){
		var package_json_location = yutils.findPackageJsonLocation( undefined, parent );
		var error = null, module_path = null;
		
		if( package_json_location === null ){
			error = new Error( 'Failed to find package.json for ' + parent.id + '.' );
			yutils.LOGGER.error( error.message );
			throw error;
		} else {
			populatePackageCache( package_json_location, parent );
		}
		
		// Determine the org from the package.json if it's not provided (defaults to '').
		if( desired.org === undefined ){
			yutils.LOGGER.debug( 'Determining ' + desired.module + '\'s org from ' + path.resolve( parent.id ) + '\'s package.json' );
			
			desired.org = package_dependencies[ package_json_location ].__reverseOrgs[ desired.module ];
			
			// Defaulting to ''.
			if( desired.org === undefined )
				desired.org = '';
		}
		
		// Determine the version from package.json if it's not provided.
		if( desired.version === undefined ){
			yutils.LOGGER.debug( 'Determining requested version from ' + path.resolve( parent.id ) + '\'s package.json' );
			
			if( desired.org === '' && package_dependencies[ package_json_location ][ desired.module ] ){
				yutils.LOGGER.debug( 'Resolving version for ' + yutils.constructYearningString( desired )  + '.' );
				desired.version = package_dependencies[ package_json_location ][ desired.module ];
			} else if( desired.org !== '' && package_dependencies[ package_json_location ][ desired.org + config.delimiters.org + desired.module ] ){
				yutils.LOGGER.debug( 'Resolving version for ' + yutils.constructYearningString( desired ) + '.' );
				desired.version = package_dependencies[ package_json_location ][ desired.org + config.delimiters.org + desired.module ];
			} else {
				error = new Error( 'Failed to resolve version from package.json for ' + yutils.constructYearningString( desired )  + '.' );
				yutils.LOGGER.error( error.message );
				throw error;
			}
		}
		
		// Check that the version is a valid semver.
		if( !yutils.isValidSemVer( desired.version )){
			error = new Error( 'Version must be a valid semver not "' + desired.version + '".');
			yutils.LOGGER.error( error.message );
			throw error;
		}
		
		// Check the cache's mappings.
		if( yearn_map[ desired.org ] && yearn_map[ desired.org ][ desired.module ] && yearn_map[ desired.org ][ desired.module ][ desired.version ] ){
			yutils.LOGGER.debug( 
				'Found cached yearn mapping for "' +
				yutils.constructYearningString( desired ) +
				' -> ' + yearn_map[ desired.org ][ desired.module ][ desired.version ]
			);
			
			module_path = yearn_map[ desired.org ][ desired.module ][ desired.version ];
			
			if( desired.file !== undefined )
				module_path = path.join( module_path, desired.file );
			
			return module_path;
		}
		
		// Hunt for satisfying module.
		if( config.orgs[ desired.org ] === undefined ){
			error = new Error( 'Org "' + desired.org + '" is not registered with yearn.' );
			yutils.LOGGER.error( error.message );
			throw error;
		}
		
		var module_location = yutils.findModuleLocation( 
			path.resolve( path.dirname( package_json_location ), path.join( config.orgs[ desired.org ] ) ), 
			desired.module,
			yutils.isLegacyYearning( desired )
		);
		
		// Check if the module exists at this level
		if( !fs.existsSync( module_location ) ){
			error = new Error( 'Module "' + desired.module + '" was not found in org "' + desired.org + '".' );
			yutils.LOGGER.error( error.message );
			throw error;
			
		}
			
		// Look for "org/module_name/version"
		var available_versions = fs.readdirSync( module_location ).filter( function( version ){
			// Filter out bad versions
			return yutils.isValidSemVer( version );
		}).sort( semver.rcompare );
		
		for( var index = 0; index < available_versions.length; ++index ){
			if( semver.satisfies( available_versions[ index ], desired.version ) ){
				module_path = path.resolve( path.join( module_location, available_versions[ index ] ));
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
		
		if( desired.file !== undefined )
			module_location = path.join( module_location, desired.file );
		
		// Fallback to looking for "org/module_name".
		return module_location;
	}

	function yearn( desired, parent ){
		var error = null;
		
		switch( typeof desired ){
			case 'object':
				yutils.LOGGER.debug( 'Explicit yearning of ' + yutils.constructYearningString( desired ) + '.' );
			
				if( desired.module === undefined ){
					error = new Error( 'Modern yearn syntax was missing minimum name: ' + JSON.stringify( desired ) + '.' );
					yutils.LOGGER.error( error.message );
					throw error;
				}
				
				if( desired.org === undefined ){
					desired.org = '';
				}
					
				break;
			case 'string':
				if( yutils.isNativeModule( desired ) ){
					yutils.LOGGER.info( 'Satiating native yearning for "' + desired + '".' );
					return original_resolver( desired, parent );
				} else if( yutils.isDirectYearning( desired ) ){
					yutils.LOGGER.info( 'Satiating direct yearning for "' + desired + '".' );
					return original_resolver( desired, parent );
				} else {
					yutils.LOGGER.info( 'Implicit yearning for "' + desired + '".' );
					desired = yutils.extractYearningParts( desired );
				}
				break;
			default:
				error = new Error( 'Unrecognized yearn object of type: ' + typeof desired );
				yutils.LOGGER.error( error.message );
				throw error;
		}
		
		if( desired.module === 'yearn' ){
			return original_resolver( yearn_id, parent );
		}
		
		var path = determineYearningPath( desired, parent );
		
		yutils.LOGGER.info( 'Satiating yearning for "' + yutils.constructYearningString( desired ) + '" with "' + path + '".' );
		return original_resolver( path, parent );
	}
	
	if( config.override === true ){
		module.constructor.prototype.require = function( desired ){
			return module.constructor._load( desired, this );
		};
		
		module.constructor._resolveFilename = yearn;
		
		_yearn = require;
		_yearn.config = config;
		_yearn.revert = revert;
		_yearn.resolve = require.resolve;
		_yearn._originalResolver = original_resolver;
	} else {
		
		_yearn = function( desired ){
			var result = yearn( desired, this );
			return module.constructor._load( result, this );
		};

		_yearn.revert = revert;
		
		_yearn.config = config;
		_yearn.revert = revert;
		
		_yearn.resolve = function( desired ){
			return yearn( desired, this );
		};
		
		_yearn._originalResolver = undefined;
	}
	
	yutils.setLOGGER( config.logger );
	
	return _yearn;
};

module.exports.ynpm = require( './ynpm' );
