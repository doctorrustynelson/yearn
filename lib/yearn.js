
var init_type = 'LAZY';
var log_level = 'NONE';
var load_missing = false;
var override = true;
var orgs = { '': './node_modules' };
var yearn_map = { };
var package_dependencies = {};
var semver = require( 'semver' );
var path = require( 'path' );
var fs = require( 'fs' );
var yutils = require( './utils/yearn-utils' );

// Initialized at first run.
var LOGGER = null;

function isValidOrg( org ){
	return orgs[ org ] !== undefined;
}

function isLegacyYearning( desired ){
	return ( desired.org === '' && orgs[''] === './node_modules' );
}

function extractYearningParts( path ){
	var spliced = path.split( '/' );
	
	switch( spliced.length ){
	case 1:
		LOGGER.debug( 'Yearning path ("' + path + '") is of the form "module".' );
		return { org: '', module: spliced[0], version: undefined };
	case 2:
		var valid_org = isValidOrg( spliced[0] );
		var valid_sem_ver = yutils.isValidSemVer( spliced[1] );
			
		if( valid_org && !valid_sem_ver ){
			LOGGER.debug( 'Yearning path ("' + path + '") is of the form "org/module".' );
			return { org: spliced[0], module: spliced[1], version: undefined };
		} else if( !valid_org && valid_sem_ver ) {

			LOGGER.debug( 'Yearning path ("' + path + '") is of the form "module/version".' );
			return { org: '', module: spliced[0], version: spliced[1] };
		}
			
		LOGGER.error( 'Yearning path ("' + path + '") could not be interperted.' );
		return null;
	case 3:
		LOGGER.debug( 'Yearning path ("' + path + '") is of the form "org/module/version".' );
		return { org: spliced[0], module: spliced[1], version: spliced[2] };
	default:
		LOGGER.error( 'Yearning path ("' + path + '") could not be interperted.' );
		return null;
	}
}

function findPackageJsonLocation( parent_location ){
	var package_json_location = path.join( parent_location, 'package.json' );
	LOGGER.debug( 'Testing for existing package.json: ' + package_json_location );
	
	if( fs.existsSync( package_json_location ) ){
		return package_json_location;
	} else if ( path.basename( parent_location ) === 'node_modules' || parent_location.length < 3 ){
		return null;
	} else {
		return findPackageJsonLocation( path.dirname( parent_location ) );
	}
	
}

function findModuleLocation( root_location, module, legacy_yearning ){
	LOGGER.debug( 'Checking for module in ' + root_location );
	
	if( fs.existsSync( path.join( root_location, module ) ) ){
		return path.join( root_location, module );
	}
	
	if( legacy_yearning !== true ){
		return null;
	}
	
	if( root_location.length < 3 || root_location === '/node_modules' ){
		return null;
	}
	
	return findModuleLocation( path.resolve( root_location, '../../node_modules' ), module, legacy_yearning );
}

function determineYearningPath( desired, parent ){
	var parent_location = ( fs.existsSync( parent.id ) && fs.statSync( parent.id ).isDirectory() ? parent.id : path.dirname(parent.id) );
	var package_json_location = findPackageJsonLocation( path.resolve( parent_location ) );
	
	// Determine the version from package.json if it's not provided.
	if( desired.version === undefined ){
		LOGGER.debug( 'Determining requested version from ' + path.resolve( parent.id ) + '\'s package.json' );
		
		if( package_dependencies[ package_json_location ] === undefined ){
			LOGGER.info( 'Importing dependencies from "' + package_json_location + '".' );
			var contents = JSON.parse( fs.readFileSync( package_json_location, 'utf8' ) );
			
			package_dependencies[ package_json_location ] = yutils.mergeMaps(
				contents.dependencies,
				contents.devDependencies,
				contents.optionalDependencies
			);
		}
		
		if( desired.org === '' && package_dependencies[ package_json_location ][ desired.module ] ){
			LOGGER.debug( 'Resolving version for "default"/' + desired.module + '.' );
			desired.version = package_dependencies[ package_json_location ][ desired.module ];
		} else if( desired.org !== '' && package_dependencies[ package_json_location ][ desired.org + '/' + desired.module ] ){
			LOGGER.debug( 'Resolving version for ' + desired.org + '/' + desired.module + '.' );
			desired.version = package_dependencies[ package_json_location ][ desired.org + '/' + desired.module ];
		} else {
			LOGGER.error( 'Failed to resolve version from package.json' );
			return null;
		}
	}
	
	// Check that the version is a valid semver.
	if( !yutils.isValidSemVer( desired.version )){
		LOGGER.error( 'Version must be a valid semver not "' + desired.version + '".');
		return null;
	}
	
	// Check the cache's mappings.
	if( yearn_map[ desired.org ] && yearn_map[ desired.org ][ desired.module ] && yearn_map[ desired.org ][ desired.module ][ desired.version ] ){
		LOGGER.debug( 'Found cached yearn mapping for "' +
			( desired.org === '' ? '"default"' : desired.org ) + '/' + desired.module + '@' + desired.version +
			' -> ' + yearn_map[ desired.org ][ desired.module ][ desired.version ] );
		return yearn_map[ desired.org ][ desired.module ][ desired.version ];
	}
	
	// Hunt for satisfying module.
	if( orgs[ desired.org ] === undefined ){
		LOGGER.error( 'Org "' + desired.org + '" is not registered with yearn.' );
		return null;
	}
	
	var module_location = findModuleLocation( 
		path.resolve( path.dirname( package_json_location ), path.join( orgs[ desired.org ] ) ), 
		desired.module,
		isLegacyYearning( desired )
	);
	//var module_location = path.resolve( path.dirname( package_json_location ), path.join( orgs[ desired.org ], desired.module ) );
	
	// Check if the module exists at this level
	if( !fs.existsSync( module_location ) ){
		LOGGER.error( 'Module "' + desired.module + '" was not found in org "' + desired.org + '".' );
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
	
	LOGGER.warn( 'Unable to find satisfactory version (assuming legacy yearning).' );
	
	// Fallback to looking for "org/module_name".
	return module_location;
}

function yearn( desired ){
	LOGGER.info( 'Yearning.' );
	
	switch( typeof desired ){
	case 'object':
		LOGGER.debug( 'Explicit yearning' );
	
		if( desired.module === undefined ){
			LOGGER.error( 'Modern yearn syntax was missing minimum name.' );
			return null;
		}
		
		if( desired.org === undefined ){
			desired.org = '';
		}
			
		break;
	case 'string':
		if( yutils.isNativeModule( desired ) ){
			LOGGER.debug( 'Native yearning.' );
			LOGGER.info( 'Satiating with [' + desired + '].' );
			return module.constructor._load( desired, this );
		} else if( yutils.isDirectYearning( desired ) ){
			LOGGER.debug( 'Direct yearning.' );
			LOGGER.info( 'Satiating with [' + desired + '].' );
			return module.constructor._load( desired, this );
		} else {
			LOGGER.debug( 'Implicit yearning.' );
			desired = extractYearningParts( desired );
		}
		break;
	default:
		LOGGER.error( 'Unrecognized yearn object of type: ' + typeof desired );
		return null;
	}
	
	var path = determineYearningPath( desired, this );
	
	LOGGER.info( 'Satiating with [' + path + '].' );
	return module.constructor._load( path, this );
}

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

var _yearn = null;

module.exports = function( yearn_options ){
	
	if( _yearn !== null ){
		LOGGER.warn( 'Yearn has already been initialized.  Returning initalized yearn.' );
		return _yearn;
	}
	
	if( typeof yearn_options === 'object' ){
		log_level = yearn_options.log || log_level;
		init_type = yearn_options.initalize || init_type;
		load_missing = yearn_options.load_missing || load_missing;
		override = ( yearn_options.override === undefined ? override : yearn_options.override );
		orgs = yearn_options.orgs || orgs;
	}
	
	if( LOGGER === null)
		LOGGER = require( './utils/logger', 'yearn' )( log_level );
	
	if( typeof override === 'function' ){
		module.constructore.prototype.require = override;
		_yearn = override;
		return override;
	}
	
	if( override === true ){
		module.constructor.prototype.require = yearn;
	}
	
	_yearn = yearn;
	return _yearn;
};
