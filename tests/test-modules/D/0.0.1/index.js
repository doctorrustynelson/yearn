var fs = require( 'fs' );
var path = require( 'path' );

var pkg = JSON.parse( fs.readFileSync( path.join( __dirname, 'package.json' ) ) );
var name = pkg.name;
var version = pkg.version;
var dependencies = Object.keys( pkg.dependencies !== undefined ? pkg.dependencies: {} );

module.exports = function( ){
	var output = [];
	
	output.push( 'Hello from ' + name + ' @ ' + version + '.' );
	dependencies.forEach( function( dep ){
		output.push( require( dep )( ) );
	} );
	
	return output.join( '\n' );
};