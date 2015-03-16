#!/usr/bin/env node

'use strict';

var repl = require( 'repl' );
var path = require( 'path' );
global.yearn = require( '../lib/yearn' )( );

process.argv.shift( );

if( process.argv.length < 2 ){
	
	repl.start( {
		prompt: 'ynode> ',
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

