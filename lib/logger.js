/**
 * Logger definition.
 */

'use strict';

var chalk = require( 'chalk' );

module.exports = function( log_level ){
	return {
		debug: function( anything ){
			if( log_level === 'DEBUG' || log_level === 'ALL' ){
				console.log( chalk.cyan( 'yearn [DEBUG] ' ) + anything );
			}
		},
		info: function( anything ){
			if( log_level === 'DEBUG' || log_level === 'INFO' || log_level === 'ALL' ){
				console.log( chalk.green( 'yearn [INFO]  ' ) + anything );
			}
		},
		warn: function( anything ){
			if( log_level === 'DEBUG' || log_level === 'INFO' || log_level === 'WARN' || log_level === 'ALL' ){
				console.log( chalk.yellow( 'yearn [WARN]  ' + anything ) );
			}
		},
		error: function( anything ){
			if( log_level === 'DEBUG' || log_level === 'WARN' || log_level === 'INFO' || log_level === 'ERROR' || log_level === 'ALL' ){
				console.log( chalk.red( 'yearn [ERROR] ' + anything ) );
			}
		}
	};
};