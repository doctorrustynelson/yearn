
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

var path = require( 'path' );
var yearn = null;

module.exports.setUp = function( callback ){
	process.env.LOG4JS_CONFIG = path.resolve( __dirname, './test-configs/test-log4js-config.json' );
	
	//var logger = require( 'log4js' ).getLogger( 'yearn' );
	
	try {
		yearn = require( '../lib/yearn' )({ 
			orgs: { 
				'': './node_modules',
				'*': path.join( __dirname, 'test-orgs', '*' )
			},
			aliases: [
				{ 	
					from: { module: 'D' },
					to: { module: 'B' }
				},{ 	
					from: { module: 'b' },
					to: { module: 'B' }
				},{ 	
					from: { module: 'C' },
					to: { module: 'A' }
				},{ 	
					from: { org: 'alias_alphabet' },
					to: { org: 'alphabet' }
				},{ 	
					from: { version: '0.0.100' },
					to: { version: '0.0.1' }
				},{ 	
					from: { version: '0.0.200' },
					to: { version: '0.0.2' }
				},{ 	
					from: { version: '0.100.0' },
					to: { version: '0.1.0' }
				},{ 	
					from: { org: 'numbers', module: 'one', version: '0.10.0' },
					to: { org: 'alphabet', module: 'A', version: '0.0.2' }
				}	
			],
			legacy: false,
			override: true
		} );
	} catch( exception ){
		console.log( 'Exception during test yearn setup.' );
		console.log( exception, exception.stack.split( '\n' ) );
	}
	
	//yearn.setLogger( logger );
	
	callback( );
};

module.exports.tearDown = function( callback ){
	process.env.LOG4JS_CONFIG = undefined;
	yearn.revert( );
	
	//wipe the cache of all yearn test node_modules
	Object.keys( require.cache ).forEach( function( item ){
		if( item.indexOf( path.resolve( __dirname, './node_modules' ) ) === 0 ){
			delete require.cache[ item ];
		}
		if( item.indexOf( path.resolve( __dirname, './test-orgs' ) ) === 0 ){
			delete require.cache[ item ];
		}
	});
	
	callback( );
};

module.exports.aliasModuleTests = {
	
	'A v 0.0.1': function( unit ){
		unit.equal( yearn( 'alphabet:A@0.0.1' )( ), [
			'Hello from A @ 0.0.1.'
		].join( '\n' ), 'alphabet:A@0.0.1 unaliased' );
		unit.done();	
	},
	
	'A v 0.0.2': function( unit ){
		unit.equal( yearn( 'alphabet:A@0.0.2' )( ), [
			'Hello from A @ 0.0.2.'
		].join( '\n' ), 'alphabet:A@0.0.2 unaliased' );
		unit.done();	
	},
	
	'A v 0.1.0': function( unit ){
		unit.equal( yearn( 'alphabet:A@0.1.0' )( ), [
			'Hello from A @ 0.1.0.'
		].join( '\n' ), 'alphabet:A@0.1.0 unaliased' );
		unit.done();	
	},
	
	'B v 0.0.1': function( unit ){
		unit.equal( yearn( 'alphabet:B@0.0.1' )( ), [
			'Hello from B @ 0.0.1.',
			'Hello from A @ 0.0.1.'
		].join( '\n' ), 'alphabet:B@0.0.1 unaliased' );
		unit.done();	
	},
	
	'B v 0.0.2': function( unit ){
		unit.equal( yearn( 'alphabet:B@0.0.2' )( ), [
			'Hello from B @ 0.0.2.',
			'Hello from A @ 0.0.2.'
		].join( '\n' ), 'alphabet:B@0.0.2 unaliased' );
		unit.done();	
	},
	
	'B v 0.1.0': function( unit ){
		unit.equal( yearn( 'alphabet:B@0.1.0' )( ), [
			'Hello from B @ 0.1.0.',
			'Hello from A @ 0.1.0.'
		].join( '\n' ), 'alphabet:B@0.1.0 unaliased' );
		unit.done();	
	},
	
	'b v 0.0.1': function( unit ){
		unit.equal( yearn( 'alphabet:b@0.0.1' )( ), [
			'Hello from B @ 0.0.1.',
			'Hello from A @ 0.0.1.'
		].join( '\n' ), 'alphabet:b@0.0.1 -> alphabet:B@0.0.1' );
		unit.done();	
	},
	
	'b v 0.0.2': function( unit ){
		unit.equal( yearn( 'alphabet:b@0.0.2' )( ), [
			'Hello from B @ 0.0.2.',
			'Hello from A @ 0.0.2.'
		].join( '\n' ), 'alphabet:b@0.0.2 -> alphabet:B@0.0.2' );
		unit.done();	
	},
	
	'b v 0.1.0': function( unit ){
		unit.equal( yearn( 'alphabet:b@0.1.0' )( ), [
			'Hello from B @ 0.1.0.',
			'Hello from A @ 0.1.0.'
		].join( '\n' ), 'alphabet:b@0.1.0 -> alphabet:B@0.1.0' );
		unit.done();	
	},
	
	'C v 0.0.1': function( unit ){
		unit.equal( yearn( 'alphabet:C@0.0.1' )( ), [
			'Hello from A @ 0.0.1.'
		].join( '\n' ), 'alphabet:C@0.0.1 -> alphabet:A@0.0.1' );
		unit.done();	
	},
	
	'D v 0.0.1': function( unit ){
		unit.equal( yearn( 'alphabet:D@0.0.1' )( ), [
			'Hello from B @ 0.0.1.',
			'Hello from A @ 0.0.1.'
		].join( '\n' ), 'alphabet:D@0.0.1 -> alphabet:B@0.0.1' );
		unit.done();	
	},
	
	'D v 0.1.0': function( unit ){
		unit.equal( yearn( 'alphabet:D@0.1.0' )( ), [
			'Hello from B @ 0.1.0.',
			'Hello from A @ 0.1.0.'
		].join( '\n' ), 'alphabet:D@0.0.1 -> alphabet:B@0.0.1' );
		unit.done();	
	}
	
};

module.exports.aliasOrgTests = {
	
	'A v 0.0.1': function( unit ){
		unit.equal( yearn( 'alias_alphabet:A@0.0.1' )( ), [
			'Hello from A @ 0.0.1.'
		].join( '\n' ), 'alias_alphabet:A@0.0.1 -> alphabet:A@0.0.1' );
		unit.done();	
	},
	
	'A v 0.0.2': function( unit ){
		unit.equal( yearn( 'alias_alphabet:A@0.0.2' )( ), [
			'Hello from A @ 0.0.2.'
		].join( '\n' ), 'alias_alphabet:A@0.0.2 -> alphabet:A@0.0.2' );
		unit.done();	
	},
	
	'A v 0.1.0': function( unit ){
		unit.equal( yearn( 'alias_alphabet:A@0.1.0' )( ), [
			'Hello from A @ 0.1.0.'
		].join( '\n' ), 'alias_alphabet:A@0.1.0 -> alphabet:A@0.1.0' );
		unit.done();	
	}
};

module.exports.aliasVersionTests = {
	
	'A v 0.0.100': function( unit ){
		unit.equal( yearn( 'alphabet:A@0.0.100' )( ), [
			'Hello from A @ 0.0.1.'
		].join( '\n' ), 'alphabet:A@0.0.100 -> alphabet:A@0.0.1' );
		unit.done();	
	},
	
	'A v 0.0.200': function( unit ){
		unit.equal( yearn( 'alphabet:A@0.0.200' )( ), [
			'Hello from A @ 0.0.2.'
		].join( '\n' ), 'alphabet:A@0.0.200 -> alphabet:A@0.0.2' );
		unit.done();	
	},
	
	'A v 0.100.0': function( unit ){
		unit.equal( yearn( 'alphabet:A@0.100.0' )( ), [
			'Hello from A @ 0.1.0.'
		].join( '\n' ), 'alias_alphabet:A@0.100.0 -> alphabet:A@0.1.0' );
		unit.done();	
	}
};

module.exports.aliasEverythingTests = {
	
	'one v 0.0.1': function( unit ){
		unit.equal( yearn( 'numbers:one@0.0.1' )( ), [
			'Hello from one @ 0.0.1.'
		].join( '\n' ), 'numbers:one@0.0.1 unaliased' );
		unit.done();	
	},
	
	'one v 0.10.0': function( unit ){
		unit.equal( yearn( 'numbers:one@0.10.0' )( ), [
			'Hello from A @ 0.0.2.'
		].join( '\n' ), 'numbers:one@0.10.0 -> alphabet:A@0.0.2' );
		unit.done();	
	},
};