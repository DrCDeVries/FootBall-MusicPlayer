"use strict";

const path = require('path');
const extend = require('extend');
const fs = require('fs');
//const { v4: uuidv4 } = require('uuid');
const { now } = require('moment');
const debug = require('debug')("confighandler");

var ConfigHandler = function (options, defaultConfig) {
    var self = this;
    var defaultOptions = {
        configFileName: 'config.json',
        configDirectory: 'config',
        readConfigOnCreate: true,
        createConfigFileBackups: true
    };
    
    self.options = extend({}, defaultOptions, options);

    self.config = null;

    var getTimeStampFilePrefix = function(){
        let now = new Date();
        return now.toISOString().replace(/:/g, "-");
    }

    var configFileRead = function () {
        
        var configFileSettings = {};
        var configFileFolder = self.options.configDirectory;
        var configFileFullPath = path.join(configFileFolder, self.options.configFileName);
        debug("info", "Config File Path", configFileFullPath);
        try {
            if(fs.existsSync(configFileFullPath) === false){
                debug("info", "Config File Missing Creating with Defaults");
                try {
                    if(fs.existsSync(configFileFolder)=== false){
                        fs.mkdirSync(configFileFolder,{recursive:true,mode:0o660})
                    }
                    //if we Can't read the config its a new config or a broken config so we create it using the defaults
                    fs.writeFileSync(configFileFullPath, JSON.stringify(defaultConfig, null, 2),{mode:0o660});
                } catch (ex) {
                    debug("error", "Error Creating New Config File just using defaults", ex);
                }
            }else{
                var strConfig = fs.readFileSync(configFileFullPath);
                configFileSettings = JSON.parse(strConfig);
            }
        } catch (ex) {
            //This needs to stay Console.log as writetolog will not function as no config
            try {
                console.log("error", "Error Reading or Creating a Config File", configFileFullPath, ex);
                //if we Can't read the config its a new config or a broken config so we create it using the defaults
                if(fs.existsSync(configFileFullPath) === true){
                    let now = new Date();
                    var badConfigFilePath = path.join(configFileFolder,  getTimeStampFilePrefix() + "-" + self.options.configFileName +  ".bad");
                    console.log("error", "Error Reading Existing Config File moving to ", badConfigFilePath);
                    fs.copyFileSync(configFileFullPath, badConfigFilePath);
                }
                fs.writeFileSync(configFileFullPath, JSON.stringify(defaultConfig, null, 2),{mode:0o660});
            } catch (ex) {
                console.log("error", "Error Creating New Config File just using defaults", ex);
            }
        }
        self.config = extend({}, defaultConfig, configFileSettings);
        return self.config;
    };

    

    var configFileSave = function(){
        try {
            var configFileFolder = self.options.configDirectory;
            var configFileFullPath = path.join(configFileFolder, self.options.configFileName);
            if(fs.existsSync(configFileFolder)=== false){
                fs.mkdirSync(configFileFolder,{recursive:true,mode:0o660})
            }
            if(self.options.createConfigFileBackups === true && fs.existsSync(configFileFullPath) === true){
                
                var backupConfigFullPath = path.join(configFileFolder, "backups",  getTimeStampFilePrefix() + "-" + self.options.configFileName);
                var backupConfigFolder =path.dirname(backupConfigFullPath);
                if(fs.existsSync(backupConfigFolder) === false){
                    debug("info", "Creating config Backup Folder", backupConfigFolder);
                    
                    if(fs.existsSync(backupConfigFolder)=== false){
                        fs.mkdirSync(backupConfigFolder,{recursive:true, mode:0o660})
                    }
                    
                }
                console.log("info", "creating backup config file", backupConfigFullPath);
                fs.copyFileSync(configFileFullPath, backupConfigFullPath);
            }

            //if we Can't read the config its a new config or a broken config so we create it using the defaults
            fs.writeFileSync(configFileFullPath, JSON.stringify(self.config, null, 2),{mode:0o660});
        } catch (ex) {
            console.log("error", "Error Creating New Config File just using defaults", ex);
        }
    }

    if(self.options.readConfigOnCreate){
        configFileRead();
    }

    self.configFileRead = configFileRead;
    self.configFileSave = configFileSave;
    
};
module.exports = ConfigHandler;