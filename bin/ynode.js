
'use strict';

var repl = require( 'repl' );
var path = require( 'path' );
require( path.resolve( __dirname, '../lib/yearn' ) )( { log: 'ALL' } );

//var DIRECT_CRAVING_REGEXP = /^(?:\.\.\/|\.\/|\/)/;

if( process.argv.length < 3 ){
	
	repl.start({
		prompt: 'ynode> ',
		input: process.stdin,
		output: process.stdout
	});
	
} else if ( process.argv.length === 3 ){
	
	switch( process.argv[2] ){
		// TODO: add other options
	default:
		// TODO: fix
		require( process.argv[2] );
		break;
	}
} else {
	console.log( process.argv );
	//TODO: print help.
}

