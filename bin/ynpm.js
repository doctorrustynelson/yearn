#!/usr/bin/env node

'use strict';

var commander = require( 'commander' );
var version = require( '../package.json' ).version;

// Set version number
commander.version( version );

// Link ynpm version to ynpm --version
commander
	.command( 'version' )
	.description( 'Print the version of yearn installed.' )
	.action( function( ){
		console.log( version );
	});


// Link ynpm help to ynpm --help
commander
	.command( 'help' )
	.description( 'Overview of ynpm cli (you\'r looking at it).' )
	.action( function( ){
		commander.help();
	});

// Process arguments
commander.parse( process.argv );