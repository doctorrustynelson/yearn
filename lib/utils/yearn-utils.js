/**
 * New node file
 */

var semver = require( 'semver' );
var native_modules = Object.keys( process.binding('natives') );

// Intialize on first run.
var LOGGER = null;

var DIRECT_CRAVING_REGEXP = /^(?:\.\.\/|\.\/|\/)/;
module.exports = function( config ){
	
	if( LOGGER === null )
		LOGGER = require( './logger', 'yearn' )( config.log_level );

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
		var spliced = path.split( '/' );
		
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
	
	return yutils;
};
