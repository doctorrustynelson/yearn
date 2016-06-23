#!/usr/bin/env node

'use strict';

var commander = require( 'commander' );
var fs = require( 'fs' );
var JSON5 = require( 'json5' );
var _ = require( 'lodash' );
var path = require( 'path' );

var version = require( '../package.json' ).version;
var config = require( '../lib/utils/config' ).initialize( );
var ynpm = require( '../lib/ynpm' )( config );
var yutils = require( '../lib/utils/yearn-utils' )( config );

// Set version number
commander
    .version( version )
    .option( '-u, --unsafe', 'Run commands in unsafe mode.', false )
	.option( '--noalias', 'Run commands without aliasing.', false );

// Link ynpm version to ynpm --version
commander
	.command( 'version' )
	.description( 'Print the version of yearn installed.' )
	.action( function( ){
		console.log( version );
	} );

// Link ynpm help to ynpm --help
commander
	.command( 'help' )
	.description( 'Overview of ynpm cli (you\'r looking at it).' )
	.action( function( ){
		commander.help();
	} );

commander
	.command( 'install [modules...]' )
	.description( 'Install modules from npm to the flattened yearn structure.' )
	.action( function( modules ){
		if( modules.length === 0 ){
			console.info( 'Installing modules specified in package.json.' );
			var package_json_location = yutils.findPackageJsonLocation( undefined, this );
			
			var contents = JSON5.parse( fs.readFileSync( package_json_location, 'utf8' ) );
			
			var dependencies = _.merge(
                {},
				contents.dependencies,
				contents.devDependencies,
				contents.optionalDependencies
			);
			
			modules = Object.keys( dependencies ).map( function( module ){
				return module + '@' + dependencies[ module ];
			} );
		}
		
		modules.forEach( function( module ){
			ynpm.commands.install( module, commander.noalias, function( err ){
				if( err !== null ){
					console.warn( 'Failed to install ' + module + '.' );
				} else {
					console.info( 'Module ' + module + ' correctly installed.' );
				}
			} );
		} );
	} );
	
commander
	.command( 'installLegacy [modules...]' )
	.description( 'Directly install modules from npm.' )
	.action( function( modules ){
		var cwd = process.cwd();
		
		if( modules.length === 0 ){
			console.info( 'Installing modules specified in package.json.' );
			var package_json_location = yutils.findPackageJsonLocation( undefined, this );
			
			var contents = JSON5.parse( fs.readFileSync( package_json_location, 'utf8' ) );
			
			var dependencies = _.merge(
                {},
				contents.dependencies,
				contents.devDependencies,
				contents.optionalDependencies
			);
			
			modules = Object.keys( dependencies ).map( function( module ){
				return module + '@' + dependencies[ module ];
			} );
			
			cwd = path.dirname( package_json_location );
		}
		
		modules.forEach( function( module ){
			ynpm.commands.installLegacy( module, cwd, function( err ){
				if( err !== null ){
					console.warn( 'Failed to install ' + module + '.' );
				} else {
					console.info( 'Module ' + module + ' correctly installed.' );
				}
			} );
		} );
	} );

commander
	.command( 'orgs' )
	.description( 'Print the current orgs as specified by the YEARN_CONFIG.' )
	.action( function( ){
		var orgs = ynpm.commands.orgs( );
		for( var org in orgs ){
			if( orgs.hasOwnProperty( org ) ){
				console.log( '\t' + ( org === '' ? '""' : org ) + ' -> ' + orgs[org] );
			}
		}
	} );
	
commander
	.command( 'list <module>' )
	.description( 'Find all the modules that fulfill the desired org-module-semver (or subset) provided.' )
	.action( function( desired ){
		ynpm.commands.list( desired, process.cwd( ), commander.noalias, function( err, list ){
			console.log( 'Found ' + list.length + ' matching module(s):' );
			console.log( '\t' + list.join( '\n\t' ) );
		} );
	} );
	
commander
	.command( 'shrinkwrap [root_dir]' )
	.description( 'Create a ynpm shrinkwrap.' )
	.action( function( root_dir ){
		
		if( root_dir === undefined )
			root_dir = process.cwd( );
		
        var unsafe = commander.unsafe;
        
		ynpm.commands.shrinkwrap( root_dir, {}, unsafe, function( err, shrinkwrap ){
            var dest = path.join( root_dir, 'ynpm-shrinkwrap.json' );
			fs.writeFileSync( dest, JSON.stringify( shrinkwrap, null, '\t' ) );
            console.log( 'Successfully generated ' + path.resolve( dest ) );
		} );
	} );

commander
    .command( 'runGlobal <module> [options_string]' )
    .description( 'Runs a global script.' )
    .option( '-c, --cmd [cmd]', 'Name of the command to run if there are multiple in the module.' )
    .action( ( module, options_string, options ) => {
        var yearn = require( '../lib/yearn' )( { override: false } );
        var pkg = yearn( `${module}/package.json` );
        
        var commands = Object.keys( pkg.bin );
        if( commands.length === 1 && options.cmd === undefined ){
            options.cmd = commands[ 0 ];
        }
        
        if( commands.length !== 1 && options.cmd === undefined ){
            console.error( `Module ${module} contains multiple global scripts please specify one via the --cmd option.` );
            process.exit( 1 );
        }
        
        if( pkg.bin[options.cmd] === undefined ){
            console.error( `Command ${options.cmd} is not a global script of ${module}.` );
            process.exit( 1 );
        }
        
        if( options_string === undefined ){
            options_string = '';
        }
        
        var script = yearn.resolve( `${module}/${pkg.bin[options.cmd]}` );
        var node = require( 'which' ).sync( 'node' );
        var child = require( 'child_process' ).spawn( node, [ script ].concat( options_string.trim().split( ' ' ) ), {
            env: process.env,
            stdio: [ process.stdin, process.stdout, process.stderr ]
        } );
        
        child.on( 'close', (code) => {
            process.exit( code );
        } );
    } );
    
commander
    .command( 'bootstrap [modules...]' )
    .description( 'Bootstrap global module scripts so they can be executed on the command line.' )
    .action( (modules) => {
        var yearn = require( '../lib/yearn' )( { override: false } );
        var os = require( 'os' );
        var scripts_dir = path.join( os.homedir(), '.globalscripts' );
        var manifest_file = path.join( scripts_dir, 'manfiest.json' );
        var manifest = {};
        
        try {
            fs.accessSync( scripts_dir );  
        } catch( exception ){
            fs.mkdirSync( scripts_dir );
        }
        
        try {
            fs.accessSync( manifest_file );
            manifest = JSON5.parse( fs.readFileSync( manifest_file ) );
        } catch( exception ){
            // Will create the manifest later on
        }
        
        modules.forEach( ( module ) => {
            var pkg = yearn( `${module}/package.json` );
            
            if( pkg.bin === undefined )
                return;
            
            Object.keys( pkg.bin ).forEach( ( script ) => {
                var script_location = yearn.resolve( `${module}/${pkg.bin[script]}` );
                
                console.log( `bootstrapping ${script_location} from ${module}` );
                if( os.type() === 'Windows_NT' ){
                    fs.writeFileSync( path.join( scripts_dir, script ) + '.CMD', `@node ${script_location} %*` );
                } else {
                    fs.writeFileSync( path.join( scripts_dir, script ), `node ${script_location} "$@"` );
                }
            } );
            
            manifest[pkg.name] = pkg.version;
        } );
        
        
        if( process.env.path.split( path.delimiter ).indexOf( scripts_dir ) === -1 ){
            console.warn( `Append to PATH env variable "${scripts_dir}" to use bootstrapped global modules.` );
        }
        
        fs.writeFileSync( manifest_file, JSON.stringify( manifest ) );
    } );

commander
	.command( 'check [orgs_or_specific_modules...]' )
	.description( 'Print the modules that need to be updated and to what version.' )
	.action( function( modules ){
		if( modules.length === 0 ){
			modules = Object.keys( config.orgs );
		}
		
		modules.forEach( function( module ){
			if( yutils.isValidOrg( module ) ){
				fs.readdirSync( config.orgs[ module ] ).forEach( function( installed_module ){
					var desired;
					if( module === '' ){
						desired = '""/' + installed_module;
						return ynpm.commands.check( installed_module, commander.noalias, function( err, latest ){
							console.log( desired + ' -> ' + latest );
						} );
					} else {
						desired = module + '/' + installed_module;
						return ynpm.commands.check( desired, commander.noalias, function( err, latest ){
							console.log( desired + ' -> ' + latest );
						} );
					}
				} );
			} else {
				return ynpm.commands.check( module, commander.noalias, function( err, latest ){
					if( latest !== true && latest !== false ){
						console.log( module + ' -> ' + latest );
					}
				} );
				
			}
		} );
	} );

// Unrecognized 
commander
	.command( '*' )
	.action( function( ){
		console.log( 'Unrecognized ynpm command.  For more help using ynpm run "ynpm help".' );
	} );

commander.parse( process.argv );