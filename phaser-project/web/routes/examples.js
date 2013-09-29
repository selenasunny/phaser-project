var fs = require('fs');

exports.index = function (req, res){
    var loc     = process.cwd()+'/phaser-project/web/public/examples/';
    var list    = fs.readdirSync(loc);
    list.splice(list.indexOf('assets'),1);

    var examples = [];

    for (ind in list) {
        i = list[ind];
        if(i.indexOf('.') == -1) {
            var dir = {name : i, files: []};

            var filelist =  fs.readdirSync(loc+i);
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


    res.render('examples', { examples:examples});  
};