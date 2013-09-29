
module.exports = new BaseConfig()
var self = module.exports;


function BaseConfig() {
    this.base_path = process.cwd();
};


BaseConfig.prototype.getBasePath =function() {
    return self.base_path;
};


BaseConfig.prototype.getPhaserProjectPath = function() {
    return self.getBasePath()+"/phaser-project";
};


BaseConfig.prototype.getProjectPath = function() {
    return self.getBasePath()+"/projects";
};


BaseConfig.prototype.getEnginePath = function() {
    return self.getPhaserProjectPath()+"/engine";
};


BaseConfig.prototype.getWebPath = function() {
    return self.getPhaserProjectPath()+"/web";
};


BaseConfig.prototype.getTempPath = function() {
    return self.getPhaserProjectPath()+"/tmp";
};