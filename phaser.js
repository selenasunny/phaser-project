#!/usr/bin/env node

var fs          = require('fs');
var wrench      = require('wrench');

//var express = require('express');
var program     = require('commander');
var https       = require('https');
var versionFile = require('./utils/versionfile');
var serve       = require('./utils/serve');
var project     = require('./utils/project');


versionFile.initialize();


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
    .action(function () {
        process.stdout.write("Fetching Phaser version list: \n");

        // Issue a request to the github API to grab the list of tags
        var req = https.request({
                host:   'api.github.com',
                path:   '/repos/photonstorm/phaser/git/refs/tags',
                method: 'GET'
            }, function (res) {
                var body = '';
                res.on('data', function(data) {
                    body += data;
                });

                res.on('end', function() {
                    data = JSON.parse(body);
                    var tags = [];

                    for (i in data) {
                        tagData = data[i];
                        tags.push(tagData.ref.replace(/refs\/tags\//,''));
                    }
                    console.log(tags);
                });
            }
        );

        req.on('error', function(err) {
            console.log(err);
        });

        req.end();
    });


/**
 * 
 * 
 */
program.command('engine:update')
    .description('Downloads the latest version of the phaser engine')
    .action(function () {

    });


program.parse(process.argv);
