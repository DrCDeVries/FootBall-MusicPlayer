'use strict';
const path = require('path');

//set Enviroment DEBUG=confighandler, app to see console output
var ConfigHandler = null;
if (process.env.USELOCALLIB === "true"){
    ConfigHandler = require('../../configHandler.js');
}else{
    ConfigHandler = require('configHandler');
    
}


var myAppDefaultConfig = {
    dbConnectionString:"sampleDbConnectionString",
    appEmailAddress:"example@example.com",
    version: 0

}


var configHandler = new ConfigHandler(
    {
        configFileName: 'config.json',
        configDirectory: path.join(__dirname,'config'),
        readConfigOnCreate: true
    },

    myAppDefaultConfig
);

console.log("Config", configHandler.config);

configHandler.config.version++;
configHandler.config.appEmailAddress = "updated" + configHandler.config.version + "@example,com";

configHandler.configFileSave();

console.log("Config", configHandler.config);
