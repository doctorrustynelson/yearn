
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
var grunt = require( 'grunt' );

module.exports.orgsCommandTests = {
	
	undefinedConfig: function( test ){
		
		require( '../lib/ynpm' )( undefined, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
			
			test.deepEqual( { '': './node_modules' }, ynpm.commands.orgs() );
			test.done();
		} );
	},
	
	emptyConfig: function( test ){
		
		require( '../lib/ynpm' )( {}, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			test.deepEqual( { '': './node_modules' }, ynpm.commands.orgs() );
			test.done();
		} );
	},
	
	emptyOrgs: function( test ){
		
		require( '../lib/ynpm' )( { orgs: {} }, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			test.deepEqual( { '': './node_modules' }, ynpm.commands.orgs() );
			test.done();
		} );
	},
	
	fullySpecifiedConfig: function( test ){
		
		require( '../lib/ynpm' )( { orgs: { '': '/user/bin/node_modules', 'spec': '/user/bin/spec' } }, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			test.deepEqual( { '': '/user/bin/node_modules', 'spec': '/user/bin/spec' }, ynpm.commands.orgs() );
			test.done();
		} );
	},
	
	noDefaultInOverridenConfig: function( test ){
		
		require( '../lib/ynpm' )( { orgs: { 'spec': '/user/bin/spec' } }, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			test.deepEqual( { '': './node_modules', 'spec': '/user/bin/spec' }, ynpm.commands.orgs() );
			test.done();
		} );
	}
};


module.exports.installCommandTests = {
	
	installNativeModule: function( test ){
		var temp_dir = require( 'temp' ).mkdirSync();
		
		require( '../lib/ynpm' )( { orgs: { '': temp_dir } }, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			ynpm.commands.install( 'os', function( err ){
				test.notEqual( err, null );
				
				grunt.file.delete( temp_dir, { force: true } );
				test.done();
			} );
		} );
	},
	
	installPath: function( test ){
		var temp_dir = require( 'temp' ).mkdirSync();
		
		require( '../lib/ynpm' )( { orgs: { '': temp_dir } }, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			ynpm.commands.install( './node_modules/test-module-0/1.0.0', function( err ){
				test.notEqual( err, null );
				
				grunt.file.delete( temp_dir, { force: true } );
				test.done();
			} );
		} );
	},
	
	installNumber: function( test ){
		var temp_dir = require( 'temp' ).mkdirSync();
		
		require( '../lib/ynpm' )( { orgs: { '': temp_dir } }, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			ynpm.commands.install( 0, function( err ){
				test.notEqual( err, null );
				
				grunt.file.delete( temp_dir, { force: true } );
				test.done();
			} );
		} );
	},
		
	installLodashToAbsoluteDefault: function( test ){
		var temp_dir = require( 'temp' ).mkdirSync();
		
		require( '../lib/ynpm' )( { orgs: { '': temp_dir } }, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			ynpm.commands.install( 'lodash@2.4.0', function( ){
				test.ok( grunt.file.exists( path.join( temp_dir, 'lodash' ) ) );
				test.ok( grunt.file.exists( path.join( temp_dir, 'lodash', '2.4.0' ) ) );
				test.ok( grunt.file.exists( path.join( temp_dir, 'lodash', '2.4.0', 'package.json' ) ) );
				
				grunt.file.delete( temp_dir, { force: true } );
				test.done();
			} );
		} );
	},
	
	installLodashWithoutVersionToAbsoluteDefault: function( test ){
		var temp_dir = require( 'temp' ).mkdirSync();
		
		require( '../lib/ynpm' )( { orgs: { '': temp_dir } }, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			ynpm.commands.install( 'lodash', function( ){
				test.ok( grunt.file.exists( path.join( temp_dir, 'lodash' ) ) );
				
				grunt.file.delete( temp_dir, { force: true } );
				test.done();
			} );
		} );
	},
	
	installNodeunitToAbsoluteDefault: function( test ){
		var temp_dir = require( 'temp' ).mkdirSync();
		
		require( '../lib/ynpm' )( { orgs: { '': temp_dir } }, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			ynpm.commands.install( 'nodeunit@0.9.0', function( ){
				test.ok( grunt.file.exists( path.join( temp_dir, 'nodeunit' ) ) );
				test.ok( grunt.file.exists( path.join( temp_dir, 'nodeunit', '0.9.0' ) ) );
				test.ok( grunt.file.exists( path.join( temp_dir, 'nodeunit', '0.9.0', 'package.json' ) ) );
				test.ok( grunt.file.exists( path.join( temp_dir, 'tap' ) ) );
				
				grunt.file.delete( temp_dir, { force: true } );
				test.done();
			} );
		} );
	},
	
	installLodashToRelativeDefault: function( test ){
		var temp_dir = './temp_node_modules';
		
		require( '../lib/ynpm' )( { orgs: { '': temp_dir } }, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			ynpm.commands.install( 'lodash@2.4.0', function( ){
				test.ok( grunt.file.exists( path.join( temp_dir, 'lodash' ) ) );
				test.ok( grunt.file.exists( path.join( temp_dir, 'lodash', '2.4.0' ) ) );
				test.ok( grunt.file.exists( path.join( temp_dir, 'lodash', '2.4.0', 'package.json' ) ) );
				
				grunt.file.delete( temp_dir, { force: true } );
				test.done();
			} );
		} );
	},
	
	installNodeunitToRelativeDefault: function( test ){
		var temp_dir = './temp_node_modules';
		
		require( '../lib/ynpm' )( { orgs: { '': temp_dir } }, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			ynpm.commands.install( 'nodeunit@0.9.0', function( ){
				test.ok( grunt.file.exists( path.join( temp_dir, 'nodeunit' ) ) );
				test.ok( grunt.file.exists( path.join( temp_dir, 'nodeunit', '0.9.0' ) ) );
				test.ok( grunt.file.exists( path.join( temp_dir, 'nodeunit', '0.9.0', 'package.json' ) ) );
				test.ok( grunt.file.exists( path.join( temp_dir, 'tap' ) ) );
				
				grunt.file.delete( temp_dir, { force: true } );
				test.done();
			} );
		} );
	},
	
	installNodeunitAbsoluteWithRelativeDefault: function( test ){
		var temp_dir = './temp_node_modules';
		var spec_dir = require( 'temp' ).mkdirSync();
		
		require( '../lib/ynpm' )( { orgs: { '': temp_dir, 'other': spec_dir } }, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			ynpm.commands.install( 'other:nodeunit@0.9.0', function( ){
				test.ok( grunt.file.exists( path.join( spec_dir, 'nodeunit' ) ) );
				test.ok( grunt.file.exists( path.join( spec_dir, 'nodeunit', '0.9.0' ) ) );
				test.ok( grunt.file.exists( path.join( spec_dir, 'nodeunit', '0.9.0', 'package.json' ) ) );
				test.ok( !grunt.file.exists( path.join( spec_dir, 'tap' ) ) );
				test.ok( !grunt.file.exists( path.join( temp_dir, 'nodeunit' ) ) );
				test.ok( !grunt.file.exists( path.join( temp_dir, 'nodeunit', '0.9.0' ) ) );
				test.ok( !grunt.file.exists( path.join( temp_dir, 'nodeunit', '0.9.0', 'package.json' ) ) );
				test.ok( grunt.file.exists( path.join( temp_dir, 'tap' ) ) );
				
				grunt.file.delete( temp_dir, { force: true } );
				test.done();
			} );
		} );
	},
	
	modernProgramaticInstallMalformedObject: function( test ){
		var temp_dir = require( 'temp' ).mkdirSync();
		
		require( '../lib/ynpm' )( { orgs: { '': temp_dir } }, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			ynpm.commands.install( { }, function( err ){
				test.notEqual( err, null );
				
				grunt.file.delete( temp_dir, { force: true } );
				test.done();
			} );
		} );
	},
	
	modernProgramaticInstallLodash: function( test ){
		var temp_dir = require( 'temp' ).mkdirSync();
		
		require( '../lib/ynpm' )( { orgs: { '': temp_dir } }, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			ynpm.commands.install( { module: 'lodash', version: '2.4.0' }, function( ){
				test.ok( grunt.file.exists( path.join( temp_dir, 'lodash' ) ) );
				test.ok( grunt.file.exists( path.join( temp_dir, 'lodash', '2.4.0' ) ) );
				test.ok( grunt.file.exists( path.join( temp_dir, 'lodash', '2.4.0', 'package.json' ) ) );
				
				grunt.file.delete( temp_dir, { force: true } );
				test.done();
			} );
		} );
	},
	
	gitVersionOverrides: function( test ){
		var temp_dir = require( 'temp' ).mkdirSync();
		
		require( '../lib/ynpm' )( { orgs: { '': temp_dir } }, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			ynpm.commands.install( { module: 'jsdoc', version: '3.2.2' }, function( ){
				test.ok( grunt.file.exists( path.join( temp_dir, 'jsdoc' ) ) );
				test.ok( grunt.file.exists( path.join( temp_dir, 'jsdoc', '3.2.2' ) ) );
				test.ok( grunt.file.exists( path.join( temp_dir, 'jsdoc', '3.2.2', 'package.json' ) ) );
				
				var pkg = grunt.file.readJSON( path.join( temp_dir, 'jsdoc', '3.2.2', 'package.json' ) );
				
				test.equal( pkg.dependencies[ "crypto-browserify" ], '0.1.1' );
				test.equal( pkg.dependencies[ "taffydb" ], '*' );
				
				grunt.file.delete( temp_dir, { force: true } );
				test.done();
			} );
		} );
	},
};

module.exports.checkCommandTests = {
		
	badOrg: function( test ){
		require( '../lib/ynpm' )( { orgs: { '': './node_modules' } }, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			ynpm.commands.check( 'badorg:lodash', function( err, version ){
				test.notEqual( err, null );
				test.equal( version, null );
				test.done();
			} );
		} );
	},
	
	noSuchModuleExists: function( test ){
		require( '../lib/ynpm' )( { orgs: { '': './node_modules' } }, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			ynpm.commands.check( 'nosuchmoduleexists', function( err, version ){
				test.notEqual( err, null, err );
				test.equal( version, null );
				test.done();
			} );
		} );
	},
	
	lodashNotInstalled: function( test ){
		var temp_dir = require( 'temp' ).mkdirSync();
		
		require( '../lib/ynpm' )( { orgs: { '': temp_dir }, log: 'ALL' }, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			ynpm.commands.check( 'lodash', function( err, version ){
				test.equal( err, null );
				test.notEqual( version, true );
				test.notEqual( version, false );
				
				grunt.file.delete( temp_dir, { force: true } );
				test.done();
			} );
		} );
	},
		
	lodashInDefaultOrgAndCorrect: function( test ){
		var temp_dir = require( 'temp' ).mkdirSync();
		
		require( '../lib/ynpm' )( { orgs: { '': temp_dir }, log: 'ALL' }, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			ynpm.commands.install( 'lodash', function( ){
				ynpm.commands.check( 'lodash', function( err, version ){
					test.equal( err, null );
					test.equal( version, true );
					grunt.file.delete( temp_dir, { force: true } );
					test.done();
				} );
			} );
		} );
	},
	
	multipleLodashInDefaultOrgAndCorrect: function( test ){
		var temp_dir = require( 'temp' ).mkdirSync();
		
		require( '../lib/ynpm' )( { orgs: { '': temp_dir } }, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			ynpm.commands.install( 'lodash', function( ){
				ynpm.commands.install( 'lodash@2.4.0', function( ){
					ynpm.commands.check( 'lodash', function( err, version ){
						test.equal( err, null );
						test.equal( version, true );
						grunt.file.delete( temp_dir, { force: true } );
						test.done();
					} );
				} );
			} );
		} );
	},
	
	lodashInOtherOrgAndCorrect: function( test ){
		var temp_dir = require( 'temp' ).mkdirSync();
		var spec_dir = require( 'temp' ).mkdirSync();
		
		require( '../lib/ynpm' )( { orgs: { '': temp_dir, 'spec': spec_dir } }, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			ynpm.commands.install( 'spec:lodash', function( ){
				ynpm.commands.check( 'spec:lodash', function( err, version ){
					test.equal( err, null );
					test.equal( version, true );
					grunt.file.delete( temp_dir, { force: true } );
					grunt.file.delete( spec_dir, { force: true } );
					test.done();
				} );
			} );
		} );
	},
	
	lodashInDefaultOrgAndIncorrect: function( test ){
		var temp_dir = require( 'temp' ).mkdirSync();
		
		require( '../lib/ynpm' )( { orgs: { '': temp_dir }, log: 'All' }, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			ynpm.commands.install( 'lodash@2.3.0', function( ){
				ynpm.commands.check( 'lodash', function( err, version ){
					test.equal( err, null );
					test.notEqual( version, true );
					test.notEqual( version, false );
					grunt.file.delete( temp_dir, { force: true } );
					test.done();
				} );
			} );
		} );
	},
	
	multipleLodashInDefaultOrgAndIncorrect: function( test ){
		var temp_dir = require( 'temp' ).mkdirSync();
		
		require( '../lib/ynpm' )( { orgs: { '': temp_dir } }, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			ynpm.commands.install( 'lodash@2.3.0', function( ){
				ynpm.commands.install( 'lodash@2.4.0', function( ){
					ynpm.commands.check( 'lodash', function( err, version ){
						test.equal( err, null );
						test.notEqual( version, true );
						test.notEqual( version, false );
						grunt.file.delete( temp_dir, { force: true } );
						test.done();
					} );
				} );
			} );
		} );
	},
	
	lodashInOtherOrgAndIncorrect: function( test ){
		var temp_dir = require( 'temp' ).mkdirSync();
		var spec_dir = require( 'temp' ).mkdirSync();
		
		require( '../lib/ynpm' )( { orgs: { '': temp_dir, 'spec': spec_dir }, log: 'All' }, function( err, ynpm ){
			test.strictEqual( err, null, 'No errors on ynpm initialization' );
		
			ynpm.commands.install( 'spec:lodash@2.3.0', function( ){
				ynpm.commands.check( 'spec:lodash', function( err, version ){
					test.equal( err, null );
					test.notEqual( version, true );
					test.notEqual( version, false );
					grunt.file.delete( temp_dir, { force: true } );
					grunt.file.delete( spec_dir, { force: true } );
					test.done();
				} );
			} );
		} );
	}
};
