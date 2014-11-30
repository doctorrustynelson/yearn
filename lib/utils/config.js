/**
 * New node file
 */

var JSON5 = require( 'json5' );
var fs = require( 'fs' );

var DEFAULT_INIT_TYPE = 'LAZY';
var DEFAULT_LOG_LEVEL = 'WARN';
var DEFAULT_LOAD_MISSING = false;
var DEFAULT_OVERRIDE = true;
var DEFAULT_ORGS = { '': './node_modules' };

function defaultConfig( config ){
	
	if( config === undefined )
		config = {};
	
	config.log_level = config.log || DEFAULT_LOG_LEVEL;
	config.init_type = config.initalize || DEFAULT_INIT_TYPE;
	config.load_missing = ( config.load_missing === undefined ? DEFAULT_LOAD_MISSING : config.load_missing );
	config.override = ( config.override === undefined ? DEFAULT_OVERRIDE : config.override );
	config.orgs = config.orgs || DEFAULT_ORGS;
	
	if( config.orgs[''] === undefined )
		config.orgs[''] = DEFAULT_ORGS[''];
	
	return config;
}

function merge( ){
	var obj = {};
	for( var i = 0; i < arguments.length; ++i ){
		for (var attr in arguments[ i ] ) {
			if( arguments[ i ].hasOwnProperty( attr ) ){
				if( typeof arguments[ attr ] === 'object' ){
					if( obj[ attr ] === undefined )
						obj[ attr ] = {};
					obj[ attr ] = merge( obj[ attr ], arguments[ i ][ attr ] );
				} else {
					obj[ attr ] = arguments[ i ][ attr ];
				}
			}
		}
	}
	return obj;
}

function initialize( user_config ){
	
	var YEARN_CONFIG = process.env.YEARN_CONFIG;
	
	if( YEARN_CONFIG === undefined || YEARN_CONFIG === '' || YEARN_CONFIG === 'false' ){
		console.warn( 'YEARN_CONFIG is not defined.  Using default config.' );
		return defaultConfig( user_config );
	} else if( !fs.existsSync( YEARN_CONFIG ) ){
		console.warn( 'YEARN_CONFIG was not found at ' + YEARN_CONFIG + '.  Using default config.' );
		return defaultConfig( user_config );
	} else {
		var yearn_config = JSON5.parse( fs.readFileSync( YEARN_CONFIG ) );
		
		return defaultConfig( merge( yearn_config, user_config ) );
	}	
}

module.exports = defaultConfig;
module.exports.initialize = initialize;