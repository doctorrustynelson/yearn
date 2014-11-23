/**
 * Logger definition.
 */

'use strict';

var chalk = require( 'chalk' );

module.exports = function( log_level, name ){
	if( name === undefined ){
		name = '';
	}
	return {
		debug: function( anything ){
			if( log_level === 'DEBUG' || log_level === 'ALL' ){
				console.log( chalk.cyan( name + ' [DEBUG] ' ) + anything );
			}
		},
		info: function( anything ){
			if( log_level === 'DEBUG' || log_level === 'INFO' || log_level === 'ALL' ){
				console.log( chalk.green( name + ' [INFO]  ' ) + anything );
			}
		},
		warn: function( anything ){
			if( log_level === 'DEBUG' || log_level === 'INFO' || log_level === 'WARN' || log_level === 'ALL' ){
				console.log( chalk.yellow( name + ' [WARN]  ' + anything ) );
			}
		},
		error: function( anything ){
			if( log_level === 'DEBUG' || log_level === 'WARN' || log_level === 'INFO' || log_level === 'ERROR' || log_level === 'ALL' ){
				console.log( chalk.red( name + ' [ERROR] ' + anything ) );
			}
		}
	};
};