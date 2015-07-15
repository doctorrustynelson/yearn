/**
 * Configuration
 */

var JSON5 = require( 'json5' );
var fs = require( 'fs' );
var merge = require( 'merge' ).recursive;

var DEFAULT_INIT_TYPE = 'LAZY';
var DEFAULT_LOGGER = 'default';
var DEFAULT_LOAD_MISSING = false;
var DEFAULT_LEGACY = false;
var DEFAULT_OVERRIDE = true;
var DEFAULT_PROMPT = 'ynode> ';
var DEFAULT_ORGS = { '': './node_modules' };
var DEFAULT_NPMCONFIG = {};
var DEFAULT_LOOSE_SEMVER = false;
var DEFAULT_DELIMITERS = {
	org: ':',
	semver: '@',
	file: '/'
};

function defaultConfig( config ){
	
	if( config === undefined )
		config = {};
	
	config.logger = config.logger || DEFAULT_LOGGER;
	config.init_type = config.initalize || DEFAULT_INIT_TYPE;
	config.load_missing = ( config.load_missing === undefined ? DEFAULT_LOAD_MISSING : config.load_missing );
	config.legacy = ( config.legacy === undefined ? DEFAULT_LEGACY : config.legacy );
	config.override = ( config.override === undefined ? DEFAULT_OVERRIDE : config.override );
	config.prompt = ( config.prompt === undefined ? DEFAULT_PROMPT : config.prompt );
	config.loose_semver = ( config.loose_semver === undefined ? DEFAULT_LOOSE_SEMVER : config.loose_semver );
	
	config.orgs = config.orgs || {};
	config.orgs[''] = config.orgs[''] || DEFAULT_ORGS[''];
	
	config.delimiters = config.delimiters || {};
	config.delimiters.org = config.delimiters.org || DEFAULT_DELIMITERS.org;
	config.delimiters.semver = config.delimiters.semver || DEFAULT_DELIMITERS.semver;
	config.delimiters.file = config.delimiters.file || DEFAULT_DELIMITERS.file;
	
	config.npmconfig = config.npmconfig || DEFAULT_NPMCONFIG;
	
	return config;
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
		
		if( user_config !== undefined ){
			Object.keys( user_config ).forEach( function( key ){
				if( user_config[ key ] === undefined ){
					delete user_config[ key ];
				}	
			} );
		}
		
		return defaultConfig( merge( yearn_config, user_config ) );
	}	
}

module.exports = defaultConfig;
module.exports.initialize = initialize;