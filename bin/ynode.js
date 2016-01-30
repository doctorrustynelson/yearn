#!/usr/bin/env node

'use strict';

var repl = require( 'repl' );
var path = require( 'path' );
var fs = require( 'fs' );
var commander = require( 'commander' );

commander
	.version( process.version )
	.option( '--yversion', 'ouput version of yearn.', function( ){
		var pkg = JSON.parse( fs.readFileSync( path.join( __dirname, '..', 'package.json' ) ) );
		console.log( pkg.version );
		process.exit( 0 );
	} )
	.option( '--legacy', 'turn legacy resolution on' )
	.option( '-e, --eval <script>', 'evaluate command', function( script ){ 
		
		global.yearn = require( '../lib/yearn' )( { legacy: commander.legacy } );
		
		var temp_file = path.resolve( '.tempnodescript.js' );
		fs.writeFileSync( temp_file, script );
		require( temp_file );
		fs.unlinkSync( temp_file );
		process.exit( 0 );
	} )
	.arguments('<script>')
	.action( function( script ){
		
		if( script ){
			
			global.yearn = require( '../lib/yearn' )( { legacy: commander.legacy } );
			
			try {
				require( path.resolve( process.argv[1] ) );
			} catch ( exception ) {
				console.log( exception.stack );
				process.exit( 1 );
			}
			process.exit( 0 );
		}
	} );

commander.parse( process.argv );

global.yearn = require( '../lib/yearn' )( { legacy: commander.legacy } );

repl.start( {
	prompt: ( global.yearn.config.prompt || 'ynode> ' ),
	input: process.stdin,
	output: process.stdout
} );
