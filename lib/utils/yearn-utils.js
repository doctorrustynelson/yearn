/**
 * New node file
 */

var semver = require( 'semver' );
var native_modules = Object.keys( process.binding('natives') );

var DIRECT_CRAVING_REGEXP = /^(?:\.\.\/|\.\/|\/)/;
module.exports = {

	isDirectYearning: function( path ){
		return DIRECT_CRAVING_REGEXP.test( path );
	},
	
	isValidSemVer: function( version ){
		return semver.valid( version ) || semver.validRange( version );
	},
	
	isNativeModule: function( module ){
		return native_modules.indexOf( module ) !== -1;
	},
	
	mergeMaps: function( ){
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
	}
	
};
