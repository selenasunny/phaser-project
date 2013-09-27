var fs = require('fs');

exports.index = function (req, res){
    var list = fs.readdirSync(process.cwd()+'/examples/');
    list.splice(list.indexOf('assets'),1);

    var examples = [];

    for (ind in list) {
        i = list[ind];
        if(i.indexOf('.') == -1) {
            var dir = {name : i, files: []};

            var filelist =  fs.readdirSync(process.cwd()+'/examples/'+i);
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