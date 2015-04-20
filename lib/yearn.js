/*
 * yearn Options:
 * {
 *   orgs: {
 *     "org_name": "/absolute/org/location/"
 *   },
 *   logger: "default/log4js",
 *   initialize: "LAZY/LIVELY/OCD",
 *   load_missing: true/false
 *   override: true/false/function( desired )	
 * }
 * 
 * yearn Examples:
 *   yearn( 'org:module' );
 *   yearn( 'module@version' );
 *   yearn( 'org:module@version' );
 *   yearn( 'module' );
 *   yearn( 'org:module/file' );
 *   yearn( 'module@version/file' );
 *   yearn( 'org:module@version/file' );
 *   yearn( 'module/file' );
 *   yearn( { org: 'org', module: 'module' });
 *   yearn( { module: 'module', version: 'version' });
 *   yearn( { org: 'org', module: 'module', version: 'version' });
 *   yearn( { module: 'module' });
 *   yearn( { org: 'org', module: 'module', file: 'file' });
 *   yearn( { module: 'module', version: 'version', file: 'file' });
 *   yearn( { org: 'org', module: 'module', version: 'version', file: 'file' });
 *   yearn( { module: 'module', file: 'file' });
 */


var CONFIG = require( './utils/config' );
var core = require( './yearn-core' );

var _yearn = null;
var yearn_id = module.id;

function revert( ){
	module.constructor.prototype.require = core.original_require;
	module.constructor._resolveFilename = core.original_resolver;
	
	_yearn = null;
}

module.exports = function( config, force ){
		
	if( force === true ){
		revert();
	}
		
	if( _yearn !== null ){
		return _yearn;
	}
	
	config = CONFIG.initialize( config );
	
	if( typeof config.override === 'function' ){
		
		module.constructor.prototype.require = function( desired ){
			return module.constructor._load( desired, this );
		};
		
		module.constructor._resolveFilename = config.override;
		
		_yearn = require;
		_yearn.config = config;
		_yearn.revert = revert;
		_yearn.resolve = require.resolve;
		_yearn._originalResolver = core.original_resolver;
		return _yearn;
	}
	
	if( config.override === true ){
		
		module.constructor.prototype.require = function( desired ){
			return module.constructor._load( desired, this );
		};
		
		module.constructor._resolveFilename = core.resolve;
		
		_yearn = require;
		_yearn.config = config;
		_yearn.revert = revert;
		_yearn.resolve = require.resolve;
		_yearn._originalResolver = core.original_resolver;
		
	} else {
		
		_yearn = function( desired ){
			var result = core.resolve( desired, this );
			return module.constructor._load( result, this );
		};
		
		_yearn.config = config;
		_yearn.revert = revert;
		
		_yearn.resolve = function( desired ){
			return core.resolve( desired, this );
		};
		
		_yearn._originalResolver = undefined;
	}
	
	core.init( config, yearn_id );
	
	return _yearn;
};

module.exports.ynpm = require( './ynpm' );
