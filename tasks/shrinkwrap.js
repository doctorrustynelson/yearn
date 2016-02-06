'use strict';

var path = require( 'path' );

module.exports = function( grunt ){
    grunt.registerMultiTask( 'ynpm-shrinkwrap', 'Generate a ynpm shrinkwrap.', function( ){
        var done = this.async();
        var options = this.options( { unsafe: false, config: {} } );
        var task = this;
        
        var config = require( '../lib/utils/config' ).initialize( options.config );
        
        require( '../lib/ynpm' )( config, function( err, ynpm ){
            task.files.forEach( function( file ){
                var src = file.src.filter( function( filepath ){
                    if ( !grunt.file.exists( filepath ) ){
                        grunt.log.warn( 'Source dir "' + filepath + '" not found.' );
                        return false;
                    } else {
                        return true;
                    }
                } );
                
                var dest = path.join( file.dest, "ynpm-shrinkwrap.json" );
                
                src.forEach( function( src ){
                    ynpm.commands.shrinkwrap( src, {}, function( err, shrinkwrap ){
                        grunt.file.write( dest, JSON.stringify( shrinkwrap, null, '\t' ) );
                        done();  
                    } );
                } );
            } );         
        } );
    } );
};