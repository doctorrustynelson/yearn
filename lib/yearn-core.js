
var path = require( 'path' );
var YUTILS = require( './utils/yearn-utils' );
var dependency_manager = require( './utils/dependency-manager' );

var config = null;
var yearn_map = null;
var yutils = null;
var yearn_id = null;

var core = module.exports = {};

core.original_resolver = module.constructor._resolveFilename;
core.original_require = module.constructor.prototype.require;

core.init = function( configuration, id ){
	config = configuration;
	yearn_id = id;
	yearn_map = {};
	yutils = YUTILS( config );
	dependency_manager.init( config.orgs, yutils );	
	
	var root_package_json_location = yutils.findPackageJsonLocation( path.resolve( process.cwd() ) );
	var root_dependency_path = [ undefined ];
	dependency_manager.populate( root_dependency_path, undefined, root_package_json_location );
};

core.determineYearningPath = function( desired, parent ){
	var package_json_location = yutils.findPackageJsonLocation( undefined, parent );
	var error = null, module_path = null, dependency_info = null;
	
	var parent_dependency_path = dependency_manager.determinePath( parent );

	if( package_json_location === null ){
		yutils.LOGGER.warn( 'Failed to find package.json for ' + parent.id + '.' );
	}
	
	dependency_info = dependency_manager.populate( parent_dependency_path, parent.id, package_json_location );

	// Determine the org from the package.json if it's not provided (defaults to '').
	if( desired.org === undefined ){
		yutils.LOGGER.debug( 'Determining ' + desired.module + '\'s org from ' + path.resolve( parent.id ) + '\'s package.json' );
		if( dependency_info )
			desired.org = dependency_info.moduleToOrg[ desired.module ];

		// Defaulting to ''.
		if( desired.org === undefined )
			desired.org = '';
	}
	
	// Determine the version from package.json if it's not provided.
	if( desired.version === undefined ){
		yutils.LOGGER.debug( 'Determining requested version from ' + path.resolve( parent.id ) + '\'s package.json' );
		
		if( desired.org === '' && dependency_info && dependency_info.dependencies[ desired.module ] ){
			yutils.LOGGER.debug( 'Resolving version for ' + yutils.constructYearningString( desired )  + '.' );
			desired.version = dependency_info.dependencies[ desired.module ].semver;
		} else if( desired.org !== '' && dependency_info && dependency_info.dependencies[ desired.org + config.delimiters.org + desired.module ] ){
			yutils.LOGGER.debug( 'Resolving version for ' + yutils.constructYearningString( desired ) + '.' );
			desired.version = dependency_info.dependencies[ desired.org + config.delimiters.org + desired.module ].semver;
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
	
	if( config.orgs[ desired.org ] === undefined && config.orgs[ '*' ] === undefined ){
		error = new Error( 'Org "' + desired.org + '" is not registered with yearn.' );
		yutils.LOGGER.error( error.message );
		throw error;
	}
	
	module_path = yutils.findModuleLocation( package_json_location, desired );
	
	if( module_path !== null ){			
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
	
	error = new Error( 'Module "' + desired.module + '" was not found in org "' + desired.org + '".' );
	yutils.LOGGER.error( error.message );
	throw error;
};

core.resolve = function( desired, parent ){
	desired = yutils.parseDesired( desired );
	
	if( desired.direct ){
		yutils.LOGGER.info( 'Satiating direct yearning for "' + desired.file + '".' );
		return core.original_resolver( desired.file, parent );
	}
	
	if( desired.native ){
		yutils.LOGGER.info( 'Satiating native yearning for "' + desired.module + '".' );
		return core.original_resolver( desired.module, parent );
	}	
	
	if( desired.module === 'yearn' ){
		return core.original_resolver( yearn_id, parent );
	}
	
	var root_path = core.determineYearningPath( desired, parent );
	
	yutils.LOGGER.info( 'Satiating yearning for "' + yutils.constructYearningString( desired ) + '" with "' + root_path + '".' );
	
	if( desired.rootPath === true ){
		return root_path;
	} else {
		return core.original_resolver( root_path, parent );
	}
};

core.setLogger = function( logger ){
	yutils.setLOGGER( logger );
};
