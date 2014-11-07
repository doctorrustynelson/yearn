
var chalk = require( 'chalk' );
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

var LOGGER = {
	debug: function( anything ){
		if( log_level === 'DEBUG' || log_level === 'ALL' ){
			console.log( chalk.cyan( 'yearn [DEBUG] ' ) + anything );
		}
	},
	info: function( anything ){
		if( log_level === 'DEBUG' || log_level === 'INFO' || log_level === 'ALL' ){
			console.log( chalk.green( 'yearn [INFO]  ' ) + anything );
		}
	},
	warn: function( anything ){
		if( log_level === 'DEBUG' || log_level === 'INFO' || log_level === 'WARN' || log_level === 'ALL' ){
			console.log( chalk.yellow( 'yearn [WARN]  ' + anything ) );
		}
	},
	error: function( anything ){
		if( log_level === 'DEBUG' || log_level === 'WARN' || log_level === 'INFO' || log_level === 'ERROR' || log_level === 'ALL' ){
			console.log( chalk.red( 'yearn [ERROR] ' + anything ) );
		}
	}
};

var DIRECT_CRAVING_REGEXP = /^(?:\.\.\/|\.\/|\/)/;
function isDirectYearning( path ){
	return DIRECT_CRAVING_REGEXP.test( path );
}

function isValidOrg( org ){
	return orgs[ org ] !== undefined;
}

function isValidSemVer( version ){
	return semver.valid( version ) || semver.validRange( version );
}

function extractYearningParts( path ){
	var spliced = path.split( '/' );
	
	switch( spliced.length ){
		case 1:
			LOGGER.debug( 'Yearning path ("' + path + '") is of the form "module".' );
			return { org: '', module: spliced[0], version: undefined };
		case 2:
			var valid_org = isValidOrg( spliced[0] );
			var valid_sem_ver = isValidSemVer( spliced[1] );
			
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

function mergeDependencies( ){
	var merged_dependencies = {};
	for( var index = 0; index < arguments.length; ++index ){
		if( arguments[index] && typeof arguments[ index ] === 'object' ){
			for( var module in arguments[ index ] ){
				if( arguments[ index ].hasOwnProperty( module )){
					merged_dependencies[ module ] = arguments[ index ][ module ];
				}
			}
		}
	}
	return merged_dependencies;
}

function determineYearningPath( desired, parent ){
	LOGGER.debug( parent.id );
	var parent_location = ( fs.existsSync( parent.id) && fs.statSync( parent.id ).isDirectory() ? parent.id : path.dirname(parent.id) );
	
	// Determine the version from package.json if it's not provided.
	if( desired.version === undefined ){
		LOGGER.debug( 'Determining requested version from ' + path.resolve( parent.id ) + '\'s package.json' );
		var package_json_location = path.join( parent_location, 'package.json' );
		
		if( package_dependencies[ package_json_location ] === undefined ){
			LOGGER.info( 'Importing dependencies from "' + package_json_location + '".' );
			var contents = JSON.parse( fs.readFileSync( package_json_location, 'utf8' ) );
			
			package_dependencies[ package_json_location ] = mergeDependencies(
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
	if( !isValidSemVer( desired.version )){
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
	if( orgs[ desired.org] === undefined ){
		LOGGER.error( 'Org "' + desired.org + '" is not registered with yearn.' );
		return null;
	}
	
	var module_location = path.resolve( parent_location, path.join( orgs[ desired.org ], desired.module ) );
	
	if( !fs.existsSync( module_location ) ){
		LOGGER.error( 'Module "' + desired.module + '" was not found in org "' + desired.org + '".' );
		return null;
	}
	
	var available_versions = fs.readdirSync( module_location ).sort( semver.rcompare );
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
	
	LOGGER.error( 'Unable to find satisfactory version.' );
	return null;
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
			if( isDirectYearning( desired ) ){
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

module.exports = function( yearn_options ){
	
	if( typeof yearn_options === 'object' ){
		log_level = yearn_options.log || log_level;
		init_type = yearn_options.initalize || init_type;
		load_missing = yearn_options.load_missing || load_missing;
		override = yearn_options.override || override;
		orgs = yearn_options.orgs || orgs;
	}
	
	if( typeof override === 'function' ){
		module.constructore.prototype.require = override;
		return override;
	}
	
	if( override === true ){
		module.constructor.prototype.require = yearn;
		return yearn;
	}
};
