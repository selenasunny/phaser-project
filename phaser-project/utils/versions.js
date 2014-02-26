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
    this.current;
};


Versions.prototype.versionExistsLocal = function (version, cb) {
    var installed = self.getInstalled();

    if (installed.indexOf(version) == -1) {
        cb(false);
    } else {
        cb(true);
    }
};


Versions.prototype.versionExists = function (version, cb) {
    self.fetchAvailable(function (vers) {
        if (vers.indexOf(version) == -1) {
            cb(false);
        } else {
            cb(true);
        }
    });
};


Versions.prototype.downloadVersion = function(version, cb) {
    self.fetchAvailable(function(list) {

        if (list.indexOf(version) == -1) {
            process.stdout.write("No such version "+version+" exists.\n");
            process.exit();
        }

        process.stdout.write("Found version "+version+"; Downloading...\n");
        var url     = 'https://github.com/photonstorm/phaser/archive/'+version+'.zip';
        var file    = base.getTempPath()+'/'+version+".zip";
        var dest    = base.getEnginePath();
        
        var req     = request(url);
        req.pipe(fs.createWriteStream(file));


        req.on('end', function() {
            var zp = new zip(file);
         
            zp.extractAllTo(dest, /*overwrite*/true);
            fs.renameSync(dest+"/phaser-"+version, dest+"/"+version);

            cb(version);
        });

    });

};



Versions.prototype.getInstalled = function() {
    if (!self.current) {
        self.readFile();
    }

    return self.current.installed;
};


Versions.prototype.getLatest = function() {
    if (!self.current) {
        self.readFile();
    }

    return self.current.latest;
};



Versions.prototype.getLatestRemote = function(cb) {
    self.fetchAvailable(function(tags) {
        cb(self._latestInList(tags));
    });
};


Versions.prototype.fetchAvailable = function(cb) {

    //process.stdout.write("Fetching Phaser version list: \n");

    // Issue a request to the github API to grab the list of tags
    var req = https.request({
            host:   'api.github.com',
            path:   '/repos/photonstorm/phaser/git/refs/tags',
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13'
            }
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

            });
        }
    );

    req.on('error', function(err) {
        console.log(err);
    });

    req.end();
};



Versions.prototype.initFile = function() {
    if(!fs.existsSync(this.path)) {
        var structure = {
            available: [],
            installed: [],
            latest: null
        };

        this.writeFile(structure);
    }
};


Versions.prototype.writeFile = function(structure) {
    self.current = structure; 

    fs.writeFileSync(this.path, JSON.stringify(structure));
};


Versions.prototype.readFile = function () {
    var data = fs.readFileSync(this.path);

    self.current = JSON.parse(data.toString());

    return self.current;
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
        versions.latest=null;
        self.writeFile(versions);
        return;
    }


    versions.latest = self._latestInList(versions.installed);

    self.writeFile(versions);

};


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
};
