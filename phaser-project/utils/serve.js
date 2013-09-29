       
/**
 * Module dependencies.
 */

var http        = require('http');
var path        = require('path');
var express     = require('express');
var routes      = require('../web/routes');
var examples    = require('../web/routes/examples');


serve = {
      
    serve : function (port) {
        var app = express();

        // all environments
        app.set('port', port || 8000);
        app.set('views', process.cwd() + '/phaser-project/web/views');
        app.set('view engine', 'hjs');
        app.use(express.favicon());
        app.use(express.logger('dev'));
        app.use(express.bodyParser());
        app.use(express.methodOverride());
        app.use(app.router);
        app.use(express.static(process.cwd()+'/phaser-project/web/public'));
        app.use(express.static(path.join(process.cwd(), 'projects')));

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