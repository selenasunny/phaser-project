
module.exports = new HomeStorage();
var self = module.exports;

function HomeStorage() {
    //console.log(self.getHomedir());
}




HomeStorage.prototype.getHomedir = function () {
    return process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
};