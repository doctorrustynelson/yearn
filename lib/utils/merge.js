function merge( ){
	var obj = {};
	for( var i = 0; i < arguments.length; ++i ){
		for (var attr in arguments[ i ] ) {
			if( arguments[ i ].hasOwnProperty( attr ) ){
				if( typeof arguments[ attr ] === 'object' ){
					if( obj[ attr ] === undefined )
						obj[ attr ] = {};
					obj[ attr ] = merge( obj[ attr ], arguments[ i ][ attr ] );
				} else {
					obj[ attr ] = arguments[ i ][ attr ];
				}
			}
		}
	}
	return obj;
}

module.exports = merge;