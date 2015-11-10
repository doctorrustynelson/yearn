
var path = require( 'path' );
var JSON5 = require( 'json5' );
var merge = require( 'merge' ).recursive;
var fs = require( 'fs' );

var dependency_tree = {
/*
 * 	semver: "",
 *  version: "",
 * 	dependencies: {
 *		"org:module": {}
 *		"org:module": {}
 * 	},
 * 	moduleToOrg: {
 *		"module1":  "org1",
 *		"module2":  "org1",
 * 	}
 */	
};

var manager = module.exports = {};
var path_to_orgs = [];
var wild_path = null;
var yutils = null;

manager.init = function( orgs, yearn_utils ){
	dependency_tree = { dependencies:{}, moduleToOrg:{} };
	path_to_orgs = [];

	// Setting up mapper from path to org
	Object.keys( orgs ).forEach( function( org ){
		var resolved_path;

		if( org === '*' ){
			
			var full_org = path.resolve( orgs[ org ] ).replace( /^[^*]*/, function( match ){ 
				return fs.realpathSync( match ) + path.sep; 
			} );
			
			switch(path.sep){
				case '/':
					wild_path = new RegExp( '' + 
						path.resolve( full_org ).replace( /\*/, '([^/]+)' ).replace( /\*/g, '\1' ) + 
						'/?([^/]*)/([^/]*)/(.*)' );
					break;
				case '\\':
					wild_path = new RegExp( '' + 
						path.resolve( full_org ).replace( /\\/g, '\\\\').replace( /\*/, '([^\\\\]+)' ).replace( /\*/g, '\1' ) + 
						'\\\\?([^\\\\]*)\\\\([^\\\\]*)\\\\(.*)' );
					break;
				default: 
					throw new Error( 'Unrecognized path seperator: ' + path.sep );	
			}
			
			return;
		}

		if( orgs[ org ] === './node_modules' ){
			// Special case
			switch(path.sep){
				case '/':
					resolved_path = new RegExp( '(.*)/node_modules/([^/]*)/(.*)' );
					break;
				case '\\':
					resolved_path = new RegExp( '(.*)\\\\node_modules\\\\([^\\\\]*)\\\\(.*)' );
					break;
				default: 
					throw new Error( 'Unrecognized path seperator: ' + path.sep );	
			}
		} else {
			switch(path.sep){
				case '/':
					resolved_path = new RegExp( '(' + fs.realpathSync( path.resolve( orgs[ org ] ) ) + ')/?([^/]*)/([^/]*)/(.*)' );
					break;
				case '\\':
					resolved_path = new RegExp( '(' + fs.realpathSync( path.resolve( orgs[ org ] ) ).replace( /\\/g, '\\\\') + ')\\\\?([^\\\\]*)\\\\([^\\\\]*)\\\\(.*)' );
					break;
				default: 
					throw new Error( 'Unrecognized path seperator: ' + path.sep );	
			}
		}

		path_to_orgs.push( { 'path': resolved_path, 'org': org } );
	} );
	
	yutils = yearn_utils;
};

manager.addAllDependencies = function( parent, dependencies ){
	if( parent.dependencies === undefined )
		parent.dependencies = {};
	
	if( parent.moduleToOrg === undefined )
		parent.moduleToOrg = {};

	Object.keys( dependencies ).forEach( function( raw_dependency ){
		var dependency = yutils.extractYearningParts( raw_dependency );

		if( dependency.org === undefined )
			dependency.org = '';
	
		if( parent.moduleToOrg[ dependency.module ] !== undefined && parent.moduleToOrg[ dependency.module ] !== dependency.org ){
			var error = new Error( 'Dependency ' + dependency.module + ' can not exist in multiple orgs [ ' + parent.moduleToOrg[ dependency.module ] + ', ' +  dependency.org + ' ].' );
			yutils.LOGGER.error( error.message );
			throw error;
		}

		parent.moduleToOrg[ dependency.module ] = dependency.org;
		
		// If a dependency already has a semver associated with it then we ignore it.
		if( parent.dependencies[ raw_dependency ] ){
			return;
		}
		

		if( typeof dependencies[ raw_dependency ] === 'object' ){
			parent.dependencies[ raw_dependency ] = { semver: dependencies[ raw_dependency ].version };
			if( typeof dependencies[ raw_dependency ].dependencies === 'object' )
				manager.addAllDependencies( parent.dependencies[ raw_dependency ], dependencies[ raw_dependency ].dependencies );
		} else {
			parent.dependencies[ raw_dependency ] = { semver: dependencies[ raw_dependency ] };
		}
	} ); 
};

manager.populate = function( parent_path, parent_id, package_json_location ){
	var parent;

	// Transverse tree to current dependency
	parent_path.forEach( function( dependency ){
		if( dependency === undefined ){
			parent = dependency_tree;
			return;
		}

		var child;

		if( dependency.org === '' ){
			child = parent.dependencies[ dependency.module ];
		} else {
			child = parent.dependencies[ dependency.org + ':' + dependency.module ];
		}

		// Generate branch if it doesn't exist
		if( child === undefined ){
			yutils.LOGGER.trace( 'Gernerating missing branch for module ' + dependency.module + '.' );
			if( dependency.org === '' ){
				child = parent.dependencies[ dependency.module ] = { dependencies: {} };
			} else {
				child = parent.dependencies[ dependency.org + ':' + dependency.module ] = { dependencies: {} };
			}
		}

		// TODO: Maybe add version check

		yutils.LOGGER.trace( 'Tranversing dependency tree to ' + dependency.module + '.' );
		parent = child;
	});

	if( package_json_location === null ){
		yutils.LOGGER.warn( 'No package.json found for ' + parent_id + '.' );
		return parent;
	}
	
		// Only populate if parent.version isn't set and package_json_location matches
	if( parent.version && parent.pkg_location === package_json_location ){
		yutils.LOGGER.trace( 'Found cached dependencies for ' + parent_id + '.' );
		return parent;
	}
	
	if( parent.pkg_location === null ){
		parent.pkg_location = package_json_location;
	}

	var pkg_contents;
	var ynpm_shrinkwrap_location = path.resolve( package_json_location, '..', 'ynpm-shrinkwrap.json' );
	
	// Use contents of ynpm-shrinkwrap instead if one is available else import dependencies from package.json
	if( fs.existsSync( ynpm_shrinkwrap_location ) ){
		yutils.LOGGER.info( 'Importing dependencies from "' + ynpm_shrinkwrap_location + '".' );
		pkg_contents = JSON5.parse( fs.readFileSync( ynpm_shrinkwrap_location, 'utf8' ) );
	} else {
		yutils.LOGGER.info( 'Importing dependencies from "' + package_json_location + '".' );
		pkg_contents = JSON5.parse( fs.readFileSync( package_json_location, 'utf8' ) );
	}
	
	var parent_link = parent_path[ parent_path.length - 1 ];
		
	// Determine contents being used in package.json
	var dependencies = merge(
		/* Ignore devDependencies if we're not in the root module */
		( parent_link === undefined ? pkg_contents.devDependencies : {} ),
		pkg_contents.dependencies,
		pkg_contents.peerDependencies,
		pkg_contents.optionalDependencies
	);

	// Populate parent.dependencies and parent.moduleToOrg without overwriting
	manager.addAllDependencies( parent, dependencies );

	// Populate parent.version
	if( parent_link ){
		if( parent_link.version === undefined ){
			parent.version = pkg_contents.version;
		} else {
			parent.version = parent_link.version;
		}	
	} else {
		// We are at the root
		parent.version = 'root';
	}

	return parent;
};

manager.determinePath = function( node_parent ){
	yutils.LOGGER.debug( 'Determining dependency path of ' + node_parent.id );
	
	var temp = node_parent;
	var dep_path = [];
	while( temp ){
		dep_path.push( temp.id );
		temp = temp.parent;
	}

	//TODO: Remove
	yutils.LOGGER.debug( 'Raw path: \n\t - ' + dep_path.join( '\n\t - ' ) );
 	
	var resolved_dep_path = dep_path.map( function( dep ){
		var revised_dependency;
		var result;
			
		for( var index = 0; index < path_to_orgs.length; index += 1 ){
			result = path_to_orgs[index].path.exec( dep );
			
			if( result === null ){
				continue;
			}
				
			if( result.length === 5 ){
				revised_dependency = { org: path_to_orgs[index].org, module: result[2], version: result[3] };
				break;
			}

			if( result.length === 4 ){
				revised_dependency = { org: path_to_orgs[index].org, module: result[2], version: undefined };
				break;
			}
		}
		
		if( revised_dependency === undefined && wild_path !== null ){
			result = wild_path.exec( dep );
			
			if( result !== null ){
				
				if( result.length === 5 ){
					revised_dependency = { org: result[1], module: result[2], version: result[3] };
				}
				
				if( result.length === 4 ){
					revised_dependency = { org: result[1], module: result[2], version: undefined };
				}
			}
		}

		return revised_dependency;
	} );

	//TODO: Remove
	yutils.LOGGER.debug( 'Resolved Path: \n\t -> ' + resolved_dep_path.map( function(d){ return JSON.stringify( d ); } ).join( '\n\t -> ' ) );

	var collapsed_dep_path = resolved_dep_path.reduce( function( collapsed, dep ){

		if( collapsed.length === 0 )
			return collapsed.concat( dep );

		var prev = collapsed[ collapsed.length - 1 ];
		if( prev === dep )
			return collapsed;

		if( typeof prev === 'object' && typeof dep === 'object' &&  prev.org === dep.org && prev.module === dep.module && prev.version === dep.version )
			return collapsed;
		
		return collapsed.concat( dep );
	}, [] );

	//TODO: Remove
	yutils.LOGGER.debug( 'Collapsed Path: \n\t => ' + collapsed_dep_path.map( function(d){ return JSON.stringify( d ); } ).join( '\n\t => ' ) );

	var first_root = collapsed_dep_path.indexOf( undefined );
	var reduced_dep_path = collapsed_dep_path.slice( 0, first_root === -1 ? collapsed_dep_path.length : first_root + 1 ).reverse();

	yutils.LOGGER.trace( 'Reduced Path: \n\t --> ' + reduced_dep_path.map( function(d){ return JSON.stringify( d ); } ).join( '\n\t --> ' ) );
	
	return reduced_dep_path;
};
