
var fs = require( 'fs' );
var merge = require( 'merge' ).recursive;
var path = require( 'path' );
var semver = require( 'semver' );
var JSON5 = require( 'json5' );
var YUTILS = require( './utils/yearn-utils' );

var config = null;
var yearn_map = null;
var yutils = null;
var yearn_id = null;

var core = module.exports = {};

core.original_resolver = module.constructor._resolveFilename;
core.original_require = module.constructor.prototype.require;

core.package_dependencies = null;

core.init = function( configuration, id ){
	config = configuration;
	yearn_id = id;
	yearn_map = {};
	core.package_dependencies = {};
	yutils = YUTILS( config );
	
	yutils.setLOGGER( config.logger );
};

core.populatePackageCache = function( package_json_location, parent ){
	if( core.package_dependencies[ package_json_location ] === undefined ){
		yutils.LOGGER.info( 'Importing dependencies from "' + package_json_location + '".' );
		var contents = JSON5.parse( fs.readFileSync( package_json_location, 'utf8' ));
		
		core.package_dependencies[ package_json_location ] = merge( 
			contents.dependencies,
			contents.devDependencies,
			contents.optionalDependencies
		);
		
		// Creating mapping of module to org
		var reverseOrgs = {};
		Object.keys( core.package_dependencies[ package_json_location ] ).forEach( function( dependency ){
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
		
		core.package_dependencies[ package_json_location ].__reverseOrgs = reverseOrgs;
	} else {
		yutils.LOGGER.trace( 'Found cached dependencies of ' + parent.id + '.' );
	}
};

core.determineYearningPath = function( desired, parent ){
	var package_json_location = yutils.findPackageJsonLocation( undefined, parent );
	var error = null, module_path = null;
	
	if( package_json_location === null ){
		yutils.LOGGER.warn( 'Failed to find package.json for ' + parent.id + '.' );
	} else {
		core.populatePackageCache( package_json_location, parent );
	}
	
	// Determine the org from the package.json if it's not provided (defaults to '').
	if( desired.org === undefined ){
		yutils.LOGGER.debug( 'Determining ' + desired.module + '\'s org from ' + path.resolve( parent.id ) + '\'s package.json' );
		
		if( package_json_location !== null )
			desired.org = core.package_dependencies[ package_json_location ].__reverseOrgs[ desired.module ];
		
		// Defaulting to ''.
		if( desired.org === undefined )
			desired.org = '';
	}
	
	// Determine the version from package.json if it's not provided.
	if( desired.version === undefined ){
		yutils.LOGGER.debug( 'Determining requested version from ' + path.resolve( parent.id ) + '\'s package.json' );
		
		if( desired.org === '' && package_json_location !== null && core.package_dependencies[ package_json_location ][ desired.module ] ){
			yutils.LOGGER.debug( 'Resolving version for ' + yutils.constructYearningString( desired )  + '.' );
			desired.version = core.package_dependencies[ package_json_location ][ desired.module ];
		} else if( desired.org !== '' && package_json_location !== null && core.package_dependencies[ package_json_location ][ desired.org + config.delimiters.org + desired.module ] ){
			yutils.LOGGER.debug( 'Resolving version for ' + yutils.constructYearningString( desired ) + '.' );
			desired.version = core.package_dependencies[ package_json_location ][ desired.org + config.delimiters.org + desired.module ];
		} else {
			yutils.LOGGER.warn( 'Failed to resolve version from package.json for ' + yutils.constructYearningString( desired )  + '.' );
			desired.version = '*';
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
	
	var module_location = yutils.findModernModuleLocation( 
		path.dirname( package_json_location || parent.id ), 
		config.orgs[ desired.org ], 
		desired.module
	);
	
	// Check if the module exists using the modern syntax
	if( fs.existsSync( module_location ) ){
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
				
				if( desired.file !== undefined )
					module_path = path.join( module_path, desired.file );
				
				return module_path;
			}
		}
	}
		
	// Check if allowing legacy yearning
	if( yutils.isLegacyYearning( desired ) || config.legacy ){
		yutils.LOGGER.warn( 'Unable to find satisfactory version (assuming legacy yearning).' );
		
		module_location = yutils.findLegacyModuleLocation( path.dirname( package_json_location || parent.id ), desired.module );
		
		if( desired.file !== undefined )
			module_location = path.join( module_location, desired.file );
		
		return module_location;
	} else {
		error = new Error( 'Module "' + desired.module + '" was not found in org "' + desired.org + '".' );
		yutils.LOGGER.error( error.message );
		throw error;
	}
};

core.resolve = function( desired, parent ){
	var error = null;
	
	switch( typeof desired ){
		case 'object':
			yutils.LOGGER.debug( 'Explicit yearning of ' + yutils.constructYearningString( desired ) + '.' );
		
			if( desired.module === undefined ){
				error = new Error( 'Modern yearn syntax was missing minimum name: ' + JSON5.stringify( desired ) + '.' );
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
				return core.original_resolver( desired, parent );
			} else if( yutils.isDirectYearning( desired ) ){
				yutils.LOGGER.info( 'Satiating direct yearning for "' + desired + '".' );
				return core.original_resolver( desired, parent );
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
		return core.original_resolver( yearn_id, parent );
	}
	
	var path = core.determineYearningPath( desired, parent );
	
	yutils.LOGGER.info( 'Satiating yearning for "' + yutils.constructYearningString( desired ) + '" with "' + path + '".' );
	return core.original_resolver( path, parent );
};