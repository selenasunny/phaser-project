var fs      = require('fs');
var base    = require('./base');
var semver  = require('semver');
var https   = require('https');
var request = require('request');
var zip     = require('adm-zip');


module.exports = new Versions();
var self = module.exports;


function Versions() {
    this.path = base.getEnginePath()+"/versions.json";
};



Versions.prototype.getVersion = function(version, cb) {
    var url     = 'https://github.com/photonstorm/phaser/archive/'+version+'.zip';
    var file    = base.getTempPath()+'/'+version+".zip";
    var dest    = base.getEnginePath();

    var req     = request(url);
    req.pipe(fs.createWriteStream(file))


    req.on('end', function() {
        var zp = new zip(file);
        //zipEntries = zp.getEntries();
        zp.extractAllTo(dest, /*overwrite*/true);
        fs.renameSync(dest+"/phaser-"+version, dest+"/"+version);

        cb(version);
    });

};



Versions.prototype.getAvailable = function(cb) {

    //process.stdout.write("Fetching Phaser version list: \n");

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
                cb(tags);
                //console.log(tags);
            });
        }
    );

    req.on('error', function(err) {
        console.log(err);
    });

    req.end();
}



Versions.prototype.initFile = function() {
    if(!fs.existsSync(this.path)) {
        var structure = {
            available: [],
            installed: [],
            latest: null
        };

        this.write(structure);
    }
};


Versions.prototype.writeFile = function(structure) {
    fs.writeFileSync(this.path, JSON.stringify(structure));
};


Versions.prototype.readFile = function () {
    var data = fs.readFileSync(this.path);

    return JSON.parse(data.toString());
};


Versions.prototype.syncFileFromFs = function() {
    var loc     = base.getEnginePath();
    var list    = fs.readdirSync(loc);
   
    var versions = self.readFile();
    versions.installed = [];


    for (ind in list) {
        var dir     = loc+"/"+list[ind];
        var stat    = fs.statSync(dir);

        if(stat.isDirectory()) {
            versions.installed.push(list[ind]);
        }
    }

    if (versions.installed.length == 0) {
        self.writeFile(versions);
        return;
    }


    versions.latest = self._latestInList(versions.installed);

    self.writeFile(versions);

};


Versions.prototype._latestLocal = function() {
    var data = self.readFile();
    return data.latest;
}


Versions.prototype._latestInList = function(list) {
    var latest;

    for (i in list) {
        var curr = list[i];

        if (!latest || !semver.valid(latest)) {
            latest = curr;
            continue;
        }

        if (semver.valid(curr) && semver.gt(curr, latest)) {
            latest = curr;
        }
    }

    return latest;
}
