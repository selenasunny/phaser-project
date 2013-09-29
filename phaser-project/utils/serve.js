       
/**
 * Module dependencies.
 */

var http        = require('http');
var path        = require('path');
var express     = require('express');
var base        = require('./base');
var routes      = require(base.getWebPath()+'/routes');
var examples    = require(base.getWebPath()+'/routes/examples');


serve = {
      
    serve : function (port) {
        var app = express();

        // all environments
        app.set('port', port || 8000);
        app.set('views', base.getWebPath()+'/views');
        app.set('view engine', 'hjs');
        app.use(express.favicon());
        app.use(express.logger('dev'));
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(app.router);
        app.use(express.static(base.getWebPath()+'/public'));
        app.use(express.static(base.getProjectPath()));

        // development only
        if ('development' == app.get('env')) {
          app.use(express.errorHandler());
        }

        app.get('/', routes.index);
        app.get('/examples', examples.index);


        http.createServer(app).listen(app.get('port'), function(){
            process.stdout.write("\nDev server stated on port "+app.get('port')+"\n");
            process.stdout.write("\nYou can view your projects by visting http://localhost:"+app.get('port')+" in your browser\n\n");
        });
    }

};


module.exports = serve;