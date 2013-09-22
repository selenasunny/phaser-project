var fs          = require('fs');
var connect     = require('connect');
var mu          = require('mustache');

serve = {
    routes : [
        /**
         * Handle the main index page
         */
        {
            match: ["/index.html", "/"],
            handler: function (req, res, next) {
                var list = fs.readdirSync("./projects");
                list.splice(list.indexOf('.gitignore'),1);

                list = list.map(function(elem) {
                    return {name: elem};
                });

                var html = fs.readFileSync(process.cwd()+"/index.html");

                html = mu.to_html(html.toString(), {name: "TEST?", projects: list});

                res.end(html);
            }
        },
        /**
         * Handle the examples page
         */
        {
            match: ["/examples","/examples/","/examples/index.html"],
            handler: function (req, res, next) {
                var list = fs.readdirSync('./examples/');
                list.splice(list.indexOf('assets'),1);

                var examples = [];

                for (ind in list) {
                    i = list[ind];
                    if(i.indexOf('.') == -1) {
                        var dir = {name : i, files: []};

                        var filelist =  fs.readdirSync('./examples/'+i);
                        for (file in filelist) {
                            k = filelist[file];
                            ind = k.indexOf(".example.html"); 
                            if (ind >= 0) {
                                var name = k.substring(0, ind);
                                dir.files.push({example_name: name});
                            }
                        }
                        examples.push(dir);
                    }
                }
      

                var html = fs.readFileSync(__dirname+"/examples/index.html");
                html = mu.to_html(html.toString(), {examples: examples});

                res.end(html);
            }
        }
    ],




    serve : function (port) {

        if (!port) {
            port = 8000;
        }

        var c = connect()
            .use(connect.bodyParser())
            .use(connect.logger())
            .use(function(req, res, next) {
             
                path = req.originalUrl;

                for (i in serve.routes) {
                    if (serve.routes[i].match.indexOf(path) >=0 ) {
                        serve.routes[i].handler(req, res, next);
                        return;
                    }
                }
                next();
            })
            
            .use(connect.static(process.cwd()))
            .listen(port);
       
        process.stdout.write("\nDev server stated on port "+port+"\n");
        process.stdout.write("\nYou can view your projects by visting http://localhost:"+port+" in your browser\n\n");
            
    }
};


module.exports = serve;