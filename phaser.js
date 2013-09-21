#!/usr/bin/env node

var fs      = require('fs');
var mu      = require('mustache');
var yesno   = require('yesno');
var wrench  = require('wrench');
var connect = require('connect');
//var express = require('express');
var program = require('commander');


//TODO: rework this into a util structure
function copyFile(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}


/**
 * Handle special requests to the 
 * dev/testing server. TODO: move these
 * out of the way so this file is less jumbled
 **/
var routes = [
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

            var html = fs.readFileSync(__dirname+"/index.html");

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
];



/**
 * Command for creating a new project
 * 
 */
program.command('project:make [project]')
    .description('Create a new Phaser project')
    .action(function(project) {
        var path = "./projects/"+project;
        if (fs.existsSync(path)) {
            console.log("Cannot create '"+project+"'; A project named '"+project+"' already exists.");
            process.exit(0);
        }

        // todo: test that project name is valid
        fs.mkdir(path, function(err) {
            if (err) {
                console.log("Couldn't create the project because:");
                console.log(err);
                process.exit(1);
            }


            // copy the "skeleton" of the project
            wrench.copyDirSyncRecursive('./templates/project', path, {
                preserveFiles:  true,
                forceDelete:    true
            });
            
            // copy in phaser files
            fs.mkdirSync(path+'/phaser/build');
            fs.mkdirSync(path+'/phaser/src');

            wrench.copyDirSyncRecursive('./node_modules/Phaser/build', path+"/phaser/build/", {
                preserveFiles:  true,
                forceDelete:    true
            });
            wrench.copyDirSyncRecursive('./node_modules/Phaser/src', path+"/phaser/src/", {
                preserveFiles:  true,
                forceDelete:    true
            });
            
        });
    });


/**
 * Command for deleting a project. This will entirely delete the project 
 * from the filesystem, so probably be careful when using it.
 * 
 */
program.command('project:delete [project]')
    .description('Delete a project')
    .action(function(project) {
        if(!fs.existsSync('./projects/'+project)) {
            console.log("Cannot delete '"+project+"'; no project named '"+project+"' exists.");
            process.exit(0);
        }

        yesno.ask('Are you sure you want to delete '+project+'? [y/N]', false, function(ok) {
            if(ok) {
                wrench.rmdirSyncRecursive("./projects/"+project);
                process.stdout.write("Deleted "+project+". It's gone forever. You killed it. You monster.\n");
                process.exit(0);
            }
            else {
                process.stdout.write("Whew, That was close!");
                process.exit(0);
            }
        });
       
    });


/**
 * Command for listing projects that exist on the system
 * TODO: actually implement this. Or throw it away, it seems not entirely useful
 */
program.command('project:list')
    .description('List projects')
    .action(function(project) {
        console.log("LISTING");
    });


/**
 * Command for serving up the dev/testing server for users
 * to check out examples/play with their projects
 *
 * TODO: This feels kind of way overly clunky (see the routes array
 * at the top of the file). Maybe figure out a better way to do this?
 *
 * I don't particularly think node is the best tool for running 
 * a testing server, especially when I am injecting stuff into only
 * some of the html being returned. Another alternative is to 
 * generate the HTML for the index/examples page automagically when
 * new projects or examples are added/deleted.
 */
program.command('serve [port]')
    .description('Run a phaser testing server so you can view your project')
    .action(function (port) {
        if (!port) {
            port = 8000;
        }

        var c = connect()
            .use(connect.bodyParser())
            .use(connect.logger())
            .use(function(req, res, next) {
            
                path = req.originalUrl;
                for (i in routes) {
                    if (routes[i].match.indexOf(path) >=0 ) {
                        routes[i].handler(req, res, next);
                        return;
                    }
                }
                next();
            })
            
            .use(connect.static(__dirname))
            .listen(port);
       
        process.stdout.write("\nDev server stated on port "+port+"\n");
        process.stdout.write("\nYou can view your projects by visting http://localhost:"+port+" in your browser\n\n");
            
    });


program.parse(process.argv);
