
var semver = require( 'semver' );
var fs = require( 'fs' );
var path = require( 'path' );
var native_modules = Object.keys( process.binding('natives') );
var logger_factory = require( './logger' );

var DIRECT_CRAVING_REGEXP = /^(?:\.\.|\.\/|\/|\\\\|[A-Za-z]:\\|[A-Za-z]:\/)/;

module.exports = function( config ){

	var yutils = {};
	
	yutils.setLOGGER = function( logger ){
		yutils.LOGGER = logger;
	};
	yutils.setLOGGER( logger_factory.getLOGGER( 'default', 'yearn' ) );
	
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
		return ( semver.valid( version, config.loose_semver ) !== null ) || ( semver.validRange( version, config.loose_semver ) !== null );
	};
	
	yutils.isNativeModule = function( module ){
		return native_modules.indexOf( module ) !== -1;
	};
	
	yutils.constructYearningString = function( desired ){
		return ( desired.org === undefined ? '' : ( desired.org === '' ? '"default"' : desired.org ) + config.delimiters.org.split('|')[0] ) +
			( desired.module ) +
			( desired.version === undefined ? '' : config.delimiters.semver.split('|')[0] + desired.version ) +
			( desired.file === undefined ? '' : config.delimiters.file.split('|')[0] + desired.file );
	};

	var YEARNING_PARTS_REGEXP = new RegExp( 
		'^((?:[^' + config.delimiters.org + ']*(?=[' + config.delimiters.org + ']))|)[' + config.delimiters.org + ']?' +
		'([^' + config.delimiters.semver + '' + config.delimiters.file + ']*)' +
		'[' + config.delimiters.semver + ']?([^' + config.delimiters.file + ']*)' + 
		'[' + config.delimiters.file + ']?(.*)$' 
	);
	
	yutils.extractYearningParts = function( desired ){
		
		var result = YEARNING_PARTS_REGEXP.exec( desired );
		
		return{
			org: ( result[ 1 ] === '' ? undefined : result[ 1 ] ),
			module: ( result[ 2 ] ),
			version: ( result[ 3 ] === '' ? undefined : result[ 3 ] ),
			file: ( result[ 4 ] === '' ? undefined : result[ 4 ] )
		};
	};
	
	yutils.findPackageJsonLocation = function( parent_location, parent ){
		
		if( parent_location === undefined ){
			parent_location = path.resolve( 
				fs.existsSync( parent.id ) && fs.statSync( parent.id ).isDirectory() ? parent.id : path.dirname( parent.id )
			);
		}
		
		var package_json_location = path.join( parent_location, 'package.json' );
		yutils.LOGGER.debug( 'Testing for existing package.json: ' + package_json_location );
		
		if( fs.existsSync( package_json_location ) ){
			return package_json_location;
		} else if ( path.basename( parent_location ) === 'node_modules' || parent_location.length <= path.resolve( '/' ).length ){
			return null;
		} else {
			return yutils.findPackageJsonLocation( path.dirname( parent_location ) );
		}
	};
	
	yutils.findModernModuleLocation = function( package_location, org_location, module ){
		var root_location = path.resolve( package_location, org_location );
		yutils.LOGGER.debug( 'Checking for module in ' + root_location );
		
		if( fs.existsSync( path.join( root_location, module ) ) ){
			return path.join( root_location, module );
		}
		
		return null;
	};
	
	yutils.findLegacyModuleLocation = function( package_location, module ){
		var root_location = path.resolve( package_location, './node_modules' );
		var old_root_location = root_location;
		
		var system_root_length = path.resolve( '/' ).length;
		while( path.dirname( root_location ).length > system_root_length ){
			yutils.LOGGER.debug( 'Checking for module in ' + root_location );
			
			if( fs.existsSync( path.join( root_location, module ) ) ){
				return path.join( root_location, module );
			}
			
			old_root_location = root_location;
			root_location = path.resolve( root_location, '../../node_modules' );
			if( root_location === old_root_location )
				break;
		}
		
		return null;
	};
	
	return yutils;
};
