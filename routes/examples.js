

exports.index = function (req, res){
    res.render('examples', { projects: list });  
};