#!/usr/bin/env node

'use strict';

var commander = require( 'commander' );
var fs = require( 'fs' );
var version = require( '../package.json' ).version;
var config = require( '../lib/utils/config' ).initialize( );
var ynpm = require( '../lib/ynpm' )( config );
var yutils = require( '../lib/utils/yearn-utils' )( config );
var LOGGER = require( '../lib/utils/logger' )( config.log_level, 'ynpm' );

// Set version number
commander.version( version );

// Link ynpm version to ynpm --version
commander
	.command( 'version' )
	.description( 'Print the version of yearn installed.' )
	.action( function( ){
		console.log( version );
	} );


// Link ynpm help to ynpm --help
commander
	.command( 'help' )
	.description( 'Overview of ynpm cli (you\'r looking at it).' )
	.action( function( ){
		commander.help();
	} );

commander
	.command( 'install [modules...]' )
	.description( 'Install modules from npm to the flattened yearn structure.' )
	.action( function( modules ){
		if( modules.length === 0 ){
			LOGGER.info( 'Installing modules specified in package.json.' );
			var package_json_location = yutils.findPackageJsonLocation( undefined, this );
			
			console.log( package_json_location );
			
			var contents = JSON.parse( fs.readFileSync( package_json_location, 'utf8' ) );
			
			var dependencies = yutils.mergeMaps(
				contents.dependencies,
				contents.devDependencies,
				contents.optionalDependencies
			);
			
			modules = Object.keys( dependencies ).map( function( module ){
				return module + '@' + dependencies[ module ];
			} );
		}
		
		modules.forEach( function( module ){
			ynpm.commands.install( module );
		} );
		
	} );

commander
	.command( 'orgs' )
	.description( 'Print the current orgs as specified by the YEARN_CONFIG.' )
	.action( function( ){
		var orgs = ynpm.commands.orgs( );
		for( var org in orgs ){
			if( orgs.hasOwnProperty( org ) ){
				console.log( '\t' + ( org === '' ? '""' : org ) + ' -> ' + orgs[org] );
			}
		}
	} );

commander
	.command( 'check [orgs_or_specific_modules...]' )
	.description( 'Print the modules that need to be updated and to what version.' )
	.action( function( modules ){
		if( modules.length === 0 ){
			modules = Object.keys( config.orgs );
		}
		
		modules.forEach( function( module ){
			if( yutils.isValidOrg( module ) ){
				fs.readdirSync( config.orgs[ module ] ).forEach( function( installed_module ){
					var latest;
					var desired;
					if( module === '' ){
						desired = '""/' + installed_module;
						latest = ynpm.commands.check( installed_module );
					} else {
						desired = module + '/' + installed_module;
						latest = ynpm.commands.check( desired );
					}
					
					if( latest !== true && latest !== false ){
						console.log( desired + ' -> ' + latest );
					}
				} );
			} else {
				var latest = ynpm.commands.check( module );
				if( latest !== true && latest !== false ){
					console.log( module + ' -> ' + latest );
				}
			}
		} );
		
		console.log( 'Checking Complete.' );
	} );

// Unrecognized 
commander
	.command( '*' )
	.action( function( ){
		console.log( 'Unrecognized ynpm command.  For more help using ynpm run "ynpm help".' );
		console.log( arguments );
	} );

// Process arguments
commander.parse( process.argv );