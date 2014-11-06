
var repl = require("repl");

if( process.argv.length < 3 ){
	
	repl.start({
		prompt: "cnode> ",
		input: process.stdin,
		output: process.stdout
	});
	
	//TODO: No Arguments run REPL
} else if ( process.argv.length == 3 ){
	
	switch( process.argv[2] ){
			// TODO: add other options
		default:
			//TODO: print help run script
			break;
	}
} else {
	console.log( process.argv );
	//TODO: print help.
}

