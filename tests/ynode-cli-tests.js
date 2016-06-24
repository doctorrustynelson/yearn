/* Node unit quick reference:
 * 
 *	ok(value, [message]) 
 *		- Tests if value is a true value.
 *	equal(actual, expected, [message]) 
 *		- Tests shallow, coercive equality with the equal comparison operator ( == ).
 *	notEqual(actual, expected, [message]) 
 *		- Tests shallow, coercive non-equality with the not equal comparison operator ( != ).
 *	deepEqual(actual, expected, [message]) 
 *		- Tests for deep equality.
 *	notDeepEqual(actual, expected, [message]) 
 *		- Tests for any deep inequality.
 *	strictEqual(actual, expected, [message]) 
 *		- Tests strict equality, as determined by the strict equality operator ( === )
 *	notStrictEqual(actual, expected, [message]) 
 *		- Tests strict non-equality, as determined by the strict not equal operator ( !== )
 *	throws(block, [error], [message]) 
 *		- Expects block to throw an error.
 *	doesNotThrow(block, [error], [message]) 
 *		- Expects block not to throw an error.
 *	ifError(value) 
 *		- Tests if value is not a false value, throws if it is a true value.
 *	
 *	expect(amount) 
 *		- Specify how many assertions are expected to run within a test. 
 *	done() 
 *		- Finish the current test function, and move on to the next. ALL tests should call this!
 */

var exec = require( 'child_process' ).exec;
var path = require( 'path' );
var fs = require( 'fs' );

module.exports.versionTests = {
	
	explicit: function( test ){
		
		exec( 'node ../bin/ynode.js --version', {
			cwd: __dirname
		}, function( err, stdout, stderr ){
			test.equal( null, err );
			test.deepEqual( [
			    //'YEARN_CONFIG is not defined.'
			], stderr.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ));
			test.deepEqual( [
 			    '' + process.version
 			], stdout.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ));
			test.done();
		} );
	},
	
	shorthand: function( test ){
		
		exec( 'node ../bin/ynode.js -V', {
			cwd: __dirname
		}, function( err, stdout, stderr ){
			test.equal( null, err );
			test.deepEqual( [
			    //'YEARN_CONFIG is not defined.'
			], stderr.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ));
			test.deepEqual( [
 			    '' + process.version
 			], stdout.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ));
			test.done();
		} );
	},

	shorthand2: function( test ){
		
		exec( 'node ../bin/ynode.js -v', {
			cwd: __dirname
		}, function( err, stdout, stderr ){
			test.equal( null, err );
			test.deepEqual( [
			    //'YEARN_CONFIG is not defined.'
			], stderr.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ));
			test.deepEqual( [
 			    '' + process.version
 			], stdout.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ));
			test.done();
		} );
	},
};

module.exports.yearnVersionTests = {
	
	explicit: function( test ){
		
		exec( 'node ../bin/ynode.js --yversion', {
			cwd: __dirname
		}, function( err, stdout, stderr ){
			test.equal( null, err );
			test.deepEqual( [
			    //'YEARN_CONFIG is not defined.'
			], stderr.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ));
			test.deepEqual( [
 			    '' + JSON.parse( fs.readFileSync( path.join( __dirname, '..', 'package.json' ) ) ).version
 			], stdout.split( '\n' ).map( function( line ){ return line.trim(); } ).filter( function( line ){ return line !== ''; } ));
			test.done();
		} );
	}
};
