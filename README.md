# yearn
[![Build Status](https://img.shields.io/travis/doctorrustynelson/yearn.svg)](http://travis-ci.org/doctorrustynelson/yearn)
[![NPM Version](https://img.shields.io/npm/v/yearn.svg)](https://npmjs.org/package/yearn)
![NPM License](https://img.shields.io/npm/l/yearn.svg)

### Overview
Yearn is a library that injects functionality into Node's require mechanism (optional but default) providing the ability to transform the require before it's passed to load.
A default mechanism is injected so that all requires look for *./node_modules/module/version* instead of node's default *./node_modules/module* location. 
There is also support for __orgs__, which allows for a more central placement of all modules or separation of public and private modules (default __org__ points to *./node_modules* for back compatibility).
Yearn also has a goal (not yet fully implemented) of providing wrappers around node (__ynode__) and npm (__ynpm__) to automaticaly enforce yearn requiring.

### Installation

Local installation:

    $ npm install yearn

Global installation:

    $ npm install yearn -g

### Local Usage
To use yearn for a single project it needs to be installed locally.
Due to the fact that it needs to be bootstrapped it must be installed in the traditional npm structure.
All other modules may be installed in any way compatible with the yearn implementation.

Once installed locally require it and provide initialization options before using the new require mechanism.
Example initialization with default options: 

		var yearn = require( 'yearn' )({ /* options */ });

### Global Usage
See ynode and ynpm below.

### Options

		var yearn = require( 'yearn' )({
				orgs: { '', './node_modules' },
				log: 'NONE',
				override: true
		});

+ __orgs__:

   __orgs__ is a mapping of organization names to their locations.
   The default location ( `''` ) will point to the module's local node_modules folder (*./node_modules*).
   
   Example:
   
		var yearn = require( 'yearn' )({
				orgs: { 
						'', '//usr/bin/default_node_modules_location' 
						'other_loc': '//some/other/location'	
				}
		});
		
		// require looking in '//usr/bin/default_node_modules_location/module1' for a version specified in the package.json for module1.
		var regular_module = require( 'module1' );  
		
		// require looking in '//some/other/location/module2' for a version specified in the package.json for module2.
		var other_modules = require( 'other/module2' );
   
+ __log__: yearn has a built in logger which for the most part you will probably ignore and leave turned off.
Should you want to turn it on there are varying levels each specified by a different string:
   
   + `'NONE'`: no logging (default).
   + `'DEBUG'`: print all messages.
   + `'INFO'`: print all messages except debug messages.
   + `'WARN'`: print only warning and error message.
   + `'ERROR'`: print only error messages.
   + `'ALL'`: Same as debug.   

+ __override__: This boolean specifies if yearn should override Node's require mechanism or should only return the yearn functionality.
Additionaly if a function is provided than yearn will ignore all of it's default funtionality and override require with that functionality instead.

   There are a few thing that one should know if your going to override the functionality yourself.
   Firstly this does not override the most outer form of require and thus you end up limited to a single argument getting passed to your require function.
   Secondly if you want to call the underlying load mechanism use `module.constructor._load( path, this )` where path is the location of the modules (or name of the modules to get Node's default loading mechanism instead).

### ynode

IN DEVELOPMENT

### ynpm

IN DEVELOPMENT
