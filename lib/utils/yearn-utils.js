/**
 * New node file
 */

var semver = require( 'semver' );
var fs = require( 'fs' );
var path = require( 'path' );
var native_modules = Object.keys( process.binding('natives') );

var DIRECT_CRAVING_REGEXP = /^(?:\.\.\/|\.\/|\/)/;
module.exports = function( config ){
	
	var LOGGER = require( './logger' )( config.log_level, 'yearn' );

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
		return ( semver.valid( version ) !== null ) || ( semver.validRange( version ) !== null );
	};
	
	yutils.isNativeModule = function( module ){
		return native_modules.indexOf( module ) !== -1;
	};
	
	yutils.mergeMaps = function( ){
		var merged_maps = {};
		for( var index = 0; index < arguments.length; ++index ){
			if( arguments[ index ] && typeof arguments[ index ] === 'object' ){
				for( var key in arguments[ index ] ){
					if( arguments[ index ].hasOwnProperty( key )){
						merged_maps[ key ] = arguments[ index ][ key ];
					}
				}
			}
		}
		return merged_maps;
	};
	
	yutils.extractYearningParts = function( path ){
		var spliced = path.split( /\/|@/ );
		
		switch( spliced.length ){
		case 1:
			LOGGER.debug( 'Yearning path ("' + path + '") is of the form "module".' );
			return { org: '', module: spliced[0], version: undefined };
		case 2:
			var valid_org = yutils.isValidOrg( spliced[0] );
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
	};
	
	yutils.findPackageJsonLocation = function( parent_location, parent ){
		
		if( parent_location === undefined ){
			parent_location = path.resolve( 
				fs.existsSync( parent.id ) && fs.statSync( parent.id ).isDirectory() ? parent.id : path.dirname( parent.id )
			);
		}
		
		var package_json_location = path.join( parent_location, 'package.json' );
		LOGGER.debug( 'Testing for existing package.json: ' + package_json_location );
		
		if( fs.existsSync( package_json_location ) ){
			return package_json_location;
		} else if ( path.basename( parent_location ) === 'node_modules' || parent_location.length < 3 ){
			return null;
		} else {
			return yutils.findPackageJsonLocation( path.dirname( parent_location ) );
		}
	};
	
	yutils.findModuleLocation = function( root_location, module, legacy_yearning ){
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
		
		return yutils.findModuleLocation( path.resolve( root_location, '../../node_modules' ), module, legacy_yearning );
	};
	
	return yutils;
};
