#!/usr/bin/env node

'use strict';

var commander = require( 'commander' );
var fs = require( 'fs' );
var version = require( '../package.json' ).version;
var config = require( '../lib/utils/config' ).initialize( );
var ynpm = require( '../lib/ynpm' )( config );
var yutils = require( '../lib/utils/yearn-utils' )( config );
var LOGGER = require( '../lib/utils/logger' ).getLOGGER( config.logger );

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
			ynpm.commands.install( module, function( err ){
				if( err !== null ){
					LOGGER.warn( 'Failed to install ' + module + '.' );
				} else {
					LOGGER.info( 'Module ' + module + ' correctly installed.' );
				}
			} );
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
					var desired;
					if( module === '' ){
						desired = '""/' + installed_module;
						return ynpm.commands.check( installed_module, function( err, latest ){
							console.log( desired + ' -> ' + latest );
						} );
					} else {
						desired = module + '/' + installed_module;
						return ynpm.commands.check( desired, function( err, latest ){
							console.log( desired + ' -> ' + latest );
						} );
					}
				} );
			} else {
				return ynpm.commands.check( module, function( err, latest ){
					if( latest !== true && latest !== false ){
						console.log( module + ' -> ' + latest );
					}
				} );
				
			}
		} );
	} );

commander
	.command( 'config [args...]' )
	.description( 'Manage npm configuration.' )
	.action( function( args ){
		ynpm.commands.config( args, function( ){ } );
	} );

// Unrecognized 
commander
	.command( '*' )
	.action( function( ){
		console.log( 'Unrecognized ynpm command.  For more help using ynpm run "ynpm help".' );
		console.log( arguments );
	} );

// Initialize ynpm and process arguments
ynpm.init(
	{
		//TODO: make this more configurable with a .ynpmrc config file
		long: true,
		prefix: require( 'os' ).tmpdir( )
	},
	function( err ){
		if( err === null ){
			commander.parse( process.argv );
		}
	}
);