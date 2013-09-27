
var fs = require('fs');
/*
 * GET home page.
 */

exports.index = function(req, res){

    var list = fs.readdirSync(process.cwd()+"/projects");
    list.splice(list.indexOf('.gitignore'),1);

    list = list.map(function(elem) {
        return {name: elem};
    });

    res.render('index', { projects: list });
}; 