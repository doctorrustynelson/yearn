#!/usr/bin/env node

'use strict';

var repl = require( 'repl' );
var path = require( 'path' );

var legacy = undefined;
var index;
while( ( index = process.argv.indexOf( '--legacy' ) ) !== -1 ){
	legacy = true;
	process.argv.splice( index, 1 );
}

global.yearn = require( '../lib/yearn' )( { legacy: legacy } );

process.argv.shift( );

if( process.argv.length < 2 ){
	
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

