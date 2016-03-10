#!/usr/bin/env node

'use strict';

var commander = require( 'commander' );
var fs = require( 'fs' );
var JSON5 = require( 'json5' );
var _ = require( 'lodash' );
var path = require( 'path' );

var version = require( '../package.json' ).version;
var config = require( '../lib/utils/config' ).initialize( );
var ynpm = null;
var yutils = require( '../lib/utils/yearn-utils' )( config );
var LOGGER = require( '../lib/utils/logger' ).getLOGGER( config.logger );

// Set version number
commander
    .version( version )
    .option( '-u, --unsafe', 'Run commands in unsafe mode.', false )
	.option( '--noalias', 'Run commands without aliasing.', false );

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
			
			var contents = JSON5.parse( fs.readFileSync( package_json_location, 'utf8' ) );
			
			var dependencies = _.merge(
                {},
				contents.dependencies,
				contents.devDependencies,
				contents.optionalDependencies
			);
			
			modules = Object.keys( dependencies ).map( function( module ){
				return module + '@' + dependencies[ module ];
			} );
		}
		
		modules.forEach( function( module ){
			ynpm.commands.install( module, commander.noalias, function( err ){
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
	.command( 'list <module>' )
	.description( 'Find all the modules that fulfill the desired org-module-semver (or subset) provided.' )
	.action( function( desired ){
		ynpm.commands.list( desired, process.cwd( ), commander.noalias, function( err, list ){
			console.log( 'Found ' + list.length + ' matching module(s):' );
			console.log( '\t' + list.join( '\n\t' ) );
		} );
	} );

	
commander
	.command( 'shrinkwrap [root_dir]' )
	.description( 'Create a ynpm shrinkwrap.' )
	.action( function( root_dir ){
		
		if( root_dir === undefined )
			root_dir = process.cwd( );
		
        var unsafe = commander.unsafe;
        
		ynpm.commands.shrinkwrap( root_dir, {}, unsafe, function( err, shrinkwrap ){
            var dest = path.join( root_dir, 'ynpm-shrinkwrap.json' );
			fs.writeFileSync( dest, JSON.stringify( shrinkwrap, null, '\t' ) );
            console.log( 'Successfully generated ' + path.resolve( dest ) );
		} );
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
						return ynpm.commands.check( installed_module, commander.noalias, function( err, latest ){
							console.log( desired + ' -> ' + latest );
						} );
					} else {
						desired = module + '/' + installed_module;
						return ynpm.commands.check( desired, commander.noalias, function( err, latest ){
							console.log( desired + ' -> ' + latest );
						} );
					}
				} );
			} else {
				return ynpm.commands.check( module, commander.noalias, function( err, latest ){
					if( latest !== true && latest !== false ){
						console.log( module + ' -> ' + latest );
					}
				} );
				
			}
		} );
	} );

// Unrecognized 
commander
	.command( '*' )
	.action( function( ){
		console.log( 'Unrecognized ynpm command.  For more help using ynpm run "ynpm help".' );
		console.log( arguments );
	} );

// Initialize ynpm and process arguments
require( '../lib/ynpm' )( config, function( err, initialized_ynpm ){
	if( err === null ){
		ynpm = initialized_ynpm;
		commander.parse( process.argv );
	} else {
		console.log( 'Error intializing YNPM' );
	}
} );