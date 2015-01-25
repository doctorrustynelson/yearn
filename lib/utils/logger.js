/**
 * Logger definition.
 */

'use strict';

var DEFAULT_LOGGER = {
	trace: function(){},
	debug: function(){},
	info: function(){},
	warn: function(){},
	error: function(){},
	fatal: function(){}
};

module.exports = {
	
	getLOGGER: function( type, name ){
		switch( ( '' + type ).toUpperCase() ){
			case 'UNDEFINED':
			case '':
			case 'NONE':
			case 'OFF':
			case 'DEFAULT':
				return DEFAULT_LOGGER;
			default:
				return require( type ).getLogger( name );
		}
	}
};