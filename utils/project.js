var fs      = require('fs');
var wrench  = require('wrench');
var yesno   = require('yesno');


module.exports = new Project;
self = module.exports;


function Project() {
    this.default_project = "hello_phaser";
}


Project.prototype.make = function(project, base_project) {

    var path = "./projects/"+project;
    
    if (!base_project) {
        base_project = self.default_project;
    }

    if (! fs.existsSync('./templates/'+base_project)) {
        console.log("Can't create a project for template "+base_project+"; no such template exists.");
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
        wrench.copyDirSyncRecursive('./templates/'+base_project, path, {
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
};


Project.prototype.delete = function(project) {
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
};