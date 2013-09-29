var fs      = require('fs');
var wrench  = require('wrench');
var yesno   = require('yesno');
var base    = require('./base');

module.exports = new Project;
self = module.exports;



function Project() {
    this.default_template   = "hello_phaser";
    this.base_project_path  = base.getProjectPath()+"/userprojects/";
    this.base_template_path = base.getProjectPath()+"/templates/";
}


Project.prototype.make = function(project, base_project) {

    var path = self.base_project_path+project;
    
    if (!base_project) {
        base_project = self.default_template;
    }

    if (! fs.existsSync(self.base_template_path+base_project)) {
        console.log("Can't create a project from template "+base_project+"; no such template exists.");
        process.exit(0);
    }

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
        wrench.copyDirSyncRecursive(self.base_template_path+base_project, path, {
            preserveFiles:  true,
            forceDelete:    true
        });
        
        // copy in phaser files
        fs.mkdirSync(path+'/phaser/build');
        fs.mkdirSync(path+'/phaser/src');

        wrench.copyDirSyncRecursive(process.cwd()+'/node_modules/Phaser/build', path+"/phaser/build/", {
            preserveFiles:  true,
            forceDelete:    true
        });
        wrench.copyDirSyncRecursive(process.cwd()+'/node_modules/Phaser/src', path+"/phaser/src/", {
            preserveFiles:  true,
            forceDelete:    true
        });
        
    });
};


Project.prototype.delete = function(project) {
    var _self = self;
    
    if(!fs.existsSync(self.base_project_path+project)) {
        console.log("Cannot delete '"+project+"'; no project named '"+project+"' exists.");
        process.exit(0);
    }

    yesno.ask('Are you sure you want to delete '+project+'? [y/N]', false, function(ok) {
        if(ok) {
            wrench.rmdirSyncRecursive(_self.base_project_path+project);
            process.stdout.write("Deleted "+project+". It's gone forever. You killed it. You monster.\n");
            process.exit(0);
        }
        else {
            process.stdout.write("Whew, That was close!");
            process.exit(0);
        }
    }); 
};