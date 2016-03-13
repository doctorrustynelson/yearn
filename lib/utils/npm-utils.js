
var fs = require( 'fs' );
var JSON5 = require( 'json5' );
var spawn = require('child_process').spawn;
var merge = require( 'lodash' ).merge;

var NODE_COMMAND = process.argv[ 0 ];
var NPM_COMMAND = require.resolve( 'npm/bin/npm-cli.js' );

module.exports = {
	
	installToDir: function( module, dest, npmconfig, callback ){
		fs.access( dest, ( error ) => {
			if( error ){
				console.log(`ERROR: Destination for npm install ${dest} doesn't exist.`);
				return callback( error );
			}
			
			var env = merge( {}, process.env );
			Object.keys( npmconfig ).forEach( ( key ) => {
				env[`npm_config_${key}`] = npmconfig[ key ];
			} );
			
			const npm_install = spawn( NODE_COMMAND, [ NPM_COMMAND, 'install', module ], {
				cwd: dest,
				env: env
			} );
			
			npm_install.on( 'close', (exit_code) => {
				if( exit_code !== 0 ){
					console.log(`ERROR: npm install ${module} exited with code ${exit_code}.`);
					return callback( true );
				}
				
				return callback( null );
			} );
		} );
	},
	
	viewVersion: function( module, npmconfig, callback ){
		var env = merge( {}, process.env );
		Object.keys( npmconfig ).forEach( ( key ) => {
			env[`npm_config_${key}`] = npmconfig[ key ];
		} );
		
		const npm_view = spawn( NODE_COMMAND, [ NPM_COMMAND, 'view', module, 'version', '--json' ] );
		
		var buff = '';
		npm_view.stdout.on( 'data', (data) => {
			buff = buff.concat( data );
		} );
		
		npm_view.on( 'close', (exit_code) => {
			if( exit_code !== 0 ){
				console.log(`ERROR: npm view ${module} version exited with code ${exit_code}.`);
				return callback( true );
			}
			
			var json;
			try {
				json = JSON5.parse( buff );
			} catch( exception ){
				console.log(`ERROR: failed to parse output from npm view ${module} version.`);
				return callback( true );
			}
			
			return callback( null, json );
		} );
	}
		
};