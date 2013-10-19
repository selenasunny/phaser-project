#!/usr/bin/env node

var fs          = require('fs');
var wrench      = require('wrench');

//var express = require('express');
var program     = require('commander');
var base        = require('./phaser-project/utils/base');
var semver      = require('semver');

var versions    = require(base.getPhaserProjectPath()+'/utils/versions');
var serve       = require(base.getPhaserProjectPath()+'/utils/serve');
var project     = require(base.getPhaserProjectPath()+'/utils/project');


versions.initFile();
versions.syncFileFromFs();
if(!versions.getLatest()) 
{
    process.stdout.write("It looks like this is the first time you've used Phaser-Project\n");
    process.stdout.write("Please wait while the latest version of Phaser is downloaded for you...\n");
    versions.getLatestRemote(function(latest) {
        process.stdout.write("\nLatest version is: "+latest+". Downloading...\n");
        versions.downloadVersion(latest, function() {});
    });
    return;
}



/**
 * Command for creating a new project
 * 
 */
program.command('project:make [project] [base_project]')
    .description('Create a new Phaser project')
    .action(project.make);


/**
 * Command for deleting a project. This will entirely delete the project 
 * from the filesystem, so probably be careful when using it.
 * 
 */
program.command('project:delete [project]')
    .description('Delete a project')
    .action(project.delete);


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
    .action(serve.serve);


/**
 * Command to show the list of available Phaser engine versions
 * 
 */
program.command('engine:versions')
    .description('displays a list of available phaser versions')
    .action(function() {
        process.stdout.write("Fetching Phaser version list: \n");
        versions.fetchAvailable(function(tags) { 
            var installed = versions.getInstalled();

            for (i in tags) {
                process.stdout.write(tags[i]);

                if(installed.indexOf(tags[i]) != -1) {
                    process.stdout.write(" *installed");
                }
                
                process.stdout.write("\n");
            }
        });
    });


/**
 * 
 * 
 */
program.command('engine:update')
    .description('Downloads the latest version of the phaser engine')
    .action(function () {
        versions.fetchAvailable(function(vers) {
            var myLatest    = versions.getLatest();
            var realLatest  = versions._latestInList(vers);
             
            if (myLatest && semver.valid(myLatest) && semver.eq(myLatest, realLatest)) {
                process.stdout.write("Latest version is "+realLatest+"; already installed.\n");
                process.exit(0);
            }

            process.stdout.write("Downloading "+realLatest+"\n");
            versions.downloadVersion(realLatest, function() {
                process.stdout.write("Downloaded the latest version! ("+realLatest+")\n");
                versions.syncFileFromFs();
            });
        });
    });


program.command('engine:install')
    .description('Attempts to download a specific version of the phaser engine')
    .action(function (version) {
        versions.downloadVersion(version, function () {
            process.stdout.write('Version '+version+' installed.\n');
            versions.syncFileFromFs();
        });

    });

program.parse(process.argv);
