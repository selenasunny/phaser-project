var fs = require('fs');

module.exports = {

    path: process.cwd()+"/versions.json",


    read: function () {
        var data = fs.readFileSync(this.path);
        return JSON.parse(data.toString());
    },


    write: function (structure) {
        fs.writeFileSync(this.path, JSON.stringify(structure));
    },


    syncFromFs: function () {

    },


    initialize: function () {
        if(!fs.existsSync(this.path)) {
            var structure = {
                available: [],
                installed: [],
                latest: null
            };

            this.write(structure);
        }
    }


};