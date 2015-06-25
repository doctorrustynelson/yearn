#!/usr/bin/env node

'use strict';

var repl = require( 'repl' );
var path = require( 'path' );
var fs = require( 'fs' );

var legacy;
var version = false;
var yversion = false;
var index;

while( ( index = process.argv.indexOf( '--legacy' ) ) !== -1 ){
	legacy = true;
	process.argv.splice( index, 1 );
}

while( ( index = process.argv.indexOf( '--version' ) ) !== -1 ){
	version = true;
	process.argv.splice( index, 1 );
}

while( ( index = process.argv.indexOf( '-v' ) ) !== -1 ){
	version = true;
	process.argv.splice( index, 1 );
}

while( ( index = process.argv.indexOf( '--yversion' ) ) !== -1 ){
	yversion = true;
	process.argv.splice( index, 1 );
}

global.yearn = require( '../lib/yearn' )( { legacy: legacy } );

process.argv.shift( );

if( process.argv.length < 2 ){

	if( version === true ) {
		console.log( process.version );
		process.exit( 0 );
	}

	if( yversion === true ) {
		var pkg = JSON.parse( fs.readFileSync( path.join( __dirname, '..', 'package.json' ) ) );
		console.log( pkg.version );
		process.exit( 0 );
	}

	
	repl.start( {
		prompt: ( global.yearn.config.prompt || 'ynode> ' ),
		input: process.stdin,
		output: process.stdout
	} );
	
} else if ( process.argv.length >= 2 ){
	
	switch( process.argv[1] ){
		default:
			try {
				require( path.resolve( process.argv[1] ) );
			} catch ( exception ) {
				console.log( exception.stack );
			}
			break;
	}
}

